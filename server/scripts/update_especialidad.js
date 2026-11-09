const db = require('../db');
const { invalidateDocentesCache } = require('../services/docentesCache.service');

async function run() {
  console.log('--- Consultando especialidades en la base de datos ---');
  const [rows] = await db.query('SELECT * FROM especialidades_v3');
  console.log('Especialidades actuales:', rows);

  // Buscar la que coincida con dificultad de aprendizaje
  const target = rows.find(r => /dificultad.*aprendizaje/i.test(r.nombre) || /aprendizaje/i.test(r.nombre));
  console.log('Especialidad objetivo encontrada:', target);

  const nuevoNombre = 'Educación Especial para Personas en Situación de Discapacidad';

  if (target) {
    await db.query('UPDATE especialidades_v3 SET nombre = ? WHERE id = ?', [nuevoNombre, target.id]);
    console.log(`✅ Actualizado en especialidades_v3: [ID ${target.id}] "${target.nombre}" -> "${nuevoNombre}"`);
  } else {
    // Si no existía, insertarla
    const [ins] = await db.query('INSERT INTO especialidades_v3 (nombre, activo) VALUES (?, 1)', [nuevoNombre]);
    console.log(`✅ Creada en especialidades_v3: [ID ${ins.insertId}] "${nuevoNombre}"`);
  }

  // Verificar si hay alguna otra mención en tablas relacionadas o texto
  // Por ejemplo, si hay registros en docentes_v3 o histórico que tengan el texto antiguo en alguna columna
  const [updatedRows] = await db.query('SELECT * FROM especialidades_v3 WHERE nombre = ?', [nuevoNombre]);
  console.log('Verificación en BD:', updatedRows);

  try {
    invalidateDocentesCache();
    console.log('✅ Caché de docentes invalidada.');
  } catch (e) {}

  process.exit(0);
}

run().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
