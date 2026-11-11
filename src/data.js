import defaultCursos from './cursos.json';
import defaultPlanesEstudio from './planes_estudio.json';
import {
  getCachedStaff,
  getCachedStaffAsync,
  setCachedStaff,
  getCachedCatalogo,
  setCachedCatalogo,
  enqueueMutation,
  updateLocalCacheOptimistically,
  triggerAutoSync,
  isSystemOnline
} from './services/offlineManager';

export const API_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL
  : (typeof window !== 'undefined'
    ? (window.location.port === '5173' ? `http://${window.location.hostname || 'localhost'}:3001/api` : '/api')
    : '/api');

export const AUTH_TOKEN_KEY = 'upel_auth_token';

export const getAuthToken = () => {
  return typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
};

export const getAuthHeaders = (extraHeaders = {}) => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...extraHeaders
  };
};

// Cache en memoria RAM para navegación instantánea (Zero-Latency UI V3.0)
let inMemoryStaffCache = null;
let inMemoryStaffPeriodo = null;
let lastFetchTimestamp = 0;
const MEMORY_CACHE_TTL = 15000; // 15s de respuesta inmediata al navegar entre pestañas

export const invalidateStaffCache = () => {
  inMemoryStaffCache = null;
  lastFetchTimestamp = 0;
};

export const getStaffData = async (periodo) => {
  const isAll = !periodo || periodo === 'Todos';
  const targetPeriodo = isAll ? 'Todos' : periodo;

  // Si tenemos datos en RAM frescos para esta consulta, responder en 0ms
  if (
    inMemoryStaffCache &&
    inMemoryStaffPeriodo === targetPeriodo &&
    (Date.now() - lastFetchTimestamp < MEMORY_CACHE_TTL)
  ) {
    return inMemoryStaffCache;
  }

  try {
    const url = (!isAll) 
      ? `${API_URL}/docentes?periodo=${encodeURIComponent(periodo)}` 
      : `${API_URL}/docentes`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (res.ok) {
      const rawData = await res.json();
      const data = (Array.isArray(rawData) ? rawData : []).map(d => ({
        ...d,
        department: normalizeDepartmentName(d.department)
      }));
      setCachedStaff(data); // Actualizar siempre con datos frescos del servidor
      inMemoryStaffCache = data;
      inMemoryStaffPeriodo = targetPeriodo;
      lastFetchTimestamp = Date.now();
      return data;
    }
    // Si el backend responde con error, recurrir a la caché local (IndexedDB)
    const cached = await getCachedStaffAsync();
    if (cached) {
      const normalizedCached = (Array.isArray(cached) ? cached : []).map(d => ({
        ...d,
        department: normalizeDepartmentName(d.department)
      }));
      inMemoryStaffCache = normalizedCached;
      return normalizedCached;
    }
    return [];
  } catch (err) {
    console.warn('Backend inaccesible, sirviendo personal desde caché local offline (IndexedDB):', err.message);
    const cached = await getCachedStaffAsync();
    if (cached) {
      inMemoryStaffCache = cached;
      return cached;
    }
    return [];
  }
};

const extractServerErrorMessage = async (res, fallback) => {
  const errData = await res.json().catch(() => ({}));
  if (res.status === 401) {
    return errData.error || errData.message || 'Sesión expirada o no autorizada (401). Cierre sesión e inicie sesión nuevamente.';
  }
  return errData.error || errData.message || fallback;
};

