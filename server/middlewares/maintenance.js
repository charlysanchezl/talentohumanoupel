const fs = require('fs');
const path = require('path');

const MAINTENANCE_CONFIG_FILE = path.join(__dirname, '../maintenance_config.json');

function getMaintenanceConfig() {
  try {
    if (fs.existsSync(MAINTENANCE_CONFIG_FILE)) {
      const raw = fs.readFileSync(MAINTENANCE_CONFIG_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error leyendo maintenance_config.json en middleware:', e);
  }
  return {
    enabled: false,
    strictLockout: true,
    message: 'El sistema se encuentra en labores rutinarias de mantenimiento y actualización institucional.',
    estimatedEnd: ''
  };
}

/**
 * Middleware de Control de Modo Mantenimiento Institucional UPEL SIGOA
 * Cuando el modo mantenimiento está activo con bloqueo estricto (strictLockout):
 * - Permite acceso total al Administrador (role === 'ADMIN').
 * - Permite endpoints esenciales: login (/api/auth/login), consulta de estado (/api/backup/maintenance-mode), y health check (/api/health).
 * - Bloquea todas las demás rutas API para usuarios comunes, coordinadores y accesos públicos (incluyendo Portal Docente).
 */
function maintenanceMiddleware(req, res, next) {
  // Endpoints exentos que deben seguir respondiendo para permitir autenticación de admin y consulta de estado
  const allowedPrefixes = [
    '/backup/maintenance-mode',
    '/api/backup/maintenance-mode',
    '/auth/login',
    '/api/auth/login',
    '/auth/google',
    '/api/auth/google',
    '/health',
    '/api/health'
  ];

  const currentPath = req.path || '';
  const originalUrl = req.originalUrl || '';
  const isExempt = allowedPrefixes.some(prefix => 
    currentPath === prefix || 
    originalUrl === prefix ||
    currentPath.startsWith(`${prefix}/`) ||
    originalUrl.startsWith(`${prefix}/`) ||
    originalUrl.startsWith(`${prefix}?`)
  );

  if (isExempt) {
    return next();
  }

  const config = getMaintenanceConfig();
  if (config.enabled && config.strictLockout) {
    // Si la petición ya fue autenticada y el usuario tiene rol ADMIN, permitir acceso sin trabas
    if (req.user && req.user.role === 'ADMIN') {
      return next();
    }

    // Bloqueo estricto para cualquier otro usuario o acceso anónimo (Portal Docente, registro, consultas, etc.)
    return res.status(503).json({
      success: false,
      maintenance: true,
      error: 'El sistema UPEL SIGOA se encuentra en labores de mantenimiento institucional. El acceso a las operaciones y al Portal Docente está temporalmente suspendido.',
      message: config.message || 'Mantenimiento institucional en curso. Por favor intente más tarde.',
      estimatedEnd: config.estimatedEnd || null
    });
  }

  next();
}

module.exports = {
  maintenanceMiddleware,
  getMaintenanceConfig
};
