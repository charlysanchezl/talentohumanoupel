/**
 * Adaptador de Persistencia 3NF para UPEL SIGOA
 * Traduce operaciones sobre 'docentes' y 'docentes_materias' directamente
 * a las tablas normalizadas de Primera, Segunda y Tercera Forma Normal:
 * - docentes_v3 (Identidad personal atómica con PK id - 1FN/2FN/3FN)
 * - docentes_formacion_academica_v3 (Títulos, escalafón, dedicación y especialidad_id - 2FN/3FN)
 * - especialidades_v3 (Catálogo de especialidades curriculares - 3FN)
 * - docentes_datos_bancarios_v3 + bancos_v3 (Cuentas vinculadas por banco_id y docente_id - 3FN)
 * - docentes_contrataciones_v3 (Relación contractual por docente_id, periodo_id, departamento_id, sede_id y especialidad_id - 2FN/3FN)
 * - cargas_academicas_v3 + materias_catalogo_v3 (Unidades curriculares por contratacion_id, materia_id y especialidad_destino_id - 1FN/2FN/3FN)
 * - cargas_historicas_materias_v3 (Desglose atómico 1FN/3FN del kardex histórico por materia_id y especialidad_destino_id)
 */

function normalizeCedula(ced) {
  if (!ced) return '';
  if (Array.isArray(ced)) ced = ced[0];
  const clean = String(ced).trim().replace(/^[VEve]-?/i, '').replace(/\D/g, '');
  return clean;
}

/**
 * Garantiza 1FN (atomicidad de nombres y apellidos) incluso si una importación Excel
 * envía el nombre completo en un solo campo y el otro vacío.
 */
function ensureAtomicNombresApellidos(nombresRaw, apellidosRaw) {
  let nombres = String(nombresRaw || '').trim().replace(/\s+/g, ' ');
  let apellidos = String(apellidosRaw || '').trim().replace(/\s+/g, ' ');

  if (!nombres && apellidos && apellidos.includes(' ')) {
    const parts = apellidos.split(' ');
    if (parts.length === 2) {
      nombres = parts[0];
      apellidos = parts[1];
    } else if (parts.length === 3) {
      nombres = `${parts[0]} ${parts[1]}`;
      apellidos = parts[2];
    } else {
      const half = Math.ceil(parts.length / 2);
      nombres = parts.slice(0, half).join(' ');
      apellidos = parts.slice(half).join(' ');
    }
  } else if (nombres && !apellidos && nombres.includes(' ')) {
    const parts = nombres.split(' ');
    if (parts.length === 2) {
      nombres = parts[0];
      apellidos = parts[1];
    } else if (parts.length === 3) {
      nombres = `${parts[0]} ${parts[1]}`;
      apellidos = parts[2];
    } else {
      const half = Math.ceil(parts.length / 2);
      nombres = parts.slice(0, half).join(' ');
      apellidos = parts.slice(half).join(' ');
    }
  }

  return { nombres, apellidos };
}

function resolveDepartmentId(name, deptRows) {
  if (!name) return 1; // Default: Matemática
  const norm = String(name).toUpperCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const d of deptRows) {
    const dNorm = d.nombre.toUpperCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (norm.includes(dNorm) || dNorm.includes(norm)) return d.id;
    if (norm.includes('MATEMATICA') && dNorm.includes('MATEMATICA')) return d.id;
    if (norm.includes('PEDAGOGIA') && dNorm.includes('PEDAGOGIA')) return d.id;
    if (norm.includes('SOCIAL') && dNorm.includes('SOCIAL')) return d.id;
    if (norm.includes('AGRO') && dNorm.includes('AGRO')) return d.id;
  }
  return 1;
}

function resolveSedeId(name, sedeRows) {
  if (!name) return 1; // Default: Rubio
  const norm = String(name).toUpperCase().trim();
  for (const s of sedeRows) {
    const sNorm = s.nombre.toUpperCase().trim();
    if (norm.includes(sNorm) || sNorm.includes(norm)) return s.id;
    if (norm.includes('MENDOZA') && sNorm.includes('MENDOZA')) return s.id;
    if (norm.includes('ENCONTRADOS') && sNorm.includes('ENCONTRADOS')) return s.id;
  }
  return 1;
}

