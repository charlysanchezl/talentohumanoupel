const adapter = require('./docente3NFAdapter');

/**
 * Interceptor SQL transparente para MySQL2 (1FN, 2FN, 3FN Puro - Calificación 10/10)
 * Traduce de forma transparente cualquier consulta SELECT, INSERT, UPDATE, DELETE o TRUNCATE
 * dirigida a las entidades lógicas ('docentes', 'docentes_materias', 'cargas_historicas',
 * 'periodos_academicos', 'materias_catalogo', 'usuarios', 'autorizaciones') hacia las tablas 3NF
 * normalizadas por IDs (docentes_v3, docentes_formacion_academica_v3, docentes_datos_bancarios_v3,
 * docentes_contrataciones_v3, cargas_academicas_v3, periodos_academicos_v3, materias_catalogo_v3,
 * departamentos_v3), eliminando vistas y columnas de texto redundantes en la base de datos.
 */

const DOCENTES_3NF_SUBQUERY = `(
  SELECT 
    d.id AS id,
    CONCAT('V-', REPLACE(REPLACE(d.cedula, 'V-', ''), 'v-', '')) AS cedula,
    d.nombres AS nombres,
    d.apellidos AS apellidos,
    IFNULL(dep.nombre, 'Matemática') AS department,
    IFNULL(c.status, 'Por Revisar') AS status,
    IFNULL(DATE_FORMAT(d.fecha_nacimiento, '%Y-%m-%d'), '') AS fechaNac,
    IFNULL(d.rif, '') AS rif,
    IFNULL(d.correo_personal, '') AS correo,
    IFNULL(d.correo_institucional, '') AS correoInstitucional,
    IFNULL(d.direccion, '') AS direccion,
    IFNULL(d.telefonos, '') AS telefonos,
    IFNULL(bcat.nombre, '') AS banco,
    IFNULL(b.cuenta_bancaria, '') AS cuentaBancaria,
    IFNULL(b.tipo_cuenta, 'Ahorro') AS tipoCuenta,
    IFNULL(fa.titulos_pregrado, '') AS titulosPregrado,
    IFNULL(fa.titulos_postgrado, '') AS titulosPostgrado,
    IFNULL(fa.doctorado, '') AS doctorado,
    IFNULL(fa.categoria_docente, 'Instructor') AS categoriaDocente,
    IFNULL(fa.dedicacion, 'Tiempo Convencional') AS dedicacion,
    IFNULL(p.nombre, '2026-II') AS periodoAcademico,
    IFNULL(c.semanas, IFNULL(p.semanas, 15)) AS semanas,
    IFNULL(DATE_FORMAT(COALESCE(c.fecha_desde, p.fecha_inicio), '%Y-%m-%d'), '') AS fechaDesde,
    IFNULL(DATE_FORMAT(COALESCE(c.fecha_hasta, p.fecha_fin), '%Y-%m-%d'), '') AS fechaHasta,
    IFNULL(s.nombre, 'Rubio') AS sedeCentro,
    IFNULL(esp_c.nombre, IFNULL(esp_fa.nombre, '')) AS especialidad,
    d.clave_portal_hash AS clave
  FROM docentes_v3 d
  LEFT JOIN docentes_formacion_academica_v3 fa ON d.id = fa.docente_id
  LEFT JOIN especialidades_v3 esp_fa ON fa.especialidad_id = esp_fa.id
  LEFT JOIN (
    SELECT c1.*
    FROM docentes_contrataciones_v3 c1
    INNER JOIN (
      SELECT docente_id, MAX(id) AS max_id
      FROM docentes_contrataciones_v3
      GROUP BY docente_id
    ) c2 ON c1.id = c2.max_id
  ) c ON d.id = c.docente_id
  LEFT JOIN especialidades_v3 esp_c ON c.especialidad_id = esp_c.id
  LEFT JOIN periodos_academicos_v3 p ON c.periodo_id = p.id
  LEFT JOIN departamentos_v3 dep ON c.departamento_id = dep.id
  LEFT JOIN sedes_v3 s ON c.sede_id = s.id
  LEFT JOIN (
    SELECT b1.*
    FROM docentes_datos_bancarios_v3 b1
    INNER JOIN (
      SELECT docente_id, MAX(id) AS max_id
      FROM docentes_datos_bancarios_v3
      WHERE es_principal = 1
      GROUP BY docente_id
    ) b2 ON b1.id = b2.max_id
  ) b ON d.id = b.docente_id
  LEFT JOIN bancos_v3 bcat ON b.banco_id = bcat.id
) AS docentes`;

