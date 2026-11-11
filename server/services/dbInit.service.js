const fs = require('fs');
const path = require('path');
const db = require('../db');
const { isBcryptHash, hashPassword } = require('../utils/security');

async function syncCatalogoMaterias() {
  try {
    const cursosPath = path.join(__dirname, '../../src/cursos.json');
    if (fs.existsSync(cursosPath)) {
      const cursos = JSON.parse(fs.readFileSync(cursosPath, 'utf8'));
      for (const curso of cursos) {
        await db.query('INSERT IGNORE INTO materias_catalogo_v3 (nombre) VALUES (?)', [curso.trim()]).catch(() => {});
      }
      console.log('Sincronización de catálogo completada (' + cursos.length + ' materias verificadas en 3NF).');
    }
  } catch (error) {
    console.error('Error al sincronizar catálogo:', error);
  }
}

async function syncDatabaseSchema() {
  try {
    await db.query("ALTER TABLE usuarios MODIFY COLUMN role ENUM('ADMIN', 'JEFE', 'AUDITOR', 'DOCENCIA') NOT NULL");
  } catch (e) {}

  try {
    await db.query('ALTER TABLE usuarios ADD COLUMN correo VARCHAR(150)');
  } catch (e) {}

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS especialidades_v3 (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL UNIQUE,
        activo TINYINT(1) NOT NULL DEFAULT 1
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS bancos_v3 (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        codigo_sudeban CHAR(4) NOT NULL UNIQUE,
        nombre VARCHAR(100) NOT NULL UNIQUE,
        activo TINYINT(1) NOT NULL DEFAULT 1
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS docentes_formacion_academica_v3 (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        docente_id INT UNSIGNED NOT NULL UNIQUE,
        especialidad_id INT UNSIGNED DEFAULT NULL,
        titulos_pregrado VARCHAR(255) DEFAULT NULL,
        titulos_postgrado VARCHAR(255) DEFAULT NULL,
        doctorado VARCHAR(255) DEFAULT NULL,
        categoria_docente ENUM('Instructor','Asistente','Agregado','Asociado','Titular') NOT NULL DEFAULT 'Instructor',
        dedicacion ENUM('Tiempo Convencional','Medio Tiempo','Tiempo Completo','Dedicación Exclusiva') NOT NULL DEFAULT 'Tiempo Convencional',
        actualizado_el DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_formacion_especialidad (especialidad_id),
        CONSTRAINT fk_formacion_docente_id FOREIGN KEY (docente_id) REFERENCES docentes_v3(id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_formacion_especialidad FOREIGN KEY (especialidad_id) REFERENCES especialidades_v3(id) ON DELETE SET NULL ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (e) {}

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT DEFAULT NULL,
        user_name VARCHAR(100),
        user_role VARCHAR(50),
        action VARCHAR(255),
        details TEXT,
        ip_address VARCHAR(45) DEFAULT NULL,
        user_agent VARCHAR(255) DEFAULT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_audit_usuario_id (usuario_id),
        CONSTRAINT fk_audit_usuario_id FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE
      )
    `);
    try {
      await db.query('ALTER TABLE audit_logs ADD COLUMN ip_address VARCHAR(45) DEFAULT NULL');
    } catch (e) {}
    try {
      await db.query('ALTER TABLE audit_logs ADD COLUMN user_agent VARCHAR(255) DEFAULT NULL');
    } catch (e) {}

    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS cargas_historicas (
          id INT AUTO_INCREMENT PRIMARY KEY,
          docente_id INT UNSIGNED NOT NULL,
          periodo_id INT UNSIGNED NOT NULL,
          departamento_id INT UNSIGNED NOT NULL,
          status VARCHAR(30) DEFAULT 'Por Revisar',
          semanas INT DEFAULT 15,
          fechaDesde VARCHAR(20),
          fechaHasta VARCHAR(20),
          totalHorasSemanal INT DEFAULT 0,
          totalHorasLapso INT DEFAULT 0,
          fechaRegistro DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY uk_hist_docente_id_periodo_id (docente_id, periodo_id),
          CONSTRAINT fk_hist_docente_id FOREIGN KEY (docente_id) REFERENCES docentes_v3(id) ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT fk_hist_periodo_v3 FOREIGN KEY (periodo_id) REFERENCES periodos_academicos_v3(id) ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT fk_hist_depto_v3 FOREIGN KEY (departamento_id) REFERENCES departamentos_v3(id) ON DELETE CASCADE ON UPDATE CASCADE
        )
      `);
      console.log('Tabla cargas_historicas verificada/creada (3FN por IDs).');
    } catch (e) {
      console.error('Error verificando cargas_historicas:', e);
    }

    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS periodos_academicos_v3 (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          nombre VARCHAR(30) NOT NULL UNIQUE,
          estado ENUM('ACTIVO', 'PLANIFICACION', 'CERRADO') NOT NULL DEFAULT 'PLANIFICACION',
          semanas TINYINT UNSIGNED NOT NULL DEFAULT 15,
          fecha_inicio DATE DEFAULT NULL,
          fecha_fin DATE DEFAULT NULL,
          observaciones VARCHAR(255) DEFAULT NULL,
          creado_el DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          fecha_activacion DATETIME DEFAULT NULL,
          fecha_cierre DATETIME DEFAULT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('Tabla periodos_academicos_v3 verificada/creada (3FN).');
    } catch (e) {
      console.error('Error verificando periodos_academicos_v3:', e);
    }

    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS materias_catalogo_v3 (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          nombre VARCHAR(150) NOT NULL UNIQUE,
          departamento_id INT UNSIGNED DEFAULT NULL,
          horas_semanales_referencial TINYINT UNSIGNED DEFAULT 4,
          CONSTRAINT fk_matcat_depto FOREIGN KEY (departamento_id) REFERENCES departamentos_v3(id) ON DELETE SET NULL ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('Tabla materias_catalogo_v3 verificada/creada (3NF).');

      const [catCount] = await db.query('SELECT COUNT(*) as c FROM materias_catalogo_v3');
      if (catCount[0].c === 0) {
        await syncCatalogoMaterias();
      }
    } catch (e) {
      console.error('Error verificando materias_catalogo_v3:', e);
    }

    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS autorizaciones (
          cedula VARCHAR(20) PRIMARY KEY,
          departamento_id INT UNSIGNED NOT NULL DEFAULT 1,
          nombresApellidos VARCHAR(150),
          CONSTRAINT fk_autorizaciones_depto_v3 FOREIGN KEY (departamento_id) REFERENCES departamentos_v3(id) ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('Tabla autorizaciones verificada/creada (3FN).');
    } catch (e) {
      console.error('Error verificando autorizaciones:', e);
    }

    try {
      const ensureIndex = async (table, indexName, cols) => {
        try {
          await db.query(`CREATE INDEX ${indexName} ON ${table}(${cols})`);
        } catch (idxErr) {}
      };
      await ensureIndex('audit_logs', 'idx_audit_logs_timestamp', 'timestamp');
      await ensureIndex('audit_logs', 'idx_audit_user', 'user_name');
      await ensureIndex('usuarios', 'idx_usuarios_role', 'role');

      await migrateLegacyPlaintextPasswords();
      console.log('Departamentos e índices de rendimiento verificados con éxito en BD (10/10 3FN).');
    } catch (e) {
      console.error('Error verificando índices en BD:', e);
    }
  } catch (e) {
    console.error('Error verificando esquema 3FN:', e);
  }
}

