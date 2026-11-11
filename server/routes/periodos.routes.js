const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const db = require('../db');
const logger = require('../utils/logger');
const { requireRole, requireStaffAuth } = require('../middlewares/auth');
const { logAction } = require('../services/auditService');
const { invalidateDocentesCache } = require('../services/docentesCache.service');
const { normalizeDepartmentName } = require('../utils/normalizer');
const { writeSqlDumpToFile } = require('../services/backupDump.service');

// HELPER PARA CIERRE SEGURO DE LAPSO (TRANSACCIÓN ACID: RESGUARDA 100% CARGA DOCENTE Y ASIGNATURAS)
async function cerrarPeriodoSeguro(periodoObj, auditor = null, motivo = 'Cierre oficial') {
  if (!periodoObj || periodoObj.estado === 'CERRADO') return;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Verificar si este período ya cuenta con resguardo consolidado en cargas_historicas
    const [existingCargas] = await conn.query(
      'SELECT COUNT(*) as cnt, COALESCE(SUM(totalHorasSemanal), 0) as sumHoras FROM cargas_historicas WHERE periodoAcademico = ?',
      [periodoObj.nombre]
    );
    const existingCount = parseInt(existingCargas[0]?.cnt || 0);
    const existingHours = parseInt(existingCargas[0]?.sumHoras || 0);

    const [currentDocentes] = await conn.query('SELECT * FROM docentes');
    const [currentMaterias] = await conn.query('SELECT * FROM docentes_materias');

    // Calcular volumen de la tabla en vivo actual
    const currentTotalHours = currentMaterias.reduce((acc, m) => acc + (parseInt(m.horasSemanal) || 0), 0);

    // BLINDAJE SENIOR: Si el histórico ya tiene carga consolidada y la tabla en caliente tiene menos del 50% de horas
    // (por ejemplo, porque docentes_materias ya pasó al siguiente período o está limpia), PROTEGEMOS el histórico.
    if (existingCount > 0 && existingHours > 50 && currentTotalHours < existingHours * 0.5) {
      console.warn(`[Cierre Seguro] El período ${periodoObj.nombre} ya posee resguardo histórico consolidado (${existingHours} hrs en ${existingCount} docentes). Se preserva la data histórica y se omite sobreescritura destructiva.`);
    } else {
      const matMap = {};
      for (const m of currentMaterias) {
        if (!matMap[m.docente_cedula]) matMap[m.docente_cedula] = [];
        matMap[m.docente_cedula].push(m);
      }

      for (const d of currentDocentes) {
        const dMats = matMap[d.cedula] || [];
        const totSem = dMats.reduce((acc, m) => acc + (parseInt(m.horasSemanal) || 0), 0);
        const totLap = dMats.reduce((acc, m) => acc + (parseInt(m.horasLapso) || 0), 0);

        await conn.query(`
          INSERT INTO cargas_historicas 
            (cedula_docente, periodoAcademico, department, status, semanas, fechaDesde, fechaHasta, materias, totalHorasSemanal, totalHorasLapso)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            department = VALUES(department),
            status = VALUES(status),
            semanas = VALUES(semanas),
            fechaDesde = VALUES(fechaDesde),
            fechaHasta = VALUES(fechaHasta),
            materias = IF(VALUES(totalHorasSemanal) > 0, VALUES(materias), materias),
            totalHorasSemanal = IF(VALUES(totalHorasSemanal) > 0, VALUES(totalHorasSemanal), totalHorasSemanal),
            totalHorasLapso = IF(VALUES(totalHorasLapso) > 0, VALUES(totalHorasLapso), totalHorasLapso)
        `, [
          d.cedula,
          periodoObj.nombre,
          d.department,
          d.status || 'Validado',
          d.semanas || periodoObj.semanas || 15,
          d.fechaDesde || periodoObj.fechaDesde || '',
          d.fechaHasta || periodoObj.fechaHasta || '',
          JSON.stringify(dMats),
          totSem,
          totLap
        ]);
      }
    }

    // 2. Marcar período saliente como CERRADO de forma atómica
    await conn.query("UPDATE periodos_academicos SET estado = 'CERRADO', fechaCierre = CURRENT_TIMESTAMP WHERE id = ?", [periodoObj.id]);
    await conn.query("UPDATE periodos_academicos_v3 SET estado = 'CERRADO' WHERE nombre = ?", [periodoObj.nombre]).catch(() => {});

    await conn.commit();
  } catch (err) {
    await conn.rollback().catch(() => {});
    throw err;
  } finally {
    conn.release();
  }

  // 3. Registrar auditoría institucional e invalidar caché solo tras confirmar el commit
  const auditUser = auditor?.username || 'Sistema Automático';
  const auditRole = auditor?.role || 'ADMIN';
  await logAction(
    auditUser,
    auditRole,
    'Cierre Institucional de Lapso Académico',
    `El período ${periodoObj.nombre} ha sido cerrado (${motivo}). 100% de la carga académica y asignaturas resguardadas en histórico.`
  );

  invalidateDocentesCache();
}

async function verificarCierreAutomaticoLapsos() {
  try {
    const [activos] = await db.query("SELECT * FROM periodos_academicos WHERE estado = 'ACTIVO'");
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    const hoyStr = `${yyyy}-${mm}-${dd}`;

    for (const p of activos) {
      if (p.fechaHasta && p.fechaHasta.trim() !== '') {
        if (p.fechaHasta < hoyStr) {
          console.log(`[Lapsos Automático] El período ${p.nombre} cumplió su fecha calendario de culminación (${p.fechaHasta} < ${hoyStr}). Ejecutando cierre institucional automático seguro...`);
          await cerrarPeriodoSeguro(
            p,
            { username: 'Sistema Automático (Calendario)', role: 'SISTEMA' },
            `Cierre automático institucional por culminación de fecha calendario (${p.fechaHasta})`
          );
        }
      }
    }
  } catch (err) {
    console.error('Error al verificar cierre de lapsos:', err);
  }
}