export const createStaff = async (staffData) => {
  invalidateStaffCache();
  const auditor = getCurrentUser();

  try {
    const res = await fetch(`${API_URL}/docentes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...staffData, auditor })
    });
    if (res.ok) {
      updateLocalCacheOptimistically('CREATE_STAFF', staffData);
      return true;
    }
    if (res.status >= 502) {
      updateLocalCacheOptimistically('CREATE_STAFF', staffData);
      enqueueMutation('CREATE_STAFF', staffData, auditor);
      return true;
    }
    const errMsg = await extractServerErrorMessage(res, 'Error del servidor al guardar el docente.');
    throw new Error(errMsg);
  } catch (err) {
    if (err && err.name === 'TypeError') {
      console.warn('Guardado en cola offline (sin conexión):', err.message);
      updateLocalCacheOptimistically('CREATE_STAFF', staffData);
      enqueueMutation('CREATE_STAFF', staffData, auditor);
      return true;
    }
    throw err;
  }
};

export const updateStaffCarga = async (cedula, materias, status, validationData = {}) => {
  invalidateStaffCache();
  const auditor = getCurrentUser();
  const payload = { cedula, materias, status, ...validationData };

  try {
    const res = await fetch(`${API_URL}/docentes/carga`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...payload, auditor })
    });
    if (res.ok) {
      updateLocalCacheOptimistically('UPDATE_CARGA', payload);
      return true;
    }
    if (res.status >= 502) {
      updateLocalCacheOptimistically('UPDATE_CARGA', payload);
      enqueueMutation('UPDATE_CARGA', payload, auditor);
      return true;
    }
    const errMsg = await extractServerErrorMessage(res, 'No se pudo actualizar la carga académica en el servidor.');
    console.error('Error al actualizar carga en servidor:', errMsg);
    throw new Error(errMsg);
  } catch (err) {
    if (err && err.name === 'TypeError') {
      console.warn('Carga guardada en cola offline (sin conexión):', err.message);
      updateLocalCacheOptimistically('UPDATE_CARGA', payload);
      enqueueMutation('UPDATE_CARGA', payload, auditor);
      return true;
    }
    throw err;
  }
};

export const deleteStaff = async (cedula) => {
  invalidateStaffCache();
  const auditor = getCurrentUser();

  try {
    const res = await fetch(`${API_URL}/docentes/${cedula}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({ auditor })
    });
    if (res.ok) {
      updateLocalCacheOptimistically('DELETE_STAFF', { cedula });
      return true;
    }
    if (res.status >= 502) {
      updateLocalCacheOptimistically('DELETE_STAFF', { cedula });
      enqueueMutation('DELETE_STAFF', { cedula }, auditor);
      return true;
    }
    const errMsg = await extractServerErrorMessage(res, 'No se pudo eliminar el docente en el servidor.');
    throw new Error(errMsg);
  } catch (error) {
    if (error && error.name === 'TypeError') {
      console.warn("Docente eliminado localmente y encolado para sincronización:", error.message);
      updateLocalCacheOptimistically('DELETE_STAFF', { cedula });
      enqueueMutation('DELETE_STAFF', { cedula }, auditor);
      return true;
    }
    throw error;
  }
};

export const getPlanesEstudio = () => defaultPlanesEstudio;

const sortMateriasAlphabetically = (list) => {
  return Array.from(new Set(list || []))
    .map(m => (typeof m === 'string' ? m.trim() : ''))
    .filter(Boolean)
    .sort((a, b) => {
      const comp = a.localeCompare(b, 'es', { sensitivity: 'base' });
      return comp !== 0 ? comp : a.localeCompare(b, 'es');
    });
};

export const getCatalogoMaterias = async () => {
  try {
    const res = await fetch(`${API_URL}/materias-catalogo`);
    if (res.ok) {
      const data = await res.json();
      const merged = sortMateriasAlphabetically([...defaultCursos, ...(Array.isArray(data) ? data : [])]);
      setCachedCatalogo(merged);
      return merged;
    }
    const cached = getCachedCatalogo();
    if (cached && Array.isArray(cached) && cached.length > 0) {
      const merged = sortMateriasAlphabetically([...defaultCursos, ...cached]);
      return merged;
    }
    return sortMateriasAlphabetically(defaultCursos);
  } catch (error) {
    console.warn("Catálogo servido desde caché/bundle offline:", error.message);
    const cached = getCachedCatalogo();
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return sortMateriasAlphabetically([...defaultCursos, ...cached]);
    }
    return sortMateriasAlphabetically(defaultCursos);
  }
};

// --- AUDITORÍA Y RESPALDOS (Delegados a auditService) ---
import { fetchAuditLogs, triggerDownloadBackup, purgeOldAuditLogs } from './services/api/auditService';
export const getAuditLogs = fetchAuditLogs;
export const downloadBackup = triggerDownloadBackup;
export const purgeAuditLogs = purgeOldAuditLogs;