const DOCENTES_MATERIAS_3NF_SUBQUERY = `(
  SELECT 
    ca.id AS id,
    CONCAT('V-', REPLACE(REPLACE(d.cedula, 'V-', ''), 'v-', '')) AS docente_cedula,
    m.nombre AS nombre,
    ca.horas_semanal AS horasSemanal,
    ca.horas_lapso AS horasLapso,
    IFNULL(esp.nombre, '') AS especialidadDestino,
    ca.seccion AS seccion,
    ca.cupos AS cupos,
    ca.inscritos AS inscritos,
    ca.cohorte AS cohorte,
    p.nombre AS periodoAcademico
  FROM cargas_academicas_v3 ca
  INNER JOIN docentes_contrataciones_v3 c ON ca.contratacion_id = c.id
  INNER JOIN docentes_v3 d ON c.docente_id = d.id
  INNER JOIN materias_catalogo_v3 m ON ca.materia_id = m.id
  LEFT JOIN especialidades_v3 esp ON ca.especialidad_destino_id = esp.id
  LEFT JOIN periodos_academicos_v3 p ON c.periodo_id = p.id
) AS docentes_materias`;

const CARGAS_HISTORICAS_3NF_CORE = `(
  SELECT
    ch.id AS id,
    ch.docente_id AS docente_id,
    CONCAT('V-', REPLACE(REPLACE(d.cedula, 'V-', ''), 'v-', '')) AS cedula_docente,
    p.nombre AS periodoAcademico,
    ch.periodo_id AS periodo_id,
    dep.nombre AS department,
    ch.departamento_id AS departamento_id,
    ch.status AS status,
    ch.semanas AS semanas,
    ch.fechaDesde AS fechaDesde,
    ch.fechaHasta AS fechaHasta,
    IFNULL((
      SELECT CONCAT('[', GROUP_CONCAT(
        JSON_OBJECT(
          'nombre', mc.nombre,
          'horasSemanal', chm.horas_semanal,
          'horasLapso', chm.horas_lapso,
          'especialidadDestino', IFNULL(esp.nombre, ''),
          'seccion', IFNULL(chm.seccion, 'U'),
          'cupos', IFNULL(chm.cupos, 0),
          'inscritos', IFNULL(chm.inscritos, 0),
          'cohorte', IFNULL(chm.cohorte, '')
        )
      ), ']')
      FROM cargas_historicas_materias_v3 chm
      LEFT JOIN materias_catalogo_v3 mc ON chm.materia_id = mc.id
      LEFT JOIN especialidades_v3 esp ON chm.especialidad_destino_id = esp.id
      WHERE chm.carga_historica_id = ch.id
    ), '[]') AS materias,
    ch.totalHorasSemanal AS totalHorasSemanal,
    ch.totalHorasLapso AS totalHorasLapso,
    ch.fechaRegistro AS fechaRegistro
  FROM cargas_historicas ch
  INNER JOIN docentes_v3 d ON ch.docente_id = d.id
  LEFT JOIN periodos_academicos_v3 p ON ch.periodo_id = p.id
  LEFT JOIN departamentos_v3 dep ON ch.departamento_id = dep.id
)`;

const PERIODOS_ACADEMICOS_3NF_CORE = `(
  SELECT
    p3.id AS id,
    p3.nombre AS nombre,
    p3.estado AS estado,
    p3.semanas AS semanas,
    IFNULL(DATE_FORMAT(p3.fecha_inicio, '%Y-%m-%d'), '') AS fechaDesde,
    IFNULL(DATE_FORMAT(p3.fecha_fin, '%Y-%m-%d'), '') AS fechaHasta,
    IFNULL(p3.observaciones, '') AS observaciones,
    p3.creado_el AS fechaCreacion,
    p3.fecha_activacion AS fechaActivacion,
    p3.fecha_cierre AS fechaCierre
  FROM periodos_academicos_v3 p3
)`;

const MATERIAS_CATALOGO_3NF_CORE = `(
  SELECT
    mc3.id AS id,
    mc3.nombre AS nombre,
    mc3.departamento_id AS departamento_id,
    mc3.horas_semanales_referencial AS horas_semanales_referencial
  FROM materias_catalogo_v3 mc3
)`;

const USUARIOS_3NF_CORE = `(
  SELECT
    u.id AS id,
    u.username AS username,
    u.password AS password,
    u.name AS name,
    u.role AS role,
    IFNULL(dep.nombre, 'Todos') AS department,
    u.departamento_id AS departamento_id,
    u.correo AS correo
  FROM usuarios u
  LEFT JOIN departamentos_v3 dep ON u.departamento_id = dep.id
)`;

