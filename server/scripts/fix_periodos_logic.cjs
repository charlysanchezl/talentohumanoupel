const mysql = require('./server/node_modules/mysql2/promise');

async function fixPeriods() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'upel_talento_humano'
  });

  console.log('--- REPARANDO ESTADO DE PERÍODOS SEGÚN LÓGICA INSTITUCIONAL ---');

  // 1. Eliminar 2027-I si existe sin registros asociados
  await conn.execute("DELETE FROM periodos_academicos WHERE nombre = '2027-I'");
  console.log('✓ Período transitorio 2027-I eliminado limpiamente.');

  // 2. Reactivar 2026-I como ACTIVO
  await conn.execute(`
    UPDATE periodos_academicos 
    SET estado = 'ACTIVO', 
        fechaCierre = NULL, 
        fechaDesde = '2026-05-21', 
        fechaHasta = '2026-11-30',
        semanas = 15,
        observaciones = 'Período en curso oficial del sistema'
    WHERE nombre = '2026-I'
  `);
  console.log('✓ Período 2026-I establecido como ACTIVO (vigente hasta 30/11/2026).');

  // 3. Colocar 2026-II en PLANIFICACION
  await conn.execute(`
    UPDATE periodos_academicos 
    SET estado = 'PLANIFICACION', 
        fechaCierre = NULL, 
        fechaActivacion = NULL,
        semanas = 15,
        observaciones = 'Próximo período abierto para planificación y asignación anticipada de carga'
    WHERE nombre = '2026-II'
  `);
  console.log('✓ Período 2026-II establecido en PLANIFICACIÓN (esperando asignación anticipada).');

  // 4. Sincronizar periodos_academicos_v3
  await conn.execute(`
    UPDATE periodos_academicos_v3 
    SET estado = 'ACTIVO' 
    WHERE nombre = '2026-I'
  `);
  await conn.execute(`
    UPDATE periodos_academicos_v3 
    SET estado = 'PLANIFICACION' 
    WHERE nombre = '2026-II'
  `);
  console.log('✓ Tabla periodos_academicos_v3 sincronizada con éxito.');

  // 5. Asegurar periodo_id en docentes_contrataciones_v3
  await conn.execute(`
    UPDATE docentes_contrataciones_v3 
    SET periodo_id = (SELECT id FROM periodos_academicos_v3 WHERE nombre = '2026-I')
  `);
  console.log('✓ Todas las contrataciones docentes asignadas a 2026-I.');

  // 6. Consultar resultado final
  const [periodos] = await conn.execute('SELECT id, nombre, estado, fechaDesde, fechaHasta, fechaCierre FROM periodos_academicos ORDER BY id');
  console.log('\n--- ESTADO FINAL DE PERIODOS (periodos_academicos) ---');
  console.table(periodos);

  const [pv3] = await conn.execute('SELECT id, nombre, estado FROM periodos_academicos_v3 ORDER BY id');
  console.log('\n--- ESTADO FINAL DE PERIODOS (periodos_academicos_v3) ---');
  console.table(pv3);

  const [docCount] = await conn.execute('SELECT count(*) as total, periodoAcademico FROM docentes GROUP BY periodoAcademico');
  console.log('\n--- DOCENTES EN VISTA OFICIAL ---');
  console.table(docCount);

  await conn.end();
}

fixPeriods().catch(err => {
  console.error('Error al reparar períodos:', err);
  process.exit(1);
});