export const addMateriaCatalogo = async (nombre) => {
  try {
    const res = await fetch(`${API_URL}/materias-catalogo`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ nombre: (nombre || '').toString().trim() })
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.success) {
      return { success: false, message: data?.error || data?.message || 'Operación reservada para el Administrador del Sistema.' };
    }
    invalidateStaffCache();
    const currentCat = getCachedCatalogo() || [];
    const updated = sortMateriasAlphabetically([...currentCat, data.nombre]);
    setCachedCatalogo(updated);
    return data;
  } catch (error) {
    console.error("Error adding materia_catalogo:", error);
    return { success: false, message: 'No se pudo conectar con el servidor.' };
  }
};

// --- REPLICACIÓN Y KARDEX DE PERÍODOS ACADÉMICOS ---
export const replicateAcademicPeriod = async ({ periodoOrigen, periodoDestino, semanas, fechaDesde, fechaHasta, department, cedulasSeleccionadas }) => {
  try {
    const auditor = getCurrentUser();
    const res = await fetch(`${API_URL}/periodos/replicar`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        periodoOrigen,
        periodoDestino,
        semanas,
        fechaDesde,
        fechaHasta,
        department,
        cedulasSeleccionadas,
        auditor
      })
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error replicando período:', err);
    return { success: false, error: err.message };
  }
};

export const getTeacherHistory = async (cedula) => {
  try {
    const res = await fetch(`${API_URL}/docentes/${encodeURIComponent(cedula)}/historial`, {
      headers: getAuthHeaders()
    });
    if (res.ok) return await res.json();
    return [];
  } catch (err) {
    console.error('Error fetching teacher history:', err);
    return [];
  }
};

export const getAvailableHistoricalPeriods = async () => {
  try {
    const res = await fetch(`${API_URL}/historico-periodos`);
    if (res.ok) return await res.json();
    return [];
  } catch (err) {
    console.error('Error fetching historical periods:', err);
    return [];
  }
};

// --- GESTIÓN INSTITUCIONAL DE LAPSOS / PERÍODOS ---
export const getAcademicPeriodsList = async () => {
  try {
    const res = await fetch(`${API_URL}/periodos`);
    if (res.ok) return await res.json();
    return [];
  } catch (err) {
    console.error('Error fetching academic periods list:', err);
    return [];
  }
};

export const createAcademicPeriod = async ({ nombre, estado = 'PLANIFICACION', semanas = 15, fechaDesde = '', fechaHasta = '', observaciones = '' }) => {
  try {
    const auditor = getCurrentUser();
    const res = await fetch(`${API_URL}/periodos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ nombre, estado, semanas, fechaDesde, fechaHasta, observaciones, auditor })
    });
    return await res.json();
  } catch (err) {
    console.error('Error creating academic period:', err);
    return { success: false, error: err.message };
  }
};

export const updateAcademicPeriod = async (id, { semanas, fechaDesde, fechaHasta, observaciones, propagarADocentes = true }) => {
  try {
    const auditor = getCurrentUser();
    const res = await fetch(`${API_URL}/periodos/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ semanas, fechaDesde, fechaHasta, observaciones, propagarADocentes, auditor })
    });
    const data = await res.json();
    if (data && data.success) {
      invalidateStaffCache();
    }
    return data;
  } catch (err) {
    console.error('Error updating academic period:', err);
    return { success: false, error: err.message };
  }
};

export const activateAcademicPeriod = async ({ periodoId, nombre, fechaDesde, fechaHasta, semanas, observaciones }) => {
  try {
    const auditor = getCurrentUser();
    const res = await fetch(`${API_URL}/periodos/activar`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ periodoId, nombre, fechaDesde, fechaHasta, semanas, observaciones, auditor })
    });
    const data = await res.json();
    if (data && data.success) {
      invalidateStaffCache();
    }
    return data;
  } catch (err) {
    console.error('Error activating academic period:', err);
    return { success: false, error: err.message };
  }
};

export const closeAcademicPeriod = async (id, { motivo } = {}) => {
  try {
    const auditor = getCurrentUser();
    const res = await fetch(`${API_URL}/periodos/${id}/cerrar`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ auditor, motivo })
    });
    return await res.json();
  } catch (err) {
    console.error('Error closing academic period:', err);
    return { success: false, error: err.message };
  }
};

