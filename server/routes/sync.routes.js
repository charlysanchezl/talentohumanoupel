const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const xlsx = require('xlsx');
const db = require('../db');
const { logAction } = require('../services/auditService');
const { requireRole, requireAuth } = require('../middlewares/auth');

const upload = multer({ dest: 'uploads/' });
const { registerSSEClient, getLastVersion, broadcastRealtimeUpdate } = require('../services/realtimeSync.service');

// Sincronización en Tiempo Real mediante Server-Sent Events (SSE)
router.get('/sync/events', (req, res) => {
  registerSSEClient(req, res);
});

// Endpoint ultraligero de verificación de versión (Smart Polling / ETag Fallback)
router.get('/sync/version', (req, res) => {
  res.json({
    success: true,
    ...getLastVersion()
  });
});

// Endpoint para emitir notificación manual de sincronización
router.post('/sync/notify', requireAuth, (req, res) => {
  const { entity = 'docentes', data = {} } = req.body || {};
  broadcastRealtimeUpdate(entity, data);
  res.json({ success: true, message: `Evento de cambio emitido para: ${entity}` });
});

// 1. POST /sync-external
router.post('/sync-external', requireRole('ADMIN'), upload.array('files'), async (req, res) => {
  try {
    let affected = 0;
    for (const file of req.files) {
      const wb = xlsx.readFile(file.path);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(ws, { header: 1 });
      let isCursos = false;
      let isDocentes = false;

      let colNomCursoIdx = -1;
      let colCedulaIdx = -1;
      let colNombresIdx = -1;
      let colDptoIdx = -1;
      let colSedeIdx = -1;
      let colEspecialidadIdx = -1;
      let colSeccionesIdx = -1;
      let colCuposIdx = -1;
      let colInscritosIdx = -1;
      let colBancoIdx = -1;
      let colCuentaIdx = -1;
      let colRifIdx = -1;
      let colCorreoIdx = -1;
      let colTelefonosIdx = -1;
      let headerRowIdx = -1;

      for (let i = 0; i < Math.min(20, data.length); i++) {
        const row = data[i];
        if (!row || !Array.isArray(row)) continue;
        
        const strRow = Object.values(row).map(c => String(c).toLowerCase());
        const hasCedula = strRow.findIndex(c => c.includes('cedula') || c.includes('cédula') || c.includes('c.i') || c.includes('identidad') || c.includes('ci'));
        const hasCurso = strRow.findIndex(c => c.includes('curso') || c.includes('materia') || c.includes('unidad') || c.includes('asignatura'));
        const hasDpto = strRow.findIndex(c => c.includes('dpto') || c.includes('departamento'));
        
        if (hasCurso !== -1 || hasCedula !== -1 || hasDpto !== -1) {
          headerRowIdx = i;
          colNomCursoIdx = hasCurso;
          colCedulaIdx = hasCedula;
          colNombresIdx = strRow.findIndex(c => c.includes('nombre') || c.includes('apellido'));
          colDptoIdx = hasDpto;
          colSedeIdx = strRow.findIndex(c => c.includes('sede') || c.includes('centro'));
          colEspecialidadIdx = strRow.findIndex(c => c.includes('especialidad'));
          colSeccionesIdx = strRow.findIndex(c => c.includes('seccion') || c.includes('sección') || c.includes('secciones'));
          colCuposIdx = strRow.findIndex(c => c.includes('cupo') || c.includes('cupos'));
          colInscritosIdx = strRow.findIndex(c => c.includes('inscrito') || c.includes('inscritos'));
          colBancoIdx = strRow.findIndex(c => c.includes('banco'));
          colCuentaIdx = strRow.findIndex(c => c.includes('cuenta') || c.includes('bancaria'));
          colRifIdx = strRow.findIndex(c => c.includes('rif'));
          colCorreoIdx = strRow.findIndex(c => c.includes('correo') || c.includes('email'));
          colTelefonosIdx = strRow.findIndex(c => c.includes('telefono') || c.includes('teléfono') || c.includes('celular') || c.includes('tlf'));
          break;
        }
      }

      if (headerRowIdx !== -1) {
        if (colNomCursoIdx !== -1) isCursos = true;
        if (colCedulaIdx !== -1) isDocentes = true;
      }
      
      if (isCursos) {
        await db.query('TRUNCATE TABLE datos_externos_cursos');
        for (let i = headerRowIdx + 1; i < data.length; i++) {
          const row = data[i];
          if (row && row[colNomCursoIdx]) {
            await db.query('INSERT INTO datos_externos_cursos (nom_Curso) VALUES (?)', [String(row[colNomCursoIdx]).trim()]);
          }
        }
        affected++;
      } else if (isDocentes) {
        await db.query('TRUNCATE TABLE datos_externos_docentes');
        for (let i = headerRowIdx + 1; i < data.length; i++) {
          const row = data[i];
          if (row && row[colCedulaIdx]) {
            const cedulaLimpiada = String(row[colCedulaIdx]).replace(/\D/g, '');
            await db.query('INSERT INTO datos_externos_docentes (cedula_docente, Nombres_apellidos, DPTO, SEDe_CENTRO, especialidad, secciones, cupos, inscritos) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
              'V-' + cedulaLimpiada,
              colNombresIdx !== -1 && row[colNombresIdx] ? String(row[colNombresIdx]).trim() : '', 
              colDptoIdx !== -1 && row[colDptoIdx] ? String(row[colDptoIdx]).trim() : '', 
              colSedeIdx !== -1 && row[colSedeIdx] ? String(row[colSedeIdx]).trim() : '',
              colEspecialidadIdx !== -1 && row[colEspecialidadIdx] ? String(row[colEspecialidadIdx]).trim() : '',
              colSeccionesIdx !== -1 && row[colSeccionesIdx] ? String(row[colSeccionesIdx]).trim() : '',
              colCuposIdx !== -1 && row[colCuposIdx] ? String(row[colCuposIdx]).trim() : '',
              colInscritosIdx !== -1 && row[colInscritosIdx] ? String(row[colInscritosIdx]).trim() : ''
            ]);

            if (colNomCursoIdx !== -1 && row[colNomCursoIdx]) {
              const materiaNombre = String(row[colNomCursoIdx]).trim();
              const especialidad = colEspecialidadIdx !== -1 && row[colEspecialidadIdx] ? String(row[colEspecialidadIdx]).trim() : '';
              const secciones = colSeccionesIdx !== -1 && row[colSeccionesIdx] ? String(row[colSeccionesIdx]).trim() : '';
              const cupos = colCuposIdx !== -1 && row[colCuposIdx] ? String(row[colCuposIdx]).trim() : '';
              const inscritos = colInscritosIdx !== -1 && row[colInscritosIdx] ? String(row[colInscritosIdx]).trim() : '';
              
              const [mats] = await db.query('SELECT * FROM docentes_materias WHERE REPLACE(docente_cedula, "V-", "") = ? AND nombre = ?', [cedulaLimpiada, materiaNombre]);
              if (mats.length === 0) {
                await db.query('INSERT INTO docentes_materias (docente_cedula, nombre, especialidadDestino, seccion, cupos, inscritos) VALUES (?, ?, ?, ?, ?, ?)', [
                  'V-' + cedulaLimpiada, materiaNombre, especialidad, secciones, cupos, inscritos || null
                ]);
              } else {
                await db.query('UPDATE docentes_materias SET especialidadDestino = ?, seccion = ?, cupos = ?, inscritos = ? WHERE REPLACE(docente_cedula, "V-", "") = ? AND nombre = ?', [
                  especialidad, secciones, cupos, inscritos || null, cedulaLimpiada, materiaNombre
                ]);
              }
              await db.query('INSERT IGNORE INTO materias_catalogo (nombre) VALUES (?)', [materiaNombre.toUpperCase()]);
            }

            const updates = [];
            const updateVals = [];
            if (colBancoIdx !== -1 && row[colBancoIdx]) {
              updates.push("banco = ?");
              updateVals.push(String(row[colBancoIdx]).trim());
            }
            if (colCuentaIdx !== -1 && row[colCuentaIdx]) {
              const cta = String(row[colCuentaIdx]).replace(/\D/g, '');
              if (cta.length >= 10) {
                updates.push("cuentaBancaria = ?");
                updateVals.push(cta);
              }
            }
            if (colRifIdx !== -1 && row[colRifIdx]) {
              updates.push("rif = ?");
              updateVals.push(String(row[colRifIdx]).trim());
            }
            if (colCorreoIdx !== -1 && row[colCorreoIdx]) {
              updates.push("correo = ?");
              updateVals.push(String(row[colCorreoIdx]).trim());
            }
            if (colTelefonosIdx !== -1 && row[colTelefonosIdx]) {
              updates.push("telefonos = ?");
              updateVals.push(String(row[colTelefonosIdx]).trim());
            }
            if (updates.length > 0) {
              updateVals.push(cedulaLimpiada);
              try {
                await db.query(`UPDATE docentes SET ${updates.join(', ')} WHERE REPLACE(cedula, 'V-', '') = ?`, updateVals);
              } catch (bankUpdateErr) {
                console.error('Error actualizando campos extra desde Excel:', bankUpdateErr);
              }
            }
          }
        }
        
        try {
          await db.query(`
            UPDATE docentes d
            JOIN datos_externos_docentes e 
              ON REPLACE(d.cedula, 'V-', '') = REPLACE(e.cedula_docente, 'V-', '')
            SET 
              d.sedeCentro = NULLIF(e.SEDe_CENTRO, ''),
              d.department = IF(e.DPTO != '', e.DPTO, d.department),
              d.especialidad = IF(e.especialidad != '', e.especialidad, d.especialidad)
          `);
        } catch(syncErr) {
          console.error('Error durante sincronización permanente:', syncErr);
        }
        
        affected++;
      }
      try {
        fs.unlinkSync(file.path);
      } catch (e) {}
    }
    
    if (affected === 0) {
      return res.status(400).json({ error: 'El archivo no contiene las columnas esperadas. Asegúrate de que tenga una columna con "Cédula", "C.I", o "Identidad".' });
    }
    
    res.json({ message: 'Sincronización exitosa', affected });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno: ' + err.message });
  }
});