async function resolveDocenteId(executor, cedula) {
  if (!cedula) return null;
  const bare = normalizeCedula(cedula);
  const withV = `V-${bare}`;
  try {
    const [rows] = await executor.query('SELECT id FROM docentes_v3 WHERE cedula = ? OR cedula = ? LIMIT 1', [bare, withV]);
    return rows && rows.length > 0 ? rows[0].id : null;
  } catch (e) {
    return null;
  }
}

async function resolveOrCreateEspecialidadId(executor, especialidadNombre) {
  if (!especialidadNombre || String(especialidadNombre).trim() === '') return null;
  const clean = String(especialidadNombre).trim();
  try {
    const [existing] = await executor.query('SELECT id FROM especialidades_v3 WHERE UPPER(TRIM(nombre)) = UPPER(?) LIMIT 1', [clean]);
    if (existing.length > 0) return existing[0].id;
    await executor.query('INSERT IGNORE INTO especialidades_v3 (nombre) VALUES (?)', [clean]);
    const [rows] = await executor.query('SELECT id FROM especialidades_v3 WHERE UPPER(TRIM(nombre)) = UPPER(?) LIMIT 1', [clean]);
    return rows.length > 0 ? rows[0].id : null;
  } catch (e) {
    return null;
  }
}

async function resolveOrCreateBancoId(executor, bancoNombre, cuentaBancaria) {
  let cleanBanco = String(bancoNombre || 'Banco de Venezuela').trim();
  const cleanCuenta = String(cuentaBancaria || '').replace(/\D/g, '');
  const prefix = cleanCuenta.length >= 4 ? cleanCuenta.substring(0, 4) : '0102';

  if (prefix === '0175' || /bicentenario/i.test(cleanBanco) || /digital.*trabajador/i.test(cleanBanco)) {
    cleanBanco = 'Banco Digital de los Trabajadores';
  }

  try {
    const [byCode] = await executor.query(
      'SELECT id FROM bancos_v3 WHERE codigo_sudeban = ? OR UPPER(TRIM(nombre)) = UPPER(?) LIMIT 1',
      [prefix, cleanBanco]
    );
    if (byCode.length > 0) return byCode[0].id;
    await executor.query('INSERT IGNORE INTO bancos_v3 (codigo_sudeban, nombre) VALUES (?, ?)', [prefix, cleanBanco]);
    const [created] = await executor.query('SELECT id FROM bancos_v3 WHERE UPPER(TRIM(nombre)) = UPPER(?) LIMIT 1', [cleanBanco]);
    return created.length > 0 ? created[0].id : 1;
  } catch (e) {
    return 1;
  }
}

async function getReferenceData(executor) {
  const [depts] = await executor.query('SELECT id, nombre, codigo FROM departamentos_v3 WHERE activo = 1');
  const [sedes] = await executor.query('SELECT id, nombre FROM sedes_v3 WHERE activo = 1');
  const [periodos] = await executor.query('SELECT id, nombre, estado FROM periodos_academicos_v3');
  return { depts, sedes, periodos };
}

/**
 * 1. UPSERT DOCENTE EN 3NF PURO
 */
