// offlineManager.js - Gestor de Conectividad, Caché Local y Cola de Sincronización Automática
const QUEUE_STORAGE_KEY = 'upel_offline_sync_queue_v1';
const CACHE_STAFF_KEY = 'upel_cache_staff_v1';
const CACHE_CATALOGO_KEY = 'upel_cache_catalogo_v1';

let listeners = [];
let isSyncing = false;
let onlineStatus = typeof navigator !== 'undefined' ? navigator.onLine : true;

const notifyListeners = (statusObj) => {
  listeners.forEach(cb => {
    try {
      cb(statusObj);
    } catch (e) {
      console.error('Error notifying sync listener:', e);
    }
  });
};

export const checkServerHealth = async (apiUrl) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`${apiUrl}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    return res.ok;
  } catch (err) {
    return false;
  }
};

if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    onlineStatus = true;
    notifyListeners({ isOnline: true, isSyncing, queueCount: getQueueCount() });
    await triggerAutoSync();
  });

  window.addEventListener('offline', () => {
    onlineStatus = false;
    notifyListeners({ isOnline: false, isSyncing, queueCount: getQueueCount() });
  });
}

export const subscribeSyncStatus = (callback) => {
  listeners.push(callback);
  callback({ isOnline: onlineStatus, isSyncing, queueCount: getQueueCount() });
  return () => {
    listeners = listeners.filter(cb => cb !== callback);
  };
};

export const isSystemOnline = () => onlineStatus;

export const getSyncQueue = () => {
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const getQueueCount = () => {
  return getSyncQueue().length;
};

export const enqueueMutation = (type, payload, auditor) => {
  try {
    const queue = getSyncQueue();
    const item = {
      id: 'sync_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      type,
      payload,
      auditor,
      timestamp: new Date().toISOString()
    };
    queue.push(item);
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    notifyListeners({ isOnline: onlineStatus, isSyncing, queueCount: queue.length });
    return item;
  } catch (e) {
    console.error('Error enqueuing mutation:', e);
    return null;
  }
};

export const clearQueue = () => {
  localStorage.removeItem(QUEUE_STORAGE_KEY);
  notifyListeners({ isOnline: onlineStatus, isSyncing, queueCount: 0 });
};

export const removeProcessedFromQueue = (idsToRemove) => {
  try {
    if (!Array.isArray(idsToRemove) || idsToRemove.length === 0) return getSyncQueue();
    const queue = getSyncQueue();
    const idSet = new Set(idsToRemove);
    const remaining = queue.filter(item => !idSet.has(item.id));
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(remaining));
    notifyListeners({ isOnline: onlineStatus, isSyncing, queueCount: remaining.length });
    return remaining;
  } catch (e) {
    return [];
  }
};

import { idbGet, idbSet } from './idbStorage';

// In-Memory cache para respuestas síncronas instantáneas en UI
let _inMemoryStaff = null;
let _inMemoryCatalogo = null;

// Pre-cargar desde localStorage e IndexedDB al inicio
if (typeof window !== 'undefined') {
  try {
    const rawStaff = localStorage.getItem(CACHE_STAFF_KEY);
    if (rawStaff) _inMemoryStaff = JSON.parse(rawStaff);
  } catch (e) {}

  idbGet(CACHE_STAFF_KEY).then(idbStaff => {
    if (idbStaff && Array.isArray(idbStaff) && idbStaff.length > 0) {
      _inMemoryStaff = idbStaff;
    }
  }).catch(() => {});

  idbGet(CACHE_CATALOGO_KEY).then(idbCat => {
    if (idbCat && Array.isArray(idbCat) && idbCat.length > 0) {
      _inMemoryCatalogo = idbCat;
    }
  }).catch(() => {});
}

export const getCachedStaff = () => {
  if (_inMemoryStaff && Array.isArray(_inMemoryStaff)) {
    return _inMemoryStaff;
  }
  try {
    const raw = localStorage.getItem(CACHE_STAFF_KEY);
    if (raw) {
      _inMemoryStaff = JSON.parse(raw);
      return _inMemoryStaff;
    }
  } catch (e) {}
  return null;
};

export const getCachedStaffAsync = async () => {
  if (_inMemoryStaff && Array.isArray(_inMemoryStaff) && _inMemoryStaff.length > 0) {
    return _inMemoryStaff;
  }
  try {
    const fromIdb = await idbGet(CACHE_STAFF_KEY);
    if (fromIdb && Array.isArray(fromIdb) && fromIdb.length > 0) {
      _inMemoryStaff = fromIdb;
      return fromIdb;
    }
  } catch (e) {}
  return getCachedStaff();
};

export const setCachedStaff = (staffArray) => {
  if (!Array.isArray(staffArray)) return;
  _inMemoryStaff = staffArray;

  // 1. Guardar de forma robusta e ilimitada en IndexedDB
  idbSet(CACHE_STAFF_KEY, staffArray).catch(e => {
    console.warn('Advertencia guardando en IndexedDB:', e);
  });

  // 2. Intentar guardar en localStorage como respaldo secundario (capturando exceso de cuota de 5MB)
  try {
    localStorage.setItem(CACHE_STAFF_KEY, JSON.stringify(staffArray));
  } catch (e) {
    // Si excede los 5 MB de localStorage, IndexedDB resguarda los datos completos
  }
};

export const getCachedCatalogo = () => {
  if (_inMemoryCatalogo) return _inMemoryCatalogo;
  try {
    const raw = localStorage.getItem(CACHE_CATALOGO_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const setCachedCatalogo = (catalogoArray) => {
  _inMemoryCatalogo = catalogoArray;
  idbSet(CACHE_CATALOGO_KEY, catalogoArray).catch(() => {});
  try {
    localStorage.setItem(CACHE_CATALOGO_KEY, JSON.stringify(catalogoArray));
  } catch (e) {}
};

export const updateLocalCacheOptimistically = (type, payload) => {
  const current = getCachedStaff() || [];
  let updated = [...current];

  if (type === 'CREATE_STAFF') {
    const existingIdx = updated.findIndex(s => s.cedula === payload.cedula);
    if (existingIdx !== -1) {
      updated[existingIdx] = { ...updated[existingIdx], ...payload };
    } else {
      updated.unshift({ ...payload, materias: payload.materias || [] });
    }
  } else if (type === 'UPDATE_CARGA') {
    const { cedula, materias, status, periodoAcademico, semanas, fechaDesde, fechaHasta } = payload;
    const idx = updated.findIndex(s => s.cedula === cedula);
    if (idx !== -1) {
      updated[idx] = {
        ...updated[idx],
        materias: materias || updated[idx].materias || [],
        status: status || updated[idx].status,
        periodoAcademico: periodoAcademico || updated[idx].periodoAcademico,
        semanas: semanas !== undefined ? semanas : updated[idx].semanas,
        fechaDesde: fechaDesde !== undefined ? fechaDesde : updated[idx].fechaDesde,
        fechaHasta: fechaHasta !== undefined ? fechaHasta : updated[idx].fechaHasta
      };
    }
  } else if (type === 'DELETE_STAFF') {
    updated = updated.filter(s => s.cedula !== payload.cedula);
  }

  setCachedStaff(updated);
  return updated;
};

export const getBaseApiUrl = () => {
  if (typeof window === 'undefined') return '/api';
  return window.location.port === '5173' ? `http://${window.location.hostname}:3001/api` : '/api';
};