// --- REPLICACIÓN Y PROMOCIÓN DE PERÍODO ACADÉMICO ---
router.post('/periodos/replicar', requireRole(['ADMIN', 'JEFE']), async (req, res) => {
  try {
    const { 
      periodoOrigen, 
      periodoDestino, 
      semanas = 15, 
      fechaDesde = '', 
      fechaHasta = '', 
      department,
      cedulasSeleccionadas,
      auditor 
    } = req.body;

    if (!periodoOrigen || !periodoDestino) {
      return res.status(400).json({ error: 'Debes indicar el período origen y el período destino.' });
    }

    if (!cedulasSeleccionadas || cedulasSeleccionadas.length === 0) {
      return res.status(400).json({ error: 'Debes seleccionar al menos un docente para replicar.' });
    }

    // 1. Obtener los docentes seleccionados junto con sus materias actuales
    const [docentes] = await db.query(
      'SELECT * FROM docentes WHERE cedula IN (?)',
      [cedulasSeleccionadas]
    );

    const [materias] = await db.query(
      'SELECT * FROM docentes_materias WHERE docente_cedula IN (?)',
      [cedulasSeleccionadas]
    );

    const materiasPorDocente = {};
    for (const m of materias) {
      if (!materiasPorDocente[m.docente_cedula]) {
        materiasPorDocente[m.docente_cedula] = [];
      }
      materiasPorDocente[m.docente_cedula].push(m);
    }

    let isDestinoPlanificacion = false;
    let finalSemanas = parseInt(semanas) || 15;
    let finalFechaDesde = fechaDesde || '';
    let finalFechaHasta = fechaHasta || '';

    try {
      const [destRows] = await db.query('SELECT estado, semanas, fechaDesde, fechaHasta FROM periodos_academicos WHERE nombre = ?', [periodoDestino]);
      if (destRows.length > 0) {
        if (destRows[0].estado === 'PLANIFICACION') {
          isDestinoPlanificacion = true;
        }
        if (destRows[0].semanas) finalSemanas = parseInt(destRows[0].semanas) || 15;
        if (destRows[0].fechaDesde) finalFechaDesde = destRows[0].fechaDesde;
        if (destRows[0].fechaHasta) finalFechaHasta = destRows[0].fechaHasta;
      } else {
        await db.query(`
          INSERT INTO periodos_academicos (nombre, estado, semanas, fechaDesde, fechaHasta, observaciones)
          VALUES (?, 'PLANIFICACION', ?, ?, ?, 'Generado automáticamente según régimen semestral UPEL (2 períodos por año)')
        `, [periodoDestino, finalSemanas, finalFechaDesde, finalFechaHasta]);
        isDestinoPlanificacion = true;
      }
    } catch (e) {
      console.error('Error al verificar o auto-registrar período semestral UPEL:', e);
    }

    // 3. Resguardar período origen en cargas_historicas y generar nuevo registro para período destino bajo transacción ACID
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      for (const d of docentes) {
        const docenteMats = materiasPorDocente[d.cedula] || [];
        const totSem = docenteMats.reduce((acc, m) => acc + (parseInt(m.horasSemanal) || 0), 0);
        const totLap = docenteMats.reduce((acc, m) => acc + (parseInt(m.horasLapso) || 0), 0);

        // La precarga hacia un período en planificación solo incluye docentes cuya carga en el semestre a culminar haya sido validada por el Jefe de Departamento
        const isDocenteValidado = (d.status === 'Validado' || d.status === 'Activo') && docenteMats.length > 0;
        if (isDestinoPlanificacion && !isDocenteValidado) {
          continue;
        }

        // Snapshot del período origen solo si no es una simple precarga a planificación (si el origen está cerrando/promoviendo)
        if (!isDestinoPlanificacion) {
          await conn.query(`
            INSERT INTO cargas_historicas 
              (cedula_docente, periodoAcademico, department, status, semanas, fechaDesde, fechaHasta, materias, totalHorasSemanal, totalHorasLapso)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              department = VALUES(department),
              status = VALUES(status),
              materias = VALUES(materias),
              totalHorasSemanal = VALUES(totalHorasSemanal),
              totalHorasLapso = VALUES(totalHorasLapso)
          `, [
            d.cedula,
            periodoOrigen,
            d.department,
            d.status || 'Validado',
            d.semanas || 15,
            d.fechaDesde || '',
            d.fechaHasta || '',
            JSON.stringify(docenteMats),
            totSem,
            totLap
          ]);
        }

        // Malla para destino
        const matsDestino = isDestinoPlanificacion
          ? docenteMats.map(m => ({
              ...m,
              docente_asignado: 'SIN_ASIGNAR',
              docente_nombre: 'Pendiente por Asignar',
              docente_cedula: ''
            }))
          : docenteMats;

        const statusDestino = isDestinoPlanificacion ? 'Planificación' : 'Por Revisar';

        await conn.query(`
          INSERT INTO cargas_historicas 
            (cedula_docente, periodoAcademico, department, status, semanas, fechaDesde, fechaHasta, materias, totalHorasSemanal, totalHorasLapso)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            department = VALUES(department),
            status = VALUES(status),
            semanas = VALUES(semanas),
            fechaDesde = VALUES(fechaDesde),
            fechaHasta = VALUES(fechaHasta),
            materias = VALUES(materias),
            totalHorasSemanal = VALUES(totalHorasSemanal),
            totalHorasLapso = VALUES(totalHorasLapso),
            fechaRegistro = CURRENT_TIMESTAMP
        `, [
          d.cedula,
          periodoDestino,
          d.department,
          statusDestino,
          finalSemanas,
          finalFechaDesde,
          finalFechaHasta,
          JSON.stringify(matsDestino),
          totSem,
          totLap
        ]);
      }

      if (!isDestinoPlanificacion) {
        await conn.query(`
          UPDATE docentes 
          SET periodoAcademico = ?, status = 'Por Revisar', semanas = ?, fechaDesde = ?, fechaHasta = ?
          WHERE cedula IN (?)
        `, [periodoDestino, finalSemanas, finalFechaDesde, finalFechaHasta, cedulasSeleccionadas]);
      }

      await conn.commit();
    } catch (txErr) {
      await conn.rollback();
      throw txErr;
    } finally {
      conn.release();
    }

    if (auditor && auditor.username) {
      await logAction(
        auditor.username, 
        auditor.role, 
        isDestinoPlanificacion ? 'Replicó Carga a Período en Planificación' : 'Replicó Período Académico', 
        `De ${periodoOrigen} -> A ${periodoDestino}. Docentes preparados: ${cedulasSeleccionadas.length} (Departamento: ${department || 'General'})`
      );
    }

    invalidateDocentesCache();
    res.json({
      success: true,
      count: cedulasSeleccionadas.length,
      periodoDestino,
      isDestinoPlanificacion,
      message: isDestinoPlanificacion
        ? `¡Éxito! Se ha pre-cargado la carga de ${cedulasSeleccionadas.length} docentes hacia el período ${periodoDestino} (en Planificación). Las clases y materias del semestre actual se mantienen activas.`
        : `¡Éxito! Se han replicado ${cedulasSeleccionadas.length} docentes hacia el período ${periodoDestino} en estatus "Por Revisar".`
    });
  } catch (error) {
    console.error('Error replicando período académico:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint explícito para cierre de período
router.put('/periodos/:id/cerrar', requireRole(['ADMIN', 'DOCENCIA', 'AUDITOR']), async (req, res) => {
  try {
    const { id } = req.params;
    const { auditor, motivo = 'Cierre institucional solicitado' } = req.body;

    const allowedPeriodRoles = ['ADMIN', 'AUDITOR', 'DOCENCIA'];
    if (auditor && auditor.role && !allowedPeriodRoles.includes(auditor.role)) {
      return res.status(403).json({ error: 'Acceso denegado: Solo el Administrador, Auditor y Subdirección de Docencia pueden cerrar lapsos académicos.' });
    }

    const [pRows] = await db.query('SELECT * FROM periodos_academicos WHERE id = ?', [id]);
    if (pRows.length === 0) {
      return res.status(404).json({ error: 'Período no encontrado.' });
    }
    const periodoObj = pRows[0];

    await cerrarPeriodoSeguro(periodoObj, auditor, motivo);

    res.json({ 
      success: true, 
      message: `El período ${periodoObj.nombre} ha sido cerrado oficialmente y toda su programación académica ha quedado protegida en el historial.` 
    });
  } catch (error) {
    console.error('Error al cerrar período:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint explícito para reactivar y reabrir un período cerrado sin dañar nada
router.put('/periodos/:id/reactivar', requireRole(['ADMIN', 'DOCENCIA', 'AUDITOR']), async (req, res) => {
  try {
    const { id } = req.params;
    const { auditor, motivo = 'Reactivación institucional de período cerrado' } = req.body || {};

    const [pRows] = await db.query('SELECT * FROM periodos_academicos WHERE id = ? OR nombre = ?', [id, id]);
    if (pRows.length === 0) {
      return res.status(404).json({ error: 'Período no encontrado.' });
    }
    const periodoObj = pRows[0];

    // 1. Cerrar de forma segura cualquier otro período marcado como ACTIVO (resguardando su carga en vivo si le pertenece)
    const [prevActives] = await db.query(
      "SELECT * FROM periodos_academicos WHERE estado = 'ACTIVO' AND id != ? AND nombre != ?",
      [periodoObj.id, periodoObj.nombre]
    );
    for (const prev of prevActives) {
      const [prevDm] = await db.query('SELECT COUNT(*) AS cnt FROM docentes_materias WHERE periodoAcademico = ?', [prev.nombre]);
      if (parseInt(prevDm[0]?.cnt || 0) > 0) {
        await cerrarPeriodoSeguro(prev, auditor, `Resguardo automático antes de reactivar ${periodoObj.nombre}`);
      } else {
        await db.query("UPDATE periodos_academicos SET estado = 'CERRADO', fechaCierre = CURRENT_TIMESTAMP WHERE id = ?", [prev.id]);
      }
    }

    // 2. Extender fecha si estaba vencida
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    const hoyStr = `${yyyy}-${mm}-${dd}`;
    let finalFechaHasta = periodoObj.fechaHasta;
    if (periodoObj.fechaHasta && periodoObj.fechaHasta < hoyStr) {
      finalFechaHasta = `${yyyy}-11-30`;
    }

    // 3. Reactivar este período
    await db.query(`
      UPDATE periodos_academicos 
      SET estado = 'ACTIVO', fechaCierre = NULL, fechaHasta = ?, fechaActivacion = COALESCE(fechaActivacion, CURRENT_TIMESTAMP),
          observaciones = 'Período reactivado institucionalmente como oficial en curso'
      WHERE id = ? OR nombre = ?
    `, [finalFechaHasta, periodoObj.id, periodoObj.nombre]);

    try {
      await db.query("UPDATE periodos_academicos_v3 SET estado = 'CERRADO' WHERE estado = 'ACTIVO' AND nombre != ?", [periodoObj.nombre]);
      await db.query("UPDATE periodos_academicos_v3 SET estado = 'ACTIVO' WHERE nombre = ?", [periodoObj.nombre]);
    } catch (v3Err) {}

    try {
      await db.query(`
        UPDATE docentes_contrataciones_v3 
        SET periodo_id = (SELECT id FROM periodos_academicos_v3 WHERE nombre = ? LIMIT 1),
            semanas = ?,
            fecha_desde = NULLIF(?, ''),
            fecha_hasta = NULLIF(?, '')
        WHERE periodo_id = (SELECT id FROM periodos_academicos_v3 WHERE nombre = ? LIMIT 1)
           OR periodo_id IS NULL
      `, [periodoObj.nombre, periodoObj.semanas || 15, periodoObj.fechaDesde || '', finalFechaHasta || '', periodoObj.nombre]);
      await db.query(`
        UPDATE cargas_historicas 
        SET semanas = ?, fechaDesde = ?, fechaHasta = ? 
        WHERE periodoAcademico = ?
      `, [periodoObj.semanas || 15, periodoObj.fechaDesde || '', finalFechaHasta || '', periodoObj.nombre]);
    } catch (eDoc) {}

    invalidateDocentesCache(true);

    if (auditor && auditor.username) {
      await logAction(
        auditor.username,
        auditor.role || 'ADMIN',
        'Reactivación de Período Académico',
        `El período ${periodoObj.nombre} ha sido reabierto y reactivado oficialmente (${motivo}). Toda la carga y materias se mantuvieron intactas.`
      );
    }

    res.json({
      success: true,
      periodo: periodoObj.nombre,
      message: `¡Éxito! El período ${periodoObj.nombre} ha sido reactivado como período oficial en curso sin alterar la carga docente.`
    });
  } catch (error) {
    console.error('Error al reactivar período:', error);
    res.status(500).json({ error: error.message });
  }
});

// Listar períodos
router.get('/periodos', async (req, res) => {
  try {
    await verificarCierreAutomaticoLapsos();
    const [rows] = await db.query(`
      SELECT p.*,
        CASE 
          WHEN p.estado = 'ACTIVO' THEN (SELECT COUNT(*) FROM docentes)
          ELSE (SELECT COUNT(*) FROM cargas_historicas ch WHERE ch.periodoAcademico = p.nombre)
        END AS docentesCount
      FROM periodos_academicos p
      ORDER BY 
        CASE p.estado 
          WHEN 'ACTIVO' THEN 1 
          WHEN 'PLANIFICACION' THEN 2 
          WHEN 'CERRADO' THEN 3 
          ELSE 4 
        END,
        p.nombre DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al listar períodos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Crear período
router.post('/periodos', requireRole(['ADMIN', 'DOCENCIA']), async (req, res) => {
  try {
    const { nombre, estado = 'PLANIFICACION', semanas = 15, fechaDesde = '', fechaHasta = '', observaciones = '', auditor } = req.body;
    
    const allowedPeriodRoles = ['ADMIN', 'DOCENCIA'];
    if (auditor && auditor.role && !allowedPeriodRoles.includes(auditor.role)) {
      return res.status(403).json({ error: 'Acceso denegado: Solo el Administrador y la Subdirección de Docencia tienen atribución para crear períodos académicos.' });
    }

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre del período es requerido (ej: 2026-II).' });
    }

    if (estado === 'ACTIVO') {
      await db.query("UPDATE periodos_academicos SET estado = 'CERRADO', fechaCierre = CURRENT_TIMESTAMP WHERE estado = 'ACTIVO'");
    }

    const [result] = await db.query(`
      INSERT INTO periodos_academicos (nombre, estado, semanas, fechaDesde, fechaHasta, observaciones, fechaActivacion)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [nombre, estado, parseInt(semanas) || 15, fechaDesde, fechaHasta, observaciones, estado === 'ACTIVO' ? new Date() : null]);

    if (auditor && auditor.username) {
      await logAction(auditor.username, auditor.role, 'Creó Período Académico', `Período: ${nombre}, Estado: ${estado}`);
    }

    res.json({ success: true, id: result.insertId, nombre, estado });
  } catch (error) {
    console.error('Error al crear período:', error);
    res.status(500).json({ error: error.message });
  }
});

// Modificar / Reprogramar período
router.put('/periodos/:id', requireRole(['ADMIN', 'DOCENCIA', 'AUDITOR']), async (req, res) => {
  try {
    const { id } = req.params;
    const { semanas, fechaDesde, fechaHasta, observaciones, propagarADocentes = true, auditor } = req.body;

    const allowedPeriodRoles = ['ADMIN', 'DOCENCIA', 'AUDITOR'];
    if (auditor && auditor.role && !allowedPeriodRoles.includes(auditor.role)) {
      return res.status(403).json({ error: 'Acceso denegado: La reprogramación y modificación de lapsos académicos es potestad de Administrador, Auditor y Subdirección de Docencia.' });
    }

    const [pRows] = await db.query('SELECT * FROM periodos_academicos WHERE id = ? OR nombre = ?', [id, id]);
    if (pRows.length === 0) {
      return res.status(404).json({ error: 'Período no encontrado.' });
    }
    const periodoObj = pRows[0];
    function toSqlDate(dStr) {
      if (!dStr) return '';
      const s = String(dStr).trim();
      if (!s) return '';
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
        const parts = s.split('/');
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
      return s;
    }

    const sem = parseInt(semanas) || periodoObj.semanas || 15;
    const finalDesde = toSqlDate(fechaDesde) || periodoObj.fechaDesde || '';
    const finalHasta = toSqlDate(fechaHasta) || periodoObj.fechaHasta || '';

    await db.query(`
      UPDATE periodos_academicos 
      SET semanas = ?, fechaDesde = ?, fechaHasta = ?, observaciones = ?
      WHERE id = ? OR nombre = ?
    `, [sem, finalDesde, finalHasta, observaciones || '', id, id]);

    try {
      await db.query(`
        UPDATE periodos_academicos_v3 
        SET semanas = ?, fecha_inicio = ?, fecha_fin = ?, observaciones = ?
        WHERE id = ? OR nombre = ?
      `, [sem, finalDesde || null, finalHasta || null, observaciones || '', id, id]);
    } catch (eP3) {}


    if (propagarADocentes && periodoObj.estado === 'ACTIVO') {
      const fDesde = (finalDesde && String(finalDesde).trim() !== '') ? finalDesde : null;
      const fHasta = (finalHasta && String(finalHasta).trim() !== '') ? finalHasta : null;
      try {
        await db.query(`
          UPDATE docentes_contrataciones_v3 
          SET semanas = ?, fecha_desde = ?, fecha_hasta = ?
          WHERE periodo_id = (SELECT id FROM periodos_academicos_v3 WHERE nombre = ? LIMIT 1)
             OR periodo_id IS NULL
        `, [sem, fDesde, fHasta, periodoObj.nombre]);
      } catch (eDoc) {
        console.error('Error al sincronizar contrataciones docentes:', eDoc);
      }

      try {
        await db.query(`
          UPDATE cargas_historicas 
          SET semanas = ?, fechaDesde = ?, fechaHasta = ?
          WHERE periodoAcademico = ?
        `, [sem, finalDesde, finalHasta, periodoObj.nombre]);
      } catch (eCarga) {}
    }

    if (auditor && auditor.username) {
      const isReprog = periodoObj.estado === 'ACTIVO';
      await logAction(
        auditor.username, 
        auditor.role, 
        isReprog ? 'Reprogramó Lapso Académico Activo' : 'Actualizó Datos de Período', 
        `Período: ${periodoObj.nombre}, Semanas: ${sem}, Fechas: ${finalDesde || 'N/A'} al ${finalHasta || 'N/A'}, Motivo: ${observaciones || 'Sin observaciones'}`
      );
    }

    invalidateDocentesCache();
    res.json({ success: true, message: `Período ${periodoObj.nombre} actualizado y reprogramación aplicada con éxito.` });
  } catch (error) {
    console.error('Error al actualizar período:', error);
    res.status(500).json({ error: error.message });
  }
});

// ACTIVAR PERÍODO ACADÉMICO: Culmina el semestre actual y promueve oficialmente la carga planificada
router.post('/periodos/activar', requireRole(['ADMIN', 'DOCENCIA']), async (req, res) => {
  try {
    const { periodoId, nombre, auditor, fechaDesde, fechaHasta, semanas, observaciones } = req.body;

    const allowedPeriodRoles = ['ADMIN', 'DOCENCIA'];
    if (auditor && auditor.role && !allowedPeriodRoles.includes(auditor.role)) {
      return res.status(403).json({ error: 'Acceso denegado: Solo el Administrador y la Subdirección de Docencia tienen atribución para activar nuevos períodos académicos.' });
    }

    let target = null;
    if (periodoId) {
      const [rows] = await db.query('SELECT * FROM periodos_academicos WHERE id = ?', [periodoId]);
      if (rows.length > 0) target = rows[0];
    } else if (nombre) {
      const [rows] = await db.query('SELECT * FROM periodos_academicos WHERE nombre = ?', [nombre]);
      if (rows.length > 0) target = rows[0];
    }

    if (!target) {
      return res.status(404).json({ error: 'No se encontró el período a activar.' });
    }

    if (fechaDesde !== undefined || fechaHasta !== undefined || semanas !== undefined || observaciones !== undefined) {
      if (fechaDesde) target.fechaDesde = fechaDesde;
      if (fechaHasta) target.fechaHasta = fechaHasta;
      if (semanas) target.semanas = parseInt(semanas);
      if (observaciones) target.observaciones = observaciones;

      await db.query(`
        UPDATE periodos_academicos 
        SET 
          fechaDesde = COALESCE(?, fechaDesde),
          fechaHasta = COALESCE(?, fechaHasta),
          semanas = COALESCE(?, semanas),
          observaciones = COALESCE(?, observaciones)
        WHERE id = ?
      `, [fechaDesde || null, fechaHasta || null, semanas ? parseInt(semanas) : null, observaciones || null, target.id]);
    }

    const [activeRows] = await db.query("SELECT * FROM periodos_academicos WHERE estado = 'ACTIVO' LIMIT 1");
    const prevActive = activeRows.length > 0 ? activeRows[0] : null;

    // Respaldo Preventivo Automático
    let autoBackupName = null;
    try {
      const backupDir = path.join(__dirname, '../uploads', 'backups');
      if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

      const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const fileName = `auto_pre_activacion_${prevActive ? prevActive.nombre : 'prev'}_a_${target.nombre}_${dateStr}.sql`;
      const fullPath = path.join(backupDir, fileName);
      await writeSqlDumpToFile(fullPath, { userLabel: auditor?.username || 'Sistema Automático' });
      autoBackupName = fileName;

      await logAction(
        auditor?.username || 'Sistema',
        auditor?.role || 'ADMIN',
        'Respaldo Preventivo Automático (Snap-Before-Change)',
        `Generado respaldo íntegro ${fileName} antes de activar el período ${target.nombre}.`
      );
    } catch (bkErr) {
      console.error('Error generando respaldo preventivo antes de activación:', bkErr);
    }

    let nextCreated = null;
    let cargasPlanificadasCount = 0;
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      if (prevActive) {
        const [currentDocentes] = await conn.query('SELECT * FROM docentes');
        const [currentMaterias] = await conn.query('SELECT * FROM docentes_materias');
        const matMap = {};
        for (const m of currentMaterias) {
          if (!matMap[m.docente_cedula]) matMap[m.docente_cedula] = [];
          matMap[m.docente_cedula].push(m);
        }

        for (const d of currentDocentes) {
          const dMats = matMap[d.cedula] || [];
          const totSem = dMats.reduce((acc, m) => acc + (parseInt(m.horasSemanal) || 0), 0);
          const totLap = dMats.reduce((acc, m) => acc + (parseInt(m.horasLapso) || 0), 0);

          await conn.query(`
            INSERT INTO cargas_historicas 
              (cedula_docente, periodoAcademico, department, status, semanas, fechaDesde, fechaHasta, materias, totalHorasSemanal, totalHorasLapso)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              department = VALUES(department),
              status = VALUES(status),
              materias = VALUES(materias),
              totalHorasSemanal = VALUES(totalHorasSemanal),
              totalHorasLapso = VALUES(totalHorasLapso)
          `, [
            d.cedula,
            prevActive.nombre,
            d.department,
            d.status || 'Validado',
            d.semanas || 15,
            d.fechaDesde || prevActive.fechaDesde || '',
            d.fechaHasta || prevActive.fechaHasta || '',
            JSON.stringify(dMats),
            totSem,
            totLap
          ]);
        }

        await conn.query("UPDATE periodos_academicos SET estado = 'CERRADO', fechaCierre = CURRENT_TIMESTAMP WHERE id = ?", [prevActive.id]);
      }

      await conn.query("UPDATE periodos_academicos SET estado = 'ACTIVO', fechaActivacion = CURRENT_TIMESTAMP WHERE id = ?", [target.id]);

      // 1. Obtener la carga base del semestre anterior para herencia natural
      const sourcePeriodName = prevActive ? prevActive.nombre : '2026-I';
      const [prevCargas] = await conn.query('SELECT * FROM cargas_historicas WHERE periodoAcademico = ?', [sourcePeriodName]);
      const baseSemestreAnteriorMap = {};
      for (const pc of prevCargas) {
        let pMats = [];
        try { pMats = typeof pc.materias === 'string' ? JSON.parse(pc.materias) : (pc.materias || []); } catch(e) {}
        if (pMats.length > 0) {
          baseSemestreAnteriorMap[pc.cedula_docente] = pMats;
        }
      }

      // 2. Mapear posibles cargas planificadas explícitas del período destino
      const [cargasPlanificadas] = await conn.query('SELECT * FROM cargas_historicas WHERE periodoAcademico = ?', [target.nombre]);
      cargasPlanificadasCount = cargasPlanificadas.length;
      const planificadasMap = {};
      for (const c of cargasPlanificadas) {
        let mats = [];
        try {
          mats = typeof c.materias === 'string' ? JSON.parse(c.materias) : (c.materias || []);
        } catch (e) {
          mats = [];
        }
        if (mats.length > 0) {
          planificadasMap[c.cedula_docente] = { ...c, materias: mats };
        }
      }

      // 3. Promover cada docente: Si tiene planificación previa la usa, sino hereda del semestre anterior en 'Por Revisar'
      const [allDocentes] = await conn.query('SELECT cedula, department FROM docentes');
      for (const d of allDocentes) {
        const cargaPlan = planificadasMap[d.cedula];
        const matsPromover = (cargaPlan && cargaPlan.materias && cargaPlan.materias.length > 0)
          ? cargaPlan.materias
          : (baseSemestreAnteriorMap[d.cedula] || []);

        await conn.query(`
          UPDATE docentes 
          SET periodoAcademico = ?, status = 'Por Revisar', semanas = ?, fechaDesde = ?, fechaHasta = ?
          WHERE cedula = ?
        `, [
          target.nombre,
          target.semanas || 15,
          target.fechaDesde || '',
          target.fechaHasta || '',
          d.cedula
        ]);

        await conn.query('DELETE FROM docentes_materias WHERE docente_cedula = ?', [d.cedula]);

        if (matsPromover.length > 0) {
          const matValues = matsPromover.map(m => [
            d.cedula,
            m.nombre,
            parseInt(m.horasSemanal) || 0,
            parseInt(m.horasLapso) || 0,
            m.especialidadDestino || '',
            m.seccion || m.secciones || '',
            (m.cupos !== undefined && m.cupos !== null && m.cupos !== '') ? String(m.cupos).trim() : null,
            (m.inscritos !== undefined && m.inscritos !== null && m.inscritos !== '') ? parseInt(m.inscritos) : null,
            m.cohorte || null,
            target.nombre
          ]);
          await conn.query(
            'INSERT INTO docentes_materias (docente_cedula, nombre, horasSemanal, horasLapso, especialidadDestino, seccion, cupos, inscritos, cohorte, periodoAcademico) VALUES ?',
            [matValues]
          );

          // Sincronizar en cargas_historicas bajo target.nombre en estatus 'Por Revisar'
          const totSem = matsPromover.reduce((acc, m) => acc + (parseInt(m.horasSemanal) || 0), 0);
          const totLap = matsPromover.reduce((acc, m) => acc + (parseInt(m.horasLapso) || 0), 0);
          await conn.query(`
            INSERT INTO cargas_historicas 
              (cedula_docente, periodoAcademico, department, status, semanas, fechaDesde, fechaHasta, materias, totalHorasSemanal, totalHorasLapso)
            VALUES (?, ?, ?, 'Por Revisar', ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              department = VALUES(department),
              status = 'Por Revisar',
              materias = VALUES(materias),
              totalHorasSemanal = VALUES(totalHorasSemanal),
              totalHorasLapso = VALUES(totalHorasLapso)
          `, [
            d.cedula,
            target.nombre,
            d.department,
            target.semanas || 15,
            target.fechaDesde || '',
            target.fechaHasta || '',
            JSON.stringify(matsPromover),
            totSem,
            totLap
          ]);
        }
      }

      try {
        await conn.query(`
          UPDATE cargas_historicas 
          SET fechaDesde = ?, fechaHasta = ?, semanas = ?
          WHERE periodoAcademico = ?
        `, [target.fechaDesde || '', target.fechaHasta || '', target.semanas || 15, target.nombre]);
      } catch (histErr) {}

      const [futurePlan] = await conn.query("SELECT * FROM periodos_academicos WHERE estado = 'PLANIFICACION' LIMIT 1");
      if (futurePlan.length === 0) {
        let nextName = '';
        if (target.nombre.endsWith('-I')) {
          nextName = target.nombre.replace('-I', '-II');
        } else if (target.nombre.endsWith('-II')) {
          const parts = target.nombre.split('-');
          const year = parseInt(parts[0]) || new Date().getFullYear();
          nextName = `${year + 1}-I`;
        } else {
          nextName = `${new Date().getFullYear() + 1}-I`;
        }
        await conn.query(`
          INSERT INTO periodos_academicos (nombre, estado, semanas, observaciones)
          VALUES (?, 'PLANIFICACION', 15, 'Siguiente período abierto para planificación y asignación anticipada')
        `, [nextName]);
        nextCreated = nextName;
      }

      try {
        await conn.query("UPDATE periodos_academicos_v3 SET estado = 'CERRADO' WHERE estado = 'ACTIVO' AND nombre != ?", [target.nombre]);
        await conn.query("UPDATE periodos_academicos_v3 SET estado = 'ACTIVO' WHERE nombre = ?", [target.nombre]);
      } catch (v3Err) {}

      try {
        await conn.query(`
          UPDATE docentes_contrataciones_v3 
          SET periodo_id = (SELECT id FROM periodos_academicos_v3 WHERE nombre = ? LIMIT 1),
              fecha_hasta = ?
          WHERE periodo_id IS NULL OR periodo_id = (SELECT id FROM periodos_academicos_v3 WHERE nombre = ? LIMIT 1)
        `, [target.nombre, target.fechaHasta || '', target.nombre]);
      } catch (eDoc) {}

      await conn.commit();
    } catch (txErr) {
      await conn.rollback();
      throw txErr;
    } finally {
      conn.release();
    }

    invalidateDocentesCache(true);

    if (auditor && auditor.username) {
      await logAction(
        auditor.username,
        auditor.role,
        'Activación de Período Académico',
        `Culminó período ${prevActive ? prevActive.nombre : 'previo'} e inició oficialmente el período ${target.nombre}. Cargas promovidas: ${cargasPlanificadasCount}. Siguiente lapso en planificación: ${nextCreated || 'N/A'}`
      );
    }

    res.json({
      success: true,
      periodoActivado: target.nombre,
      periodoPrevioCerrado: prevActive ? prevActive.nombre : null,
      docentesPromovidos: cargasPlanificadasCount,
      siguientePlanificado: nextCreated,
      backupPreventivo: autoBackupName,
      message: `¡Éxito institucional! El período ${target.nombre} ha sido activado oficialmente. El lapso previo ha quedado resguardado en el historial${autoBackupName ? ` (Respaldo de seguridad preventivo: ${autoBackupName})` : ''}.`
    });
  } catch (error) {
    logger.error('Error al activar período académico:', error);
    res.status(500).json({ error: error.message });
  }
});

// MATERIAS HUÉRFANAS PARA UN PERÍODO
router.get('/periodos/:nombre/huerfanas', requireStaffAuth, async (req, res) => {
  try {
    const { nombre } = req.params;
    const [catalogo] = await db.query('SELECT * FROM materias_catalogo ORDER BY nombre ASC');
    const [periodoRows] = await db.query('SELECT estado FROM periodos_academicos WHERE nombre = ?', [nombre]);
    const isActivo = periodoRows.length > 0 && periodoRows[0].estado === 'ACTIVO';
    
    const assignedNames = new Set();
    if (isActivo) {
      const [docMats] = await db.query('SELECT DISTINCT UPPER(TRIM(nombre)) as matName FROM docentes_materias');
      docMats.forEach(r => assignedNames.add(r.matName));
    } else {
      const [cargas] = await db.query('SELECT materias FROM cargas_historicas WHERE periodoAcademico = ?', [nombre]);
      cargas.forEach(c => {
        let mats = [];
        try {
          mats = typeof c.materias === 'string' ? JSON.parse(c.materias) : (c.materias || []);
        } catch (e) { mats = []; }
        mats.forEach(m => {
          if (m && m.nombre) assignedNames.add(m.nombre.trim().toUpperCase());
        });
      });
    }

    const huerfanas = catalogo.filter(c => !assignedNames.has(c.nombre.trim().toUpperCase()));
    
    res.json({
      periodo: nombre,
      totalCatalogo: catalogo.length,
      cubiertasCount: assignedNames.size,
      huerfanasCount: huerfanas.length,
      huerfanas: huerfanas.map(h => h.nombre)
    });
  } catch (error) {
    console.error('Error al calcular materias huérfanas:', error);
    res.status(500).json({ error: error.message });
  }
});

// CUADRO CONSOLIDADO DE NECESIDADES DOCENTES
router.get('/periodos/:nombre/necesidades', requireStaffAuth, async (req, res) => {
  try {
    const { nombre } = req.params;
    const [periodoRows] = await db.query('SELECT estado FROM periodos_academicos WHERE nombre = ?', [nombre]);
    const isActivo = periodoRows.length > 0 && periodoRows[0].estado === 'ACTIVO';

    let docentesList = [];
    if (isActivo) {
      const [docs] = await db.query('SELECT * FROM docentes');
      const [mats] = await db.query('SELECT * FROM docentes_materias');
      const matsMap = {};
      mats.forEach(m => {
        if (!matsMap[m.docente_cedula]) matsMap[m.docente_cedula] = [];
        matsMap[m.docente_cedula].push(m);
      });
      docentesList = docs.map(d => ({
        ...d,
        materias: matsMap[d.cedula] || []
      }));
    } else {
      const [cargas] = await db.query(
        'SELECT * FROM cargas_historicas WHERE periodoAcademico = ?',
        [nombre]
      );
      docentesList = cargas.map(c => {
        let materias = [];
        try {
          materias = typeof c.materias === 'string' ? JSON.parse(c.materias) : (c.materias || []);
        } catch (e) { materias = []; }
        return {
          cedula: c.cedula_docente,
          nombres: c.nombre_docente || '',
          apellidos: '',
          department: c.departamento || 'Sin Asignar',
          dedicacion: c.dedicacion || 'Tiempo Convencional',
          categoriaDocente: c.categoriaDocente || 'Instructor',
          sedeCentro: c.sedeCentro || 'Rubio',
          periodoAcademico: c.periodoAcademico,
          materias
        };
      });
    }

    let totalHorasSemanal = 0;
    let totalHorasLapso = 0;
    const deptoMap = {};
    const sedeMap = {};
    const dedicacionMap = {};
    const especialidadMap = {};
    const uniqueMateriasSet = new Set();
    let totalMateriasCount = 0;

    docentesList.forEach(d => {
      const depto = normalizeDepartmentName(d.department);
      const sede = d.sedeCentro || 'Rubio';
      const ded = d.dedicacion || 'Tiempo Convencional';

      if (!deptoMap[depto]) deptoMap[depto] = { departamento: depto, docentes: 0, horasSemanal: 0, horasLapso: 0 };
      deptoMap[depto].docentes += 1;

      if (!sedeMap[sede]) sedeMap[sede] = { sede, docentes: 0, horasSemanal: 0, horasLapso: 0 };
      sedeMap[sede].docentes += 1;

      if (!dedicacionMap[ded]) dedicacionMap[ded] = { dedicacion: ded, docentes: 0, horasSemanal: 0 };
      dedicacionMap[ded].docentes += 1;

      (d.materias || []).forEach(m => {
        const hs = Number(m.horasSemanal) || 0;
        const hl = Number(m.horasLapso) || 0;
        totalHorasSemanal += hs;
        totalHorasLapso += hl;
        totalMateriasCount += 1;

        if (m.nombre) uniqueMateriasSet.add(m.nombre.trim().toUpperCase());

        deptoMap[depto].horasSemanal += hs;
        deptoMap[depto].horasLapso += hl;

        sedeMap[sede].horasSemanal += hs;
        sedeMap[sede].horasLapso += hl;

        dedicacionMap[ded].horasSemanal += hs;

        const esp = (m.especialidadDestino && m.especialidadDestino.trim()) ? m.especialidadDestino.trim() : 'Sin Especialidad Asignada';
        if (!especialidadMap[esp]) {
          especialidadMap[esp] = { especialidad: esp, secciones: 0, docentesSet: new Set(), horasSemanal: 0 };
        }
        especialidadMap[esp].secciones += 1;
        especialidadMap[esp].docentesSet.add(d.cedula);
        especialidadMap[esp].horasSemanal += hs;
      });
    });

    const totalDocentes = docentesList.length;
    const porDepartamento = Object.values(deptoMap).map(d => ({
      ...d,
      porcentajeCarga: totalHorasSemanal > 0 ? Number(((d.horasSemanal / totalHorasSemanal) * 100).toFixed(1)) : 0
    })).sort((a, b) => b.horasSemanal - a.horasSemanal);

    const porSede = Object.values(sedeMap).sort((a, b) => b.docentes - a.docentes);
    const porDedicacion = Object.values(dedicacionMap).sort((a, b) => b.docentes - a.docentes);

    const porEspecialidad = Object.values(especialidadMap).map(e => ({
      especialidad: e.especialidad,
      secciones: e.secciones,
      docentes: e.docentesSet.size,
      horasSemanal: e.horasSemanal
    })).sort((a, b) => b.horasSemanal - a.horasSemanal);

    res.json({
      periodo: nombre,
      resumen: {
        totalDocentes,
        totalHorasSemanal,
        totalHorasLapso,
        promedioHorasDocente: totalDocentes > 0 ? Number((totalHorasSemanal / totalDocentes).toFixed(1)) : 0,
        totalMateriasAsignadas: totalMateriasCount,
        materiasUnicasDictadas: uniqueMateriasSet.size
      },
      porDepartamento,
      porSede,
      porDedicacion,
      porEspecialidad
    });
  } catch (error) {
    console.error('Error al generar cuadro de necesidades docentes:', error);
    res.status(500).json({ error: error.message });
  }
});

// HISTÓRICO DE PERÍODOS
router.get('/historico-periodos', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT DISTINCT p.nombre AS periodoAcademico 
      FROM periodos_academicos p 
      INNER JOIN cargas_historicas ch ON ch.periodoAcademico = p.nombre 
      WHERE p.estado = 'CERRADO' 
      ORDER BY p.nombre DESC
    `);
    res.json(rows.map(r => r.periodoAcademico));
  } catch (error) {
    console.error('Error al obtener períodos históricos:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = {
  router,
  verificarCierreAutomaticoLapsos
};
