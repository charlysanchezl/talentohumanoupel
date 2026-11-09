const db = require('./db');
const fs = require('fs');
const path = require('path');

async function actualizarMaterias() {
  console.log('Iniciando actualización de materias en la base de datos MySQL...');
  try {
    const cursosPath = path.resolve(__dirname, '..', 'src', 'cursos.json');
    if (!fs.existsSync(cursosPath)) {
      console.error('No se encontró cursos.json');
      process.exit(1);
    }
    const cursos = JSON.parse(fs.readFileSync(cursosPath, 'utf8'));
    console.log(`Se encontraron ${cursos.length} materias en cursos.json para sincronizar.`);

    let insertadas = 0;
    for (const curso of cursos) {
      const [res] = await db.query('INSERT IGNORE INTO materias_catalogo (nombre) VALUES (?)', [curso.trim()]);
      if (res.affectedRows > 0) {
        insertadas++;
      }
    }

    const [totalRows] = await db.query('SELECT COUNT(*) as total FROM materias_catalogo');
    console.log(`✔ Sincronización completada.`);
    console.log(`  - Nuevas materias insertadas en MySQL: ${insertadas}`);
    console.log(`  - Total de materias en catálogo MySQL: ${totalRows[0].total}`);
    process.exit(0);
  } catch (error) {
    console.error('Error al conectar o actualizar MySQL:', error.message);
    console.log('Nota: Si MySQL no está encendido, las materias se sincronizarán automáticamente al iniciar el servidor con INICIAR_TALENTO_HUMANO.bat');
    process.exit(0);
  }
}

actualizarMaterias();
