/**
 * Middleware Institucional de Seguridad y Protección de Cabeceras
 * Sistema UPEL SIGOA - Subdirección de Docencia
 */

// Memoria de control de peticiones por IP (Rate Limiter liviano nativo)
const rateLimitStore = new Map();

/**
 * Obtiene la dirección IP real del cliente detrás de proxies o túneles
 */
function getClientIp(req) {
  const cfIp = req.headers['cf-connecting-ip'];
  if (cfIp) return String(cfIp).trim();
  const realIp = req.headers['x-real-ip'];
  if (realIp) return String(realIp).trim();
  const forwarded = req.headers['x-forwarded-for'];
  const raw = forwarded ? forwarded.split(',')[0].trim() : (req.socket?.remoteAddress || '127.0.0.1');
  return raw.replace(/^::ffff:/, '');
}

/**
 * Middleware para inyectar cabeceras HTTP de seguridad
 * Protege contra Clickjacking, MIME-sniffing, y XSS
 */
function securityHeaders(req, res, next) {
  // Evitar que la página sea embebida en iframes externos (Clickjacking)
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  // Evitar que el navegador intente adivinar el tipo MIME (MIME Sniffing)
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Filtro XSS legacy para navegadores antiguos
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Limitar la información del referente
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Deshabilitar APIs de dispositivos innecesarias
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // Evitar políticas cross-domain heredadas y exposición de recursos entre orígenes
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  // Activar HSTS estrictamente cuando la conexión real o detrás de proxy Nginx sea HTTPS
  const isHttps = req.secure || String(req.headers['x-forwarded-proto'] || '').toLowerCase().includes('https');
  if (isHttps) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  // Ocultar firma de Express
  res.removeHeader('X-Powered-By');
  next();
}

/**
 * Factory para crear limitadores de tasa (Rate Limiters) en rutas sensibles
 * @param {number} maxRequests - Número máximo de peticiones permitidas en la ventana
 * @param {number} windowMs - Ventana de tiempo en milisegundos
 * @param {string} message - Mensaje a devolver si se supera el límite
 */
function createRateLimiter(maxRequests = 60, windowMs = 15 * 60 * 1000, message = 'Demasiadas solicitudes. Por favor intente más tarde.') {
  return (req, res, next) => {
    const ip = getClientIp(req);
    // En entorno localhost se desactiva el límite estricto para no entorpecer pruebas
    if (['127.0.0.1', '::1', 'localhost', '::ffff:127.0.0.1'].includes(ip)) {
      return next();
    }

    const key = `${ip}#${req.baseUrl || req.path}`;
    const now = Date.now();
    const record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      const waitSeconds = Math.ceil((record.resetTime - now) / 1000);
      return res.status(429).json({
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: `${message} (Espere ${waitSeconds} segundos)`
      });
    }

    record.count++;
    next();
  };
}

// Limpiador periódico de registros expirados cada 10 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitStore.entries()) {
    if (now > val.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000).unref();

module.exports = {
  securityHeaders,
  createRateLimiter,
  getClientIp
};
