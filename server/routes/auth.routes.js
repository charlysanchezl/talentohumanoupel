const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyPassword, generateToken } = require('../utils/security');
const { logAction } = require('../services/auditService');

// Control de intentos y protección contra fuerza bruta
const loginAttempts = new Map(); // key: ip#user, value: { count: number, lockedUntil: number, lastAttempt: number }
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME_MS = 5 * 60 * 1000; // 5 minutos de bloqueo

setInterval(() => {
  const now = Date.now();
  for (const [key, record] of loginAttempts.entries()) {
    if ((!record.lockedUntil || now > record.lockedUntil) && (now - (record.lastAttempt || now) > LOCKOUT_TIME_MS * 2)) {
      loginAttempts.delete(key);
    }
  }
}, 10 * 60 * 1000).unref();

function getClientIp(req) {
  const cfIp = req.headers['cf-connecting-ip'];
  if (cfIp) return String(cfIp).trim();
  const realIp = req.headers['x-real-ip'];
  if (realIp) return String(realIp).trim();
  const forwarded = req.headers['x-forwarded-for'];
  const raw = forwarded ? forwarded.split(',')[0].trim() : (req.socket?.remoteAddress || '127.0.0.1');
  return raw.replace(/^::ffff:/, '');
}

// POST /login
router.post('/login', async (req, res) => {
  try {
    const clientIp = getClientIp(req);
    const now = Date.now();

    let { username, password } = req.body;
    username = (username || '').toString().trim();
    password = (password || '').toString().trim();

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Por favor ingrese su usuario y contraseña.' });
    }

    const lowerUser = username.toLowerCase();
    const normalizedUser = lowerUser.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const attemptKey = `${clientIp}#${lowerUser}`;
    const record = loginAttempts.get(attemptKey);

    const isLocalhost = ['127.0.0.1', '::1', 'localhost', '::ffff:127.0.0.1'].includes(clientIp);

    if (!isLocalhost && record && record.lockedUntil && now < record.lockedUntil) {
      const waitSeconds = Math.ceil((record.lockedUntil - now) / 1000);
      return res.status(429).json({ 
        success: false, 
        message: `Acceso temporalmente bloqueado por seguridad tras 5 intentos fallidos en esta cuenta. Por favor espere ${waitSeconds} segundos antes de reintentar.` 
      });
    }

    const [allUsers] = await db.query('SELECT * FROM usuarios');
    
    let matchedUser = allUsers.find(u => {
      const uLower = (u.username || '').toLowerCase();
      const uNorm = uLower.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const uEmail = (u.correo || '').toLowerCase();
      
      if (uLower === lowerUser || uNorm === normalizedUser || (uEmail && uEmail === lowerUser)) return true;
      
      if (u.role === 'ADMIN' && ['informatica', 'ing.yudithpena', 'ing.yudithpeña'].includes(normalizedUser)) {
        return true;
      }
      return false;
    });

    let passwordValid = false;

    if (matchedUser) {
      passwordValid = await verifyPassword(password, matchedUser.password);
    }

    if (!passwordValid) {
      const cedulaClean = username.replace(/^V-?/i, '').trim();
      const [docentes] = await db.query('SELECT * FROM docentes WHERE cedula = ? OR cedula = ?', [username, cedulaClean]);
      if (docentes.length > 0) {
        const doc = docentes[0];
        const docPassClean = (doc.cedula || '').replace(/^V-?/i, '').trim();
        
        if (doc.clave && doc.clave.trim() !== '') {
          passwordValid = await verifyPassword(password, doc.clave);
        } else {
          return res.status(401).json({
            success: false,
            message: 'Cuenta docente sin clave configurada. Por favor solicite su asignación en la Unidad de Informática.'
          });
        }

        if (passwordValid) {
          const docenteNombre = doc.nombreCompleto || 
            (doc.nombres ? `${doc.nombres} ${doc.apellidos || ''}`.trim() : null) || 
            doc.nombre || 
            'Docente UPEL';

          matchedUser = {
            id: 9000 + (doc.id || 1),
            username: `V-${docPassClean}`,
            name: docenteNombre,
            role: 'DOCENCIA',
            department: doc.department || doc.departamento || 'Docencia',
            correo: doc.correoInstitucional || doc.correo || ''
          };
        }
      }
    }

    if (matchedUser && passwordValid) {
      loginAttempts.delete(attemptKey);
      await logAction(matchedUser.username, matchedUser.role, 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', req);
      const token = generateToken(matchedUser);
      return res.json({ success: true, token, user: matchedUser });
    }

    const prev = loginAttempts.get(attemptKey) || { count: 0, lockedUntil: 0 };
    const newCount = prev.count + 1;

    if (!isLocalhost && newCount >= MAX_LOGIN_ATTEMPTS) {
      loginAttempts.set(attemptKey, { count: newCount, lockedUntil: now + LOCKOUT_TIME_MS });
      await logAction(username || 'ANÓNIMO', 'SEGURIDAD', 'Alerta: Bloqueo por Fuerza Bruta', `Usuario ${username} desde IP ${clientIp} bloqueado 5 minutos tras 5 intentos fallidos`, req);
      return res.status(429).json({
        success: false,
        message: 'Demasiados intentos fallidos. Acceso temporalmente bloqueado por 5 minutos por protección institucional.'
      });
    } else {
      loginAttempts.set(attemptKey, { count: newCount, lockedUntil: 0 });
      return res.status(401).json({ 
        success: false, 
        message: `Credenciales incorrectas. Verifique su usuario y contraseña.` 
      });
    }
  } catch (error) {
    console.error('Error en /api/login:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
