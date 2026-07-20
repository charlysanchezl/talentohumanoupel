const db = require('./db');

async function addIndexes() {
  try {
    console.log('Adding indexes...');
    await db.query('ALTER TABLE docentes ADD INDEX idx_docentes_department (department)');
    console.log('Index 1 added');
  } catch (e) { console.log('Index 1 exists or error:', e.message); }

  try {
    await db.query('ALTER TABLE docentes ADD INDEX idx_docentes_status (status)');
    console.log('Index 2 added');
  } catch (e) { console.log('Index 2 exists or error:', e.message); }

  try {
    await db.query('ALTER TABLE usuarios ADD INDEX idx_usuarios_username (username)');
    console.log('Index 3 added');
  } catch (e) { console.log('Index 3 exists or error:', e.message); }

  try {
    await db.query('ALTER TABLE docentes_materias ADD INDEX idx_docentes_materias_cedula (docente_cedula)');
    console.log('Index 4 added');
  } catch (e) { console.log('Index 4 exists or error:', e.message); }

  console.log('Done.');
  process.exit(0);
}

addIndexes();
