const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const logger = require('../utils/logger');
const { requireAuth, requireStaffAuth, requireRole, STAFF_ROLES } = require('../middlewares/auth');
const { generateToken } = require('../utils/security');
const { createRateLimiter } = require('../middlewares/securityHeaders');
const { sanitizeString, validateCedula } = require('../utils/validator');
const { logAction } = require('../services/auditService');
const { normalizeDepartmentName } = require('../utils/normalizer');
const {
  getDocentesCache,
  setDocentesCache,
  updateDocenteInCache,
  invalidateDocentesCache,
  pendingDocentesFetches
} = require('../services/docentesCache.service');

function stripSensitiveDocenteFields(doc) {
  if (!doc || typeof doc !== 'object') return doc;
  const { clave: _omitClave, ...safeDoc } = doc;
  return safeDoc;
}

function canAccessDocenteRecord(user, targetCedula) {
  if (!user) return false;
  if (STAFF_ROLES.includes(user.role)) return true;
  if (user.role === 'DOCENTE_PORTAL') {
    const userNums = String(user.cedula || '').replace(/\D/g, '');
    const targetNums = String(targetCedula || '').replace(/\D/g, '');
    return Boolean(userNums && targetNums && userNums === targetNums);
  }
  return false;
}

// Función centralizada para consultar la BD con coalescing de promesas concurrentes
async function fetchDocentesListInternal(periodo) {
  let activePeriodObj = null;
  let activePeriodName = null;
  try {
    const [actRows] = await db.query("SELECT * FROM periodos_academicos WHERE estado = 'ACTIVO' LIMIT 1");
    if (actRows.length > 0) {
      activePeriodObj = actRows[0];
      activePeriodName = actRows[0].nombre;
    } else {
      const [latestRows] = await db.query("SELECT * FROM periodos_academicos ORDER BY id DESC LIMIT 1");
      if (latestRows.length > 0) {
        activePeriodObj = latestRows[0];
        activePeriodName = latestRows[0].nombre;
      }
    }
  } catch (e) {}

  if (!periodo || periodo === 'Todos' || (activePeriodName && periodo === activePeriodName)) {
    const [docentes] = await db.query('SELECT * FROM docentes');
    const [materias] = await db.query('SELECT * FROM docentes_materias');
    
    const materiasPorDocente = {};
    for (const m of materias) {
      const normalizedMateria = {
        ...m,
        seccion: m.seccion || m.secciones || '',
        cupos: (m.cupos !== undefined && m.cupos !== null && m.cupos !== '') ? m.cupos : '',
        inscritos: (m.inscritos !== undefined && m.inscritos !== null && m.inscritos !== '') ? m.inscritos : '',
        cohorte: (m.cohorte !== undefined && m.cohorte !== null && m.cohorte !== '') ? String(m.cohorte).trim() : ''
      };
      const rawKey = String(m.docente_cedula || '').trim();
      const numKey = rawKey.replace(/\D/g, '');
      if (rawKey) {
        if (!materiasPorDocente[rawKey]) materiasPorDocente[rawKey] = [];
        materiasPorDocente[rawKey].push(normalizedMateria);
      }
      if (numKey && numKey !== rawKey) {
        if (!materiasPorDocente[numKey]) materiasPorDocente[numKey] = [];
        materiasPorDocente[numKey].push(normalizedMateria);
      }
    }

    let fallbackCargasMap = {};
    try {
      const [cargas] = await db.query('SELECT * FROM cargas_historicas ORDER BY id ASC');
      for (const c of cargas) {
        let mats = [];
        try {
          mats = typeof c.materias === 'string' ? JSON.parse(c.materias) : (c.materias || []);
        } catch (e) { mats = []; }
        if (mats && mats.length > 0) {
          const normMats = mats.map(m => ({
            ...m,
            seccion: m.seccion || m.secciones || '',
            cupos: (m.cupos !== undefined && m.cupos !== null && m.cupos !== '') ? m.cupos : '',
            inscritos: (m.inscritos !== undefined && m.inscritos !== null && m.inscritos !== '') ? m.inscritos : '',
            cohorte: (m.cohorte !== undefined && m.cohorte !== null && m.cohorte !== '') ? String(m.cohorte).trim() : ''
          }));
          const rawKey = String(c.cedula_docente || '').trim();
          const numKey = rawKey.replace(/\D/g, '');
          if (rawKey) fallbackCargasMap[rawKey] = normMats;
          if (numKey && numKey !== rawKey) fallbackCargasMap[numKey] = normMats;
        }
      }
    } catch (e) {}
    
    const result = docentes.map(doc => {
      const docNumKey = String(doc.cedula || '').replace(/\D/g, '');
      let docMats = materiasPorDocente[doc.cedula] || (docNumKey ? materiasPorDocente[docNumKey] : null) || [];
      const fbMats = fallbackCargasMap[doc.cedula] || fallbackCargasMap[docNumKey] || [];
      if (docMats.length === 0 && fbMats.length > 0) {
        docMats = fbMats;
      } else if (docMats.length > 0 && fbMats.length > 0) {
        docMats = docMats.map(dm => {
          if (dm.cohorte && String(dm.cohorte).trim() !== '') return dm;
          const matchFb = fbMats.find(fm => (fm.nombre || '').trim().toUpperCase() === (dm.nombre || '').trim().toUpperCase());
          return (matchFb && matchFb.cohorte) ? { ...dm, cohorte: String(matchFb.cohorte).trim() } : dm;
        });
      }
      const totSem = docMats.reduce((sum, m) => sum + (parseInt(m.horasSemanal) || 0), 0);
      const totLap = docMats.reduce((sum, m) => sum + (parseInt(m.horasLapso) || 0), 0);

      const fallbackEsp = docMats.find(m => m.especialidadDestino && String(m.especialidadDestino).trim() !== '')?.especialidadDestino || '';

      const hasRealLoad = docMats.length > 0 && totSem > 0;
      const finalStatus = (!hasRealLoad && (doc.status === 'Validado' || doc.status === 'Activo'))
        ? 'Por Revisar'
        : (doc.status || 'Por Revisar');

      return stripSensitiveDocenteFields({
        ...doc,
        department: normalizeDepartmentName(doc.department),
        status: finalStatus,
        especialidad: (doc.especialidad && String(doc.especialidad).trim() !== '') ? doc.especialidad : fallbackEsp,
        periodoAcademico: (periodo && periodo !== 'Todos') ? periodo : (activePeriodName || doc.periodoAcademico || '2026-I'),
        semanas: activePeriodObj?.semanas || doc.semanas || 15,
        fechaDesde: activePeriodObj?.fechaDesde || doc.fechaDesde || '',
        fechaHasta: activePeriodObj?.fechaHasta || doc.fechaHasta || '',
        materias: docMats,
        totalHorasSemanal: totSem,
        totalHorasLapso: totLap
      });
    });
    
    return result;
  }

  let reqPeriodObj = null;
  try {
    const [pRows] = await db.query('SELECT * FROM periodos_academicos WHERE nombre = ? LIMIT 1', [periodo]);
    if (pRows.length > 0) reqPeriodObj = pRows[0];
  } catch (e) {}

  const isPeriodPlanificacion = reqPeriodObj?.estado === 'PLANIFICACION';
  const isPeriodCerrado = reqPeriodObj?.estado === 'CERRADO';

  const [docentes] = await db.query('SELECT * FROM docentes');
  const [cargas] = await db.query('SELECT * FROM cargas_historicas WHERE periodoAcademico = ?', [periodo]);

  const cargasMap = {};
  for (const c of cargas) {
    let mats = [];
    try {
      mats = typeof c.materias === 'string' ? JSON.parse(c.materias) : (c.materias || []);
    } catch (e) {
      mats = [];
    }
    const normMats = mats.map(m => {
      return {
        ...m,
        seccion: m.seccion || m.secciones || '',
        cupos: (m.cupos !== undefined && m.cupos !== null && m.cupos !== '') ? m.cupos : '',
        inscritos: (m.inscritos !== undefined && m.inscritos !== null && m.inscritos !== '') ? m.inscritos : '',
        cohorte: (m.cohorte !== undefined && m.cohorte !== null && m.cohorte !== '') ? String(m.cohorte).trim() : ''
      };
    });
    const rawKey = String(c.cedula_docente || '').trim();
    const numKey = rawKey.replace(/\D/g, '');
    const cargaItem = { ...c, materias: normMats };
    if (rawKey) cargasMap[rawKey] = cargaItem;
    if (numKey && numKey !== rawKey) cargasMap[numKey] = cargaItem;
  }

  if (isPeriodPlanificacion) {
    if (cargas.length === 0) {
      return [];
    }
    const result = [];
    for (const doc of docentes) {
      const docNumKey = String(doc.cedula || '').replace(/\D/g, '');
      const carga = cargasMap[doc.cedula] || (docNumKey ? cargasMap[docNumKey] : null);
      if (carga) {
        const fallbackEsp = (carga.materias || []).find(m => m.especialidadDestino && String(m.especialidadDestino).trim() !== '')?.especialidadDestino || '';
        result.push(stripSensitiveDocenteFields({
          ...doc,
          department: normalizeDepartmentName(doc.department),
          especialidad: (doc.especialidad && String(doc.especialidad).trim() !== '') ? doc.especialidad : fallbackEsp,
          periodoAcademico: periodo,
          status: carga.status || 'En Planificación',
          semanas: reqPeriodObj?.semanas || carga.semanas || doc.semanas || 15,
          fechaDesde: reqPeriodObj?.fechaDesde || carga.fechaDesde || '',
          fechaHasta: reqPeriodObj?.fechaHasta || carga.fechaHasta || '',
          materias: carga.materias || [],
          totalHorasSemanal: carga.totalHorasSemanal || (carga.materias || []).reduce((s, m) => s + (parseInt(m.horasSemanal) || 0), 0),
          totalHorasLapso: carga.totalHorasLapso || (carga.materias || []).reduce((s, m) => s + (parseInt(m.horasLapso) || 0), 0),
          esCargaPlanificada: true
        }));
      }
    }
    return result;
  }

  if (isPeriodCerrado || (!isPeriodPlanificacion && cargas.length > 0)) {
    // Obtenemos las materias directas de docentes_materias correspondientes a este período específico
    const [dmRows] = await db.query('SELECT * FROM docentes_materias WHERE periodoAcademico = ?', [periodo]);
    const dmMap = new Map();
    for (const dm of dmRows) {
      const k1 = `${String(dm.docente_cedula).trim()}_${(dm.nombre || '').trim().toUpperCase()}`;
      const k2 = `${String(dm.docente_cedula).replace(/\D/g, '')}_${(dm.nombre || '').trim().toUpperCase()}`;
      dmMap.set(k1, dm);
      dmMap.set(k2, dm);
    }

    const result = [];
    for (const doc of docentes) {
      const docNumKey = String(doc.cedula || '').replace(/\D/g, '');
      const carga = cargasMap[doc.cedula] || (docNumKey ? cargasMap[docNumKey] : null);
      if (carga) {
        const enrichedMats = (carga.materias || []).map(m => {
          const mNombre = (m.nombre || '').trim().toUpperCase();
          const directDm = dmMap.get(`${doc.cedula}_${mNombre}`) || (docNumKey ? dmMap.get(`${docNumKey}_${mNombre}`) : null);
          return {
            ...m,
            seccion: (m.seccion !== undefined && m.seccion !== null && String(m.seccion).trim() !== '') 
              ? String(m.seccion).trim() 
              : (directDm?.seccion || ''),
            cupos: (m.cupos !== undefined && m.cupos !== null && m.cupos !== '' && parseInt(m.cupos) > 0) 
              ? m.cupos 
              : (directDm?.cupos || ''),
            inscritos: (m.inscritos !== undefined && m.inscritos !== null && m.inscritos !== '' && parseInt(m.inscritos) > 0) 
              ? m.inscritos 
              : (directDm?.inscritos || ''),
            cohorte: (m.cohorte !== undefined && m.cohorte !== null && String(m.cohorte).trim() !== '')
              ? String(m.cohorte).trim()
              : (directDm?.cohorte ? String(directDm.cohorte).trim() : '')
          };
        });

        const fallbackEsp = enrichedMats.find(m => m.especialidadDestino && String(m.especialidadDestino).trim() !== '')?.especialidadDestino || '';
        const cargaTotSem = carga.totalHorasSemanal || enrichedMats.reduce((s, m) => s + (parseInt(m.horasSemanal) || 0), 0);
        const cargaTotLap = carga.totalHorasLapso || enrichedMats.reduce((s, m) => s + (parseInt(m.horasLapso) || 0), 0);
        const cargaHasRealLoad = enrichedMats.length > 0 && cargaTotSem > 0;
        const finalCargaStatus = (!cargaHasRealLoad && (carga.status === 'Validado' || carga.status === 'Activo'))
          ? 'Por Revisar'
          : (carga.status || 'Cerrado');

        result.push(stripSensitiveDocenteFields({
          ...doc,
          department: normalizeDepartmentName(doc.department),
          especialidad: (doc.especialidad && String(doc.especialidad).trim() !== '') ? doc.especialidad : fallbackEsp,
          periodoAcademico: periodo,
          status: finalCargaStatus,
          semanas: reqPeriodObj?.semanas || carga.semanas || doc.semanas || 15,
          fechaDesde: reqPeriodObj?.fechaDesde || carga.fechaDesde || '',
          fechaHasta: reqPeriodObj?.fechaHasta || carga.fechaHasta || '',
          materias: enrichedMats,
          totalHorasSemanal: cargaTotSem,
          totalHorasLapso: cargaTotLap,
          esCargaPlanificada: false
        }));
      }
    }
    return result;
  }

  return [];
}

