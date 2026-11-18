/**
 * Servicio de Caché en Memoria y Anti-Stampede para Docentes
 */

const apiMemoryCache = {
  docentes: new Map(),
  TTL_MS: 30000 // 30 segundos de vigencia
};

const pendingDocentesFetches = new Map(); // Anti Cache-Stampede Promise Coalescing

function getDocentesCache(key) {
  const item = apiMemoryCache.docentes.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    apiMemoryCache.docentes.delete(key);
    return null;
  }
  return item.data;
}

const MAX_CACHE_ENTRIES = 25;

function setDocentesCache(key, data) {
  if (apiMemoryCache.docentes.size >= MAX_CACHE_ENTRIES && !apiMemoryCache.docentes.has(key)) {
    const oldestKey = apiMemoryCache.docentes.keys().next().value;
    if (oldestKey !== undefined) apiMemoryCache.docentes.delete(oldestKey);
  }
  apiMemoryCache.docentes.set(key, {
    data,
    expiresAt: Date.now() + apiMemoryCache.TTL_MS
  });
}

let debounceInvalidateTimer = null;

function triggerRealtimeSync() {
  try {
    const { broadcastRealtimeUpdate } = require('./realtimeSync.service');
    broadcastRealtimeUpdate('docentes');
  } catch (err) {}
}

function updateDocenteInCache(cedula, partialData) {
  const targetPeriodo = partialData?.periodoAcademico;
  for (const [cacheKey, cacheEntry] of apiMemoryCache.docentes.entries()) {
    const isActiveCache = cacheKey === 'ACTUAL' || cacheKey === 'Todos' || (targetPeriodo && cacheKey === targetPeriodo);
    if (!isActiveCache) continue;
    if (Array.isArray(cacheEntry.data)) {
      const idx = cacheEntry.data.findIndex(d => d.cedula === cedula);
      if (idx !== -1) {
        cacheEntry.data[idx] = { ...cacheEntry.data[idx], ...partialData };
      }
    }
  }
}

// Escuchar notificaciones de invalidación emitidas por otros workers en el cluster
if (typeof process !== 'undefined' && process.on) {
  process.on('message', (msg) => {
    if (msg && msg.type === 'CACHE_INVALIDATE') {
      apiMemoryCache.docentes.clear();
      pendingDocentesFetches.clear();
    }
  });
}

function invalidateDocentesCache(immediate = false) {
  // Notificar al proceso maestro del cluster para que propague la invalidación a los demás núcleos
  if (typeof process !== 'undefined' && typeof process.send === 'function') {
    try {
      process.send({ type: 'CACHE_INVALIDATE' });
    } catch (e) {}
  }

  if (immediate) {
    if (debounceInvalidateTimer) {
      clearTimeout(debounceInvalidateTimer);
      debounceInvalidateTimer = null;
    }
    apiMemoryCache.docentes.clear();
    pendingDocentesFetches.clear();
    triggerRealtimeSync();
    return;
  }
  // Coalescing de invalidación
  if (!debounceInvalidateTimer) {
    debounceInvalidateTimer = setTimeout(() => {
      apiMemoryCache.docentes.clear();
      pendingDocentesFetches.clear();
      triggerRealtimeSync();
      debounceInvalidateTimer = null;
    }, 1500);
  }
}

module.exports = {
  apiMemoryCache,
  pendingDocentesFetches,
  getDocentesCache,
  setDocentesCache,
  updateDocenteInCache,
  invalidateDocentesCache,
  triggerRealtimeSync
};
