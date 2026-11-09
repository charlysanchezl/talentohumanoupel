const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const db = require('../db');
const { requireRole } = require('../middlewares/auth');
const { logAction } = require('../services/auditService');

const MAINTENANCE_CONFIG_FILE = path.join(__dirname, '../maintenance_config.json');

function getMaintenanceConfig() {
  try {
    if (fs.existsSync(MAINTENANCE_CONFIG_FILE)) {
      const raw = fs.readFileSync(MAINTENANCE_CONFIG_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error leyendo maintenance_config.json:', e);
  }
  return {
    enabled: false,
    strictLockout: true,
    message: 'El sistema se encuentra en labores rutinarias de mantenimiento y actualización institucional.',
    estimatedEnd: '',
    updatedAt: null,
    updatedBy: null
  };
}

function saveMaintenanceConfig(config) {
  try {
    fs.writeFileSync(MAINTENANCE_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('Error guardando maintenance_config.json:', e);
    return false;
  }
}

function getFolderStats(dirPath) {
  let count = 0;
  let totalBytes = 0;
  try {
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        const full = path.join(dirPath, file);
        try {
          const st = fs.statSync(full);
          if (st.isFile()) {
            count++;
            totalBytes += st.size;
          }
        } catch (err) {}
      }
    }
  } catch (err) {}
  return {
    count,
    sizeMB: +(totalBytes / (1024 * 1024)).toFixed(2)
  };
}

// 1. Estadísticas rápidas de la base de datos
router.get('/backup/stats', requireRole(['ADMIN', 'AUDITOR']), async (req, res) => {
  try {
    const [d] = await db.query('SELECT COUNT(*) as count FROM docentes');
    const [m] = await db.query('SELECT COUNT(*) as count FROM docentes_materias');
    const [c] = await db.query('SELECT COUNT(*) as count FROM materias_catalogo');
    const [u] = await db.query('SELECT COUNT(*) as count FROM usuarios');
    const [l] = await db.query('SELECT COUNT(*) as count FROM audit_logs');
    const [h] = await db.query('SELECT COUNT(*) as count FROM cargas_historicas');
    
    res.json({
      success: true,
      stats: {
        docentes: d[0].count,
        materiasAsignadas: m[0].count,
        catalogo: c[0].count,
        usuarios: u[0].count,
        auditLogs: l[0].count,
        historico: h[0].count,
        serverTime: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Respaldo SQL completo para Pendrive / MySQL / phpMyAdmin (Exclusivo Administrador)
router.get('/backup/sql', requireRole('ADMIN'), async (req, res) => {
  try {
    const adminUser = req.user?.username || req.user?.name || 'Administrador';
    const [tableListRes] = await db.query('SHOW FULL TABLES');
    const baseTables = tableListRes.filter(row => Object.values(row)[1] === 'BASE TABLE').map(row => Object.values(row)[0]);
    const views = tableListRes.filter(row => Object.values(row)[1] === 'VIEW').map(row => Object.values(row)[0]);
    const now = new Date();
    const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);

    let sqlDump = `-- ========================================================\n`;
    sqlDump += `-- UPEL SIGOA - BÓVEDA DE RESPALDO INSTITUCIONAL (3NF)\n`;
    sqlDump += `-- Generado: ${now.toLocaleString('es-VE')} por ${adminUser}\n`;
    sqlDump += `-- Servidor: UPEL IPRGR Core MySQL/MariaDB\n`;
    sqlDump += `-- Base de Datos: upel_talento_humano (${baseTables.length} tablas base + ${views.length} vistas)\n`;
    sqlDump += `-- ========================================================\n\n`;
    sqlDump += `SET FOREIGN_KEY_CHECKS = 0;\n`;
    sqlDump += `SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";\n`;
    sqlDump += `SET NAMES utf8mb4;\n\n`;

    for (const table of baseTables) {
      const [createRes] = await db.query(`SHOW CREATE TABLE \`${table}\``);
      const createTableSql = createRes[0]['Create Table'] || Object.values(createRes[0])[1];
      
      sqlDump += `-- --------------------------------------------------------\n`;
      sqlDump += `-- Estructura de tabla para la tabla \`${table}\`\n`;
      sqlDump += `-- --------------------------------------------------------\n`;
      sqlDump += `DROP TABLE IF EXISTS \`${table}\`;\n`;
      sqlDump += `${createTableSql};\n\n`;

      const [rows] = await db.query(`SELECT * FROM \`${table}\``);
      if (rows.length > 0) {
        sqlDump += `-- Volcado de datos para la tabla \`${table}\` (${rows.length} registros)\n`;
        const columns = Object.keys(rows[0]).map(c => `\`${c}\``).join(', ');
        
        for (let i = 0; i < rows.length; i += 50) {
          const chunk = rows.slice(i, i + 50);
          const valuesList = chunk.map(row => {
            const vals = Object.values(row).map(val => {
              if (val === null || val === undefined) return 'NULL';
              if (val instanceof Date) return db.escape(val.toISOString().slice(0, 19).replace('T', ' '));
              return db.escape(val);
            });
            return `(${vals.join(', ')})`;
          }).join(',\n');
          
          sqlDump += `INSERT INTO \`${table}\` (${columns}) VALUES\n${valuesList};\n`;
        }
        sqlDump += `\n`;
      }
    }

    for (const viewName of views) {
      const [createRes] = await db.query(`SHOW CREATE VIEW \`${viewName}\``);
      const createViewSql = createRes[0]['Create View'] || Object.values(createRes[0])[1];
      sqlDump += `-- --------------------------------------------------------\n`;
      sqlDump += `-- Estructura para la vista \`${viewName}\`\n`;
      sqlDump += `-- --------------------------------------------------------\n`;
      sqlDump += `DROP TABLE IF EXISTS \`${viewName}\`;\n`;
      sqlDump += `DROP VIEW IF EXISTS \`${viewName}\`;\n`;
      sqlDump += `${createViewSql};\n\n`;
    }

    sqlDump += `SET FOREIGN_KEY_CHECKS = 1;\n`;
    sqlDump += `-- FIN DEL RESPALDO UPEL SIGOA\n`;

    try {
      await logAction(adminUser, 'ADMIN', 'Generación de Respaldo SQL', `Descargado backup .sql con ${baseTables.length} tablas 3NF y ${views.length} vistas.`, req);
    } catch (e) {}

    res.setHeader('Content-Type', 'application/sql; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="upel_sigoa_backup_${dateStr}.sql"`);
    res.send(sqlDump);
  } catch (err) {
    console.error('Error generando respaldo SQL:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Snapshot JSON completo (Exclusivo Administrador)
router.get('/backup/json', requireRole('ADMIN'), async (req, res) => {
  try {
    const adminUser = req.user?.username || req.user?.name || 'Administrador';
    const [tableListRes] = await db.query('SHOW TABLES');
    const tables = tableListRes.map(row => Object.values(row)[0]);
    const snapshotData = {};
    const counts = {};

    for (const table of tables) {
      const [rows] = await db.query(`SELECT * FROM \`${table}\``);
      snapshotData[table] = rows;
      counts[table] = rows.length;
    }

    const payload = {
      system: 'UPEL_SIGOA_TALENTO_HUMANO',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      counts,
      data: snapshotData
    };

    const dateStr = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="upel_sigoa_snapshot_${dateStr}.json"`);
    res.json(payload);
  } catch (err) {
    console.error('Error generando snapshot JSON:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Restauración segura desde snapshot JSON (Exclusivo Administrador)
router.post('/backup/restore', requireRole('ADMIN'), async (req, res) => {
  try {
    const adminUser = req.user?.username || req.user?.name || 'Administrador';
    const { payload } = req.body;

    if (!payload || !payload.data || !payload.data.docentes) {
      return res.status(400).json({ success: false, error: 'El archivo de respaldo no tiene una estructura válida de UPEL SIGOA.' });
    }

    const { data } = payload;
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      await connection.query('SET FOREIGN_KEY_CHECKS = 0');

      if (Array.isArray(data.docentes)) {
        await connection.query('TRUNCATE TABLE docentes');
        for (const d of data.docentes) {
          const keys = Object.keys(d).map(k => `\`${k}\``).join(', ');
          const vals = Object.values(d).map(v => db.escape(v)).join(', ');
          await connection.query(`INSERT INTO docentes (${keys}) VALUES (${vals})`);
        }
      }

      if (Array.isArray(data.docentes_materias)) {
        await connection.query('TRUNCATE TABLE docentes_materias');
        for (const m of data.docentes_materias) {
          const keys = Object.keys(m).map(k => `\`${k}\``).join(', ');
          const vals = Object.values(m).map(v => db.escape(v)).join(', ');
          await connection.query(`INSERT INTO docentes_materias (${keys}) VALUES (${vals})`);
        }
      }

      if (Array.isArray(data.materias_catalogo)) {
        await connection.query('TRUNCATE TABLE materias_catalogo');
        for (const c of data.materias_catalogo) {
          const keys = Object.keys(c).map(k => `\`${k}\``).join(', ');
          const vals = Object.values(c).map(v => db.escape(v)).join(', ');
          await connection.query(`INSERT INTO materias_catalogo (${keys}) VALUES (${vals})`);
        }
      }

      await connection.query('SET FOREIGN_KEY_CHECKS = 1');
      await connection.commit();
      connection.release();

      await logAction(adminUser, 'ADMIN', 'Restauración de Base de Datos', `Se restauraron ${data.docentes?.length || 0} docentes y ${data.docentes_materias?.length || 0} asignaciones.`, req);

      res.json({
        success: true,
        message: 'Base de datos restaurada con éxito.',
        restored: {
          docentes: data.docentes?.length || 0,
          docentesMaterias: data.docentes_materias?.length || 0,
          materiasCatalogo: data.materias_catalogo?.length || 0
        }
      });
    } catch (txErr) {
      await connection.rollback();
      connection.release();
      throw txErr;
    }
  } catch (err) {
    console.error('Error restaurando base de datos:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 5. Mantenimiento y Optimización de Base de Datos
 */
async function ejecutarMantenimientoTablas(diasRetencion = 180) {
  const startTime = Date.now();
  
  // 1. Depuración de logs de auditoría antiguos
  let deletedAuditLogs = 0;
  if (diasRetencion > 0) {
    const [deleteRes] = await db.query(
      'DELETE FROM audit_logs WHERE timestamp < NOW() - INTERVAL ? DAY',
      [diasRetencion]
    );
    deletedAuditLogs = deleteRes.affectedRows || 0;
  }
  
  // 2. Tablas del núcleo relacional a optimizar
  const tablas = [
    'docentes_v3',
    'docentes_formacion_academica_v3',
    'docentes_datos_bancarios_v3',
    'docentes_contrataciones_v3',
    'cargas_academicas_v3',
    'cargas_historicas',
    'cargas_historicas_materias_v3',
    'departamentos_v3',
    'sedes_v3',
    'especialidades_v3',
    'bancos_v3',
    'periodos_academicos_v3',
    'materias_catalogo_v3',
    'audit_logs',
    'usuarios',
    'autorizaciones'
  ];

  const resultadosTablas = [];
  for (const t of tablas) {
    try {
      await db.query(`OPTIMIZE TABLE \`${t}\``);
      await db.query(`ANALYZE TABLE \`${t}\``);
      resultadosTablas.push({ table: t, status: 'OPTIMIZED' });
    } catch (e) {
      resultadosTablas.push({ table: t, status: 'SKIPPED', error: e.message });
      console.warn(`[MAINTENANCE] Aviso optimizando tabla ${t}:`, e.message);
    }
  }

  // 3. Obtener nuevo tamaño consolidado
  const [sizeRes] = await db.query(`
    SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS totalMB
    FROM information_schema.TABLES
    WHERE table_schema = DATABASE()
  `);

  return {
    deletedAuditLogs,
    tablasOptimizadas: tablas,
    detalles: resultadosTablas,
    nuevoTamanoMB: sizeRes[0]?.totalMB || 0,
    duracionMs: Date.now() - startTime,
    timestamp: new Date().toISOString()
  };
}

// 5.1 Endpoint de Ejecución de Mantenimiento y Compactación
router.post('/backup/maintenance', requireRole('ADMIN'), async (req, res) => {
  try {
    const adminUser = req.user?.username || req.user?.name || 'Administrador';
    const dias = parseInt(req.body?.diasRetencion, 10) || 180;
    const resultado = await ejecutarMantenimientoTablas(dias);

    await logAction(
      adminUser, 
      'ADMIN', 
      'Mantenimiento de Base de Datos', 
      `Se optimizaron ${resultado.tablasOptimizadas.length} tablas y se depuraron ${resultado.deletedAuditLogs} logs antiguos (> ${dias} días). Duración: ${resultado.duracionMs}ms.`, 
      req
    );

    res.json({
      success: true,
      message: 'Mantenimiento y optimización de base de datos completado exitosamente.',
      ...resultado
    });
  } catch (err) {
    console.error('Error en mantenimiento de base de datos:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5.2 Estado Completo de Mantenimiento y Salud del Sistema
router.get('/backup/maintenance/status', requireRole(['ADMIN', 'AUDITOR']), async (req, res) => {
  try {
    // A. Tamaño y desglose de tablas
    const [tableRows] = await db.query(`
      SELECT 
        table_name AS tableName, 
        ROUND(((data_length + index_length) / 1024 / 1024), 2) AS sizeMB,
        table_rows AS tableRows
      FROM information_schema.TABLES 
      WHERE table_schema = DATABASE()
      ORDER BY (data_length + index_length) DESC
    `);

    const totalDbMB = tableRows.reduce((acc, r) => acc + (parseFloat(r.sizeMB) || 0), 0);

    // B. Conteo y antigüedad de logs de auditoría
    const [auditCount] = await db.query('SELECT COUNT(*) as c FROM audit_logs');
    const [oldLogs90] = await db.query('SELECT COUNT(*) as c FROM audit_logs WHERE timestamp < NOW() - INTERVAL 90 DAY');
    const [oldLogs180] = await db.query('SELECT COUNT(*) as c FROM audit_logs WHERE timestamp < NOW() - INTERVAL 180 DAY');

    // C. Directorios de almacenamiento
    const backupDir = path.resolve(__dirname, '../../data_insumos/backups');
    const uploadsDir = path.resolve(__dirname, '../uploads');
    const backupStats = getFolderStats(backupDir);
    const uploadsStats = getFolderStats(uploadsDir);

    // D. Métricas de servidor Node.js
    const mem = process.memoryUsage();
    const serverHealth = {
      uptimeSeconds: Math.floor(process.uptime()),
      memoryRSSMB: +(mem.rss / 1024 / 1024).toFixed(1),
      heapUsedMB: +(mem.heapUsed / 1024 / 1024).toFixed(1),
      heapTotalMB: +(mem.heapTotal / 1024 / 1024).toFixed(1),
      nodeVersion: process.version,
      platform: process.platform,
      serverTime: new Date().toISOString()
    };

    // E. Estado de Modo Mantenimiento
    const maintenanceConfig = getMaintenanceConfig();

    res.json({
      success: true,
      database: {
        totalSizeMB: +totalDbMB.toFixed(2),
        tablesCount: tableRows.length,
        tables: tableRows,
        totalAuditLogs: auditCount[0]?.c || 0,
        oldAuditLogs90: oldLogs90[0]?.c || 0,
        oldAuditLogs180: oldLogs180[0]?.c || 0
      },
      storage: {
        backups: {
          count: backupStats.count,
          sizeMB: backupStats.sizeMB,
          path: backupDir
        },
        uploads: {
          count: uploadsStats.count,
          sizeMB: uploadsStats.sizeMB,
          path: uploadsDir
        }
      },
      serverHealth,
      maintenanceConfig
    });
  } catch (err) {
    console.error('Error obteniendo estado de mantenimiento:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5.3 Diagnóstico de Integridad Referencial de Datos (Solo lectura)
router.get('/backup/integrity', requireRole(['ADMIN', 'AUDITOR']), async (req, res) => {
  try {
    const checks = [];

    // 1. Contrataciones sin docente base
    const [orphanContrataciones] = await db.query(`
      SELECT COUNT(*) as count 
      FROM docentes_contrataciones_v3 
      WHERE docente_id NOT IN (SELECT id FROM docentes_v3)
    `);
    checks.push({
      key: 'orphan_contrataciones',
      title: 'Contrataciones huérfanas',
      count: orphanContrataciones[0]?.count || 0,
      status: (orphanContrataciones[0]?.count === 0) ? 'OK' : 'WARNING',
      description: 'Contrataciones que apuntan a docentes eliminados o inexistentes.'
    });

    // 2. Cargas académicas sin contrato válido
    const [orphanCargas] = await db.query(`
      SELECT COUNT(*) as count 
      FROM cargas_academicas_v3 
      WHERE contratacion_id NOT IN (SELECT id FROM docentes_contrataciones_v3)
    `);
    checks.push({
      key: 'orphan_cargas',
      title: 'Cargas académicas desvinculadas',
      count: orphanCargas[0]?.count || 0,
      status: (orphanCargas[0]?.count === 0) ? 'OK' : 'WARNING',
      description: 'Asignaciones de horas que carecen de registro de contratación activo.'
    });

    // 3. Cargas académicas con código de materia inexistente en catálogo
    const [orphanMaterias] = await db.query(`
      SELECT COUNT(*) as count 
      FROM cargas_academicas_v3 
      WHERE materia_id NOT IN (SELECT id FROM materias_catalogo_v3)
    `);
    checks.push({
      key: 'orphan_materias',
      title: 'Materias asignadas fuera de catálogo',
      count: orphanMaterias[0]?.count || 0,
      status: (orphanMaterias[0]?.count === 0) ? 'OK' : 'WARNING',
      description: 'Horas asignadas con identificador de asignatura no existente.'
    });

    // 4. Datos bancarios huérfanos
    const [orphanBancos] = await db.query(`
      SELECT COUNT(*) as count 
      FROM docentes_datos_bancarios_v3 
      WHERE docente_id NOT IN (SELECT id FROM docentes_v3)
    `);
    checks.push({
      key: 'orphan_bancos',
      title: 'Cuentas bancarias huérfanas',
      count: orphanBancos[0]?.count || 0,
      status: (orphanBancos[0]?.count === 0) ? 'OK' : 'WARNING',
      description: 'Registros de cuentas bancarias sin docente titular asignado.'
    });

    // 5. Formaciones académicas huérfanas
    const [orphanFormacion] = await db.query(`
      SELECT COUNT(*) as count 
      FROM docentes_formacion_academica_v3 
      WHERE docente_id NOT IN (SELECT id FROM docentes_v3)
    `);
    checks.push({
      key: 'orphan_formacion',
      title: 'Expedientes académicos sin titular',
      count: orphanFormacion[0]?.count || 0,
      status: (orphanFormacion[0]?.count === 0) ? 'OK' : 'WARNING',
      description: 'Títulos o grados registrados para cédulas inexistentes.'
    });

    // 6. Docentes con cédula o nombre en blanco
    const [invalidDocentes] = await db.query(`
      SELECT COUNT(*) as count 
      FROM docentes_v3 
      WHERE TRIM(cedula) = '' OR TRIM(nombres) = '' OR TRIM(apellidos) = ''
    `);
    checks.push({
      key: 'invalid_docentes',
      title: 'Docentes con datos de identidad incompletos',
      count: invalidDocentes[0]?.count || 0,
      status: (invalidDocentes[0]?.count === 0) ? 'OK' : 'WARNING',
      description: 'Registros con cédula, nombres o apellidos en blanco.'
    });

    const hasWarnings = checks.some(c => c.status === 'WARNING');

    res.json({
      success: true,
      status: hasWarnings ? 'ATTENTION' : 'OPTIMAL',
      checks,
      checkedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error ejecutando diagnóstico de integridad:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5.4 Saneamiento automático de registros huérfanos (Exclusivo Administrador)
router.post('/backup/integrity/repair', requireRole('ADMIN'), async (req, res) => {
  try {
    const adminUser = req.user?.username || req.user?.name || 'Administrador';
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      const [resCargas] = await connection.query(`
        DELETE FROM cargas_academicas_v3 
        WHERE contratacion_id NOT IN (SELECT id FROM docentes_contrataciones_v3)
      `);
      const [resBancos] = await connection.query(`
        DELETE FROM docentes_datos_bancarios_v3 
        WHERE docente_id NOT IN (SELECT id FROM docentes_v3)
      `);
      const [resForm] = await connection.query(`
        DELETE FROM docentes_formacion_academica_v3 
        WHERE docente_id NOT IN (SELECT id FROM docentes_v3)
      `);

      await connection.commit();
      connection.release();

      const totalReparados = (resCargas.affectedRows || 0) + (resBancos.affectedRows || 0) + (resForm.affectedRows || 0);

      await logAction(
        adminUser, 
        'ADMIN', 
        'Saneamiento de Integridad Referencial', 
        `Se eliminaron ${totalReparados} registros huérfanos (${resCargas.affectedRows || 0} cargas, ${resBancos.affectedRows || 0} bancos, ${resForm.affectedRows || 0} formaciones).`, 
        req
      );

      res.json({
        success: true,
        message: 'Saneamiento de integridad completado exitosamente.',
        cleaned: {
          cargas: resCargas.affectedRows || 0,
          bancos: resBancos.affectedRows || 0,
          formacion: resForm.affectedRows || 0,
          total: totalReparados
        }
      });
    } catch (e) {
      await connection.rollback();
      connection.release();
      throw e;
    }
  } catch (err) {
    console.error('Error saneando integridad:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5.5 Obtener configuración de Modo Mantenimiento
router.get('/backup/maintenance-mode', (req, res) => {
  res.json({
    success: true,
    config: getMaintenanceConfig()
  });
});

// 5.6 Activar o Desactivar Modo Mantenimiento (Exclusivo Administrador)
router.post('/backup/maintenance-mode', requireRole('ADMIN'), async (req, res) => {
  try {
    const adminUser = req.user?.username || req.user?.name || 'Administrador';
    const { enabled, strictLockout, message, estimatedEnd } = req.body;

    const currentConfig = getMaintenanceConfig();
    const newConfig = {
      ...currentConfig,
      enabled: Boolean(enabled),
      strictLockout: strictLockout !== undefined ? Boolean(strictLockout) : true,
      message: (message && typeof message === 'string') ? message.trim() : currentConfig.message,
      estimatedEnd: (estimatedEnd && typeof estimatedEnd === 'string') ? estimatedEnd.trim() : '',
      updatedAt: new Date().toISOString(),
      updatedBy: adminUser
    };

    saveMaintenanceConfig(newConfig);

    await logAction(
      adminUser,
      'ADMIN',
      'Configuración de Modo Mantenimiento',
      `Modo Mantenimiento ${newConfig.enabled ? 'ACTIVADO' : 'DESACTIVADO'}. Mensaje: "${newConfig.message}".`,
      req
    );

    res.json({
      success: true,
      message: `Modo Mantenimiento ${newConfig.enabled ? 'activado' : 'desactivado'} correctamente.`,
      config: newConfig
    });
  } catch (err) {
    console.error('Error configurando modo mantenimiento:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.ejecutarMantenimientoTablas = ejecutarMantenimientoTablas;
module.exports = router;