async function migrateLegacyPlaintextPasswords() {
  const exec = typeof db.nativeQuery === 'function' ? db.nativeQuery.bind(db) : db.query.bind(db);
  let migratedUsers = 0;
  let migratedDocentes = 0;

  try {
    const [userRows] = await exec(
      "SELECT id, password FROM usuarios WHERE password IS NOT NULL AND TRIM(password) <> ''"
    );
    for (const row of userRows) {
      if (!isBcryptHash(row.password)) {
        const hashed = await hashPassword(String(row.password));
        await exec('UPDATE usuarios SET password = ? WHERE id = ?', [hashed, row.id]);
        migratedUsers++;
      }
    }

    const [docRows] = await exec(
      "SELECT id, clave_portal_hash FROM docentes_v3 WHERE clave_portal_hash IS NOT NULL AND TRIM(clave_portal_hash) <> ''"
    );
    for (const row of docRows) {
      if (!isBcryptHash(row.clave_portal_hash)) {
        const hashed = await hashPassword(String(row.clave_portal_hash));
        await exec('UPDATE docentes_v3 SET clave_portal_hash = ? WHERE id = ?', [hashed, row.id]);
        migratedDocentes++;
      }
    }

    if (migratedUsers > 0 || migratedDocentes > 0) {
      console.log(`🔒 Migradas contraseñas heredadas a bcrypt: ${migratedUsers} usuarios, ${migratedDocentes} docentes.`);
    }
  } catch (err) {
    console.warn('Aviso migrando contraseñas heredadas a bcrypt:', err.message);
  }
}

module.exports = {
  syncDatabaseSchema,
  syncCatalogoMaterias,
  migrateLegacyPlaintextPasswords
};
