const express = require('express');
const cors = require('cors');
const compression = require('compression');
const db = require('./db');
require('dotenv').config();

const app = express();

app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Deshabilitar caché para todas las respuestas de la API
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

const fs = require('fs');
const path = require('path');

// Sincronizar cursos.json a la BD al arrancar
async function syncCatalogoMaterias() {
  try {
    const cursosPath = path.join(__dirname, '../src/cursos.json');
    if (fs.existsSync(cursosPath)) {
      const cursos = JSON.parse(fs.readFileSync(cursosPath, 'utf8'));
      const [rows] = await db.query('SELECT COUNT(*) as count FROM materias_catalogo');
      if (rows[0].count === 0) {
        console.log('Migrando cursos.json a la base de datos...');
        for (const curso of cursos) {
          await db.query('INSERT IGNORE INTO materias_catalogo (nombre) VALUES (?)', [curso.trim()]);
        }
        console.log('Migración de catálogo completada.');
      }
    }
  } catch (error) {
    console.error('Error al sincronizar catálogo:', error);
  }
}
syncCatalogoMaterias();

// Asegurar que la columna correo exista (migración automática)
async function syncDatabaseSchema() {
  try {
    await db.query('ALTER TABLE docentes ADD COLUMN correo VARCHAR(150)');
    console.log('Columna correo agregada a la tabla docentes.');
  } catch (e) {
    // Si ya existe o hay otro error, lo ignoramos silenciosamente
  }
}
syncDatabaseSchema();

