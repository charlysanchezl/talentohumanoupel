const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const pool = require('../db');

describe('Suite de Pruebas de Integridad: Base de Datos Relacional y Rendimiento', () => {

  it('debe tener conexión activa y responder a ping', async () => {
    const [rows] = await pool.nativeQuery('SELECT 1 as ping');
    assert.strictEqual(rows.length, 1);
    assert.strictEqual(rows[0].ping, 1);
  });

  it('Integridad Referencial: NO deben existir cargas académicas huérfanas', async () => {
    const [orphans] = await pool.nativeQuery(`
      SELECT ca.id 
      FROM cargas_academicas_v3 ca
      LEFT JOIN docentes_contrataciones_v3 dc ON ca.contratacion_id = dc.id
      WHERE dc.id IS NULL
    `);
    assert.strictEqual(orphans.length, 0, 'Se detectaron cargas huérfanas sin contratación');
  });

  it('Integridad Referencial: NO deben existir contrataciones huérfanas sin docente', async () => {
    const [orphans] = await pool.nativeQuery(`
      SELECT dc.id 
      FROM docentes_contrataciones_v3 dc
      LEFT JOIN docentes_v3 d ON dc.docente_cedula = d.cedula
      WHERE d.cedula IS NULL
    `);
    assert.strictEqual(orphans.length, 0, 'Se detectaron contrataciones huérfanas sin docente base');
  });

  it('Integridad Referencial: NO deben existir datos bancarios huérfanos', async () => {
    const [orphans] = await pool.nativeQuery(`
      SELECT db.id 
      FROM docentes_datos_bancarios_v3 db
      LEFT JOIN docentes_v3 d ON db.docente_cedula = d.cedula
      WHERE d.cedula IS NULL
    `);
    assert.strictEqual(orphans.length, 0, 'Se detectaron datos bancarios huérfanos sin docente');
  });

  it('Índices de Rendimiento: deben existir los índices creados para alta concurrencia', async () => {
    const [indexesContratacion] = await pool.nativeQuery("SHOW INDEX FROM docentes_contrataciones_v3 WHERE Key_name = 'idx_contratacion_cedula_id'");
    assert.ok(indexesContratacion.length > 0, 'El índice idx_contratacion_cedula_id debe existir');

    const [indexesCargaSeccion] = await pool.nativeQuery("SHOW INDEX FROM cargas_academicas_v3 WHERE Key_name = 'idx_carga_seccion'");
    assert.ok(indexesCargaSeccion.length > 0, 'El índice idx_carga_seccion debe existir');

    const [indexesBanco] = await pool.nativeQuery("SHOW INDEX FROM docentes_datos_bancarios_v3 WHERE Key_name = 'idx_banco_principal'");
    assert.ok(indexesBanco.length > 0, 'El índice idx_banco_principal debe existir');
  });

  it('Plan de Ejecución EXPLAIN: consulta de docente debe ejecutarse sin Full Table Scan', async () => {
    const [explainRows] = await pool.nativeQuery("EXPLAIN SELECT * FROM docentes WHERE cedula = 'V-12345678'");
    assert.ok(explainRows.length > 0);
    // Ningún paso del query plan debe ser de tipo ALL (Full Table Scan)
    for (const step of explainRows) {
      assert.notStrictEqual(step.type, 'ALL', `Paso ${step.table || step.id} no debe realizar Full Table Scan (ALL)`);
    }
  });

  it('Plan de Ejecución EXPLAIN: consulta de docentes_materias debe usar índices eficientes', async () => {
    const [explainRows] = await pool.nativeQuery("EXPLAIN SELECT * FROM docentes_materias WHERE docente_cedula = 'V-12345678'");
    assert.ok(explainRows.length > 0);
    for (const step of explainRows) {
      assert.notStrictEqual(step.type, 'ALL', `Paso ${step.table || step.id} no debe realizar Full Table Scan (ALL)`);
    }
  });

  after(async () => {
    // Cerrar el pool de conexiones de prueba de forma limpia
    await pool.end();
  });

});
