const fs = require('fs');
const db = require('./db');

async function runMigration() {
  try {
    console.log('Iniciando migración...');
    
    const tableCursos = `
      CREATE TABLE IF NOT EXISTS datos_externos_cursos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom_Curso VARCHAR(255)
      )
    `;
    await db.query(tableCursos);
    console.log('Tabla datos_externos_cursos creada.');

    const tableDocentes = `
      CREATE TABLE IF NOT EXISTS datos_externos_docentes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cedula_docente VARCHAR(50),
        Nombres_apellidos VARCHAR(255),
        DPTO VARCHAR(100),
        SEDe_CENTRO VARCHAR(100)
      )
    `;
    await db.query(tableDocentes);
    console.log('Tabla datos_externos_docentes creada.');

    // Append to database.sql
    const sqlContent = `
CREATE TABLE IF NOT EXISTS datos_externos_cursos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom_Curso VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS datos_externos_docentes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cedula_docente VARCHAR(50),
  Nombres_apellidos VARCHAR(255),
  DPTO VARCHAR(100),
  SEDe_CENTRO VARCHAR(100)
);
`;
    fs.appendFileSync('database.sql', sqlContent);
    console.log('database.sql actualizado.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

runMigration();
