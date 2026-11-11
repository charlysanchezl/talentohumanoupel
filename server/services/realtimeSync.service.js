/**
 * Servicio de Sincronización en Tiempo Real (Server-Sent Events - SSE)
 * Nivel Senior: Solución de tiempo real tolerante a proxies y sin WebSockets invasivos.
 * 
 * Ventajas:
 * 1. Opera sobre HTTP estándar (1.1 / 2) con text/event-stream.
 * 2. Compatible con Nginx, Apache, cPanel y Cloudflare (cabecera X-Accel-Buffering: no).
 * 3. Propagación multi-proceso en clúster (inter-worker IPC).
 * 4. Heartbeat preventivo anti-timeout cada 25 segundos.
 */

const logger = require('../utils/logger');

let sseClients = new Set();
let lastVersionTimestamp = Date.now();

// Escuchar broadcasts de otros workers si opera bajo clúster Node.js
if (typeof process !== 'undefined' && process.on) {
  process.on('message', (msg) => {
    if (msg && msg.type === 'REALTIME_BROADCAST') {
      emitLocalSSE(msg.entity, msg.extraData, false);
    }
  });
}

/**
 * Emite el evento a todos los clientes conectados a este proceso worker
 */
function emitLocalSSE(entity = 'docentes', extraData = {}, isOriginator = true) {
  lastVersionTimestamp = Date.now();
  const payload = JSON.stringify({
    type: 'change',
    entity,
    timestamp: lastVersionTimestamp,
    ...extraData
  });

  const eventMessage = `data: ${payload}\n\n`;

  for (const client of sseClients) {
    try {
      client.res.write(eventMessage);
    } catch (err) {
      sseClients.delete(client);
    }
  }

  // Si este worker originó el cambio, propagar a los otros workers del clúster
  if (isOriginator && typeof process !== 'undefined' && typeof process.send === 'function') {
    try {
      process.send({
        type: 'REALTIME_BROADCAST',
        entity,
        extraData
      });
    } catch (clusterErr) {
      // Ignorar si no está en modo cluster
    }
  }
}

/**
 * Registra un nuevo cliente HTTP SSE
 */
function registerSSEClient(req, res) {
  // Cabeceras obligatorias para SSE y compatibilidad con proxies
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Evita que Nginx/cPanel bufferee los eventos
    'Access-Control-Allow-Origin': '*'
  });

  const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const clientObj = { id: clientId, res, ip: req.ip || req.connection.remoteAddress };

  sseClients.add(clientObj);

  // Enviar mensaje de bienvenida con el estado y timestamp actual
  res.write(`data: ${JSON.stringify({ type: 'connected', clientId, timestamp: lastVersionTimestamp })}\n\n`);

  req.on('close', () => {
    sseClients.delete(clientObj);
  });
}

/**
 * Emite una notificación de cambio a todos los clientes conectados
 * @param {string} entity - 'docentes' | 'periodos' | 'materias' | 'general'
 * @param {object} extraData - Metadatos opcionales
 */
function broadcastRealtimeUpdate(entity = 'docentes', extraData = {}) {
  emitLocalSSE(entity, extraData, true);
}

/**
 * Devuelve la última versión de timestamp registrada
 */
function getLastVersion() {
  return {
    version: lastVersionTimestamp,
    activeConnections: sseClients.size,
    serverTime: Date.now()
  };
}

// Heartbeat periódico (cada 25s) para mantener viva la conexión TCP en proxies y cPanel
setInterval(() => {
  for (const client of sseClients) {
    try {
      client.res.write(': keepalive\n\n');
    } catch (err) {
      sseClients.delete(client);
    }
  }
}, 25000).unref();

module.exports = {
  registerSSEClient,
  broadcastRealtimeUpdate,
  getLastVersion
};
