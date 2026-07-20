import React, { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser, departments, getRegistrationStatus, setRegistrationStatus } from '../data';
import { Shield, Plus, Trash2, User, Power, PowerOff, Edit, Eye, EyeOff } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsersList] = useState([]);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [editingUserId, setEditingUserId] = useState(null);
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    name: '',
    department: 'Pedagogía',
    role: 'JEFE'
  });

  useEffect(() => {
    const fetchUsers = async () => {
      const u = await getUsers();
      setUsersList(u);
    };
    fetchUsers();
    setIsRegistrationOpen(getRegistrationStatus());
  }, []);

  const toggleRegistration = () => {
    const newStatus = !isRegistrationOpen;
    setIsRegistrationOpen(newStatus);
    setRegistrationStatus(newStatus);
  };

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password || !newUser.name) return;

    const existing = users.find(u => u.username === newUser.username);
    if (existing && existing.id !== editingUserId) {
      alert('Ese nombre de funcionario ya existe.');
      return;
    }

    const userToSave = {
      ...newUser,
      department: (newUser.role === 'AUDITOR' || newUser.role === 'ADMIN') ? 'Todos' : newUser.department
    };

    let success = false;
    if (editingUserId) {
      success = await updateUser(editingUserId, userToSave);
    } else {
      success = await createUser(userToSave);
    }

    if (success) {
      const updatedUsers = await getUsers();
      setUsersList(updatedUsers);
      handleCancelEdit();
    } else {
      alert('Error guardando en la base de datos.');
    }
  };

  const handleEdit = (user) => {
    setEditingUserId(user.id);
    setNewUser({
      username: user.username,
      password: user.password,
      name: user.name,
      department: user.department,
      role: user.role
    });
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setNewUser({
      username: '',
      password: '',
      name: '',
      department: 'Pedagogía',
      role: 'JEFE'
    });
  };

  const handleDelete = async (id) => {
    if (id === '1' || id === 1 || id === 'admin1') {
      alert('No puedes eliminar al administrador principal.');
      return;
    }
    const success = await deleteUser(id);
    if (success) {
      const updatedUsers = await getUsers();
      setUsersList(updatedUsers);
    } else {
      alert('Error eliminando en la base de datos.');
    }
  };

  // Departamentos sin "Todos"
  const dpts = departments.filter(d => d !== 'Todos');

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1>Gestión de Funcionarios y Accesos</h1>
        <p className="subtitle">Crea y administra las cuentas para los Jefes de Departamento, y configura opciones globales.</p>
      </div>

      <div className="surface" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: isRegistrationOpen ? '4px solid var(--success)' : '4px solid var(--danger)' }}>
        <div>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Portal de Actualización de Datos
          </h3>
          <p className="text-muted" style={{ margin: '0.5rem 0 0', fontSize: '0.9rem' }}>
            {isRegistrationOpen 
              ? 'El portal está abierto. Los docentes pueden ingresar a registrar o actualizar sus datos.' 
              : 'El portal está cerrado por seguridad. Nadie puede enviar ni actualizar datos.'}
          </p>
        </div>
        <button 
          onClick={toggleRegistration} 
          className={`btn ${isRegistrationOpen ? 'btn-outline' : 'btn-primary'}`}
          style={!isRegistrationOpen ? { background: 'var(--danger)', borderColor: 'var(--danger)' } : { color: 'var(--danger)', borderColor: 'var(--danger)' }}
        >
          {isRegistrationOpen ? (
            <><PowerOff size={18} /> Deshabilitar Actualización de Datos</>
          ) : (
            <><Power size={18} /> Habilitar Actualización de Datos</>
          )}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Formulario de Creación */}
        <div className="surface" style={{ padding: '1.5rem', alignSelf: 'start' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {editingUserId ? <Edit size={20} className="text-primary" /> : <Plus size={20} className="text-primary" />} 
            {editingUserId ? 'Editar Funcionario' : 'Nuevo Funcionario'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="form-label">Nombre del Jefe</label>
              <input required type="text" name="name" value={newUser.name} onChange={handleInputChange} className="filter-input w-full" placeholder="Ej. Prof. José Luis" />
            </div>
            <div>
              <label className="form-label">Nombre de Usuario (Login)</label>
              <input required type="text" name="username" value={newUser.username} onChange={handleInputChange} className="filter-input w-full" placeholder="Ej. jose.matematica" />
            </div>
            <div>
              <label className="form-label">Contraseña</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input required type={showFormPassword ? "text" : "password"} name="password" value={newUser.password} onChange={handleInputChange} className="filter-input w-full" placeholder="Contraseña temporal" style={{ paddingRight: '2.5rem' }} />
                <button type="button" onClick={() => setShowFormPassword(!showFormPassword)} style={{ position: 'absolute', right: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showFormPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="form-label">Rol del Funcionario</label>
              <select name="role" value={newUser.role} onChange={handleInputChange} className="filter-select w-full" disabled={newUser.role === 'ADMIN'}>
                <option value="JEFE">Jefe de Departamento</option>
                <option value="AUDITOR">Unidad de Talento Humano (Solo Lectura/Auditor)</option>
                {newUser.role === 'ADMIN' && <option value="ADMIN">Administrador del Sistema</option>}
              </select>
            </div>
            {newUser.role !== 'AUDITOR' && newUser.role !== 'ADMIN' && (
              <div>
                <label className="form-label">Departamento Asignado</label>
                <select name="department" value={newUser.department} onChange={handleInputChange} className="filter-select w-full">
                  {dpts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                {editingUserId ? 'Guardar Cambios' : 'Crear Cuenta'}
              </button>
              {editingUserId && (
                <button type="button" onClick={handleCancelEdit} className="btn btn-outline" style={{ flex: 1 }}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Lista de Usuarios */}
        <div className="surface" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={20} className="text-primary" /> Cuentas Activas
          </h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Funcionario</th>
                  <th>Credenciales</th>
                  <th>Rol / Acceso</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="user-name" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={16} className="text-muted" /> {u.name}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>User: {u.username}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Pass: {visiblePasswords[u.id] ? u.password : '••••••••'}
                        <button onClick={() => togglePasswordVisibility(u.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-muted)', display: 'flex' }} title={visiblePasswords[u.id] ? "Ocultar contraseña" : "Ver contraseña"}>
                          {visiblePasswords[u.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </td>
                    <td>
                      {u.role === 'ADMIN' ? (
                        <span className="badge badge-success">Administrador Total</span>
                      ) : u.role === 'AUDITOR' ? (
                        <span className="badge badge-info" style={{ background: '#e0f2fe', color: '#0369a1' }}>Talento Humano (Auditor)</span>
                      ) : (
                        <span className="badge badge-warning">Jefe: {u.department}</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-outline" style={{ padding: '0.3rem' }} onClick={() => handleEdit(u)} title="Editar funcionario">
                          <Edit size={16} />
                        </button>
                        {u.role !== 'ADMIN' && (
                          <button className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger-bg)', padding: '0.3rem' }} onClick={() => handleDelete(u.id)} title="Eliminar funcionario">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <style>{`
        .w-full { width: 100%; }
        .form-label { display: block; margin-bottom: 0.3rem; font-size: 0.85rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.03em; }
      `}</style>
    </div>
  );
};

export default UserManagement;
