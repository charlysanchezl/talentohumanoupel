const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../utils/security');

/**
 * Middleware de Autenticación JWT Institucional UPEL SIGOA
 * Extrae y valida el token desde:
 * 1. Encabezado HTTP: Authorization: Bearer <token>
 * 2. Parámetro Query: ?token=<token> (ideal para descargas directas del navegador)
 */
function authenticateToken(req, res, next) {
  let token = null;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded; // { id, username, name, role, department }
      return next();
    } catch (err) {
      req.tokenExpired = err.name === 'TokenExpiredError';
      req.user = null;
    }
  }

  req.user = null;
  next();
}

const STAFF_ROLES = ['ADMIN', 'AUDITOR', 'DOCENCIA', 'JEFE'];

/**
 * Middleware para exigir obligatoriamente un token JWT válido (401 Unauthorized)
 */
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: req.tokenExpired
        ? 'Token de autenticación expirado. Por favor inicie sesión nuevamente.'
        : 'Acceso no autorizado: Se requiere token de sesión Bearer válido.'
    });
  }
  next();
}

/**
 * Middleware para exigir sesión de personal institucional (excluye tokens de portal docente)
 */
function requireStaffAuth(req, res, next) {
  requireAuth(req, res, () => {
    if (!STAFF_ROLES.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado: Se requiere una sesión institucional autorizada.'
      });
    }
    next();
  });
}

/**
 * Middleware para exigir control de acceso basado en roles (RBAC) (403 Forbidden)
 * @param {string|string[]} allowedRoles - Rol o lista de roles permitidos (ej. 'ADMIN', ['ADMIN', 'JEFE'])
 */
function requireRole(allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return (req, res, next) => {
    requireAuth(req, res, () => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: `Acceso denegado: Operación reservada exclusivamente para perfil [${roles.join(', ')}].`
        });
      }
      next();
    });
  };
}

module.exports = {
  authenticateToken,
  requireAuth,
  requireStaffAuth,
  requireRole,
  STAFF_ROLES
};