async function upsertDocente3NF(executor, data) {
  const cedula = normalizeCedula(data.cedula);
  if (!cedula) throw new Error('Cédula requerida para guardar docente en 3NF');

  const { depts, sedes, periodos } = await getReferenceData(executor);

  // A) docentes_v3 (Datos Personales Atómicos - 1FN, 2FN & 3FN)
  const { nombres, apellidos } = ensureAtomicNombresApellidos(data.nombres, data.apellidos);
  const fechaNac = data.fechaNac && String(data.fechaNac).trim() !== '' ? String(data.fechaNac).trim().substring(0, 10) : null;
  const rif = String(data.rif || '').trim() || null;
  const correo = String(data.correo || '').trim() || null;
  const correoInstitucional = String(data.correoInstitucional || '').trim() || null;
  const telefonos = String(data.telefonos || '').trim() || null;
  const direccion = String(data.direccion || '').trim() || null;
  const clave = data.clave !== undefined && data.clave !== null && String(data.clave).trim() !== '' 
    ? String(data.clave).trim() 
    : null;

  await executor.query(`
    INSERT INTO docentes_v3 
      (cedula, nombres, apellidos, fecha_nacimiento, rif, correo_personal, correo_institucional, telefonos, direccion, clave_portal_hash)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      nombres = IF(VALUES(nombres) != '', VALUES(nombres), nombres),
      apellidos = IF(VALUES(apellidos) != '', VALUES(apellidos), apellidos),
      fecha_nacimiento = COALESCE(VALUES(fecha_nacimiento), fecha_nacimiento),
      rif = COALESCE(VALUES(rif), rif),
      correo_personal = COALESCE(VALUES(correo_personal), correo_personal),
      correo_institucional = COALESCE(VALUES(correo_institucional), correo_institucional),
      telefonos = COALESCE(VALUES(telefonos), telefonos),
      direccion = COALESCE(VALUES(direccion), direccion),
      clave_portal_hash = COALESCE(VALUES(clave_portal_hash), clave_portal_hash)
  `, [cedula, nombres, apellidos, fechaNac, rif, correo, correoInstitucional, telefonos, direccion, clave]);

  const docenteId = await resolveDocenteId(executor, cedula);

  // B) docentes_datos_bancarios_v3 + bancos_v3 (Datos Financieros Desacoplados - 3FN Puro)
  const banco = String(data.banco || '').trim();
  const cuentaBancaria = String(data.cuentaBancaria || '').trim();
  const tipoCuenta = String(data.tipoCuenta || 'Ahorro').toLowerCase().includes('corriente') ? 'Corriente' : 'Ahorro';

  if (banco && cuentaBancaria && docenteId) {
    const bancoId = await resolveOrCreateBancoId(executor, banco, cuentaBancaria);
    await executor.query('UPDATE docentes_datos_bancarios_v3 SET es_principal = 0 WHERE docente_id = ?', [docenteId]).catch(() => {});
    await executor.query(`
      INSERT INTO docentes_datos_bancarios_v3 
        (docente_id, banco_id, cuenta_bancaria, tipo_cuenta, es_principal)
      VALUES (?, ?, ?, ?, 1)
      ON DUPLICATE KEY UPDATE
        banco_id = VALUES(banco_id),
        tipo_cuenta = VALUES(tipo_cuenta),
        es_principal = 1
    `, [docenteId, bancoId, cuentaBancaria, tipoCuenta]);
  }

  // C) Resolver Referencias Institucionales y Formación Académica (2FN & 3FN Puro)
  const deptoId = resolveDepartmentId(data.department, depts);
  const sedeId = resolveSedeId(data.sedeCentro, sedes);
  const especialidad = String(data.especialidad || '').trim() || null;
  const especialidadId = await resolveOrCreateEspecialidadId(executor, especialidad);

  const categoriaDocente = ['Instructor', 'Asistente', 'Agregado', 'Asociado', 'Titular'].includes(data.categoriaDocente)
    ? data.categoriaDocente
    : 'Instructor';

  const dedicacion = ['Tiempo Convencional', 'Medio Tiempo', 'Tiempo Completo', 'Dedicación Exclusiva'].includes(data.dedicacion)
    ? data.dedicacion
    : 'Tiempo Convencional';

  const titulosPregrado = String(data.titulosPregrado || '').trim() || null;
  const titulosPostgrado = String(data.titulosPostgrado || '').trim() || null;
  const doctorado = String(data.doctorado || '').trim() || null;

  if (docenteId) {
    await executor.query(`
      INSERT INTO docentes_formacion_academica_v3
        (docente_id, especialidad_id, titulos_pregrado, titulos_postgrado, doctorado, categoria_docente, dedicacion)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        especialidad_id = COALESCE(VALUES(especialidad_id), especialidad_id),
        titulos_pregrado = COALESCE(VALUES(titulos_pregrado), titulos_pregrado),
        titulos_postgrado = COALESCE(VALUES(titulos_postgrado), titulos_postgrado),
        doctorado = COALESCE(VALUES(doctorado), doctorado),
        categoria_docente = VALUES(categoria_docente),
        dedicacion = VALUES(dedicacion)
    `, [docenteId, especialidadId, titulosPregrado, titulosPostgrado, doctorado, categoriaDocente, dedicacion]);
  }

  // Buscar periodo activo o coincidente
  let periodoId = 2;
  if (data.periodoAcademico) {
    const pFound = periodos.find(p => p.nombre === data.periodoAcademico);
    if (pFound) {
      periodoId = pFound.id;
    } else {
      await executor.query('INSERT IGNORE INTO periodos_academicos_v3 (nombre, estado, semanas) VALUES (?, "PLANIFICACION", 15)', [data.periodoAcademico]).catch(() => {});
      const [newP] = await executor.query('SELECT id FROM periodos_academicos_v3 WHERE nombre = ? LIMIT 1', [data.periodoAcademico]).catch(() => [[]]);
      if (newP && newP.length > 0) periodoId = newP[0].id;
    }
  } else {
    const pActivo = periodos.find(p => p.estado === 'ACTIVO');
    if (pActivo) periodoId = pActivo.id;
  }

  // D) docentes_contrataciones_v3 (Contrato Académico por Período/Depto/Sede/Especialidad - 2FN & 3FN Puro)
  const allowedStatuses = ['Activo', 'Validado', 'Por Revisar', 'Inactivo', 'Jubilado'];
  const status = allowedStatuses.includes(data.status) 
    ? data.status 
    : 'Por Revisar';

  const semanas = parseInt(data.semanas) || 15;
  const fechaDesde = data.fechaDesde && String(data.fechaDesde).trim() !== '' ? String(data.fechaDesde).trim().substring(0, 10) : null;
  const fechaHasta = data.fechaHasta && String(data.fechaHasta).trim() !== '' ? String(data.fechaHasta).trim().substring(0, 10) : null;

  if (docenteId) {
    await executor.query(`
      INSERT INTO docentes_contrataciones_v3
        (docente_id, periodo_id, departamento_id, sede_id, especialidad_id, status, semanas, fecha_desde, fecha_hasta)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        sede_id = VALUES(sede_id),
        especialidad_id = COALESCE(VALUES(especialidad_id), especialidad_id),
        status = VALUES(status),
        semanas = VALUES(semanas),
        fecha_desde = COALESCE(VALUES(fecha_desde), fecha_desde),
        fecha_hasta = COALESCE(VALUES(fecha_hasta), fecha_hasta)
    `, [docenteId, periodoId, deptoId, sedeId, especialidadId, status, semanas, fechaDesde, fechaHasta]);
  }

  return { success: true, cedula, docenteId, periodoId };
}

