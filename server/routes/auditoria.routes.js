const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireRole } = require('../middlewares/auth');
const { logAction } = require('../services/auditService');

// --- AUDITORÍA Y BITÁCORA ---
router.get('/audit', requireRole(['ADMIN', 'AUDITOR']), async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 1000');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- MANTENIMIENTO PREVENTIVO: PURGA DE REGISTROS ANTIGUOS ---
router.post('/audit/purge', requireRole('ADMIN'), async (req, res) => {
  try {
    const days = parseInt(req.body.days) || 365;
    const [result] = await db.query(
      'DELETE FROM audit_logs WHERE timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)',
      [days]
    );
    const adminUser = req.user?.username || req.user?.name || 'Administrador';
    await logAction(adminUser, 'ADMIN', 'Purgado de Auditoría', `Mantenimiento preventivo: se depuraron ${result.affectedRows} eventos anteriores a ${days} días`, req);
    res.json({ success: true, affectedRows: result.affectedRows, days });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- RESPALDOS DE BASE DE DATOS (BACKUP) ---
router.get('/backup', requireRole('ADMIN'), async (req, res) => {
  try {
    const adminUser = req.user?.username || req.user?.name || 'Administrador';
    const backup = {};
    const tables = [
      'usuarios', 
      'docentes', 
      'docentes_materias', 
      'autorizaciones', 
      'materias_catalogo', 
      'audit_logs', 
      'cargas_historicas', 
      'periodos_academicos'
    ];
    
    for (const table of tables) {
      const [rows] = await db.query(`SELECT * FROM \`${table}\``);
      backup[table] = rows;
    }
    
    await logAction(adminUser, 'ADMIN', 'Descargó Respaldo (Backup)', 'Base de datos completa descargada', req);
    res.json(backup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
