const db = require('../db');
const logger = require('../utils/logger');

// Cache en memoria para IDs de usuarios (evita SELECT continuo a la tabla usuarios)
const userIdCache = new Map();

// Cola en memoria para Inserción Asíncrona en Lote (Non-Blocking / Batching)
const auditQueue = [];
let isFlushing = false;
let flushTimer = null;

async function flushQueue() {
  if (isFlushing || auditQueue.length === 0) return;
  isFlushing = true;

  try {
    while (auditQueue.length > 0) {
      // Extraer lote de hasta 100 registros para procesar en un solo INSERT masivo
      const batch = auditQueue.splice(0, 100);
      if (batch.length === 0) break;

      const placeholders = [];
      const values = [];

      for (const item of batch) {
        placeholders.push('(?, ?, ?, ?, ?, ?, ?)');
        values.push(
          item.usuarioId || null,
          item.user_name,
          item.user_role || 'UNKNOWN',
          item.action,
          item.details || '',
          item.clientIp || null,
          item.userAgent || null
        );
      }

      try {
        await db.nativeQuery(
          `INSERT INTO audit_logs (usuario_id, user_name, user_role, action, details, ip_address, user_agent) VALUES ${placeholders.join(', ')}`,
          values
        );
      } catch (insertErr) {
        // Fallback por fila individual en caso de que alguna fila tenga caracteres incompatibles
        for (const item of batch) {
          try {
            await db.nativeQuery(
              'INSERT INTO audit_logs (usuario_id, user_name, user_role, action, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [item.usuarioId || null, item.user_name, item.user_role || 'UNKNOWN', item.action, item.details || '', item.clientIp || null, item.userAgent || null]
            );
          } catch (rowErr) {
            logger.warn('Aviso en inserción individual de auditoría:', rowErr.message);
          }
        }
      }
    }
  } catch (err) {
    logger.error('Error procesando cola de auditoría:', err);
  } finally {
    isFlushing = false;
  }
}

function scheduleFlush() {
  if (!flushTimer) {
    flushTimer = setTimeout(() => {
      flushTimer = null;
      flushQueue();
    }, 1500); // Acumula y descarga en lote cada 1.5 segundos
    if (typeof flushTimer.unref === 'function') {
      flushTimer.unref();
    }
  }
}

// Vaciar cola pendiente al cerrar el proceso de Node.js
process.on('beforeExit', () => {
  if (auditQueue.length > 0) {
    flushQueue().catch(() => {});
  }
});

/**
 * Servicio Centralizado de Bitácora y Auditoría Institucional (3FN)
 * Operación NO BLOQUEANTE (Fire-and-Forget):
 * Responde inmediatamente al usuario y procesa la inserción en lotes optimizados en segundo plano.
 */
function logAction(user_name, user_role, action, details, req = null) {
  let usuarioId = null;

  // Atribución garantizada si la petición cuenta con sesión JWT verificada
  if (req && req.user) {
    user_name = req.user.username || req.user.name || user_name;
    user_role = req.user.role || user_role;
    if (req.user.id && Number(req.user.id) < 9000) {
      usuarioId = Number(req.user.id);
    }
  }
  if (!user_name) return Promise.resolve(true);

  // Registro paralelo en archivo de log local
  logger.action({ username: user_name, role: user_role }, action, details);

  // Extracción síncrona segura de datos de red antes de que se recicle el objeto req
  let clientIp = null;
  let userAgent = null;
  if (req) {
    const forwarded = req.headers['x-forwarded-for'];
    const rawIp = forwarded ? forwarded.split(',')[0].trim() : (req.socket?.remoteAddress || '127.0.0.1');
    clientIp = rawIp.replace(/^::ffff:/, '');
    userAgent = String(req.headers['user-agent'] || '').slice(0, 255);
  }

  // Si no tenemos usuarioId, consultar en caché o resolver en background
  if (!usuarioId && user_name) {
    const cachedId = userIdCache.get(user_name.toLowerCase().trim());
    if (cachedId !== undefined) {
      usuarioId = cachedId;
    }
  }

  // Encolar evento de auditoría en memoria (operación en sub-milisegundos)
  auditQueue.push({
    usuarioId,
    user_name,
    user_role,
    action,
    details,
    clientIp,
    userAgent,
    queuedAt: Date.now()
  });

  // Si la cola supera 20 eventos, procesar de inmediato; de lo contrario usar timer debounce
  if (auditQueue.length >= 20) {
    setImmediate(flushQueue);
  } else {
    scheduleFlush();
  }

  // Si el usuarioId no estaba en caché y no se conoce, resolverlo asíncronamente para futuros eventos
  if (!usuarioId && user_name && !userIdCache.has(user_name.toLowerCase().trim())) {
    setImmediate(async () => {
      try {
        const [uRows] = await db.nativeQuery(
          'SELECT id FROM usuarios WHERE LOWER(TRIM(username)) = LOWER(TRIM(?)) LIMIT 1',
          [user_name]
        );
        if (uRows && uRows.length > 0) {
          userIdCache.set(user_name.toLowerCase().trim(), uRows[0].id);
        } else {
          userIdCache.set(user_name.toLowerCase().trim(), null);
        }
      } catch (e) {}
    });
  }

  // Retornar promesa resuelta de inmediato (cero retardo para el usuario de la API)
  return Promise.resolve(true);
}

module.exports = {
  logAction,
  flushQueue
};