/**
 * 2. ACTUALIZACIÓN PARCIAL DE DOCENTE EN 3NF PURO
 */
async function updateDocenteFields3NF(executor, cedulaRaw, fieldsObj) {
  if (Array.isArray(cedulaRaw)) {
    for (const c of cedulaRaw) {
      await updateDocenteFields3NF(executor, c, fieldsObj);
    }
    return;
  }

  const cedula = normalizeCedula(cedulaRaw);
  if (!cedula) return;

  const { depts, sedes, periodos } = await getReferenceData(executor);
  const docenteId = await resolveDocenteId(executor, cedula);

  // Mapear campos personales a docentes_v3
  const v3Updates = [];
  const v3Params = [];
  if (fieldsObj.nombres !== undefined && fieldsObj.apellidos !== undefined) {
    const split = ensureAtomicNombresApellidos(fieldsObj.nombres, fieldsObj.apellidos);
    v3Updates.push('nombres = ?', 'apellidos = ?');
    v3Params.push(split.nombres, split.apellidos);
  } else {
    if (fieldsObj.nombres !== undefined) { v3Updates.push('nombres = ?'); v3Params.push(fieldsObj.nombres); }
    if (fieldsObj.apellidos !== undefined) { v3Updates.push('apellidos = ?'); v3Params.push(fieldsObj.apellidos); }
  }
  if (fieldsObj.rif !== undefined) { v3Updates.push('rif = ?'); v3Params.push(fieldsObj.rif); }
  if (fieldsObj.correo !== undefined) { v3Updates.push('correo_personal = ?'); v3Params.push(fieldsObj.correo); }
  if (fieldsObj.correoInstitucional !== undefined) { v3Updates.push('correo_institucional = ?'); v3Params.push(fieldsObj.correoInstitucional); }
  if (fieldsObj.telefonos !== undefined) { v3Updates.push('telefonos = ?'); v3Params.push(fieldsObj.telefonos); }
  if (fieldsObj.direccion !== undefined) { v3Updates.push('direccion = ?'); v3Params.push(fieldsObj.direccion); }
  if (fieldsObj.fechaNac !== undefined) { 
    v3Updates.push('fecha_nacimiento = ?'); 
    v3Params.push(fieldsObj.fechaNac ? String(fieldsObj.fechaNac).substring(0, 10) : null); 
  }
  if (fieldsObj.clave !== undefined) { v3Updates.push('clave_portal_hash = ?'); v3Params.push(fieldsObj.clave); }

  if (v3Updates.length > 0) {
    v3Params.push(cedula, `V-${cedula}`);
    await executor.query(`UPDATE docentes_v3 SET ${v3Updates.join(', ')} WHERE cedula = ? OR cedula = ?`, v3Params);
  }

  // Mapear campos bancarios (docentes_datos_bancarios_v3 + bancos_v3)
  if ((fieldsObj.banco !== undefined || fieldsObj.cuentaBancaria !== undefined || fieldsObj.tipoCuenta !== undefined) && docenteId) {
    const tipo = String(fieldsObj.tipoCuenta || 'Ahorro').toLowerCase().includes('corriente') ? 'Corriente' : 'Ahorro';
    const banco = fieldsObj.banco || 'Banco de Venezuela';
    const cuenta = fieldsObj.cuentaBancaria || '';
    if (banco && cuenta) {
      const bancoId = await resolveOrCreateBancoId(executor, banco, cuenta);
      await executor.query('UPDATE docentes_datos_bancarios_v3 SET es_principal = 0 WHERE docente_id = ?', [docenteId]).catch(() => {});
      await executor.query(`
        INSERT INTO docentes_datos_bancarios_v3 (docente_id, banco_id, cuenta_bancaria, tipo_cuenta, es_principal)
        VALUES (?, ?, ?, ?, 1)
        ON DUPLICATE KEY UPDATE banco_id = VALUES(banco_id), tipo_cuenta = VALUES(tipo_cuenta), es_principal = 1
      `, [docenteId, bancoId, cuenta, tipo]);
    }
  }

  // Mapear campos de formación académica a docentes_formacion_academica_v3
  let espId = undefined;
  if (fieldsObj.especialidad !== undefined) {
    espId = await resolveOrCreateEspecialidadId(executor, fieldsObj.especialidad);
  }

  const faUpdates = [];
  const faParams = [];
  if (espId !== undefined) { faUpdates.push('especialidad_id = ?'); faParams.push(espId); }
  if (fieldsObj.titulosPregrado !== undefined) { faUpdates.push('titulos_pregrado = ?'); faParams.push(fieldsObj.titulosPregrado || null); }
  if (fieldsObj.titulosPostgrado !== undefined) { faUpdates.push('titulos_postgrado = ?'); faParams.push(fieldsObj.titulosPostgrado || null); }
  if (fieldsObj.doctorado !== undefined) { faUpdates.push('doctorado = ?'); faParams.push(fieldsObj.doctorado || null); }
  if (fieldsObj.categoriaDocente !== undefined) { faUpdates.push('categoria_docente = ?'); faParams.push(fieldsObj.categoriaDocente); }
  if (fieldsObj.dedicacion !== undefined) { faUpdates.push('dedicacion = ?'); faParams.push(fieldsObj.dedicacion); }

  if (faUpdates.length > 0 && docenteId) {
    await executor.query('INSERT IGNORE INTO docentes_formacion_academica_v3 (docente_id) VALUES (?)', [docenteId]).catch(() => {});
    faParams.push(docenteId);
    await executor.query(`UPDATE docentes_formacion_academica_v3 SET ${faUpdates.join(', ')} WHERE docente_id = ?`, faParams).catch(() => {});
  }

  // Mapear campos de contratación académica a docentes_contrataciones_v3 (3FN Puro)
  const cUpdates = [];
  const cParams = [];
  if (fieldsObj.status !== undefined) { cUpdates.push('status = ?'); cParams.push(fieldsObj.status); }
  if (fieldsObj.especialidad !== undefined) {
    cUpdates.push('especialidad_id = ?');
    cParams.push(espId);
  }
  if (fieldsObj.semanas !== undefined) { cUpdates.push('semanas = ?'); cParams.push(parseInt(fieldsObj.semanas) || 15); }
  if (fieldsObj.fechaDesde !== undefined) { cUpdates.push('fecha_desde = ?'); cParams.push(fieldsObj.fechaDesde ? String(fieldsObj.fechaDesde).substring(0, 10) : null); }
  if (fieldsObj.fechaHasta !== undefined) { cUpdates.push('fecha_hasta = ?'); cParams.push(fieldsObj.fechaHasta ? String(fieldsObj.fechaHasta).substring(0, 10) : null); }
  if (fieldsObj.department !== undefined) { cUpdates.push('departamento_id = ?'); cParams.push(resolveDepartmentId(fieldsObj.department, depts)); }
  if (fieldsObj.sedeCentro !== undefined) { cUpdates.push('sede_id = ?'); cParams.push(resolveSedeId(fieldsObj.sedeCentro, sedes)); }

  if (fieldsObj.periodoAcademico !== undefined && fieldsObj.periodoAcademico) {
    let pFound = periodos.find(p => p.nombre === fieldsObj.periodoAcademico);
    if (!pFound) {
      await executor.query('INSERT IGNORE INTO periodos_academicos_v3 (nombre, estado, semanas) VALUES (?, "PLANIFICACION", 15)', [fieldsObj.periodoAcademico]).catch(() => {});
      const [newP] = await executor.query('SELECT id, nombre FROM periodos_academicos_v3 WHERE nombre = ? LIMIT 1', [fieldsObj.periodoAcademico]).catch(() => [[]]);
      if (newP && newP.length > 0) pFound = newP[0];
    }
    if (pFound) {
      cUpdates.push('periodo_id = ?');
      cParams.push(pFound.id);
    }
  }

  if (cUpdates.length > 0 && docenteId) {
    cParams.push(docenteId);
    await executor.query(`
      UPDATE docentes_contrataciones_v3 
      SET ${cUpdates.join(', ')} 
      WHERE docente_id = ? 
      ORDER BY id DESC LIMIT 1
    `, cParams);
  }
}

