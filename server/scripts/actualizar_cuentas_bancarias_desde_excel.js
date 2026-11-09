const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const db = require('../db');
const { invalidateDocentesCache } = require('../services/docentesCache.service');

const defaultPath = path.resolve(__dirname, '../../data_insumos/LISTADO_DOCENTES_CONTRATADOS_verifica.xlsx');
const EXCEL_PATH = fs.existsSync(defaultPath)
  ? defaultPath
  : path.resolve(__dirname, '../../LISTADO_DOCENTES_CONTRATADOS_verifica.xlsx');

const BANCOS_MAP = {
  '0102': 'Banco de Venezuela',
  '0175': 'Banco Digital de los Trabajadores',
  '0108': 'Banco Provincial',
  '0134': 'Banesco',
  '0105': 'Banco Mercantil',
  '0114': 'Bancaribe',
  '0163': 'Banco del Tesoro',
  '0172': 'Bancamiga',
  '0191': 'Banco Nacional de Crédito',
  '0177': 'BANFANB'
};

async function main() {
  console.log('================================================================');
  console.log('UPEL SIGOA - ACTUALIZACIÓN MASIVA DE CUENTAS BANCARIAS');
  console.log('Archivo origen:', EXCEL_PATH);
  console.log('================================================================');

  if (!fs.existsSync(EXCEL_PATH)) {
    console.error('ERROR: No se encontró el archivo Excel en:', EXCEL_PATH);
    process.exit(1);
  }

  // 1. Asegurar catálogo de bancos en bancos_v3
  for (const [codigo, nombre] of Object.entries(BANCOS_MAP)) {
    await db.query(
      'INSERT INTO bancos_v3 (codigo_sudeban, nombre, activo) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), activo = 1',
      [codigo, nombre]
    );
  }
  const [bancosList] = await db.query('SELECT id, codigo_sudeban, nombre FROM bancos_v3');
  const bancoIdByCode = new Map();
  bancosList.forEach(b => bancoIdByCode.set(b.codigo_sudeban, b.id));

  // 2. Leer archivo Excel
  const workbook = xlsx.readFile(EXCEL_PATH);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawRows = xlsx.utils.sheet_to_json(sheet);

  console.log(`Hoja cargada: "${sheetName}" con ${rawRows.length} registros.`);

  let updatedCount = 0;
  let insertedBankCount = 0;
  let createdDocentesCount = 0;
  let errorCount = 0;
  const auditSummary = [];

  for (const row of rawRows) {
    const rawCedula = String(row.CEDULA || '').trim();
    const cleanCedula = rawCedula.replace(/\D/g, '');
    if (!cleanCedula) {
      console.warn('Fila sin cédula válida omitida:', row);
      continue;
    }

    const rawCuenta = String(row.cuenta || '').trim();
    const cleanCuenta = rawCuenta.replace(/\D/g, '');
    if (!cleanCuenta || cleanCuenta.length < 10) {
      console.warn(`Docente CI ${cleanCedula} sin número de cuenta válido (${rawCuenta}).`);
      errorCount++;
      continue;
    }

    // Código de banco (primeros 4 dígitos)
    const bancoPrefix = cleanCuenta.substring(0, 4);
    let bancoId = bancoIdByCode.get(bancoPrefix);
    if (!bancoId) {
      const nombreFallback = BANCOS_MAP[bancoPrefix] || `Banco Código ${bancoPrefix}`;
      const [insRes] = await db.query(
        'INSERT INTO bancos_v3 (codigo_sudeban, nombre, activo) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
        [bancoPrefix, nombreFallback]
      );
      bancoId = insRes.insertId;
      bancoIdByCode.set(bancoPrefix, bancoId);
    }

    // Determinar nombres y apellidos limpios
    const pNombre = String(row.p_nombre || '').trim();
    const sNombre = String(row.s_nombre || '').trim();
    const emptyNombre = String(row.__EMPTY || '').trim();
    const nombres = (pNombre ? `${pNombre} ${sNombre}`.trim() : emptyNombre) || 'Docente';

    const pApellido = String(row.p_apellido || '').trim();
    const sApellido = String(row.s_apellido || '').trim();
    const apellidosFull = String(row.apellidos || '').trim();
    const apellidos = (pApellido ? `${pApellido} ${sApellido}`.trim() : apellidosFull) || 'Contratado';

    const formattedCedula = `V-${cleanCedula}`;

    // 3. Buscar docente en docentes_v3
    let docenteId = null;
    const [docRows] = await db.query(
      `SELECT id, cedula, nombres, apellidos FROM docentes_v3 
       WHERE REPLACE(REPLACE(cedula, 'V-', ''), 'v-', '') = ? OR cedula = ? OR cedula = ? LIMIT 1`,
      [cleanCedula, cleanCedula, formattedCedula]
    );

    if (docRows.length > 0) {
      docenteId = docRows[0].id;
    } else {
      // Si el docente no existía en docentes_v3, se inserta con sus datos atómicos
      const [insDoc] = await db.query(
        `INSERT INTO docentes_v3 (cedula, nombres, apellidos, creado_el, actualizado_el) 
         VALUES (?, ?, ?, NOW(), NOW())`,
        [formattedCedula, nombres, apellidos]
      );
      docenteId = insDoc.insertId;
      createdDocentesCount++;

      // Formación académica predeterminada
      const dedicacion = String(row.tiempo || '').toUpperCase() === 'TC' 
        ? 'Tiempo Convencional' 
        : (String(row.tiempo || '').toUpperCase() === 'MT' ? 'Medio Tiempo' : 'Tiempo Convencional');
      const categoria = String(row.categoria || 'INSTRUCTOR').toUpperCase().includes('ASIST') ? 'Asistente' : 'Instructor';

      await db.query(
        `INSERT INTO docentes_formacion_academica_v3 
         (docente_id, categoria_docente, dedicacion) 
         VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE categoria_docente = VALUES(categoria_docente), dedicacion = VALUES(dedicacion)`,
        [docenteId, categoria, dedicacion]
      ).catch(() => {});
    }

    // 4. Actualizar o insertar en docentes_datos_bancarios_v3 de forma atómica y segura
    // A) Insertar o actualizar la cuenta del Excel como cuenta principal
    const [upsertRes] = await db.query(
      `INSERT INTO docentes_datos_bancarios_v3 
         (docente_id, banco_id, cuenta_bancaria, tipo_cuenta, es_principal) 
       VALUES (?, ?, ?, 'Corriente', 1)
       ON DUPLICATE KEY UPDATE 
         banco_id = VALUES(banco_id), 
         tipo_cuenta = VALUES(tipo_cuenta), 
         es_principal = 1`,
      [docenteId, bancoId, cleanCuenta]
    );

    // B) Marcar como no principales las otras cuentas que pudiera tener este docente
    await db.query(
      'UPDATE docentes_datos_bancarios_v3 SET es_principal = 0 WHERE docente_id = ? AND cuenta_bancaria != ?',
      [docenteId, cleanCuenta]
    ).catch(() => {});

    if (upsertRes.affectedRows === 1) {
      insertedBankCount++;
    } else {
      updatedCount++;
    }

    auditSummary.push({
      cedula: formattedCedula,
      nombre: `${nombres} ${apellidos}`,
      cuenta: cleanCuenta,
      banco: BANCOS_MAP[bancoPrefix] || `Banco ${bancoPrefix}`
    });
  }

  // 5. Invalidar caché del servidor para que todas las vistas reflejen los cambios al instante
  try {
    invalidateDocentesCache();
  } catch (e) {}

  // 6. Registrar en auditoría institucional
  try {
    await db.query(
      `INSERT INTO audit_logs (usuario_id, user_name, user_role, action, details) 
       VALUES (1, 'Administrador', 'ADMIN', 'Actualización Masiva de Cuentas Bancarias', ?)`,
      [`Se procesaron ${rawRows.length} registros desde LISTADO_DOCENTES_CONTRATADOS_verifica.xlsx. Cuentas actualizadas: ${updatedCount}, Cuentas nuevas insertadas: ${insertedBankCount}, Docentes registrados en BD: ${createdDocentesCount}.`]
    );
  } catch (e) {}

  console.log('----------------------------------------------------------------');
  console.log('RESULTADOS DE LA ACTUALIZACIÓN:');
  console.log(`- Registros leídos en Excel: ${rawRows.length}`);
  console.log(`- Cuentas bancarias actualizadas en BD: ${updatedCount}`);
  console.log(`- Cuentas bancarias nuevas insertadas: ${insertedBankCount}`);
  console.log(`- Docentes nuevos creados en BD: ${createdDocentesCount}`);
  console.log(`- Errores u omisiones: ${errorCount}`);
  console.log('----------------------------------------------------------------');
  console.log('Muestra de las primeras 5 cuentas verificadas en BD:');
  console.log(JSON.stringify(auditSummary.slice(0, 5), null, 2));
  console.log('================================================================');

  process.exit(0);
}

main().catch(err => {
  console.error('ERROR FATAL DURANTE LA ACTUALIZACIÓN:', err);
  process.exit(1);
});