// 2. GET /external-data
router.get('/external-data', async (req, res) => {
  res.json({ cursos: [], docentes: [] });
});

// 3. POST /migrate
router.post('/migrate', requireRole('ADMIN'), async (req, res) => {
  try {
    const { docentes } = req.body;
    
    if (!docentes || docentes.length === 0) {
      return res.json({ success: true, count: 0 });
    }

    const docentesValues = docentes.map(d => [
      d.cedula, d.nombres, d.apellidos, d.department, d.status || 'Por Revisar', 
      d.fechaNac || '', d.rif || '', d.correo || '', d.direccion || '', d.telefonos || '', 
      d.banco || '', d.cuentaBancaria || '', d.tipoCuenta || 'Ahorro',
      d.titulosPregrado || '', d.titulosPostgrado || '', d.categoriaDocente || 'Instructor', 
      d.dedicacion || 'Tiempo Convencional', d.periodoAcademico || '2025-I', 
      d.semanas || 15, d.fechaDesde || '', d.fechaHasta || '', d.doctorado || ''
    ]);

    const query = `
      INSERT INTO docentes (
        cedula, nombres, apellidos, department, status, fechaNac, rif, correo, direccion, telefonos, 
        banco, cuentaBancaria, tipoCuenta, titulosPregrado, titulosPostgrado, 
        categoriaDocente, dedicacion, periodoAcademico, semanas, fechaDesde, fechaHasta, doctorado
      ) VALUES ?
      ON DUPLICATE KEY UPDATE 
        nombres=VALUES(nombres), apellidos=VALUES(apellidos), department=VALUES(department),
        status=VALUES(status)
    `;
    await db.query(query, [docentesValues]);

    const cedulas = docentes.map(d => d.cedula);
    await db.query('DELETE FROM docentes_materias WHERE docente_cedula IN (?)', [cedulas]);

    const materiasValues = [];
    for (const d of docentes) {
      if (d.materias && d.materias.length > 0) {
        for (const m of d.materias) {
          materiasValues.push([
            d.cedula,
            m.nombre,
            parseInt(m.horasSemanal) || 0,
            parseInt(m.horasLapso) || 0,
            m.especialidadDestino || '',
            m.seccion || m.secciones || '',
            (m.cupos !== undefined && m.cupos !== null && m.cupos !== '') ? String(m.cupos).trim() : null,
            (m.inscritos !== undefined && m.inscritos !== null && m.inscritos !== '') ? parseInt(m.inscritos) : null
          ]);
        }
      }
    }
    
    if (materiasValues.length > 0) {
      await db.query(
        'INSERT INTO docentes_materias (docente_cedula, nombre, horasSemanal, horasLapso, especialidadDestino, seccion, cupos, inscritos) VALUES ?',
        [materiasValues]
      );
    }
    
    res.json({ success: true, count: docentes.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// 4. POST /sync/batch
router.post('/sync/batch', requireAuth, async (req, res) => {
  const { queue } = req.body;
  if (!queue || !Array.isArray(queue) || queue.length === 0) {
    return res.json({ success: true, processed: 0, succeeded: 0, failed: 0, succeededIds: [], errors: [] });
  }

  const results = {
    processed: 0,
    succeeded: 0,
    failed: 0,
    succeededIds: [],
    errors: []
  };

  for (const item of queue) {
    results.processed++;
    try {
      const { type, payload } = item;
      if (!payload) {
        if (item.id) results.succeededIds.push(item.id);
        results.succeeded++;
        continue;
      }

      if (type === 'CREATE_STAFF' || type === 'UPDATE_STAFF') {
        const d = payload;
        const cleanCedula = String(d.cedula || '').trim();
        const vCedula = cleanCedula.startsWith('V-') ? cleanCedula : `V-${cleanCedula.replace(/^[Vv]-?/, '')}`;
        const query = `
          INSERT INTO docentes (
            cedula, nombres, apellidos, department, status, fechaNac, rif, correo, correoInstitucional, direccion, telefonos, 
            banco, cuentaBancaria, tipoCuenta, titulosPregrado, titulosPostgrado, 
            categoriaDocente, dedicacion, periodoAcademico, semanas, fechaDesde, fechaHasta, doctorado, sedeCentro
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            nombres=VALUES(nombres), apellidos=VALUES(apellidos), department=VALUES(department),
            status=VALUES(status), fechaNac=VALUES(fechaNac), rif=VALUES(rif), correo=VALUES(correo),
            correoInstitucional=VALUES(correoInstitucional),
            direccion=VALUES(direccion), telefonos=VALUES(telefonos), banco=VALUES(banco), 
            cuentaBancaria=VALUES(cuentaBancaria), tipoCuenta=VALUES(tipoCuenta),
            titulosPregrado=VALUES(titulosPregrado), titulosPostgrado=VALUES(titulosPostgrado), 
            categoriaDocente=VALUES(categoriaDocente), dedicacion=VALUES(dedicacion), 
            periodoAcademico=VALUES(periodoAcademico), semanas=VALUES(semanas), 
            fechaDesde=VALUES(fechaDesde), fechaHasta=VALUES(fechaHasta), doctorado=VALUES(doctorado),
            sedeCentro=VALUES(sedeCentro)
        `;
        const values = [
          vCedula, d.nombres || d.nombre || 'Docente', d.apellidos || '', d.department || d.departamento || 'Docencia', d.status || 'Por Revisar', 
          d.fechaNac || '', d.rif || '', d.correo || '', d.correoInstitucional || '', d.direccion || '', d.telefonos || '', 
          d.banco || '', d.cuentaBancaria || '', d.tipoCuenta || 'Ahorro',
          d.titulosPregrado || '', d.titulosPostgrado || '', d.categoriaDocente || 'Instructor', 
          d.dedicacion || 'Tiempo Convencional', d.periodoAcademico || '2026-I', 
          parseInt(d.semanas) || 15, d.fechaDesde || '', d.fechaHasta || '', d.doctorado || '',
          d.sedeCentro || 'Rubio'
        ];
        await db.query(query, values);
        await db.query('DELETE FROM autorizaciones WHERE cedula = ? OR cedula = ?', [vCedula, cleanCedula]);

        if (d.materias && Array.isArray(d.materias)) {
          await db.query('DELETE FROM docentes_materias WHERE docente_cedula = ? OR docente_cedula = ?', [vCedula, cleanCedula]);
          const validMats = d.materias.filter(m => m && (m.nombre || m.nom_Curso));
          if (validMats.length > 0) {
            const materiasValues = validMats.map(m => [
              vCedula,
              m.nombre || m.nom_Curso,
              parseInt(m.horasSemanal || m.horasSemanales) || 0,
              parseInt(m.horasLapso) || 0,
              m.especialidadDestino || '',
              m.seccion || m.secciones || '',
              (m.cupos !== undefined && m.cupos !== null && m.cupos !== '') ? String(m.cupos).trim() : null,
              (m.inscritos !== undefined && m.inscritos !== null && m.inscritos !== '') ? parseInt(m.inscritos) : null
            ]);
            await db.query('INSERT INTO docentes_materias (docente_cedula, nombre, horasSemanal, horasLapso, especialidadDestino, seccion, cupos, inscritos) VALUES ?', [materiasValues]);
          }
        }
        results.succeeded++;
        if (item.id) results.succeededIds.push(item.id);
      } else if (type === 'UPDATE_CARGA') {
        const { cedula, materias, status, periodoAcademico, semanas, fechaDesde, fechaHasta } = payload;
        const cleanCedula = String(cedula || '').trim();
        if (!cleanCedula) {
          if (item.id) results.succeededIds.push(item.id);
          results.succeeded++;
          continue;
        }

        const vCedula = cleanCedula.startsWith('V-') ? cleanCedula : `V-${cleanCedula.replace(/^[Vv]-?/, '')}`;
        const bareCedula = cleanCedula.replace(/^[Vv]-?/, '');

        const [docRows] = await db.query(
          'SELECT cedula, department, periodoAcademico FROM docentes WHERE cedula = ? OR cedula = ? OR cedula = ? LIMIT 1',
          [cleanCedula, vCedula, bareCedula]
        );

        let targetCedula = vCedula;
        if (docRows.length > 0) {
          targetCedula = docRows[0].cedula;
          let updateQuery = 'UPDATE docentes SET status = ?';
          let updateParams = [status || 'Activo'];
          if (periodoAcademico !== undefined && periodoAcademico !== null) {
            updateQuery += ', periodoAcademico = ?, semanas = ?, fechaDesde = ?, fechaHasta = ?';
            updateParams.push(periodoAcademico, parseInt(semanas) || 15, fechaDesde || '', fechaHasta || '');
          }
          updateQuery += ' WHERE cedula = ?';
          updateParams.push(targetCedula);
          await db.query(updateQuery, updateParams);
        } else {
          // Si el docente no existe aún en la base de datos central, registrar fila base para mantener integridad relacional
          await db.query(
            'INSERT INTO docentes (cedula, nombres, apellidos, department, status, periodoAcademico, semanas, fechaDesde, fechaHasta) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [targetCedula, payload.nombres || payload.nombre || 'Docente', payload.apellidos || '(Offline)', payload.department || payload.departamento || 'Docencia', status || 'Activo', periodoAcademico || '2026-I', parseInt(semanas) || 15, fechaDesde || '', fechaHasta || '']
          );
        }

        await db.query('DELETE FROM docentes_materias WHERE docente_cedula = ? OR docente_cedula = ? OR docente_cedula = ?', [targetCedula, vCedula, bareCedula]);
        const validMaterias = (materias || []).filter(m => m && (m.nombre || m.nom_Curso));
        if (validMaterias.length > 0) {
          const materiasValues = validMaterias.map(m => [
            targetCedula,
            m.nombre || m.nom_Curso,
            parseInt(m.horasSemanal || m.horasSemanales) || 0,
            parseInt(m.horasLapso) || ((parseInt(m.horasSemanal || m.horasSemanales) || 0) * (parseInt(semanas) || 15)),
            m.especialidadDestino || payload.especialidad || '',
            m.seccion || m.secciones || '',
            (m.cupos !== undefined && m.cupos !== null && m.cupos !== '') ? String(m.cupos).trim() : null,
            (m.inscritos !== undefined && m.inscritos !== null && m.inscritos !== '') ? parseInt(m.inscritos) : null
          ]);
          await db.query('INSERT INTO docentes_materias (docente_cedula, nombre, horasSemanal, horasLapso, especialidadDestino, seccion, cupos, inscritos) VALUES ?', [materiasValues]);
        }

        try {
          const targetPeriodo = periodoAcademico || docRows[0]?.periodoAcademico || '2026-I';
          const totSem = validMaterias.reduce((acc, m) => acc + (parseInt(m.horasSemanal || m.horasSemanales) || 0), 0);
          const totLap = validMaterias.reduce((acc, m) => acc + (parseInt(m.horasLapso) || ((parseInt(m.horasSemanal || m.horasSemanales) || 0) * (parseInt(semanas) || 15))), 0);
          await db.query(`
            INSERT INTO cargas_historicas (cedula_docente, periodoAcademico, department, status, semanas, fechaDesde, fechaHasta, materias, totalHorasSemanal, totalHorasLapso)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
              status = VALUES(status), semanas = VALUES(semanas), fechaDesde = VALUES(fechaDesde), fechaHasta = VALUES(fechaHasta),
              materias = VALUES(materias), totalHorasSemanal = VALUES(totalHorasSemanal), totalHorasLapso = VALUES(totalHorasLapso)
          `, [
            targetCedula, targetPeriodo, docRows[0]?.department || payload.department || 'Docencia', status || 'Activo',
            parseInt(semanas) || 15, fechaDesde || '', fechaHasta || '', JSON.stringify(validMaterias), totSem, totLap
          ]);
        } catch (histErr) {}

        results.succeeded++;
        if (item.id) results.succeededIds.push(item.id);
      } else if (type === 'DELETE_STAFF') {
        const { cedula } = payload;
        const cleanCedula = String(cedula || '').trim();
        const vCedula = cleanCedula.startsWith('V-') ? cleanCedula : `V-${cleanCedula.replace(/^[Vv]-?/, '')}`;
        const bareCedula = cleanCedula.replace(/^[Vv]-?/, '');

        await db.query('DELETE FROM docentes WHERE cedula = ? OR cedula = ? OR cedula = ?', [cleanCedula, vCedula, bareCedula]);
        await db.query('DELETE FROM docentes_materias WHERE docente_cedula = ? OR docente_cedula = ? OR docente_cedula = ?', [cleanCedula, vCedula, bareCedula]);
        results.succeeded++;
        if (item.id) results.succeededIds.push(item.id);
      } else {
        // Tipo no reconocido, dar por resuelto para no atascar la cola
        results.succeeded++;
        if (item.id) results.succeededIds.push(item.id);
      }
    } catch (errItem) {
      console.error('Error sincronizando item de cola:', errItem);
      results.failed++;
      results.errors.push({ item, error: errItem.message });
    }
  }

  try {
    const { invalidateDocentesCache } = require('../services/docentesCache.service');
    invalidateDocentesCache();
  } catch (cErr) {}

  try {
    const auditorUser = req.user?.username || req.user?.name || queue[0]?.auditor?.username || 'Sistema Offline';
    const auditorRole = req.user?.role || queue[0]?.auditor?.role || 'AUDITOR';
    await logAction(auditorUser, auditorRole, 'Sincronización Offline en Lote', `Se procesaron ${results.succeeded} cambios exitosos de ${results.processed} encolados.`, req);
  } catch (logErr) {}

  res.json({ success: true, ...results });
});

module.exports = router;
