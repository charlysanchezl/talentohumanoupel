/**
 * Servicio API Institucional de Auditoría y Respaldo
 * UPEL SIGOA - Unidad de Informática
 */

const getStoredToken = () => {
  return typeof window !== 'undefined' ? localStorage.getItem('upel_auth_token') : null;
};

const getApiBaseUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location) {
    const isViteDev = window.location.port === '5173';
    return isViteDev ? `http://${window.location.hostname || 'localhost'}:3001/api` : '/api';
  }
  return '/api';
};

/**
 * Obtiene los registros de auditoría del sistema
 */
export const fetchAuditLogs = async () => {
  const API_URL = getApiBaseUrl();
  const token = getStoredToken();
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
  try {
    const res = await fetch(`${API_URL}/audit`, { headers });
    if (res.ok) return await res.json();
    return [];
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
};

/**
 * Mantenimiento preventivo: depuración de logs antiguos
 */
export const purgeOldAuditLogs = async (days = 365) => {
  const API_URL = getApiBaseUrl();
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
  const res = await fetch(`${API_URL}/audit/purge`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ days })
  });
  if (res.ok) return await res.json();
  const err = await res.json().catch(() => ({}));
  throw new Error(err.error || 'Error al depurar registros de auditoría');
};

/**
 * Descarga el respaldo completo de la base de datos
 */
export const triggerDownloadBackup = () => {
  const API_URL = getApiBaseUrl();
  const token = getStoredToken() || '';
  window.location.href = `${API_URL}/backup?token=${encodeURIComponent(token)}`;
};
