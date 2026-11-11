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

  it('Integridad Referencial: NO deben existir contrataciones huérfanas sin docente (FK docente_id)', async () => {
    const [orphans] = await pool.nativeQuery(`
      SELECT dc.id
      FROM docentes_contrataciones_v3 dc
      LEFT JOIN docentes_v3 d ON dc.docente_id = d.id
      WHERE d.id IS NULL
    `);
    assert.strictEqual(orphans.length, 0, 'Se detectaron contrataciones huérfanas sin docente base');
  });

  it('Integridad Referencial: NO deben existir datos bancarios huérfanos (FK docente_id)', async () => {
    const [orphans] = await pool.nativeQuery(`
      SELECT db.id
      FROM docentes_datos_bancarios_v3 db
      LEFT JOIN docentes_v3 d ON db.docente_id = d.id
      WHERE d.id IS NULL
    `);
    assert.strictEqual(orphans.length, 0, 'Se detectaron datos bancarios huérfanos sin docente');
  });

  it('Índices de Rendimiento: deben existir los índices 3NF para alta concurrencia', async () => {
    const [idxCedula] = await pool.nativeQuery("SHOW INDEX FROM docentes_v3 WHERE Key_name = 'uk_docente_cedula'");
    assert.ok(idxCedula.length > 0, 'El índice uk_docente_cedula debe existir');

    const [indexesContratacion] = await pool.nativeQuery("SHOW INDEX FROM docentes_contrataciones_v3 WHERE Key_name = 'idx_contratacion_busqueda'");
    assert.ok(indexesContratacion.length > 0, 'El índice idx_contratacion_busqueda debe existir');

    const [indexesCarga] = await pool.nativeQuery("SHOW INDEX FROM cargas_academicas_v3 WHERE Key_name = 'idx_carga_contratacion'");
    assert.ok(indexesCarga.length > 0, 'El índice idx_carga_contratacion debe existir');

    const [indexesBanco] = await pool.nativeQuery("SHOW INDEX FROM docentes_datos_bancarios_v3 WHERE Key_name = 'uq_docente_id_cuenta'");
    assert.ok(indexesBanco.length > 0, 'El índice uq_docente_id_cuenta debe existir');
  });

  it('Plan de Ejecución EXPLAIN: consulta de docentes_v3 por cédula debe usar índice único sin Full Table Scan', async () => {
    const [explainRows] = await pool.nativeQuery("EXPLAIN SELECT * FROM docentes_v3 WHERE cedula = '12345678'");
    assert.ok(explainRows.length > 0);
    for (const step of explainRows) {
      assert.notStrictEqual(step.type, 'ALL', `Paso ${step.table || step.id} no debe realizar Full Table Scan (ALL)`);
    }
  });

  it('Plan de Ejecución EXPLAIN: consulta de cargas_academicas_v3 por contratacion_id debe usar índice', async () => {
    const [explainRows] = await pool.nativeQuery('EXPLAIN SELECT * FROM cargas_academicas_v3 WHERE contratacion_id = 1');
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