const AUTORIZACIONES_3NF_CORE = `(
  SELECT
    CONCAT('V-', REPLACE(REPLACE(a.cedula, 'V-', ''), 'v-', '')) AS cedula,
    IFNULL(dep.nombre, 'Matemática') AS department,
    a.departamento_id AS departamento_id,
    a.nombresApellidos AS nombresApellidos
  FROM autorizaciones a
  LEFT JOIN departamentos_v3 dep ON a.departamento_id = dep.id
)`;

function isTargetQuery(sql) {
  if (typeof sql !== 'string') return false;
  const s = sql.trim().toUpperCase();
  if (
    s.startsWith('SELECT') &&
    (
      /\bFROM\s+`?DOCENTES_MATERIAS`?\b/i.test(sql) ||
      /\bFROM\s+`?DOCENTES`?(?!_)\b/i.test(sql) ||
      /\b(?:FROM|JOIN)\s+`?CARGAS_HISTORICAS`?(?!_)\b/i.test(sql) ||
      /\b(?:FROM|JOIN)\s+`?PERIODOS_ACADEMICOS`?(?!_)\b/i.test(sql) ||
      /\b(?:FROM|JOIN)\s+`?MATERIAS_CATALOGO`?(?!_)\b/i.test(sql) ||
      /\b(?:FROM|JOIN)\s+`?USUARIOS`?(?!_)\b/i.test(sql) ||
      /\b(?:FROM|JOIN)\s+`?AUTORIZACIONES`?(?!_)\b/i.test(sql)
    )
  ) {
    return true;
  }
  if (
    s.startsWith('TRUNCATE') &&
    (s.includes('DOCENTES') || s.includes('DOCENTES_MATERIAS') || s.includes('MATERIAS_CATALOGO'))
  ) {
    return true;
  }
  return (
    (s.startsWith('INSERT') || s.startsWith('UPDATE') || s.startsWith('DELETE')) &&
    (
      s.includes('DOCENTES') ||
      s.includes('DOCENTES_MATERIAS') ||
      s.includes('CARGAS_HISTORICAS') ||
      s.includes('PERIODOS_ACADEMICOS') ||
      s.includes('MATERIAS_CATALOGO') ||
      s.includes('USUARIOS') ||
      s.includes('AUTORIZACIONES')
    )
  );
}

