const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function reactivarPeriodo() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'upel_talento_humano'
  });

  // 1. Reactivar 2026-I
  await conn.query("UPDATE periodos_academicos SET estado = 'ACTIVO', fechaCierre = NULL WHERE nombre = '2026-I'");
  try {
    await conn.query("UPDATE periodos_academicos_v3 SET estado = 'ACTIVO' WHERE nombre = '2026-I'");
  } catch (e) {}

  // 2. Verificar estado de los períodos
  const [rows] = await conn.query("SELECT id, nombre, estado, fechaDesde, fechaHasta, fechaCierre FROM periodos_academicos");
  console.log('ESTADO ACTUAL DE PERÍODOS:');
  console.table(rows);

  // 3. Verificar estado de docentes y materias
  const [[{ countDoc }]] = await conn.query("SELECT COUNT(*) as countDoc FROM docentes WHERE periodoAcademico = '2026-I' OR status = 'Activo'");
  const [[{ countMat }]] = await conn.query("SELECT COUNT(*) as countMat FROM docentes_materias");
  console.log(`- Docentes activos en 2026-I: ${countDoc}`);
  console.log(`- Asignaciones de materias activas: ${countMat}`);

  await conn.end();
}

reactivarPeriodo().catch(console.error);
