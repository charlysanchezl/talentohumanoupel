const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireRole } = require('../middlewares/auth');
const { logAction } = require('../services/auditService');

// --- CATÁLOGO DE MATERIAS (ORDEN ALFABÉTICO Y EXCLUSIVO ADMINISTRADOR) ---
router.get('/materias-catalogo', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT nombre FROM materias_catalogo ORDER BY nombre ASC');
    const sorted = rows.map(row => row.nombre).sort((a, b) => {
      const comp = a.localeCompare(b, 'es', { sensitivity: 'base' });
      return comp !== 0 ? comp : a.localeCompare(b, 'es');
    });
    res.json(sorted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/materias-catalogo', requireRole('ADMIN'), async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ success: false, message: 'El nombre no puede estar vacío' });
    }
    const cleanName = nombre.trim().toUpperCase();
    await db.query('INSERT IGNORE INTO materias_catalogo (nombre) VALUES (?)', [cleanName]);
    const adminUser = req.user?.username || req.user?.name || 'Administrador';
    await logAction(adminUser, 'ADMIN', 'Ingreso de Materia al Catálogo', `Materia agregada: ${cleanName}`, req);
    res.json({ success: true, nombre: cleanName });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
