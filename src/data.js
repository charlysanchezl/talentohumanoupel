const API_URL = 'http://localhost:3001/api';

export const getStaffData = async () => {
  try {
    const res = await fetch(`${API_URL}/docentes`);
    if (res.ok) return await res.json();
    return [];
  } catch (err) {
    console.error('Error fetching staff:', err);
    return [];
  }
};

export const createStaff = async (staffData) => {
  try {
    const res = await fetch(`${API_URL}/docentes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(staffData)
    });
    return res.ok;
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const updateStaffCarga = async (cedula, materias, status, validationData = {}) => {
  try {
    const res = await fetch(`${API_URL}/docentes/carga`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cedula, materias, status, ...validationData })
    });
    return res.ok;
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const deleteStaff = async (cedula) => {
  try {
    const res = await fetch(`${API_URL}/docentes/${cedula}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (error) {
    console.error("Error deleting staff:", error);
    return false;
  }
};

export const getCatalogoMaterias = async () => {
  try {
    const res = await fetch(`${API_URL}/materias-catalogo`);
    if (!res.ok) throw new Error('Error fetching catalog');
    return await res.json();
  } catch (error) {
    console.error("Error fetching materias_catalogo:", error);
    return [];
  }
};

export const addMateriaCatalogo = async (nombre) => {
  try {
    const res = await fetch(`${API_URL}/materias-catalogo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre })
    });
    if (!res.ok) throw new Error('Error adding to catalog');
    return await res.json();
  } catch (error) {
    console.error("Error adding materia_catalogo:", error);
    return { success: false };
  }
};

export const departments = [
  'Todos',
  'Pedagogía',
  'Matemáticas',
  'Agroindustrial',
  'Ciencias Sociales'
];

export const getAuthorizedCedulas = async () => {
  try {
    const res = await fetch(`${API_URL}/autorizaciones`);
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cedula, department, nombresApellidos: '' })
    });
  } catch (err) {
    console.error(err);
  }
};

export const removeAuthorizedCedula = async (cedula) => {
  try {
    await fetch(`${API_URL}/autorizaciones/${cedula}`, {
      method: 'DELETE'
    });
  } catch (err) {
    console.error(err);
  }
};

// --- GESTIÓN DE USUARIOS Y AUTENTICACIÓN ---

export const getUsers = async () => {
  try {
    const res = await fetch(`${API_URL}/users`);
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
      method: 'DELETE'
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
      body: JSON.stringify({ username, password })
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem('upel_current_user', JSON.stringify(data.user));
        return data.user;
      }
    }
    return null;
  } catch (err) {
    console.error('Login error:', err);
    return null;
  }
};

export const logoutUser = () => {
  localStorage.removeItem('upel_current_user');
};


// --- GESTIÓN DE ESTADO DEL REGISTRO ---
export const getRegistrationStatus = () => {
  const stored = localStorage.getItem('upel_registration_enabled');
  if (stored !== null) return JSON.parse(stored);
  return true; // Habilitado por defecto
};

export const setRegistrationStatus = (status) => {
  localStorage.setItem('upel_registration_enabled', JSON.stringify(status));
};
