const db = require('./db');

async function test() {
  try {
    const [rows] = await db.query('SELECT cedula, nombres, apellidos, status, periodoAcademico, fechaDesde FROM docentes LIMIT 5');
    console.log("Docentes:", rows);
    const [materias] = await db.query('SELECT * FROM docentes_materias LIMIT 5');
    console.log("Materias:", materias);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

test();
