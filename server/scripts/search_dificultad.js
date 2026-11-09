const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  try {
    const list = fs.readdirSync(dir);
    for (const item of list) {
      if (item === 'node_modules' || item === '.git' || item === 'dist') continue;
      const full = path.join(dir, item);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        searchDir(full);
      } else if (/\.(js|jsx|json|html|php|sql)$/i.test(item)) {
        const text = fs.readFileSync(full, 'utf-8');
        if (/dificultad.*aprendizaje/i.test(text)) {
          console.log('Encontrado en:', full);
        }
      }
    }
  } catch (e) {}
}

console.log('Buscando en c:\\Users\\User\\Desktop\\2LIBARDOS ...');
searchDir('C:\\Users\\User\\Desktop\\2LIBARDOS');
console.log('Búsqueda completada.');