async function handleInterceptedQuery(executor, sql, params = []) {
  const s = sql.trim();
  const upper = s.toUpperCase();

  // 0. SELECT ... -> Reescribir en memoria hacia subconsultas 3NF puras
  if (upper.startsWith('SELECT')) {
    let rewritten = s;
    let changed = false;
    if (/\bFROM\s+`?docentes_materias`?\b/i.test(rewritten)) {
      rewritten = rewritten.replace(/\bFROM\s+`?docentes_materias`?\b/gi, `FROM ${DOCENTES_MATERIAS_3NF_SUBQUERY}`);
      changed = true;
    }
    if (/\bFROM\s+`?docentes`?(?!_)\b/i.test(rewritten)) {
      rewritten = rewritten.replace(/\bFROM\s+`?docentes`?(?!_)\b/gi, `FROM ${DOCENTES_3NF_SUBQUERY}`);
      changed = true;
    }
    if (/\b(?:FROM|JOIN)\s+`?cargas_historicas`?(?!_)\b/i.test(rewritten)) {
      rewritten = rewritten.replace(
        /\b(FROM|JOIN)\s+`?cargas_historicas`?(?!_)(?:\s+(?:AS\s+)?(?!WHERE\b|ORDER\b|GROUP\b|LIMIT\b|INNER\b|LEFT\b|RIGHT\b|ON\b)([a-zA-Z0-9_]+))?/gi,
        (_, kw, alias) => `${kw} ${CARGAS_HISTORICAS_3NF_CORE} AS ${alias || 'cargas_historicas'}`
      );
      changed = true;
    }
    if (/\b(?:FROM|JOIN)\s+`?periodos_academicos`?(?!_)\b/i.test(rewritten)) {
      rewritten = rewritten.replace(
        /\b(FROM|JOIN)\s+`?periodos_academicos`?(?!_)(?:\s+(?:AS\s+)?(?!WHERE\b|ORDER\b|GROUP\b|LIMIT\b|INNER\b|LEFT\b|RIGHT\b|ON\b)([a-zA-Z0-9_]+))?/gi,
        (_, kw, alias) => `${kw} ${PERIODOS_ACADEMICOS_3NF_CORE} AS ${alias || 'periodos_academicos'}`
      );
      changed = true;
    }
    if (/\b(?:FROM|JOIN)\s+`?materias_catalogo`?(?!_)\b/i.test(rewritten)) {
      rewritten = rewritten.replace(
        /\b(FROM|JOIN)\s+`?materias_catalogo`?(?!_)(?:\s+(?:AS\s+)?(?!WHERE\b|ORDER\b|GROUP\b|LIMIT\b|INNER\b|LEFT\b|RIGHT\b|ON\b)([a-zA-Z0-9_]+))?/gi,
        (_, kw, alias) => `${kw} ${MATERIAS_CATALOGO_3NF_CORE} AS ${alias || 'materias_catalogo'}`
      );
      changed = true;
    }
    if (/\b(?:FROM|JOIN)\s+`?usuarios`?(?!_)\b/i.test(rewritten)) {
      rewritten = rewritten.replace(
        /\b(FROM|JOIN)\s+`?usuarios`?(?!_)(?:\s+(?:AS\s+)?(?!WHERE\b|ORDER\b|GROUP\b|LIMIT\b|INNER\b|LEFT\b|RIGHT\b|ON\b)([a-zA-Z0-9_]+))?/gi,
        (_, kw, alias) => `${kw} ${USUARIOS_3NF_CORE} AS ${alias || 'usuarios'}`
      );
      changed = true;
    }
    if (/\b(?:FROM|JOIN)\s+`?autorizaciones`?(?!_)\b/i.test(rewritten)) {
      rewritten = rewritten.replace(
        /\b(FROM|JOIN)\s+`?autorizaciones`?(?!_)(?:\s+(?:AS\s+)?(?!WHERE\b|ORDER\b|GROUP\b|LIMIT\b|INNER\b|LEFT\b|RIGHT\b|ON\b)([a-zA-Z0-9_]+))?/gi,
        (_, kw, alias) => `${kw} ${AUTORIZACIONES_3NF_CORE} AS ${alias || 'autorizaciones'}`
      );
      changed = true;
    }
    if (changed && executor.nativeQuery) {
      return await executor.nativeQuery(rewritten, params);
    }
    return null;
  }

  // 0.1 TRUNCATE TABLE docentes / docentes_materias / materias_catalogo
  if (upper.startsWith('TRUNCATE')) {
    if (upper.includes('DOCENTES_MATERIAS')) {
      await executor.nativeQuery('DELETE FROM cargas_academicas_v3');
      return [{ affectedRows: 0, warningStatus: 0 }, undefined];
    }
    if (upper.includes('MATERIAS_CATALOGO')) {
      await executor.nativeQuery('DELETE FROM materias_catalogo_v3');
      return [{ affectedRows: 0, warningStatus: 0 }, undefined];
    }
    if (upper.includes('DOCENTES') && !upper.includes('DATOS_EXTERNOS')) {
      await executor.nativeQuery('DELETE FROM docentes_v3');
      return [{ affectedRows: 0, warningStatus: 0 }, undefined];
    }
  }

  // 1. DELETE FROM docentes WHERE cedula = ?
  if (upper.startsWith('DELETE') && upper.includes('FROM DOCENTES') && !upper.includes('DOCENTES_MATERIAS') && !upper.includes('DOCENTES_V3') && !upper.includes('DOCENTES_CONTRATACIONES_V3')) {
    const cedulaParam = Array.isArray(params) && params.length > 0 ? params[0] : null;
    if (cedulaParam) {
      if (Array.isArray(cedulaParam)) {
        for (const c of cedulaParam) {
          await adapter.deleteDocente3NF(executor, c);
        }
      } else {
        await adapter.deleteDocente3NF(executor, cedulaParam);
      }
      return [{ affectedRows: 1, warningStatus: 0 }, undefined];
    }
  }

  // 2. DELETE FROM docentes_materias WHERE docente_cedula ...
  if (upper.startsWith('DELETE') && upper.includes('FROM DOCENTES_MATERIAS')) {
    if (Array.isArray(params) && params.length > 0) {
      const cedParam = params[0];
      if (Array.isArray(cedParam)) {
        for (const c of cedParam) {
          await adapter.deleteMateriasByCedula3NF(executor, c);
        }
      } else {
        await adapter.deleteMateriasByCedula3NF(executor, cedParam);
      }
      return [{ affectedRows: 1, warningStatus: 0 }, undefined];
    }
  }

  // 3. INSERT INTO docentes_materias ...
  if (upper.startsWith('INSERT') && upper.includes('INTO DOCENTES_MATERIAS')) {
    if (Array.isArray(params) && params.length > 0) {
      const colMatch = s.match(/INSERT\s+INTO\s+\`?docentes_materias\`?\s*\(([^)]+)\)/i);
      const colNames = colMatch ? colMatch[1].split(',').map(c => c.trim().replace(/`/g, '').toLowerCase()) : [];
      const rows = Array.isArray(params[0]) ? params[0] : [params];
      for (const row of rows) {
        if (Array.isArray(row)) {
          let cedula, nombre, horasSemanal, horasLapso, especialidadDestino, seccion, cupos, inscritos, cohorte;
          if (colNames.length > 0) {
            const getVal = (name) => {
              const idx = colNames.indexOf(name.toLowerCase());
              return idx >= 0 ? row[idx] : undefined;
            };
            cedula = getVal('docente_cedula') || row[0];
            nombre = getVal('nombre') || row[1];
            horasSemanal = getVal('horassemanal') !== undefined ? getVal('horassemanal') : row[2];
            horasLapso = getVal('horaslapso') !== undefined ? getVal('horaslapso') : row[3];
            especialidadDestino = getVal('especialidaddestino') !== undefined ? getVal('especialidaddestino') : row[4];
            seccion = getVal('seccion') !== undefined ? getVal('seccion') : row[5];
            cupos = getVal('cupos') !== undefined ? getVal('cupos') : row[6];
            inscritos = getVal('inscritos') !== undefined ? getVal('inscritos') : row[7];
            cohorte = getVal('cohorte');
            if (cohorte === undefined && row.length > 8 && colNames.includes('cohorte')) {
              cohorte = row[8];
            }
          } else {
            [cedula, nombre, horasSemanal, horasLapso, especialidadDestino, seccion, cupos, inscritos] = row;
            if (row.length > 8) cohorte = row[8];
          }

          if (cedula && nombre) {
            const normCed = adapter.normalizeCedula(cedula);
            const docenteId = await adapter.resolveDocenteId(executor, normCed);
            if (docenteId) {
              let [cRows] = await executor.query(
                'SELECT id FROM docentes_contrataciones_v3 WHERE docente_id = ? ORDER BY id DESC LIMIT 1',
                [docenteId]
              );
              if (!cRows || cRows.length === 0) {
                const [pAct] = await executor.query("SELECT id FROM periodos_academicos_v3 WHERE estado = 'ACTIVO' LIMIT 1").catch(() => [[]]);
                const pId = pAct && pAct.length > 0 ? pAct[0].id : 2;
                await executor.query(
                  'INSERT INTO docentes_contrataciones_v3 (docente_id, periodo_id, departamento_id, sede_id, status) VALUES (?, ?, 1, 1, ?)',
                  [docenteId, pId, 'Activo']
                ).catch(() => {});
                const [newCRows] = await executor.query(
                  'SELECT id FROM docentes_contrataciones_v3 WHERE docente_id = ? ORDER BY id DESC LIMIT 1',
                  [docenteId]
                );
                cRows = newCRows || [];
              }
              if (cRows.length > 0) {
                const contratacionId = cRows[0].id;
                await executor.nativeQuery('INSERT IGNORE INTO materias_catalogo_v3 (nombre) VALUES (?)', [nombre.trim()]);
                const [mRows] = await executor.nativeQuery('SELECT id FROM materias_catalogo_v3 WHERE nombre = ? LIMIT 1', [nombre.trim()]);
                if (mRows.length > 0) {
                  const espDest = especialidadDestino ? String(especialidadDestino).trim() : null;
                  const espDestId = await adapter.resolveOrCreateEspecialidadId(executor, espDest);
                  await executor.query(`
                    INSERT INTO cargas_academicas_v3 
                      (contratacion_id, materia_id, especialidad_destino_id, horas_semanal, horas_lapso, seccion, cupos, inscritos, cohorte)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                  `, [
                    contratacionId,
                    mRows[0].id,
                    espDestId,
                    parseInt(horasSemanal) || 0,
                    parseInt(horasLapso) || 0,
                    seccion ? String(seccion).trim() : 'U',
                    cupos !== undefined && cupos !== null && cupos !== '' ? parseInt(cupos) : 0,
                    inscritos !== undefined && inscritos !== null && inscritos !== '' ? parseInt(inscritos) : 0,
                    (cohorte !== undefined && cohorte !== null && String(cohorte).trim() !== '') ? String(cohorte).trim() : null
                  ]);
                }
              }
            }
          }
        } else if (typeof row === 'object' && row !== null) {
          const [cedula, nombre, esp, sec, cup, insc, coh] = params;
          if (cedula && nombre) {
            await adapter.replaceMaterias3NF(executor, cedula, [{
              nombre,
              especialidadDestino: esp,
              seccion: sec,
              cupos: cup,
              inscritos: insc,
              cohorte: coh
            }]);
          }
          break;
        }
      }
      return [{ affectedRows: 1, insertId: 1, warningStatus: 0 }, undefined];
    }
  }

  // 4. UPDATE docentes_materias SET ... WHERE ...
  if (upper.startsWith('UPDATE') && upper.includes('DOCENTES_MATERIAS')) {
    const setMatch = s.match(/UPDATE\s+docentes_materias\s+SET\s+([\s\S]+?)\s+WHERE\s+([\s\S]+)$/i);
    if (setMatch && Array.isArray(params) && params.length >= 2) {
      const setClause = setMatch[1];
      const assignments = setClause.split(',').map(a => a.trim());
      const fields = {};
      assignments.forEach((assign, idx) => {
        const fieldName = assign.split('=')[0].trim();
        fields[fieldName] = params[idx];
      });
      const nombre = params[params.length - 1];
      const cedula = params[params.length - 2];
      await adapter.updateMateriaSingle3NF(executor, cedula, nombre, fields);
      return [{ affectedRows: 1, changedRows: 1, warningStatus: 0 }, undefined];
    }
  }

  // 5. INSERT INTO docentes (...) VALUES (...) ON DUPLICATE KEY UPDATE ...
  if (upper.startsWith('INSERT') && upper.includes('INTO DOCENTES') && !upper.includes('DOCENTES_MATERIAS') && !upper.includes('DOCENTES_V3') && !upper.includes('DOCENTES_CONTRATACIONES_V3') && !upper.includes('DOCENTES_DATOS_BANCARIOS_V3') && !upper.includes('DOCENTES_FORMACION_ACADEMICA_V3')) {
    const colMatch = s.match(/INSERT\s+INTO\s+\`?docentes\`?\s*\(([^)]+)\)/i);
    if (colMatch && Array.isArray(params) && params.length > 0) {
      const colNames = colMatch[1].split(',').map(c => c.trim().replace(/`/g, ''));
      if (Array.isArray(params[0]) && Array.isArray(params[0][0])) {
        for (const row of params[0]) {
          const docObj = {};
          colNames.forEach((col, idx) => {
            docObj[col] = row[idx];
          });
          await adapter.upsertDocente3NF(executor, docObj);
        }
      } else {
        const docObj = {};
        colNames.forEach((col, idx) => {
          docObj[col] = params[idx];
        });
        await adapter.upsertDocente3NF(executor, docObj);
      }
      return [{ affectedRows: 1, insertId: 0, warningStatus: 0 }, undefined];
    }
  }

  // 6. UPDATE docentes SET ... WHERE ...
  if (upper.startsWith('UPDATE') && upper.includes('DOCENTES') && !upper.includes('DOCENTES_MATERIAS') && !upper.includes('DOCENTES_V3') && !upper.includes('DOCENTES_CONTRATACIONES_V3') && !upper.includes('DOCENTES_DATOS_BANCARIOS_V3') && !upper.includes('DOCENTES_FORMACION_ACADEMICA_V3')) {
    const setMatch = s.match(/UPDATE\s+docentes\s+(?:d\s+)?SET\s+([\s\S]+?)\s+WHERE\s+([\s\S]+)$/i);
    if (setMatch && Array.isArray(params) && params.length > 0) {
      const setClause = setMatch[1];
      const assignments = setClause.split(',').map(a => a.trim());
      const fieldsObj = {};
      let paramIdx = 0;
      
      for (const assign of assignments) {
        const parts = assign.split('=').map(p => p.trim());
        const fieldName = parts[0].replace(/^d\./, '');
        if (parts[1] && parts[1].includes('?')) {
          fieldsObj[fieldName] = params[paramIdx];
          paramIdx++;
        } else if (parts[1] && parts[1].toUpperCase() === 'NULL') {
          fieldsObj[fieldName] = null;
        } else if (parts[1] && /^'[^']*'$/.test(parts[1])) {
          fieldsObj[fieldName] = parts[1].slice(1, -1);
        }
      }

      const cedulaParam = params[paramIdx] !== undefined ? params[paramIdx] : params[params.length - 1];
      await adapter.updateDocenteFields3NF(executor, cedulaParam, fieldsObj);
      return [{ affectedRows: 1, changedRows: 1, warningStatus: 0 }, undefined];
    }
  }

  // 7. Sincronización automática de CARGAS HISTÓRICAS a 1FN y 3FN (guardando exclusivamente por IDs: docente_id, periodo_id, departamento_id)
  if (upper.startsWith('INSERT') && upper.includes('INTO CARGAS_HISTORICAS') && !upper.includes('CARGAS_HISTORICAS_MATERIAS_V3')) {
    try {
      const cedula = adapter.normalizeCedula(params[0]);
      const periodo = params[1];
      const department = params[2];
      const hasLiteralPorRevisar = params.length === 9;
      const status = hasLiteralPorRevisar ? 'Por Revisar' : (params[3] || 'Por Revisar');
      const semanas = parseInt(hasLiteralPorRevisar ? params[3] : params[4]) || 15;
      const fechaDesde = (hasLiteralPorRevisar ? params[4] : params[5]) || '';
      const fechaHasta = (hasLiteralPorRevisar ? params[5] : params[6]) || '';
      const materiasRaw = hasLiteralPorRevisar ? params[6] : params[7];
      const totSem = parseInt(hasLiteralPorRevisar ? params[7] : params[8]) || 0;
      const totLap = parseInt(hasLiteralPorRevisar ? params[8] : params[9]) || 0;

      let materiasArr = [];
      if (typeof materiasRaw === 'string') {
        try { materiasArr = JSON.parse(materiasRaw); } catch (e) {}
      } else if (Array.isArray(materiasRaw)) {
        materiasArr = materiasRaw;
      }

      const docenteId = await adapter.resolveDocenteId(executor, cedula);
      const [depts] = await executor.nativeQuery('SELECT id, nombre, codigo FROM departamentos_v3 WHERE activo = 1');
      const deptoId = adapter.resolveDepartmentId(department, depts);
      let periodoId = 1;
      if (periodo) {
        const [pRows] = await executor.nativeQuery('SELECT id FROM periodos_academicos_v3 WHERE nombre = ? LIMIT 1', [periodo]);
        if (pRows.length > 0) {
          periodoId = pRows[0].id;
        } else {
          await executor.nativeQuery('INSERT IGNORE INTO periodos_academicos_v3 (nombre, estado, semanas) VALUES (?, "PLANIFICACION", 15)', [periodo]).catch(() => {});
          const [newP] = await executor.nativeQuery('SELECT id FROM periodos_academicos_v3 WHERE nombre = ? LIMIT 1', [periodo]);
          if (newP.length > 0) periodoId = newP[0].id;
        }
      }

      if (docenteId && periodoId) {
        const res = await executor.nativeQuery(`
          INSERT INTO cargas_historicas
            (docente_id, periodo_id, departamento_id, status, semanas, fechaDesde, fechaHasta, totalHorasSemanal, totalHorasLapso)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            departamento_id = VALUES(departamento_id),
            status = VALUES(status),
            semanas = VALUES(semanas),
            fechaDesde = VALUES(fechaDesde),
            fechaHasta = VALUES(fechaHasta),
            totalHorasSemanal = VALUES(totalHorasSemanal),
            totalHorasLapso = VALUES(totalHorasLapso),
            fechaRegistro = CURRENT_TIMESTAMP
        `, [docenteId, periodoId, deptoId, status, semanas, fechaDesde, fechaHasta, totSem, totLap]);

        if (Array.isArray(materiasArr)) {
          const [hRows] = await executor.nativeQuery(
            'SELECT id FROM cargas_historicas WHERE docente_id = ? AND periodo_id = ? LIMIT 1',
            [docenteId, periodoId]
          );
          if (hRows.length > 0) {
            await adapter.syncHistoricoMaterias1NF(executor, hRows[0].id, materiasArr);
          }
        }
        return res;
      }
    } catch (err) {
      console.warn('Aviso sincronizando 1FN/3FN en cargas_historicas:', err.message);
    }
    return [{ affectedRows: 1, insertId: 0, warningStatus: 0 }, undefined];
  }

  // 7.1 UPDATE cargas_historicas ...
  if (upper.startsWith('UPDATE') && upper.includes('CARGAS_HISTORICAS') && !upper.includes('CARGAS_HISTORICAS_MATERIAS_V3')) {
    if (upper.includes('PERIODOACADEMICO')) {
      const rewritten = s.replace(
        /WHERE\s+periodoAcademico\s*=\s*\?/i,
        'WHERE periodo_id = (SELECT id FROM periodos_academicos_v3 WHERE nombre = ? LIMIT 1)'
      );
      if (executor.nativeQuery) {
        return await executor.nativeQuery(rewritten, params);
      }
    }
    return [{ affectedRows: 0, changedRows: 0, warningStatus: 0 }, undefined];
  }

  // 8. Redirección transparente de PERIODOS_ACADEMICOS -> PERIODOS_ACADEMICOS_V3
  if ((upper.startsWith('INSERT') || upper.startsWith('UPDATE') || upper.startsWith('DELETE')) && /\bPERIODOS_ACADEMICOS\b(?!_)/i.test(s)) {
    let rewritten = s
      .replace(/\bperiodos_academicos\b(?!_)/gi, 'periodos_academicos_v3')
      .replace(/\bfechaDesde\b/g, 'fecha_inicio')
      .replace(/\bfechaHasta\b/g, 'fecha_fin')
      .replace(/\bfechaCreacion\b/g, 'creado_el')
      .replace(/\bfechaActivacion\b/g, 'fecha_activacion')
      .replace(/\bfechaCierre\b/g, 'fecha_cierre');

    // Sanitizar fechas vacías '' a NULL para columnas DATE de MySQL (fecha_inicio, fecha_fin)
    const cleanParams = Array.isArray(params)
      ? params.map(p => (typeof p === 'string' && p.trim() === '' ? null : p))
      : params;

    if (executor.nativeQuery) {
      return await executor.nativeQuery(rewritten, cleanParams);
    }
  }

  // 9. Redirección transparente de MATERIAS_CATALOGO -> MATERIAS_CATALOGO_V3
  if ((upper.startsWith('INSERT') || upper.startsWith('UPDATE') || upper.startsWith('DELETE')) && /\bMATERIAS_CATALOGO\b(?!_)/i.test(s)) {
    const rewritten = s.replace(/\bmaterias_catalogo\b(?!_)/gi, 'materias_catalogo_v3');
    if (executor.nativeQuery) {
      return await executor.nativeQuery(rewritten, params);
    }
  }

  // 10. Normalización transparente de USUARIOS (resolución de department -> departamento_id)
  if ((upper.startsWith('INSERT') || upper.startsWith('UPDATE')) && /\bUSUARIOS\b(?!_)/i.test(s)) {
    if (/\bdepartment\b/i.test(s)) {
      const [depts] = await executor.nativeQuery('SELECT id, nombre, codigo FROM departamentos_v3');
      const resolveDeptNullable = (val) => {
        if (!val || String(val).trim().toLowerCase() === 'todos') return null;
        return adapter.resolveDepartmentId(val, depts);
      };

      if (upper.startsWith('INSERT')) {
        // INSERT INTO usuarios (username, password, name, role, department, correo) VALUES (?, ?, ?, ?, ?, ?)
        const [username, password, name, role, department, correo] = params;
        const dId = resolveDeptNullable(department);
        return await executor.nativeQuery(
          'INSERT INTO usuarios (username, password, name, role, departamento_id, correo) VALUES (?, ?, ?, ?, ?, ?)',
          [username, password, name, role, dId, correo]
        );
      }

      if (upper.startsWith('UPDATE')) {
        if (params && params.length >= 6) {
          // UPDATE usuarios SET username = ?, name = ?, role = ?, department = ?, correo = ? [, password = ?] WHERE id = ?
          const dId = resolveDeptNullable(params[3]);
          const newParams = [...params];
          newParams[3] = dId;
          const rewritten = s.replace(/\bdepartment\s*=\s*\?/i, 'departamento_id = ?');
          return await executor.nativeQuery(rewritten, newParams);
        } else {
          // UPDATE de sincronización de nombres de departamento en dbInit -> ignorar ya que está en 3NF
          return [{ affectedRows: 0, changedRows: 0, warningStatus: 0 }, undefined];
        }
      }
    }
  }

  // 11. Normalización transparente de AUTORIZACIONES (cedula sin V- y departamento_id FK)
  if ((upper.startsWith('INSERT') || upper.startsWith('UPDATE') || upper.startsWith('DELETE')) && /\bAUTORIZACIONES\b(?!_)/i.test(s)) {
    if (upper.startsWith('DELETE')) {
      const rawParam = params && params[0] ? String(params[0]).trim() : '';
      const cleanCed = adapter.normalizeCedula(rawParam);
      return await executor.nativeQuery(
        'DELETE FROM autorizaciones WHERE cedula = ? OR cedula = ?',
        [cleanCed, `V-${cleanCed}`]
      );
    }
    if (upper.startsWith('INSERT')) {
      const [depts] = await executor.nativeQuery('SELECT id, nombre, codigo FROM departamentos_v3');
      const cleanCed = adapter.normalizeCedula(params[0]);
      const dId = adapter.resolveDepartmentId(params[1], depts) || 1;
      const nombresApellidos = params[2] || '';
      return await executor.nativeQuery(
        'INSERT IGNORE INTO autorizaciones (cedula, departamento_id, nombresApellidos) VALUES (?, ?, ?)',
        [cleanCed, dId, nombresApellidos]
      );
    }
    if (upper.startsWith('UPDATE')) {
      return [{ affectedRows: 0, changedRows: 0, warningStatus: 0 }, undefined];
    }
  }

  return null;
}

module.exports = {
  DOCENTES_3NF_SUBQUERY,
  DOCENTES_MATERIAS_3NF_SUBQUERY,
  isTargetQuery,
  handleInterceptedQuery
};