// --- CATÁLOGO DE MATERIAS ---
app.get('/api/materias-catalogo', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT nombre FROM materias_catalogo ORDER BY nombre ASC');
    res.json(rows.map(row => row.nombre));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/materias-catalogo', async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ success: false, message: 'El nombre no puede estar vacío' });
    }
    await db.query('INSERT IGNORE INTO materias_catalogo (nombre) VALUES (?)', [nombre.trim().toUpperCase()]);
    res.json({ success: true, nombre: nombre.trim().toUpperCase() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- USUARIOS ---
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await db.query('SELECT * FROM usuarios WHERE username = ? AND password = ?', [username, password]);
    if (rows.length > 0) {
      // Remover el password de la respuesta
      const { password: _, ...user } = rows[0];
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, username, password, name, role, department FROM usuarios');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { username, password, name, role, department } = req.body;
    await db.query(
      'INSERT INTO usuarios (username, password, name, role, department) VALUES (?, ?, ?, ?, ?)',
      [username, password, name, role, department]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (id === '1' || id === 1) {
      return res.status(403).json({ error: 'No se puede eliminar al administrador principal' });
    }
    await db.query('DELETE FROM usuarios WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, name, role, department } = req.body;
    await db.query(
      'UPDATE usuarios SET username = ?, password = ?, name = ?, role = ?, department = ? WHERE id = ?',
      [username, password, name, role, department, id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- AUTORIZACIONES ---
app.get('/api/autorizaciones', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM autorizaciones');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/autorizaciones', async (req, res) => {
  try {
    const { cedula, department, nombresApellidos } = req.body;
    await db.query('INSERT IGNORE INTO autorizaciones (cedula, department, nombresApellidos) VALUES (?, ?, ?)', 
      [cedula, department, nombresApellidos]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/autorizaciones/:cedula', async (req, res) => {
  try {
    const { cedula } = req.params;
    await db.query('DELETE FROM autorizaciones WHERE cedula = ?', [cedula]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- DOCENTES ---
app.get('/api/docentes', async (req, res) => {
  try {
    const [docentes] = await db.query('SELECT * FROM docentes');
    const [materias] = await db.query('SELECT * FROM docentes_materias');
    
    const materiasPorDocente = {};
    for (const m of materias) {
      if (!materiasPorDocente[m.docente_cedula]) {
        materiasPorDocente[m.docente_cedula] = [];
      }
      materiasPorDocente[m.docente_cedula].push(m);
    }
    
    // Anidar las materias de forma optimizada O(N+M) en lugar de O(N*M)
    const result = docentes.map(doc => {
      doc.materias = materiasPorDocente[doc.cedula] || [];
      return doc;
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/docentes', async (req, res) => {
  try {
    const d = req.body;
    // Insertar o actualizar docente
    const query = `
      INSERT INTO docentes (
        cedula, nombres, apellidos, department, status, fechaNac, rif, correo, direccion, telefonos, 
        banco, cuentaBancaria, tipoCuenta, titulosPregrado, titulosPostgrado, 
        categoriaDocente, dedicacion, periodoAcademico, semanas, fechaDesde, fechaHasta, doctorado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        nombres=VALUES(nombres), apellidos=VALUES(apellidos), department=VALUES(department),
        fechaNac=VALUES(fechaNac), rif=VALUES(rif), correo=VALUES(correo), direccion=VALUES(direccion), telefonos=VALUES(telefonos),
        banco=VALUES(banco), cuentaBancaria=VALUES(cuentaBancaria), tipoCuenta=VALUES(tipoCuenta),
        titulosPregrado=VALUES(titulosPregrado), titulosPostgrado=VALUES(titulosPostgrado),
        categoriaDocente=VALUES(categoriaDocente), dedicacion=VALUES(dedicacion), 
        periodoAcademico=VALUES(periodoAcademico), semanas=VALUES(semanas), 
        fechaDesde=VALUES(fechaDesde), fechaHasta=VALUES(fechaHasta), doctorado=VALUES(doctorado)
    `;
    
    const values = [
      d.cedula, d.nombres, d.apellidos, d.department, d.status || 'Por Revisar', 
      d.fechaNac, d.rif, d.correo || '', d.direccion, d.telefonos, d.banco, d.cuentaBancaria, d.tipoCuenta,
      d.titulosPregrado, d.titulosPostgrado, d.categoriaDocente, d.dedicacion, 
      d.periodoAcademico, d.semanas, d.fechaDesde, d.fechaHasta, d.doctorado || ''
    ];

    await db.query(query, values);
    
    // Eliminar de autorizaciones si estaba
    await db.query('DELETE FROM autorizaciones WHERE cedula = ?', [d.cedula]);

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/docentes/:cedula', async (req, res) => {
  try {
    const { cedula } = req.params;
    await db.query('DELETE FROM docentes WHERE cedula = ?', [cedula]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/docentes/carga', async (req, res) => {
  try {
    const { cedula, materias, status, periodoAcademico, semanas, fechaDesde, fechaHasta } = req.body;
    
    // Actualizar status y datos de validación
    let updateQuery = 'UPDATE docentes SET status = ?';
    let updateParams = [status];

    if (periodoAcademico !== undefined) {
      updateQuery += ', periodoAcademico = ?, semanas = ?, fechaDesde = ?, fechaHasta = ?';
      updateParams.push(periodoAcademico, semanas, fechaDesde, fechaHasta);
    }
    
    updateQuery += ' WHERE cedula = ?';
    updateParams.push(cedula);

    await db.query(updateQuery, updateParams);
    
    // Eliminar materias anteriores
    await db.query('DELETE FROM docentes_materias WHERE docente_cedula = ?', [cedula]);
    
    // Insertar nuevas materias de forma masiva (Bulk Insert)
    if (materias && materias.length > 0) {
      const materiasValues = materias.map(m => [
        cedula, 
        m.nombre, 
        parseInt(m.horasSemanal) || 0, 
        parseInt(m.horasLapso) || 0
      ]);
      await db.query(
        'INSERT INTO docentes_materias (docente_cedula, nombre, horasSemanal, horasLapso) VALUES ?',
        [materiasValues]
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error in /api/docentes/carga:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- MIGRATION ---
app.post('/api/migrate', async (req, res) => {
  try {
    const { docentes } = req.body;
    
    if (!docentes || docentes.length === 0) {
      return res.json({ success: true, count: 0 });
    }

    // 1. Bulk Insert / Update de Docentes
    const docentesValues = docentes.map(d => [
      d.cedula, d.nombres, d.apellidos, d.department, d.status || 'Por Revisar', 
      d.fechaNac || '', d.rif || '', d.correo || '', d.direccion || '', d.telefonos || '', 
      d.banco || '', d.cuentaBancaria || '', d.tipoCuenta || 'Ahorro',
      d.titulosPregrado || '', d.titulosPostgrado || '', d.categoriaDocente || 'Instructor', 
      d.dedicacion || 'Tiempo Convencional', d.periodoAcademico || '2025-I', 
      d.semanas || 15, d.fechaDesde || '', d.fechaHasta || '', d.doctorado || ''
    ]);

    const query = `
      INSERT INTO docentes (
        cedula, nombres, apellidos, department, status, fechaNac, rif, correo, direccion, telefonos, 
        banco, cuentaBancaria, tipoCuenta, titulosPregrado, titulosPostgrado, 
        categoriaDocente, dedicacion, periodoAcademico, semanas, fechaDesde, fechaHasta, doctorado
      ) VALUES ?
      ON DUPLICATE KEY UPDATE 
        nombres=VALUES(nombres), apellidos=VALUES(apellidos), department=VALUES(department),
        status=VALUES(status)
    `;
    await db.query(query, [docentesValues]);

    // 2. Delete old materias para estos docentes
    const cedulas = docentes.map(d => d.cedula);
    await db.query('DELETE FROM docentes_materias WHERE docente_cedula IN (?)', [cedulas]);

    // 3. Bulk Insert de Materias
    const materiasValues = [];
    for (const d of docentes) {
      if (d.materias && d.materias.length > 0) {
        for (const m of d.materias) {
          materiasValues.push([d.cedula, m.nombre, m.horasSemanal, m.horasLapso]);
        }
      }
    }
    
    if (materiasValues.length > 0) {
      await db.query(
        'INSERT INTO docentes_materias (docente_cedula, nombre, horasSemanal, horasLapso) VALUES ?',
        [materiasValues]
      );
    }
    
    res.json({ success: true, count: docentes.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});