// 1. GET /docentes (Solo personal institucional autenticado)
router.get('/docentes', requireStaffAuth, async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    const { periodo, page, limit, search, department, sede } = req.query;

    const cacheKey = String(periodo || 'ACTUAL').trim();
    let fullList = getDocentesCache(cacheKey);

    if (fullList) {
      res.setHeader('X-Cache', 'HIT');
    } else {
      res.setHeader('X-Cache', 'MISS');
      if (!pendingDocentesFetches.has(cacheKey)) {
        const fetchPromise = fetchDocentesListInternal(periodo)
          .then(data => {
            setDocentesCache(cacheKey, data);
            pendingDocentesFetches.delete(cacheKey);
            return data;
          })
          .catch(err => {
            pendingDocentesFetches.delete(cacheKey);
            throw err;
          });
        pendingDocentesFetches.set(cacheKey, fetchPromise);
      }
      fullList = await pendingDocentesFetches.get(cacheKey);
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    if (!isNaN(pageNum) && pageNum > 0 && !isNaN(limitNum) && limitNum > 0) {
      let filtered = fullList;
      if (department && department !== 'Todos') {
        const deptNorm = String(department).trim().toLowerCase();
        filtered = filtered.filter(d => (d.department || '').toLowerCase() === deptNorm);
      }
      if (sede && sede !== 'Todas') {
        const sedeNorm = String(sede).trim().toLowerCase();
        filtered = filtered.filter(d => (d.sedeCentro || '').toLowerCase() === sedeNorm);
      }
      if (search && String(search).trim() !== '') {
        const term = String(search).trim().toLowerCase();
        filtered = filtered.filter(d =>
          (d.cedula || '').toLowerCase().includes(term) ||
          (d.nombres || '').toLowerCase().includes(term) ||
          (d.apellidos || '').toLowerCase().includes(term) ||
          (d.especialidad || '').toLowerCase().includes(term)
        );
      }
      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / limitNum));
      const startIndex = (pageNum - 1) * limitNum;
      const paginatedData = filtered.slice(startIndex, startIndex + limitNum);
      return res.json({
        data: paginatedData,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages
      });
    }

    res.json(fullList);
  } catch (error) {
    console.error('Error in /api/docentes:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. POST /docentes/validar-portal
router.post('/docentes/validar-portal', createRateLimiter(20, 10 * 60 * 1000, 'Demasiados intentos de validación de credenciales.'), async (req, res) => {
  try {
    const { cedula, password } = req.body;
    if (!cedula || !password) {
      return res.status(400).json({ success: false, message: 'Cédula y contraseña requeridas.' });
    }
    const inputCed = String(cedula).trim();
    const inputNumbers = inputCed.replace(/\D/g, '');
    if (!inputNumbers) {
      return res.status(400).json({ success: false, message: 'Por favor ingrese un número de cédula válido.' });
    }

    const [rows] = await db.query(
      "SELECT * FROM docentes WHERE cedula = ? OR REPLACE(REPLACE(cedula, 'V-', ''), 'v-', '') = ? LIMIT 1",
      [inputCed, inputNumbers]
    );

    if (rows.length === 0) {
      return res.json({
        success: false,
        notFound: true,
        message: 'Cédula no encontrada. Su Jefe de Departamento debe registrarlo en el sistema antes de que pueda llenar su ficha.'
      });
    }

    const existingStaff = rows[0];
    const defaultClave = inputNumbers.length >= 4 ? inputNumbers.slice(-4) : inputNumbers;
    const hasCustomClave = Boolean(existingStaff.clave && String(existingStaff.clave).trim() !== '');
    const enteredClave = String(password).trim();

    let isPasswordValid = false;

    if (hasCustomClave) {
      const expectedClave = String(existingStaff.clave).trim();
      const isBcryptHash = expectedClave.startsWith('$2a$') || expectedClave.startsWith('$2b$');
      if (isBcryptHash) {
        try {
          isPasswordValid = bcrypt.compareSync(enteredClave, expectedClave);
        } catch (e) {
          isPasswordValid = false;
        }
      } else {
        isPasswordValid = (enteredClave === expectedClave);
      }
    } else {
      // Si el docente aún NO tiene clave personalizada, ingresa con los últimos 4 dígitos por defecto
      isPasswordValid = (enteredClave === defaultClave);
    }

    if (!isPasswordValid) {
      return res.json({
        success: false,
        message: hasCustomClave
          ? 'Contraseña incorrecta. Debe ingresar con su clave personalizada configurada o usar "¿Olvidó su clave?" para restablecerla.'
          : 'Contraseña incorrecta. Por favor ingrese los últimos 4 dígitos de su cédula.'
      });
    }

    const [materias] = await db.query('SELECT * FROM docentes_materias WHERE docente_cedula = ?', [existingStaff.cedula]);
    existingStaff.materias = materias || [];
    existingStaff.department = normalizeDepartmentName(existingStaff.department);

    const hasCargaActiva = existingStaff.materias && existingStaff.materias.length > 0;
    const isCurrentValidado = hasCargaActiva && (existingStaff.status === 'Validado' || existingStaff.status === 'Activo' || existingStaff.status === 'Cerrado' || existingStaff.status === 'Culminado');
    const finalCurrentStatus = (!hasCargaActiva && (existingStaff.status === 'Validado' || existingStaff.status === 'Activo')) ? 'Por Revisar' : (existingStaff.status || 'Por Revisar');

    const mapLapsos = new Map();
    const currentPeriod = existingStaff.periodoAcademico || '2026-I';
    mapLapsos.set(currentPeriod, {
      periodo: currentPeriod,
      status: finalCurrentStatus,
      validadoPorJefe: isCurrentValidado,
      materias: isCurrentValidado ? existingStaff.materias : [],
      semanas: existingStaff.semanas || 15,
      fechaDesde: existingStaff.fechaDesde || '',
      fechaHasta: existingStaff.fechaHasta || '',
      department: existingStaff.department,
      sedeCentro: existingStaff.sedeCentro,
      categoriaDocente: existingStaff.categoriaDocente,
      dedicacion: existingStaff.dedicacion,
      especialidad: existingStaff.especialidad
    });

    try {
      const [cargasHist] = await db.query(
        'SELECT * FROM cargas_historicas WHERE cedula_docente = ? OR cedula_docente = ? ORDER BY periodoAcademico DESC',
        [existingStaff.cedula, inputNumbers]
      );
      for (const h of cargasHist) {
        if (!h.periodoAcademico) continue;
        let hMats = [];
        try {
          hMats = typeof h.materias === 'string' ? JSON.parse(h.materias) : (h.materias || []);
        } catch (e) {
          hMats = [];
        }
        
        const enrichedHMats = (hMats.length > 0 ? hMats : (existingStaff.periodoAcademico === h.periodoAcademico ? (existingStaff.materias || []) : [])).map(m => {
          const directMatch = (existingStaff.materias || []).find(dm => (dm.nombre || '').trim().toUpperCase() === (m.nombre || '').trim().toUpperCase());
          return {
            ...m,
            seccion: (m.seccion !== undefined && m.seccion !== null && String(m.seccion).trim() !== '') ? String(m.seccion).trim() : (directMatch?.seccion || ''),
            cupos: (m.cupos !== undefined && m.cupos !== null && m.cupos !== '' && parseInt(m.cupos) > 0) ? m.cupos : (directMatch?.cupos || ''),
            inscritos: (m.inscritos !== undefined && m.inscritos !== null && m.inscritos !== '' && parseInt(m.inscritos) > 0) ? m.inscritos : (directMatch?.inscritos || ''),
            cohorte: (m.cohorte !== undefined && m.cohorte !== null && String(m.cohorte).trim() !== '') ? String(m.cohorte).trim() : (directMatch?.cohorte ? String(directMatch.cohorte).trim() : '')
          };
        });

        const hasHMats = enrichedHMats.length > 0;
        const isValidado = hasHMats && (h.status === 'Validado' || h.status === 'Activo' || h.status === 'Cerrado' || h.status === 'Culminado');
        const finalHStatus = (!hasHMats && (h.status === 'Validado' || h.status === 'Activo')) ? 'Por Revisar' : (h.status || 'Por Revisar');

        if (!mapLapsos.has(h.periodoAcademico) || isValidado) {
          mapLapsos.set(h.periodoAcademico, {
            periodo: h.periodoAcademico,
            status: finalHStatus,
            validadoPorJefe: isValidado,
            materias: isValidado ? enrichedHMats : [],
            semanas: h.semanas || 15,
            fechaDesde: h.fechaDesde || '',
            fechaHasta: h.fechaHasta || '',
            department: h.department || existingStaff.department,
            sedeCentro: existingStaff.sedeCentro,
            categoriaDocente: existingStaff.categoriaDocente,
            dedicacion: existingStaff.dedicacion,
            especialidad: existingStaff.especialidad
          });
        }
      }
    } catch (e) {
      console.warn('Aviso leyendo cargas_historicas en validar-portal:', e.message);
    }

    try {
      const [contrats] = await db.query(`
        SELECT c.*, p.nombre as periodo_nombre, p.estado as periodo_estado,
               d.nombre as departamento_nombre, s.nombre as sede_nombre,
               fa.categoria_docente, fa.dedicacion, esp.nombre as especialidad
        FROM docentes_contrataciones_v3 c
        JOIN docentes_v3 doc ON c.docente_id = doc.id
        JOIN periodos_academicos_v3 p ON c.periodo_id = p.id
        LEFT JOIN departamentos_v3 d ON c.departamento_id = d.id
        LEFT JOIN sedes_v3 s ON c.sede_id = s.id
        LEFT JOIN docentes_formacion_academica_v3 fa ON c.docente_id = fa.docente_id
        LEFT JOIN especialidades_v3 esp ON COALESCE(c.especialidad_id, fa.especialidad_id) = esp.id
        WHERE doc.cedula = ? OR REPLACE(REPLACE(doc.cedula, 'V-', ''), 'v-', '') = ?
      `, [existingStaff.cedula, inputNumbers]);

      for (const c of contrats) {
        const pNombre = c.periodo_nombre;
        if (!pNombre) continue;
        const isContratNominallyValid = c.status === 'Validado' || c.status === 'Activo';
        let mats = [];
        if (isContratNominallyValid) {
          const [mRows] = await db.query(`
            SELECT ca.*, m.codigo, m.nombre,
                   ca.horas_semanal as horasSemanal,
                   ca.horas_lapso as horasLapso,
                   esp.nombre as especialidadDestino,
                   esp.nombre as especialidad_destino
            FROM cargas_academicas_v3 ca
            JOIN materias_catalogo_v3 m ON ca.materia_id = m.id
            LEFT JOIN especialidades_v3 esp ON ca.especialidad_destino_id = esp.id
            WHERE ca.contratacion_id = ?
          `, [c.id]).catch(() => [[]]);
          mats = mRows || [];
        }
        const hasContratMats = mats.length > 0 || (existingStaff.periodoAcademico === pNombre && existingStaff.materias && existingStaff.materias.length > 0);
        const isValid = hasContratMats && isContratNominallyValid;
        const finalContratStatus = (!hasContratMats && isContratNominallyValid) ? 'Por Revisar' : (c.status || 'Por Revisar');

        if (!mapLapsos.has(pNombre) || isValid) {
          mapLapsos.set(pNombre, {
            periodo: pNombre,
            status: finalContratStatus,
            validadoPorJefe: isValid,
            materias: isValid ? (mats.length > 0 ? mats : (existingStaff.periodoAcademico === pNombre ? existingStaff.materias : [])) : [],
            semanas: c.semanas || 15,
            fechaDesde: c.fecha_desde ? new Date(c.fecha_desde).toISOString().split('T')[0] : '',
            fechaHasta: c.fecha_hasta ? new Date(c.fecha_hasta).toISOString().split('T')[0] : '',
            department: c.departamento_nombre || existingStaff.department,
            sedeCentro: c.sede_nombre || existingStaff.sedeCentro,
            categoriaDocente: c.categoria_docente || existingStaff.categoriaDocente,
            dedicacion: c.dedicacion || existingStaff.dedicacion,
            especialidad: c.especialidad || existingStaff.especialidad
          });
        }
      }
    } catch (e) {}

    try {
      const [periodosBD] = await db.query('SELECT * FROM periodos_academicos ORDER BY id DESC');
      for (const p of periodosBD) {
        if (!p.nombre) continue;
        if (!mapLapsos.has(p.nombre)) {
          mapLapsos.set(p.nombre, {
            periodo: p.nombre,
            status: 'Por Revisar',
            validadoPorJefe: false,
            materias: [],
            semanas: p.semanas || 15,
            fechaDesde: p.fechaDesde || '',
            fechaHasta: p.fechaHasta || '',
            department: existingStaff.department,
            sedeCentro: existingStaff.sedeCentro,
            categoriaDocente: existingStaff.categoriaDocente,
            dedicacion: existingStaff.dedicacion,
            especialidad: existingStaff.especialidad,
            enPlanificacion: p.estado === 'PLANIFICACION'
          });
        }
      }
    } catch (e) {
      console.warn('Aviso leyendo periodos_academicos en validar-portal:', e.message);
    }

    const fichasLapsos = Array.from(mapLapsos.values()).sort((a, b) => b.periodo.localeCompare(a.periodo));
    const isFirstTime = !existingStaff.clave || String(existingStaff.clave).trim() === '';
    const safeStaff = stripSensitiveDocenteFields(existingStaff);
    const portalToken = generateToken({
      id: existingStaff.id || 0,
      username: existingStaff.cedula,
      cedula: existingStaff.cedula,
      name: `${existingStaff.nombres || ''} ${existingStaff.apellidos || ''}`.trim() || existingStaff.cedula,
      role: 'DOCENTE_PORTAL',
      department: existingStaff.department || 'Docencia'
    });

    return res.json({
      success: true,
      portalToken,
      staff: safeStaff,
      fichasLapsos,
      isFirstTime
    });
  } catch (err) {
    console.error('Error en /api/docentes/validar-portal:', err);
    res.status(500).json({ success: false, message: 'Error en el servidor al validar credenciales.' });
  }
});

// 3. POST /docentes/recuperar-clave
router.post('/docentes/recuperar-clave', createRateLimiter(6, 15 * 60 * 1000, 'Demasiadas solicitudes de recuperación de clave.'), async (req, res) => {
  try {
    const { cedula, email } = req.body;
    const inputCed = String(cedula || '').trim().replace(/\D/g, '');
    const inputMail = String(email || '').trim().toLowerCase();

    if (!inputCed || !inputMail) {
      return res.status(400).json({ success: false, message: 'Cédula y correo electrónico requeridos.' });
    }

    const [rows] = await db.query(
      "SELECT * FROM docentes WHERE cedula = ? OR REPLACE(REPLACE(cedula, 'V-', ''), 'v-', '') = ? LIMIT 1",
      [cedula, inputCed]
    );

    if (rows.length === 0) {
      return res.json({ success: false, message: 'Cédula no encontrada en el sistema.' });
    }

    const staff = rows[0];
    const personalEmail = (staff.correo || '').trim().toLowerCase();
    const instEmail = (staff.correoInstitucional || '').trim().toLowerCase();

    if (!personalEmail && !instEmail) {
      return res.json({
        success: false,
        message: 'Su ficha no tiene un correo electrónico registrado. Por favor comuníquese con la Subdirección de Docencia o su Jefe de Departamento para restablecer su acceso.'
      });
    }

    if (inputMail !== personalEmail && inputMail !== instEmail) {
      return res.json({
        success: false,
        message: 'El correo ingresado no coincide con el registrado en su ficha.'
      });
    }

    await db.query('UPDATE docentes SET clave = NULL WHERE cedula = ?', [staff.cedula]);
    invalidateDocentesCache();

    const default4 = inputCed.length >= 4 ? inputCed.slice(-4) : inputCed;
    return res.json({
      success: true,
      default4,
      message: `¡Identidad verificada exitosamente! Su contraseña ha sido restablecida a los últimos 4 dígitos de su cédula (${default4}). Ahora puede ingresar al portal y el sistema le solicitará configurar su nueva contraseña.`
    });
  } catch (err) {
    console.error('Error en /api/docentes/recuperar-clave:', err);
    res.status(500).json({ success: false, message: 'Error procesando solicitud.' });
  }
});

// 3.1 POST /docentes/cambiar-clave-portal (Autoservicio Seguro del Docente)
router.post('/docentes/cambiar-clave-portal', requireAuth, createRateLimiter(15, 10 * 60 * 1000, 'Demasiados intentos de cambio de clave.'), async (req, res) => {
  try {
    const { cedula, newPassword } = req.body;
    if (!cedula || !newPassword) {
      return res.status(400).json({ success: false, message: 'Cédula y nueva contraseña requeridas.' });
    }
    const inputCed = String(cedula).trim();
    const inputNumbers = inputCed.replace(/\D/g, '');
    if (!canAccessDocenteRecord(req.user, inputNumbers)) {
      return res.status(403).json({ success: false, message: 'No está autorizado para modificar la contraseña de otro docente.' });
    }
    const cleanPass = String(newPassword).trim();

    if (cleanPass.length < 4) {
      return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 4 caracteres.' });
    }

    const [rows] = await db.query(
      "SELECT * FROM docentes WHERE cedula = ? OR REPLACE(REPLACE(cedula, 'V-', ''), 'v-', '') = ? LIMIT 1",
      [inputCed, inputNumbers]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Docente no encontrado en el sistema.' });
    }

    const doc = rows[0];
    const hashedPassword = bcrypt.hashSync(cleanPass, 10);

    await db.query('UPDATE docentes SET clave = ? WHERE cedula = ?', [hashedPassword, doc.cedula]);
    updateDocenteInCache(doc.cedula, { clave: hashedPassword });
    invalidateDocentesCache(true);

    await logAction(doc.cedula, 'DOCENTE', 'Cambio de Clave en Portal', `El docente actualizó su contraseña de acceso personal.`, req);

    res.json({ success: true, message: '¡Contraseña actualizada exitosamente!' });
  } catch (err) {
    console.error('Error en /api/docentes/cambiar-clave-portal:', err);
    res.status(500).json({ success: false, message: 'Error en el servidor al actualizar la contraseña.' });
  }
});

// 3.2 POST /docentes/portal-actualizar-ficha (Autoservicio del Docente para completar su Ficha)
router.post('/docentes/portal-actualizar-ficha', requireAuth, async (req, res) => {
  try {
    const { cedula, ...data } = req.body;
    if (!cedula) {
      return res.status(400).json({ success: false, message: 'Cédula requerida.' });
    }
    const inputCed = String(cedula).trim();
    const inputNumbers = inputCed.replace(/\D/g, '');
    if (!canAccessDocenteRecord(req.user, inputNumbers)) {
      return res.status(403).json({ success: false, message: 'No está autorizado para modificar la ficha de otro docente.' });
    }

    const [rows] = await db.query(
      "SELECT * FROM docentes WHERE cedula = ? OR REPLACE(REPLACE(cedula, 'V-', ''), 'v-', '') = ? LIMIT 1",
      [inputCed, inputNumbers]
    );

    const doc = rows.length > 0 ? rows[0] : {};
    const isNew = rows.length === 0;
    if (isNew && !STAFF_ROLES.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Solo su Jefe de Departamento o Talento Humano puede registrar un docente nuevo.' });
    }

    const cleanCedula = doc.cedula || (inputCed.startsWith('V-') ? inputCed : `V-${inputNumbers}`);
    const cleanNombres = sanitizeString(data.nombres !== undefined ? data.nombres : (doc.nombres || ''));
    const cleanApellidos = sanitizeString(data.apellidos !== undefined ? data.apellidos : (doc.apellidos || ''));
    const cleanFechaNac = data.fechaNac !== undefined ? String(data.fechaNac).trim().substring(0, 10) : (doc.fechaNac || null);
    const cleanDireccion = sanitizeString(data.direccion !== undefined ? data.direccion : (doc.direccion || ''));
    const cleanTelefonos = sanitizeString(data.telefonos !== undefined ? data.telefonos : (doc.telefonos || ''));
    const cleanCorreo = sanitizeString(data.correo !== undefined ? data.correo : (doc.correo || ''));
    const cleanCorreoInst = sanitizeString(data.correoInstitucional !== undefined ? data.correoInstitucional : (doc.correoInstitucional || ''));
    const cleanRif = sanitizeString(data.rif !== undefined ? data.rif : (doc.rif || ''));
    const cleanBanco = sanitizeString(data.banco !== undefined ? data.banco : (doc.banco || ''));
    const cleanCuenta = sanitizeString(data.cuentaBancaria !== undefined ? data.cuentaBancaria : (doc.cuentaBancaria || ''));
    const cleanTipoCuenta = sanitizeString(data.tipoCuenta !== undefined ? data.tipoCuenta : (doc.tipoCuenta || 'Ahorro'));
    const cleanPregrado = sanitizeString(data.titulosPregrado !== undefined ? data.titulosPregrado : (doc.titulosPregrado || ''));
    const cleanPostgrado = sanitizeString(data.titulosPostgrado !== undefined ? data.titulosPostgrado : (doc.titulosPostgrado || ''));
    const cleanDoctorado = sanitizeString(data.doctorado !== undefined ? data.doctorado : (doc.doctorado || ''));
    const cleanCategoria = sanitizeString(data.categoriaDocente !== undefined ? data.categoriaDocente : (doc.categoriaDocente || 'Instructor'));
    const cleanDedicacion = sanitizeString(data.dedicacion !== undefined ? data.dedicacion : (doc.dedicacion || 'Tiempo Convencional'));
    const cleanEspecialidad = sanitizeString(data.especialidad !== undefined ? data.especialidad : (doc.especialidad || ''));
    const cleanSede = sanitizeString(data.sedeCentro !== undefined ? data.sedeCentro : (doc.sedeCentro || 'Rubio'));
    const cleanDept = sanitizeString(data.department !== undefined ? data.department : (doc.department || 'Matemática'));

    let finalClave = doc.clave || null;
    if (data.clave && String(data.clave).trim().length >= 4) {
      const rawClave = String(data.clave).trim();
      finalClave = (rawClave.startsWith('$2a$') || rawClave.startsWith('$2b$')) ? rawClave : bcrypt.hashSync(rawClave, 10);
    }

    if (isNew) {
      const insertQuery = `
        INSERT INTO docentes (
          cedula, nombres, apellidos, department, status, fechaNac, rif, correo, correoInstitucional, direccion, telefonos,
          banco, cuentaBancaria, tipoCuenta, titulosPregrado, titulosPostgrado, doctorado,
          categoriaDocente, dedicacion, sedeCentro, especialidad, clave
        ) VALUES (?, ?, ?, ?, 'Por Revisar', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await db.query(insertQuery, [
        cleanCedula, cleanNombres, cleanApellidos, cleanDept, cleanFechaNac, cleanRif, cleanCorreo, cleanCorreoInst, cleanDireccion, cleanTelefonos,
        cleanBanco, cleanCuenta, cleanTipoCuenta, cleanPregrado, cleanPostgrado, cleanDoctorado,
        cleanCategoria, cleanDedicacion, cleanSede, cleanEspecialidad, finalClave
      ]);
    } else {
      const updateQuery = `
        UPDATE docentes SET 
          nombres = ?, apellidos = ?, fechaNac = ?, direccion = ?, telefonos = ?, correo = ?, correoInstitucional = ?, rif = ?,
          banco = ?, cuentaBancaria = ?, tipoCuenta = ?, titulosPregrado = ?, 
          titulosPostgrado = ?, doctorado = ?, categoriaDocente = ?, dedicacion = ?, especialidad = ?, sedeCentro = ?, clave = ?
        WHERE cedula = ?
      `;

      await db.query(updateQuery, [
        cleanNombres, cleanApellidos, cleanFechaNac, cleanDireccion, cleanTelefonos, cleanCorreo, cleanCorreoInst, cleanRif,
        cleanBanco, cleanCuenta, cleanTipoCuenta, cleanPregrado,
        cleanPostgrado, cleanDoctorado, cleanCategoria, cleanDedicacion, cleanEspecialidad, cleanSede, finalClave, doc.cedula
      ]);
    }

    updateDocenteInCache(cleanCedula, {
      cedula: cleanCedula, nombres: cleanNombres, apellidos: cleanApellidos, fechaNac: cleanFechaNac,
      department: cleanDept, direccion: cleanDireccion, telefonos: cleanTelefonos, correo: cleanCorreo,
      correoInstitucional: cleanCorreoInst, rif: cleanRif, banco: cleanBanco,
      cuentaBancaria: cleanCuenta, tipoCuenta: cleanTipoCuenta,
      titulosPregrado: cleanPregrado, titulosPostgrado: cleanPostgrado,
      doctorado: cleanDoctorado, categoriaDocente: cleanCategoria,
      dedicacion: cleanDedicacion, especialidad: cleanEspecialidad,
      sedeCentro: cleanSede, clave: finalClave
    });
    invalidateDocentesCache(true);

    await logAction(cleanCedula, 'DOCENTE', 'Actualizó Ficha en Portal', `El docente completó o actualizó su ficha personal, académica y bancaria en el portal.`, req);

    res.json({ success: true, message: 'Ficha actualizada exitosamente.' });
  } catch (err) {
    console.error('Error en /api/docentes/portal-actualizar-ficha:', err);
    res.status(500).json({ success: false, message: 'Error actualizando datos de la ficha.' });
  }
});

// 4. POST /docentes
router.post('/docentes', requireRole(['ADMIN', 'JEFE']), async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { auditor, ...d } = req.body;
    
    // Protección ABAC: Si el usuario es JEFE, solo puede gestionar docentes de su propio departamento
    if (req.user && req.user.role === 'JEFE' && req.user.department) {
      const userDeptNorm = normalizeDepartmentName(req.user.department).toLowerCase();
      const targetDeptNorm = normalizeDepartmentName(d.department || '').toLowerCase();
      if (targetDeptNorm && targetDeptNorm !== userDeptNorm) {
        conn.release();
        return res.status(403).json({
          success: false,
          error: `Acceso denegado (ABAC): Como Jefe de Departamento (${req.user.department}), no tiene permisos para crear o modificar personal de ${d.department}.`
        });
      }
    }

    const cedulaRes = validateCedula(d.cedula);
    const cleanCedula = cedulaRes.valid ? cedulaRes.normalized : sanitizeString(d.cedula);
    const cleanNombres = sanitizeString(d.nombres);
    const cleanApellidos = sanitizeString(d.apellidos);
    const cleanDireccion = sanitizeString(d.direccion);
    const cleanTelefonos = sanitizeString(d.telefonos);

    // Hashing Senior con Bcrypt si se proporciona contraseña
    let finalClave = null;
    if (d.clave !== undefined && d.clave !== null && String(d.clave).trim() !== '') {
      const rawClave = String(d.clave).trim();
      finalClave = (rawClave.startsWith('$2a$') || rawClave.startsWith('$2b$'))
        ? rawClave
        : bcrypt.hashSync(rawClave, 10);
    }

    await conn.beginTransaction();

    const query = `
      INSERT INTO docentes (
        cedula, nombres, apellidos, department, status, fechaNac, rif, correo, correoInstitucional, direccion, telefonos, 
        banco, cuentaBancaria, tipoCuenta, titulosPregrado, titulosPostgrado, 
        categoriaDocente, dedicacion, periodoAcademico, semanas, fechaDesde, fechaHasta, doctorado, sedeCentro, especialidad, clave
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        nombres=VALUES(nombres), apellidos=VALUES(apellidos), department=VALUES(department), status=VALUES(status),
        fechaNac=VALUES(fechaNac), rif=VALUES(rif), correo=VALUES(correo), correoInstitucional=VALUES(correoInstitucional),
        direccion=VALUES(direccion), telefonos=VALUES(telefonos),
        banco=VALUES(banco), cuentaBancaria=VALUES(cuentaBancaria), tipoCuenta=VALUES(tipoCuenta),
        titulosPregrado=VALUES(titulosPregrado), titulosPostgrado=VALUES(titulosPostgrado),
        categoriaDocente=VALUES(categoriaDocente), dedicacion=VALUES(dedicacion), 
        periodoAcademico=VALUES(periodoAcademico), semanas=VALUES(semanas), 
        fechaDesde=VALUES(fechaDesde), fechaHasta=VALUES(fechaHasta), doctorado=VALUES(doctorado),
        sedeCentro=VALUES(sedeCentro),
        especialidad=VALUES(especialidad),
        clave=COALESCE(VALUES(clave), clave)
    `;
    
    const initialStatus = (!d.materias || d.materias.length === 0) ? 'Por Revisar' : (d.status || 'Por Revisar');

    const values = [
      cleanCedula, cleanNombres || '', cleanApellidos || '', d.department || '', initialStatus, 
      d.fechaNac || '', d.rif || '', d.correo || '', d.correoInstitucional || '', cleanDireccion || '', cleanTelefonos || '', 
      d.banco || '', d.cuentaBancaria || '', d.tipoCuenta || 'Ahorro',
      d.titulosPregrado || '', d.titulosPostgrado || '', d.categoriaDocente || 'Instructor', d.dedicacion || 'Tiempo Convencional', 
      d.periodoAcademico || '', d.semanas || 15, d.fechaDesde || '', d.fechaHasta || '', d.doctorado || '',
      d.sedeCentro || 'Rubio',
      d.especialidad || '',
      finalClave
    ];

    await conn.query(query, values);
    await conn.query('DELETE FROM autorizaciones WHERE cedula = ? OR cedula = ?', [cleanCedula, d.cedula]);

    await conn.commit();

    // Identidad fidedigna protegida contra spoofing
    const auditorUser = (req.user && req.user.username) ? req.user.username : (auditor && auditor.username ? auditor.username : 'Sistema');
    const auditorRole = (req.user && req.user.role) ? req.user.role : (auditor && auditor.role ? auditor.role : 'ADMIN');
    await logAction(auditorUser, auditorRole, 'Creó/Actualizó Docente', `Cédula: ${cleanCedula}, Nombre: ${cleanNombres} ${cleanApellidos}, Dpto: ${d.department}`, req);

    updateDocenteInCache(d.cedula, d);
    invalidateDocentesCache();
    res.json({ success: true });
  } catch (error) {
    await conn.rollback();
    console.error('Error en POST /api/docentes:', error);
    res.status(500).json({ error: error.message });
  } finally {
    conn.release();
  }
});

// 5. DELETE /docentes/:cedula
router.delete('/docentes/:cedula', requireRole(['ADMIN', 'DOCENCIA', 'JEFE']), async (req, res) => {
  try {
    const { cedula } = req.params;
    const { auditor } = req.body || {};
    
    const bareDelCed = String(cedula || '').trim().replace(/^[VEve]-?/, '');
    const vDelCed = `V-${bareDelCed}`;
    const [doc] = await db.query('SELECT nombres, apellidos, department FROM docentes WHERE cedula = ? OR cedula = ?', [vDelCed, bareDelCed]);

    // Protección ABAC: Si el usuario es JEFE, solo puede eliminar docentes de su propio departamento
    if (req.user && req.user.role === 'JEFE' && req.user.department) {
      const userDeptNorm = normalizeDepartmentName(req.user.department).toLowerCase();
      const targetDeptNorm = doc.length > 0 ? normalizeDepartmentName(doc[0].department || '').toLowerCase() : '';
      if (targetDeptNorm && targetDeptNorm !== userDeptNorm) {
        return res.status(403).json({
          error: `Operación denegada (ABAC): Como Jefe de Departamento (${req.user.department}), no puede eliminar personal adscrito a ${doc[0]?.department || 'otro departamento'}.`
        });
      }
    }

    let details = `Cédula: ${cedula}`;
    if (doc.length > 0) details += `, Nombre: ${doc[0].nombres} ${doc[0].apellidos}, Dpto: ${doc[0].department}`;

    await db.query('DELETE FROM docentes WHERE cedula = ?', [cedula]);
    
    // Identidad fidedigna protegida contra spoofing
    const auditorUser = (req.user && req.user.username) ? req.user.username : (auditor && auditor.username ? auditor.username : 'Sistema');
    const auditorRole = (req.user && req.user.role) ? req.user.role : (auditor && auditor.role ? auditor.role : 'ADMIN');
    await logAction(auditorUser, auditorRole, 'Eliminó Docente', details, req);
    
    invalidateDocentesCache();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. PUT /docentes/carga
router.put('/docentes/carga', requireRole(['ADMIN', 'DOCENCIA', 'JEFE']), async (req, res) => {
  try {
    const { cedula, materias, status, periodoAcademico, semanas, fechaDesde, fechaHasta, auditor } = req.body;
    
    // Normalizar cédula para garantizar match exacto en la vista docentes y tablas normalizadas
    const cleanCedula = String(cedula || '').trim();
    const vCedula = cleanCedula.startsWith('V-') ? cleanCedula : `V-${cleanCedula.replace(/^V/i, '')}`;
    const bareCedula = cleanCedula.replace(/^[Vv]-?/, '');

    const [docRow] = await db.query(
      'SELECT department, periodoAcademico, semanas, fechaDesde, fechaHasta, cedula FROM docentes WHERE cedula = ? OR cedula = ? OR cedula = ? LIMIT 1',
      [cleanCedula, vCedula, bareCedula]
    );
    const canonicalCedula = docRow.length > 0 ? docRow[0].cedula : (vCedula || cleanCedula);
    const dept = docRow.length > 0 ? docRow[0].department : '';

    // Protección ABAC: Si el usuario es JEFE, solo puede modificar cargas de su propio departamento
    if (req.user && req.user.role === 'JEFE' && req.user.department) {
      const userDeptNorm = normalizeDepartmentName(req.user.department).toLowerCase();
      const targetDeptNorm = normalizeDepartmentName(dept).toLowerCase();
      if (targetDeptNorm && targetDeptNorm !== userDeptNorm) {
        return res.status(403).json({
          error: `Operación denegada (ABAC): Como Jefe de Departamento (${req.user.department}), no puede modificar la carga de un docente adscrito a ${dept}.`
        });
      }
    }

    const [actRows] = await db.query("SELECT nombre FROM periodos_academicos WHERE estado = 'ACTIVO' LIMIT 1");
    const activePeriodo = actRows.length > 0 ? actRows[0].nombre : null;
    const currentDocPeriodo = docRow.length > 0 ? docRow[0].periodoAcademico : null;
    let targetPeriodo = periodoAcademico || activePeriodo || currentDocPeriodo;

    // Si el periodo enviado o el previo del docente está cerrado pero hay un lapso ACTIVO oficial, asociar al activo
    if (targetPeriodo && targetPeriodo !== activePeriodo) {
      try {
        const [pRows] = await db.query('SELECT estado FROM periodos_academicos WHERE nombre = ?', [targetPeriodo]);
        if (pRows.length > 0 && pRows[0].estado === 'CERRADO' && activePeriodo) {
          targetPeriodo = activePeriodo;
        }
      } catch (e) {}
    }

    let isPlanificacion = false;
    let isCerrado = false;
    if (targetPeriodo) {
      try {
        const [pRows] = await db.query('SELECT estado FROM periodos_academicos WHERE nombre = ?', [targetPeriodo]);
        if (pRows.length > 0) {
          isPlanificacion = pRows[0].estado === 'PLANIFICACION';
          isCerrado = pRows[0].estado === 'CERRADO';
        }
      } catch (e) {}
    }

    if (isPlanificacion) {
      return res.status(400).json({ 
        error: `Operación bloqueada: El período académico "${targetPeriodo}" se encuentra en PLANIFICACIÓN.\n\nNo está permitido cargar ni asignar materias porque el período aún no está abierto. Debe activar el lapso desde Gestión de Lapsos antes de registrar carga académica.` 
      });
    }

    if (isCerrado) {
      return res.status(400).json({ 
        error: `Operación bloqueada: El período académico "${targetPeriodo}" se encuentra CERRADO.\n\nNo está permitido modificar la carga académica de un período finalizado.` 
      });
    }


    const totSem = (materias || []).reduce((acc, m) => acc + (parseInt(m.horasSemanal) || 0), 0);
    const totLap = (materias || []).reduce((acc, m) => acc + (parseInt(m.horasLapso) || 0), 0);

    const hasValidLoad = (materias && materias.length > 0 && totSem > 0);
    const finalCargaStatus = hasValidLoad ? (status || 'Activo') : 'Por Revisar';

    const allowedDocenteFields = [
      'sedeCentro', 'especialidad', 'banco', 'cuentaBancaria', 'tipoCuenta',
      'rif', 'telefonos', 'correo', 'correoInstitucional', 'direccion',
      'titulosPregrado', 'titulosPostgrado', 'doctorado', 'categoriaDocente', 'dedicacion'
    ];
    const effectivePeriodo = targetPeriodo || periodoAcademico || (docRow.length > 0 ? docRow[0].periodoAcademico : '2026-I');

    let updateQuery = 'UPDATE docentes SET status = ?';
    let updateParams = [finalCargaStatus];

    if (periodoAcademico !== undefined || effectivePeriodo) {
      updateQuery += ', periodoAcademico = ?, semanas = ?, fechaDesde = ?, fechaHasta = ?';
      updateParams.push(effectivePeriodo, parseInt(semanas) || 15, fechaDesde || '', fechaHasta || '');
    }

    for (const f of allowedDocenteFields) {
      if (req.body[f] !== undefined) {
        updateQuery += `, ${f} = ?`;
        updateParams.push(req.body[f]);
      }
    }

    if (!req.body.especialidad && materias && materias.length > 0) {
      const matEsp = materias.find(m => m.especialidadDestino && String(m.especialidadDestino).trim() !== '')?.especialidadDestino;
      if (matEsp) {
        updateQuery += ', especialidad = ?';
        updateParams.push(String(matEsp).trim());
      }
    }
    
    updateQuery += ' WHERE cedula = ? OR cedula = ?';
    updateParams.push(canonicalCedula, bareCedula);

    const per = effectivePeriodo;
    let preservedMaterias = [];

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      await conn.query(updateQuery, updateParams);

      const [existingMats] = await conn.query('SELECT * FROM docentes_materias WHERE docente_cedula = ? OR docente_cedula = ?', [canonicalCedula, bareCedula]);
      const existingMatMap = new Map();
      for (const em of existingMats) {
        if (em.nombre) existingMatMap.set(em.nombre.toUpperCase().trim(), em);
      }

      await conn.query('DELETE FROM docentes_materias WHERE docente_cedula = ? OR docente_cedula = ?', [canonicalCedula, bareCedula]);
      
      if (materias && materias.length > 0) {
        const materiasValues = materias
          .filter(m => m && m.nombre && m.nombre.trim() !== '')
          .map(m => {
            const mNombre = m.nombre.trim().toUpperCase();
            const existing = existingMatMap.get(mNombre);
            const seccion = (m.seccion !== undefined && m.seccion !== null && String(m.seccion).trim() !== '')
              ? String(m.seccion).trim()
              : (existing?.seccion || '');
            const cupos = (m.cupos !== undefined && m.cupos !== null && m.cupos !== '' && parseInt(m.cupos) > 0)
              ? (parseInt(m.cupos) || 0)
              : (parseInt(existing?.cupos) || 0);
            const inscritos = (m.inscritos !== undefined && m.inscritos !== null && m.inscritos !== '' && parseInt(m.inscritos) > 0)
              ? (parseInt(m.inscritos) || 0)
              : (parseInt(existing?.inscritos) || 0);
            const especialidadDestino = m.especialidadDestino 
              ? String(m.especialidadDestino).trim() 
              : (existing?.especialidadDestino || '');

            // COHORTE: Se guarda fielmente el valor asignado por el usuario
            let cohorte = null;
            if (m.cohorte !== undefined && m.cohorte !== null && String(m.cohorte).trim() !== '') {
              cohorte = String(m.cohorte).trim();
            } else if (existing?.cohorte) {
              cohorte = String(existing.cohorte).trim();
            }

            preservedMaterias.push({
              ...m,
              nombre: mNombre,
              horasSemanal: parseInt(m.horasSemanal) || 0,
              horasLapso: parseInt(m.horasLapso) || ((parseInt(m.horasSemanal) || 0) * 15),
              especialidadDestino,
              seccion,
              cupos,
              inscritos,
              cohorte: cohorte || '',
              periodoAcademico: per
            });

            return [
              canonicalCedula, 
              mNombre, 
              parseInt(m.horasSemanal) || 0, 
              parseInt(m.horasLapso) || ((parseInt(m.horasSemanal) || 0) * 15),
              especialidadDestino,
              seccion,
              cupos,
              inscritos,
              cohorte,
              per
            ];
          });

        if (materiasValues.length > 0) {
          await conn.query(
            'INSERT INTO docentes_materias (docente_cedula, nombre, horasSemanal, horasLapso, especialidadDestino, seccion, cupos, inscritos, cohorte, periodoAcademico) VALUES ?',
            [materiasValues]
          );
        }
      }

      const sem = semanas !== undefined ? semanas : (docRow.length > 0 ? docRow[0].semanas : 15);
      const fDesde = fechaDesde !== undefined ? fechaDesde : (docRow.length > 0 ? docRow[0].fechaDesde : '');
      const fHasta = fechaHasta !== undefined ? fechaHasta : (docRow.length > 0 ? docRow[0].fechaHasta : '');

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
      `, [canonicalCedula, per, dept, finalCargaStatus, sem, fDesde, fHasta, JSON.stringify(preservedMaterias.length > 0 ? preservedMaterias : (materias || [])), totSem, totLap]);

      await conn.commit();
    } catch (txError) {
      await conn.rollback();
      throw txError;
    } finally {
      conn.release();
    }
    
    // Identidad fidedigna protegida contra spoofing
    const auditorUser = (req.user && req.user.username) ? req.user.username : (auditor && auditor.username ? auditor.username : 'Sistema');
    const auditorRole = (req.user && req.user.role) ? req.user.role : (auditor && auditor.role ? auditor.role : 'ADMIN');
    await logAction(auditorUser, auditorRole, 'Actualizó Validación/Carga', `Cédula: ${canonicalCedula}, Estado: ${finalCargaStatus}, Materias asignadas: ${materias ? materias.length : 0}`, req);

    const resolvedEspecialidad = req.body.especialidad !== undefined
      ? req.body.especialidad
      : (preservedMaterias.find(m => m.especialidadDestino && String(m.especialidadDestino).trim() !== '')?.especialidadDestino);

    const cachePatch = {
      status: finalCargaStatus,
      materias: preservedMaterias,
      totalHorasSemanal: totSem,
      totalHorasLapso: totLap,
      periodoAcademico: per,
      ...(resolvedEspecialidad !== undefined ? { especialidad: resolvedEspecialidad } : {})
    };
    updateDocenteInCache(canonicalCedula, cachePatch);
    if (cleanCedula !== canonicalCedula) {
      updateDocenteInCache(cleanCedula, cachePatch);
    }
    invalidateDocentesCache(true);
    res.json({ success: true, isPlanificacion: false });
  } catch (error) {
    console.error('Error in /api/docentes/carga:', error);
    res.status(500).json({ error: error.message });
  }
});

// 7. GET /docentes/:cedula/historial
router.get('/docentes/:cedula/historial', requireAuth, async (req, res) => {
  try {
    const { cedula } = req.params;
    const bareCedula = String(cedula || '').trim().replace(/^[VEve]-?/, '');
    if (!canAccessDocenteRecord(req.user, bareCedula)) {
      return res.status(403).json({ success: false, error: 'No autorizado para consultar el historial de otro docente.' });
    }
    const vCedula = `V-${bareCedula}`;
    const [rows] = await db.query(
      'SELECT * FROM cargas_historicas WHERE cedula_docente = ? OR cedula_docente = ? ORDER BY periodoAcademico DESC, fechaRegistro DESC',
      [bareCedula, vCedula]
    );
    const parsed = rows.map(r => {
      let mats = [];
      try {
        mats = typeof r.materias === 'string' ? JSON.parse(r.materias) : (r.materias || []);
      } catch (e) {
        mats = [];
      }
      return { ...r, materias: mats };
    });
    res.json(parsed);
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
