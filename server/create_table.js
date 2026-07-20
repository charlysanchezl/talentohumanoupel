const db = require('./db');

async function createTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS materias_catalogo (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(150) NOT NULL UNIQUE
      )
    `);
    console.log('Tabla materias_catalogo creada exitosamente.');
  } catch (error) {
    console.error('Error al crear tabla:', error);
  } finally {
    process.exit(0);
  }
}

createTable();