export const triggerAutoSync = async (apiUrl = getBaseApiUrl()) => {
  if (isSyncing) return { success: true, message: 'Sync already in progress' };

  const queue = getSyncQueue();
  if (queue.length === 0) return { success: true, processed: 0, succeeded: 0 };

  const isHealthy = await checkServerHealth(apiUrl);
  if (!isHealthy) {
    onlineStatus = false;
    notifyListeners({ isOnline: false, isSyncing: false, queueCount: queue.length });
    return { success: false, error: 'Servidor no alcanzable. Verifique que el servicio backend esté activo.' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    isSyncing = true;
    onlineStatus = true;
    notifyListeners({ isOnline: true, isSyncing: true, queueCount: queue.length });

    const token = typeof window !== 'undefined' ? localStorage.getItem('upel_auth_token') : null;
    let auditor = null;
    if (typeof window !== 'undefined') {
      try {
        const rawUser = localStorage.getItem('upel_auth_user') || localStorage.getItem('user');
        if (rawUser) auditor = JSON.parse(rawUser);
      } catch (e) {}
    }

    const res = await fetch(`${apiUrl}/sync/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ queue, auditor }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        if (Array.isArray(data.succeededIds) && data.succeededIds.length > 0) {
          removeProcessedFromQueue(data.succeededIds);
        } else if (!data.failed || data.failed === 0) {
          clearQueue();
        }

        if (data.failed > 0 && data.succeeded === 0) {
          return {
            success: false,
            error: data.errors?.[0]?.error || 'El registro en cola tiene un conflicto en la base de datos.',
            processed: data.processed,
            failed: data.failed
          };
        }

        return {
          success: true,
          processed: data.processed,
          succeeded: data.succeeded,
          failed: data.failed || 0,
          succeededIds: data.succeededIds
        };
      }
    }

    if (res.status === 401) {
      return { success: false, error: 'Sesión no autorizada o expirada. Inicie sesión nuevamente o descarte el pendiente.' };
    }

    const errData = await res.json().catch(() => ({}));
    return { success: false, error: errData.error || errData.message || 'Error del servidor al procesar lote' };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return { success: false, error: 'Tiempo de espera agotado al conectar con el servidor.' };
    }
    return { success: false, error: err.message };
  } finally {
    isSyncing = false;
    notifyListeners({ isOnline: onlineStatus, isSyncing: false, queueCount: getQueueCount() });
  }
};