export const reactivateAcademicPeriod = async (id, { motivo } = {}) => {
  try {
    const auditor = getCurrentUser();
    const res = await fetch(`${API_URL}/periodos/${id}/reactivar`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ auditor, motivo })
    });
    return await res.json();
  } catch (err) {
    console.error('Error reactivating academic period:', err);
    return { success: false, error: err.message };
  }
};

export const getHuerfanasData = async (periodo) => {
  if (!periodo || periodo === 'Todos') return null;
  try {
    const res = await fetch(`${API_URL}/periodos/${encodeURIComponent(periodo)}/huerfanas`, {
      headers: getAuthHeaders()
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.error('Error fetching orphan courses:', err);
  }
  return { periodo, totalCatalogo: 0, cubiertasCount: 0, huerfanasCount: 0, huerfanas: [] };
};

export const getNecesidadesDocentesData = async (periodo) => {
  if (!periodo || periodo === 'Todos') return null;
  try {
    const res = await fetch(`${API_URL}/periodos/${encodeURIComponent(periodo)}/necesidades`, {
      headers: getAuthHeaders()
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.error('Error fetching academic needs:', err);
  }
  return null;
};

export const departments = [
  'Todos',
  'Matemática',
  'Pedagogía',
  'Ciencias Sociales',
  'Agroindustrial'
];

export const especialidades = [
  'Artes Escénicas',
  'Educación Agropecuaria',
  'Educación Especial para Personas en Situación de Discapacidad',
  'Educación Física',
  'Educación Informática',
  'Educación Inglés',
  'Educación Inicial',
  'Educación Musical',
  'Educación Primaria',
  'Educación Rural',
  'Educación Socioproductiva',
  'Geografía e Historia',
  'Lengua y Literatura',
  'Matemática'
];

/**
 * Régimen Semestral UPEL: Dos (2) períodos académicos por año (Período I y Período II).
 * Obtiene el lapso siguiente de forma automática y secuencial.
 */
export const getNextUpelPeriod = (currentPeriod) => {
  if (!currentPeriod || typeof currentPeriod !== 'string') {
    const yr = new Date().getFullYear();
    return `${yr}-II`;
  }
  const match = currentPeriod.trim().match(/^(\d{4})-(I|II)$/i);
  if (!match) {
    const yr = new Date().getFullYear();
    return `${yr}-II`;
  }
  const year = parseInt(match[1], 10);
  const term = match[2].toUpperCase();
  if (term === 'I') {
    return `${year}-II`;
  } else {
    return `${year + 1}-I`;
  }
};

export const normalizeDepartmentName = (dept) => {
  if (!dept) return '';
  const d = dept.toString().trim().toUpperCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (d.includes('MATEMATICA')) return 'Matemática';
  if (d.includes('PEDAGOGIA')) return 'Pedagogía';
  if (d.includes('CIENCIAS SOCIAL') || d.includes('SOCIAL')) return 'Ciencias Sociales';
  if (d.includes('AGROINDUSTRIAL') || d.includes('AGRO')) return 'Agroindustrial';
  return dept.toString().trim();
};

export const normalizeSingleDepartment = normalizeDepartmentName;

export const splitDepartments = (dept) => {
  if (!dept) return [];
  const normalized = normalizeDepartmentName(dept);
  return normalized ? [normalized] : [];
};

export const matchDepartment = (d1, d2) => {
  if (!d1 || !d2) return false;
  if (d1 === 'Todos' || d2 === 'Todos') return true;
  const n1 = normalizeDepartmentName(d1);
  const n2 = normalizeDepartmentName(d2);
  if (!n1 || !n2) return false;
  return n1.toUpperCase() === n2.toUpperCase();
};

export const sedesInstitucionales = [
  'Rubio',
  'Sabana de Mendoza',
  'Encontrados'
];

export const getInstitutionalHeaderSubtitle = (sede) => {
  if (!sede || sede === 'Todos' || sede === 'Rubio') {
    return 'Instituto Pedagógico Rural Gervasio Rubio - Sede Principal';
  }
  return `Instituto Pedagógico Rural Gervasio Rubio - Extensión ${sede}`;
};


export const getAuthorizedCedulas = async () => {
  try {
    const res = await fetch(`${API_URL}/autorizaciones`, {
      headers: getAuthHeaders()
    });
    if (res.ok) return await res.json();
    return [];
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const addAuthorizedCedula = async (cedula, department) => {
  try {
    await fetch(`${API_URL}/autorizaciones`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ cedula, department, nombresApellidos: '' })
    });
  } catch (err) {
    console.error(err);
  }
};

export const removeAuthorizedCedula = async (cedula) => {
  try {
    await fetch(`${API_URL}/autorizaciones/${cedula}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  } catch (err) {
    console.error(err);
  }
};

// --- GESTIÓN DE USUARIOS Y AUTENTICACIÓN ---

export const getUsers = async () => {
  try {
    const res = await fetch(`${API_URL}/users`, {
      headers: getAuthHeaders()
    });
    if (res.ok) return await res.json();
    return [];
  } catch (err) {
    console.error('Error fetching users:', err);
    return [];
  }
};

export const createUser = async (userData) => {
  try {
    const res = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return res.ok;
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return res.ok;
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const deleteUser = async (id) => {
  try {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.ok;
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const getCurrentUser = () => {
  const stored = localStorage.getItem('upel_current_user');
  if (stored) {
    let u = JSON.parse(stored);
    // Corrección automática del nombre del departamento
    if (u.department === 'Pedagógica') {
      u.department = 'Pedagogía';
      localStorage.setItem('upel_current_user', JSON.stringify(u));
    }
    return u;
  }
  return null;
};

export const loginUser = async (username, password) => {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: (username || '').toString().trim(), 
        password: (password || '').toString().trim() 
      })
    });
    
    const data = await res.json().catch(() => null);

    if (res.ok && data?.success && data?.user) {
      if (data.token) {
        localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      }
      localStorage.setItem('upel_current_user', JSON.stringify(data.user));
      return { success: true, user: data.user, token: data.token };
    }
    return {
      success: false,
      message: data?.message || 'Credenciales incorrectas. Verifique su usuario y contraseña.'
    };
  } catch (err) {
    console.error('Login error:', err);
    return {
      success: false,
      message: 'No se pudo conectar con el servidor local. Verifique que el servicio esté activo.'
    };
  }
};

export const logoutUser = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem('upel_current_user');
};

// --- PERSONALIZACIÓN INSTITUCIONAL DE FONDO DE LOGIN ---
export const getLoginBgConfig = async () => {
  try {
    const res = await fetch(`${API_URL}/config/login-bg`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.config) {
        localStorage.setItem('upel_login_bg_cache', JSON.stringify(data.config));
        return data.config;
      }
    }
  } catch (e) {}
  const cached = localStorage.getItem('upel_login_bg_cache');
  if (cached) {
    try { return JSON.parse(cached); } catch (e) {}
  }
  return { bgUrl: '/universidad.jpeg', opacity: 0.55, isDefault: true };
};

export const saveLoginBgConfig = async (formDataOrData) => {
  try {
    const isFormData = formDataOrData instanceof FormData;
    const authHeaders = getAuthHeaders();
    const headers = isFormData
      ? (authHeaders.Authorization ? { Authorization: authHeaders.Authorization } : undefined)
      : authHeaders;
    const res = await fetch(`${API_URL}/config/login-bg`, {
      method: 'POST',
      headers,
      body: isFormData ? formDataOrData : JSON.stringify(formDataOrData)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.config) {
        localStorage.setItem('upel_login_bg_cache', JSON.stringify(data.config));
        return data.config;
      }
    }
    return null;
  } catch (e) {
    console.error('Error guardando fondo de login:', e);
    return null;
  }
};

export const resetLoginBgConfig = async () => {
  try {
    const res = await fetch(`${API_URL}/config/login-bg/reset`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.config) {
        localStorage.setItem('upel_login_bg_cache', JSON.stringify(data.config));
        return data.config;
      }
    }
  } catch (e) {}
  const def = { bgUrl: '/universidad.jpeg', opacity: 0.55, isDefault: true };
  localStorage.setItem('upel_login_bg_cache', JSON.stringify(def));
  return def;
};

// --- CONFIGURACIÓN DE FLYER INSTITUCIONAL / POPUP DESTACADO (UPEL.EDU.VE) ---
export const getFlyerConfig = async () => {
  try {
    const res = await fetch(`${API_URL}/config/flyer`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.config) {
        localStorage.setItem('upel_flyer_config_cache', JSON.stringify(data.config));
        return data.config;
      }
    }
  } catch (e) {}
  const cached = localStorage.getItem('upel_flyer_config_cache');
  if (cached) {
    try { return JSON.parse(cached); } catch (e) {}
  }
  return {
    imageUrl: '/dia_secretaria_upel.jpg',
    title: 'Feliz Día de la Secretaria',
    subtitle: 'Instituto Pedagógico Rural "Gervasio Rubio" · UPEL',
    enabled: true,
    autoOpen: true,
    isDefault: true
  };
};

export const saveFlyerConfig = async (formDataOrData) => {
  try {
    const isFormData = formDataOrData instanceof FormData;
    const authHeaders = getAuthHeaders();
    const headers = isFormData
      ? (authHeaders.Authorization ? { Authorization: authHeaders.Authorization } : undefined)
      : authHeaders;
    const res = await fetch(`${API_URL}/config/flyer`, {
      method: 'POST',
      headers,
      body: isFormData ? formDataOrData : JSON.stringify(formDataOrData)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.config) {
        localStorage.setItem('upel_flyer_config_cache', JSON.stringify(data.config));
        window.dispatchEvent(new CustomEvent('upel_flyer_updated', { detail: data.config }));
        return data.config;
      }
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || errData.message || `Error del servidor (${res.status} ${res.statusText})`);
  } catch (e) {
    console.error('Error guardando flyer institucional:', e);
    throw e;
  }
};

export const resetFlyerConfig = async () => {
  try {
    const authHeaders = getAuthHeaders();
    const res = await fetch(`${API_URL}/config/flyer/reset`, { 
      method: 'POST',
      headers: { ...authHeaders }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.config) {
        localStorage.setItem('upel_flyer_config_cache', JSON.stringify(data.config));
        window.dispatchEvent(new CustomEvent('upel_flyer_updated', { detail: data.config }));
        return data.config;
      }
    }
  } catch (e) {}
  const def = {
    imageUrl: '/dia_secretaria_upel.jpg',
    title: 'Feliz Día de la Secretaria',
    subtitle: 'Instituto Pedagógico Rural "Gervasio Rubio" · UPEL',
    enabled: true,
    autoOpen: true,
    isDefault: true
  };
  localStorage.setItem('upel_flyer_config_cache', JSON.stringify(def));
  window.dispatchEvent(new CustomEvent('upel_flyer_updated', { detail: def }));
  return def;
};

// --- AUTENTICACIÓN INSTITUCIONAL GOOGLE SSO ---
export const getGoogleClientId = () => {
  return localStorage.getItem('upel_google_client_id') || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GOOGLE_CLIENT_ID : '') || '';
};

export const setGoogleClientId = (clientId) => {
  localStorage.setItem('upel_google_client_id', clientId.trim());
};

// --- CONFIGURACIÓN Y ENVÍOS DE RESEND (EMAIL) Y WHATSAPP API ---
export const getResendApiKey = () => {
  return localStorage.getItem('upel_resend_api_key') || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_RESEND_API_KEY : '') || '';
};

export const setResendApiKey = (key) => {
  localStorage.setItem('upel_resend_api_key', key.trim());
};

export const getWhatsAppConfig = () => {
  const stored = localStorage.getItem('upel_whatsapp_config');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return {
    apiUrl: '',
    apiToken: '',
    senderNumber: ''
  };
};

export const setWhatsAppConfig = (config) => {
  localStorage.setItem('upel_whatsapp_config', JSON.stringify(config));
};

export const generateWhatsAppUrl = (phone, text) => {
  const cleanPhone = String(phone || '').replace(/\D/g, '');
  // Formato internacional para Venezuela si empieza por 04... -> 584...
  let formattedPhone = cleanPhone;
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '58' + formattedPhone.slice(1);
  } else if (formattedPhone.length === 10 && (formattedPhone.startsWith('412') || formattedPhone.startsWith('414') || formattedPhone.startsWith('424') || formattedPhone.startsWith('416') || formattedPhone.startsWith('426'))) {
    formattedPhone = '58' + formattedPhone;
  }
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
};

export const getMailConfig = async () => {
  try {
    const res = await fetch(`${API_URL}/mail-config`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      return data.config;
    }
  } catch (e) {
    console.warn('Error al obtener mail-config:', e);
  }
  return {
    smtpHost: '',
    smtpPort: '587',
    smtpSecure: false,
    smtpUser: '',
    smtpPass: '',
    smtpFrom: '',
    resendApiKey: getResendApiKey()
  };
};

export const saveMailConfig = async (config) => {
  const auditor = getCurrentUser();
  if (config.resendApiKey && config.resendApiKey !== '********') {
    setResendApiKey(config.resendApiKey);
  }
  try {
    const res = await fetch(`${API_URL}/mail-config`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...config, auditor })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.error('Error guardando mail-config:', e);
  }
  return { success: false, error: 'No se pudo conectar con el servidor backend' };
};

export const testMailConnection = async (to) => {
  try {
    const res = await fetch(`${API_URL}/test-mail`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ to })
    });
    return await res.json();
  } catch (e) {
    return { success: false, error: e.message };
  }
};

export const sendFichaToDocenteEmail = async ({
  to,
  subject,
  html,
  text,
  pdfBase64,
  filename,
  staff,
  docenteNombre,
  docenteCedula,
  department
}) => {
  const auditor = getCurrentUser();
  const recipient = (to || staff?.correoInstitucional || staff?.correo || '').trim();
  if (!recipient) {
    return { success: false, error: 'No se encontró un correo válido para el docente.' };
  }

  // 1. Intentar despacho mediante el endpoint especializado del backend
  try {
    const res = await fetch(`${API_URL}/send-ficha-email`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        to: recipient,
        subject: subject || `Ficha de Oferta Académica - ${staff?.nombres || docenteNombre || 'Docente'} (${staff?.cedula || docenteCedula || ''}) - UPEL IPRGR`,
        html,
        text,
        pdfBase64,
        filename: filename || `Ficha_Docente_${(staff?.cedula || docenteCedula || 'UPEL').replace(/\D/g, '')}.pdf`,
        docenteNombre: staff ? `${staff.nombres} ${staff.apellidos}` : docenteNombre,
        docenteCedula: staff?.cedula || docenteCedula,
        department: staff?.department || department,
        auditor
      })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return data;
    }

    // Si el backend reporta que requiere configuración pero hay Resend API Key en el frontend:
    const localResendKey = getResendApiKey();
    if (localResendKey && data.requiresSetup) {
      return await sendEmailWithResend({
        to: recipient,
        subject: subject || `Ficha de Oferta Académica - UPEL IPRGR`,
        html,
        text
      });
    }

    return data;
  } catch (err) {
    console.warn('Backend send-ficha-email no alcanzable, intentando Resend directo:', err.message);
    const localResendKey = getResendApiKey();
    if (localResendKey) {
      return await sendEmailWithResend({
        to: recipient,
        subject: subject || `Ficha de Oferta Académica - UPEL IPRGR`,
        html,
        text
      });
    }
    return {
      success: false,
      error: 'No se pudo conectar con el servidor de correos. Verifique su conexión o utilice el enlace de Gmail.'
    };
  }
};

export const sendEmailWithResend = async ({ to, subject, html, text }) => {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    return { success: false, error: 'No se ha configurado la API Key de Resend en el panel de administración.' };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: 'SIGOA - UPEL <docencia@resend.dev>',
        to: Array.isArray(to) ? to : [to],
        subject: subject,
        html: html,
        text: text || ''
      })
    });

    const data = await res.json();
    if (res.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.message || 'Error al enviar correo con Resend.' };
    }
  } catch (err) {
    console.error('Error enviando con Resend:', err);
    return { success: false, error: err.message || 'Error de conexión con el servicio de Resend.' };
  }
};

export const sendWhatsAppViaApi = async ({ phone, message }) => {
  const config = getWhatsAppConfig();
  if (!config.apiUrl) {
    // Si no hay webhook/API configurado, se usa el enlace directo de WhatsApp
    return { success: false, directUrl: generateWhatsAppUrl(phone, message), isFallback: true };
  }

  try {
    const res = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiToken ? { 'Authorization': `Bearer ${config.apiToken}` } : {})
      },
      body: JSON.stringify({
        phone: phone,
        message: message,
        sender: config.senderNumber || 'UPEL-SIGOA'
      })
    });

    if (res.ok) {
      return { success: true };
    } else {
      return { success: false, directUrl: generateWhatsAppUrl(phone, message), error: 'Fallo al conectar con la API de WhatsApp' };
    }
  } catch (err) {
    return { success: false, directUrl: generateWhatsAppUrl(phone, message), error: err.message };
  }
};

export const loginWithGoogle = async (googleUser) => {
  const email = (googleUser.email || '').toLowerCase().trim();
  
  try {
    const res = await fetch(`${API_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(googleUser)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem('upel_current_user', JSON.stringify(data.user));
        return data.user;
      }
    }
  } catch (err) {
    console.warn('Backend Google auth not reachable, using frontend resolver:', err);
  }

  // 1. Coincidencia estricta con usuarios autorizados del sistema (ADMIN, JEFE, AUDITOR, DOCENCIA)
  const users = await getUsers();
  let matchedUser = users.find(u => 
    (u.correo && u.correo.toLowerCase() === email) ||
    (u.email && u.email.toLowerCase() === email) || 
    (u.username && (u.username.toLowerCase() === email || email.startsWith(u.username.toLowerCase() + '@')))
  );

  // Solo si el usuario existe en la tabla de usuarios del sistema se le concede acceso
  if (matchedUser && ['ADMIN', 'JEFE', 'AUDITOR', 'DOCENCIA'].includes(matchedUser.role)) {
    const session = {
      ...matchedUser,
      email: email,
      avatar: googleUser.picture || matchedUser.avatar
    };
    localStorage.setItem('upel_current_user', JSON.stringify(session));
    return session;
  }

  // Si no está registrado como Jefe, Auditor o Administrador en la BD, acceso denegado
  return null;
};


// --- GESTIÓN DE ESTADO DEL REGISTRO ---
export const getRegistrationStatus = () => {
  const stored = localStorage.getItem('upel_registration_enabled');
  if (stored !== null) return JSON.parse(stored);
  return true; // Habilitado por defecto
};

export const setRegistrationStatus = (status) => {
  localStorage.setItem('upel_registration_enabled', JSON.stringify(status));
  window.dispatchEvent(new Event('upel_registration_status_changed'));
};

// --- GESTIÓN DE ESTADO DE OFERTA INSTITUCIONAL ---
export const getOfertaStatus = () => {
  const stored = localStorage.getItem('upel_oferta_enabled');
  if (stored !== null) return JSON.parse(stored);
  return true; // Habilitado por defecto
};

export const setOfertaStatus = (status) => {
  localStorage.setItem('upel_oferta_enabled', JSON.stringify(status));
  window.dispatchEvent(new Event('upel_oferta_status_changed'));
};

// --- VALIDACIÓN DE EXPEDIENTE COMPLETO DOCENTE ---
export const isExpedienteCompleto = (staff) => {
  if (!staff) return false;
  const hasValue = (val) => val !== null && val !== undefined && String(val).trim() !== '' && String(val).trim().toUpperCase() !== 'N/A';
  return Boolean(
    hasValue(staff.cedula) &&
    hasValue(staff.nombres) &&
    hasValue(staff.apellidos) &&
    hasValue(staff.telefonos) &&
    hasValue(staff.direccion) &&
    hasValue(staff.banco) &&
    hasValue(staff.cuentaBancaria) &&
    hasValue(staff.titulosPregrado)
  );
};

export const getMissingExpedienteFields = (staff) => {
  if (!staff) return ['Expediente no encontrado'];
  const hasValue = (val) => val !== null && val !== undefined && String(val).trim() !== '' && String(val).trim().toUpperCase() !== 'N/A';
  const missing = [];
  if (!hasValue(staff.telefonos)) missing.push('Teléfonos');
  if (!hasValue(staff.direccion)) missing.push('Dirección de habitación');
  if (!hasValue(staff.banco)) missing.push('Banco');
  if (!hasValue(staff.cuentaBancaria)) missing.push('Cuenta bancaria');
  if (!hasValue(staff.titulosPregrado)) missing.push('Título de pregrado');
  if (!hasValue(staff.correo)) missing.push('Correo personal');
  return missing;
};