/**
 * 3. ELIMINAR DOCENTE EN 3NF (Cascada automática a formación, contrataciones, cargas y bancos)
 */
async function deleteDocente3NF(executor, cedulaRaw) {
  const bare = normalizeCedula(cedulaRaw);
  const withV = `V-${bare}`;
  await executor.query('DELETE FROM docentes_v3 WHERE cedula = ? OR cedula = ?', [bare, withV]);
}

/**
 * 4. GESTIÓN DE MATERIAS EN 3NF PURO (cargas_academicas_v3)
 */
async function replaceMaterias3NF(executor, cedulaRaw, materiasList) {
  const docenteId = await resolveDocenteId(executor, cedulaRaw);
  if (!docenteId) return;

  const [cRows] = await executor.query(
    'SELECT id FROM docentes_contrataciones_v3 WHERE docente_id = ? ORDER BY id DESC LIMIT 1',
    [docenteId]
  );
  if (cRows.length === 0) return;
  const contratacionId = cRows[0].id;

  await executor.query('DELETE FROM cargas_academicas_v3 WHERE contratacion_id = ?', [contratacionId]);

  if (!Array.isArray(materiasList) || materiasList.length === 0) return;

  for (const m of materiasList) {
    if (!m || !m.nombre || !m.nombre.trim()) continue;
    const nombre = m.nombre.trim();

    await executor.query('INSERT IGNORE INTO materias_catalogo_v3 (nombre) VALUES (?)', [nombre]);
    await executor.query('INSERT IGNORE INTO materias_catalogo (nombre) VALUES (?)', [nombre]).catch(() => {});
    const [mRows] = await executor.query('SELECT id FROM materias_catalogo_v3 WHERE nombre = ? LIMIT 1', [nombre]);
    if (mRows.length === 0) continue;
    const materiaId = mRows[0].id;

    const horasSem = parseInt(m.horasSemanal) || 0;
    const horasLap = parseInt(m.horasLapso) || 0;
    const espDest = m.especialidadDestino ? String(m.especialidadDestino).trim() : null;
    const espDestId = await resolveOrCreateEspecialidadId(executor, espDest);
    const seccion = m.seccion ? String(m.seccion).trim() : 'U';
    const cupos = (m.cupos !== undefined && m.cupos !== null && m.cupos !== '') ? parseInt(m.cupos) : 0;
    const inscritos = (m.inscritos !== undefined && m.inscritos !== null && m.inscritos !== '') ? parseInt(m.inscritos) : 0;
    const cohorte = (m.cohorte !== undefined && m.cohorte !== null && String(m.cohorte).trim() !== '') ? String(m.cohorte).trim() : null;

    await executor.query(`
      INSERT INTO cargas_academicas_v3 
        (contratacion_id, materia_id, especialidad_destino_id, horas_semanal, horas_lapso, seccion, cupos, inscritos, cohorte)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [contratacionId, materiaId, espDestId, horasSem, horasLap, seccion, cupos, inscritos, cohorte]);
  }
}

async function deleteMateriasByCedula3NF(executor, cedulaRaw) {
  const docenteId = await resolveDocenteId(executor, cedulaRaw);
  if (!docenteId) return;
  await executor.query(`
    DELETE ca FROM cargas_academicas_v3 ca
    JOIN docentes_contrataciones_v3 c ON ca.contratacion_id = c.id
    WHERE c.docente_id = ?
  `, [docenteId]);
}

async function updateMateriaSingle3NF(executor, cedulaRaw, nombreMateria, fields) {
  const docenteId = await resolveDocenteId(executor, cedulaRaw);
  if (!docenteId) return;
  const [cRows] = await executor.query(
    'SELECT id FROM docentes_contrataciones_v3 WHERE docente_id = ? ORDER BY id DESC LIMIT 1',
    [docenteId]
  );
  if (cRows.length === 0) return;
  const contratacionId = cRows[0].id;

  const [mRows] = await executor.query('SELECT id FROM materias_catalogo_v3 WHERE nombre = ? LIMIT 1', [nombreMateria.trim()]);
  if (mRows.length === 0) return;
  const materiaId = mRows[0].id;

  const updates = [];
  const params = [];
  if (fields.especialidadDestino !== undefined) {
    const espDestId = await resolveOrCreateEspecialidadId(executor, fields.especialidadDestino);
    updates.push('especialidad_destino_id = ?');
    params.push(espDestId);
  }
  if (fields.seccion !== undefined) { updates.push('seccion = ?'); params.push(fields.seccion); }
  if (fields.cupos !== undefined) { updates.push('cupos = ?'); params.push(parseInt(fields.cupos) || 0); }
  if (fields.inscritos !== undefined) { updates.push('inscritos = ?'); params.push(parseInt(fields.inscritos) || 0); }
  if (fields.cohorte !== undefined) { 
    const coh = (fields.cohorte !== null && String(fields.cohorte).trim() !== '') ? String(fields.cohorte).trim() : null;
    updates.push('cohorte = ?'); 
    params.push(coh); 
  }

  if (updates.length > 0) {
    params.push(contratacionId, materiaId);
    await executor.query(`UPDATE cargas_academicas_v3 SET ${updates.join(', ')} WHERE contratacion_id = ? AND materia_id = ?`, params);
  }
}

/**
 * 5. SANEAMIENTO DE CARGAS HISTÓRICAS A 1FN Y 3FN PURO
 * Descompone materias TEXT a filas atómicas en cargas_historicas_materias_v3 vinculadas por ID a materias_catalogo_v3 y especialidades_v3
 */
async function initCargasHistoricas1NF(executor) {
  await executor.query(`
    CREATE TABLE IF NOT EXISTS cargas_historicas_materias_v3 (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      carga_historica_id INT NOT NULL,
      materia_id INT UNSIGNED DEFAULT NULL,
      especialidad_destino_id INT UNSIGNED DEFAULT NULL,
      horas_semanal TINYINT UNSIGNED NOT NULL DEFAULT 0,
      horas_lapso SMALLINT UNSIGNED NOT NULL DEFAULT 0,
      seccion VARCHAR(20) DEFAULT '',
      cupos SMALLINT UNSIGNED DEFAULT 0,
      inscritos SMALLINT UNSIGNED DEFAULT 0,
      cohorte VARCHAR(50) DEFAULT NULL,
      INDEX idx_hist_materia_id (carga_historica_id),
      INDEX idx_hist_mat_cat (materia_id),
      INDEX idx_hist_esp_dest (especialidad_destino_id),
      CONSTRAINT fk_hist_materias_rel FOREIGN KEY (carga_historica_id) REFERENCES cargas_historicas(id) ON DELETE CASCADE,
      CONSTRAINT fk_hist_mat_catalogo FOREIGN KEY (materia_id) REFERENCES materias_catalogo_v3(id) ON DELETE SET NULL ON UPDATE CASCADE,
      CONSTRAINT fk_hist_esp_catalogo FOREIGN KEY (especialidad_destino_id) REFERENCES especialidades_v3(id) ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function syncHistoricoMaterias1NF(executor, cargaHistoricaId, materias) {
  if (!cargaHistoricaId) return;
  await executor.query('DELETE FROM cargas_historicas_materias_v3 WHERE carga_historica_id = ?', [cargaHistoricaId]);
  if (!Array.isArray(materias) || materias.length === 0) return;

  for (const m of materias) {
    if (!m || !m.nombre) continue;
    const mNombre = String(m.nombre).trim();
    await executor.query('INSERT IGNORE INTO materias_catalogo_v3 (nombre) VALUES (?)', [mNombre]).catch(() => {});
    const [mCat] = await executor.query('SELECT id FROM materias_catalogo_v3 WHERE nombre = ? LIMIT 1', [mNombre]).catch(() => [[]]);
    const matId = mCat && mCat.length > 0 ? mCat[0].id : null;
    const espDestId = await resolveOrCreateEspecialidadId(executor, m.especialidadDestino);

    await executor.query(`
      INSERT INTO cargas_historicas_materias_v3
        (carga_historica_id, materia_id, especialidad_destino_id, horas_semanal, horas_lapso, seccion, cupos, inscritos, cohorte)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      cargaHistoricaId,
      matId,
      espDestId,
      parseInt(m.horasSemanal) || 0,
      parseInt(m.horasLapso) || 0,
      m.seccion || m.secciones || 'U',
      parseInt(m.cupos) || 0,
      parseInt(m.inscritos) || 0,
      m.cohorte ? String(m.cohorte).trim() : null
    ]);
  }
}

module.exports = {
  normalizeCedula,
  ensureAtomicNombresApellidos,
  resolveDepartmentId,
  resolveSedeId,
  resolveDocenteId,
  resolveOrCreateEspecialidadId,
  resolveOrCreateBancoId,
  upsertDocente3NF,
  updateDocenteFields3NF,
  deleteDocente3NF,
  replaceMaterias3NF,
  deleteMateriasByCedula3NF,
  updateMateriaSingle3NF,
  initCargasHistoricas1NF,
  syncHistoricoMaterias1NF
};
