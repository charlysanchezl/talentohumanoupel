const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth, requireRole } = require('../middlewares/auth');
const { hashPassword } = require('../utils/security');

// --- GESTIÓN DE USUARIOS DEL SISTEMA ---
router.get('/users', requireRole('ADMIN'), async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, username, name, role, department, correo FROM usuarios');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/users', requireRole('ADMIN'), async (req, res) => {
  try {
    const { username, password, name, role, department, email, correo } = req.body;
    const userEmail = (correo || email || '').trim().toLowerCase();
    const hashedPassword = password ? await hashPassword(password) : '';
    await db.query(
      'INSERT INTO usuarios (username, password, name, role, department, correo) VALUES (?, ?, ?, ?, ?, ?)',
      [username, hashedPassword, name, role, department, userEmail]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/users/:id', requireRole('ADMIN'), async (req, res) => {
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

router.put('/users/:id', requireRole('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, name, role, department, email, correo } = req.body;
    const userEmail = (correo || email || '').trim().toLowerCase();
    
    let query = 'UPDATE usuarios SET username = ?, name = ?, role = ?, department = ?, correo = ?';
    let params = [username, name, role, department, userEmail];
    
    if (password && password.trim() && !password.startsWith('$2')) {
      const hashedPassword = await hashPassword(password);
      query += ', password = ?';
      params.push(hashedPassword);
    }
    query += ' WHERE id = ?';
    params.push(id);
    
    await db.query(query, params);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- AUTORIZACIONES POR JEFATURA ---
router.get('/autorizaciones', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM autorizaciones');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/autorizaciones', requireRole(['ADMIN', 'JEFE']), async (req, res) => {
  try {
    const { cedula, department, nombresApellidos } = req.body;
    await db.query('INSERT IGNORE INTO autorizaciones (cedula, department, nombresApellidos) VALUES (?, ?, ?)', 
      [cedula, department, nombresApellidos]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/autorizaciones/:cedula', requireRole(['ADMIN', 'JEFE']), async (req, res) => {
  try {
    const { cedula } = req.params;
    await db.query('DELETE FROM autorizaciones WHERE cedula = ?', [cedula]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
