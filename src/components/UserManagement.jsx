import React, { useState, useEffect, lazy, Suspense } from 'react';
import { 
  getUsers, createUser, updateUser, deleteUser, departments, 
  getRegistrationStatus, setRegistrationStatus, getOfertaStatus, setOfertaStatus, 
  getGoogleClientId, setGoogleClientId, getResendApiKey, setResendApiKey, 
  getWhatsAppConfig, setWhatsAppConfig, getMailConfig, saveMailConfig, testMailConnection
} from '../data';
import { Shield, Plus, Trash2, User, Power, PowerOff, Edit, Eye, EyeOff, Globe, Mail, Key, Check, MessageCircle, Send, Server, Loader2, AlertCircle, BookOpen } from 'lucide-react';
const CatalogoMateriasModal = lazy(() => import('./CatalogoMateriasModal'));

const UserManagement = () => {
  const [users, setUsersList] = useState([]);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [isOfertaOpen, setIsOfertaOpen] = useState(true);
  const [editingUserId, setEditingUserId] = useState(null);
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [googleClientId, setGoogleClientIdState] = useState('');
  const [googleSavedMsg, setGoogleSavedMsg] = useState(false);
  const [resendApiKey, setResendApiKeyState] = useState('');
  const [resendSavedMsg, setResendSavedMsg] = useState(false);
  const [smtpConfig, setSmtpConfig] = useState({
    smtpHost: '',
    smtpPort: '587',
    smtpSecure: false,
    smtpUser: '',
    smtpPass: '',
    smtpFrom: ''
  });
  const [smtpSavedMsg, setSmtpSavedMsg] = useState(false);
  const [testEmailTo, setTestEmailTo] = useState('');
  const [testEmailResult, setTestEmailResult] = useState(null);
  const [testingEmail, setTestingEmail] = useState(false);
  const [whatsappConfig, setWhatsappConfigState] = useState({ apiUrl: '', apiToken: '', senderNumber: '' });
  const [whatsappSavedMsg, setWhatsappSavedMsg] = useState(false);
  const [isCatalogoModalOpen, setIsCatalogoModalOpen] = useState(false);
  
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
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
    setIsOfertaOpen(getOfertaStatus());
    setGoogleClientIdState(getGoogleClientId());
    setResendApiKeyState(getResendApiKey());
    setWhatsappConfigState(getWhatsAppConfig());
    getMailConfig().then(cfg => {
      if (cfg) {
        setSmtpConfig({
          smtpHost: cfg.smtpHost || '',
          smtpPort: cfg.smtpPort || '587',
          smtpSecure: cfg.smtpSecure || false,
          smtpUser: cfg.smtpUser || '',
          smtpPass: cfg.smtpPass || '',
          smtpFrom: cfg.smtpFrom || ''
        });
        if (cfg.resendApiKey) setResendApiKeyState(cfg.resendApiKey);
      }
    });
  }, []);

  const toggleRegistration = () => {
    const newStatus = !isRegistrationOpen;
    setIsRegistrationOpen(newStatus);
    setRegistrationStatus(newStatus);
  };

  const toggleOferta = () => {
    const newStatus = !isOfertaOpen;
    setIsOfertaOpen(newStatus);
    setOfertaStatus(newStatus);
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
    if (!newUser.username || (!newUser.password && !editingUserId) || !newUser.name) return;

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
      password: (user.password && user.password.startsWith('$2')) ? '' : (user.password || ''),
      name: user.name,
      email: user.correo || user.email || '',
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
      email: '',
      department: 'Pedagogía',
      role: 'JEFE'
    });
  };

  const handleSaveGoogleConfig = (e) => {
    e.preventDefault();
    setGoogleClientId(googleClientId);
    setGoogleSavedMsg(true);
    setTimeout(() => setGoogleSavedMsg(false), 3000);
  };

  const handleSaveResendConfig = async (e) => {
    e.preventDefault();
    setResendApiKey(resendApiKey);
    await saveMailConfig({
      ...smtpConfig,
      resendApiKey
    });
    setResendSavedMsg(true);
    setTimeout(() => setResendSavedMsg(false), 3000);
  };

  const handleSaveSmtpConfig = async (e) => {
    e.preventDefault();
    await saveMailConfig({
      ...smtpConfig,
      resendApiKey
    });
    setSmtpSavedMsg(true);
    setTimeout(() => setSmtpSavedMsg(false), 3000);
  };

  const handleTestMail = async (e) => {
    if (e) e.preventDefault();
    if (!testEmailTo) {
      alert('Ingresa un correo institucional o personal para la prueba.');
      return;
    }
    setTestingEmail(true);
    setTestEmailResult(null);
    const res = await testMailConnection(testEmailTo.trim());
    setTestingEmail(false);
    setTestEmailResult(res);
  };

  const handleSaveWhatsappConfig = (e) => {
    e.preventDefault();
    setWhatsAppConfig(whatsappConfig);
    setWhatsappSavedMsg(true);
    setTimeout(() => setWhatsappSavedMsg(false), 3000);
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
      {/* Header Institucional UPEL */}
      <div className="upel-card upel-card-accent-blue" style={{
        padding: '1.75rem 2rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ 
            background: 'var(--primary)', color: 'white', width: '56px', height: '56px', 
            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,51,102,0.18)'
          }}>
            <Shield size={30} />
          </div>
          <div>
            <div className="upel-section-subtitle">SEGURIDAD Y CONTROL DE ACCESO</div>
            <h1 className="upel-section-title" style={{ margin: '0.2rem 0', fontSize: '1.85rem' }}>Gestión de Funcionarios y Accesos</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Crea y administra cuentas institucionales y permisos del sistema
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsCatalogoModalOpen(true)}
          className="btn btn-primary"
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', 
            borderColor: '#6d28d9', 
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
            fontWeight: 600
          }}
        >
          <BookOpen size={18} /> Catálogo de Materias
        </button>
      </div>

      <div className={`upel-card ${isRegistrationOpen ? 'upel-card-accent-green' : 'upel-card-accent-rose'}`} style={{ padding: '1.5rem 1.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="upel-section-subtitle" style={{ color: isRegistrationOpen ? '#008744' : '#dc2626' }}>
            {isRegistrationOpen ? 'ESTADO: ACTIVO Y ACCESIBLE' : 'ESTADO: BLOQUEADO TEMPORALMENTE'}
          </div>
          <h3 style={{ margin: '0.2rem 0 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#003366', fontSize: '1.15rem' }}>
            Portal de Actualización de Datos
          </h3>
          <p className="text-muted" style={{ margin: '0.4rem 0 0', fontSize: '0.9rem' }}>
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

      <div className={`upel-card ${isOfertaOpen ? 'upel-card-accent-green' : 'upel-card-accent-rose'}`} style={{ padding: '1.5rem 1.75rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="upel-section-subtitle" style={{ color: isOfertaOpen ? '#008744' : '#dc2626' }}>
            {isOfertaOpen ? 'ESTADO: ACTIVO PARA JEFATURAS' : 'ESTADO: BLOQUEADO'}
          </div>
          <h3 style={{ margin: '0.2rem 0 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#003366', fontSize: '1.15rem' }}>
            Módulo Oferta Institucional (Departamentos)
          </h3>
          <p className="text-muted" style={{ margin: '0.4rem 0 0', fontSize: '0.9rem' }}>
            {isOfertaOpen 
              ? 'El módulo está habilitado para los jefes de departamento.' 
              : 'El módulo está deshabilitado. Los jefes de departamento no tendrán acceso.'}
          </p>
        </div>
        <button 
          onClick={toggleOferta} 
          className={`btn ${isOfertaOpen ? 'btn-outline' : 'btn-primary'}`}
          style={!isOfertaOpen ? { background: 'var(--danger)', borderColor: 'var(--danger)' } : { color: 'var(--danger)', borderColor: 'var(--danger)' }}
        >
          {isOfertaOpen ? (
            <><PowerOff size={18} /> Bloquear Módulo</>
          ) : (
            <><Power size={18} /> Habilitar Módulo</>
          )}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Formulario de Creación */}
        <div className="upel-card upel-card-accent-blue" style={{ padding: '1.75rem', alignSelf: 'start' }}>
          <div className="upel-section-subtitle">FORMULARIO INSTITUCIONAL</div>
          <h3 style={{ margin: '0.2rem 0 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#003366', fontSize: '1.2rem' }}>
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
              <label className="form-label">Correo Institucional UPEL (Opcional)</label>
              <input type="email" name="email" value={newUser.email || ''} onChange={handleInputChange} className="filter-input w-full" placeholder="Ej. jose@upel.edu.ve" />
            </div>
            <div>
              <label className="form-label">Contraseña</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input required={!editingUserId} type={showFormPassword ? "text" : "password"} name="password" value={newUser.password} onChange={handleInputChange} className="filter-input w-full" placeholder={editingUserId ? "Dejar en blanco para conservar actual" : "Contraseña temporal"} style={{ paddingRight: '2.5rem' }} />
                <button type="button" onClick={() => setShowFormPassword(!showFormPassword)} style={{ position: 'absolute', right: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showFormPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="form-label">Rol del Funcionario</label>
              <select name="role" value={newUser.role} onChange={handleInputChange} className="filter-select w-full" disabled={newUser.role === 'ADMIN'}>
                <option value="JEFE">Jefe de Departamento</option>
                <option value="AUDITOR">Subdirección de Docencia (Solo Lectura/Auditor)</option>
                <option value="DOCENCIA">Subdirección de Docencia</option>
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
        <div className="upel-card upel-card-accent-blue" style={{ padding: '1.75rem' }}>
          <div className="upel-section-subtitle">REGISTRO DE USUARIOS</div>
          <h3 style={{ margin: '0.2rem 0 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#003366', fontSize: '1.2rem' }}>
            <Shield size={20} className="text-primary" /> Cuentas Activas del Sistema
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
                      {u.email && (
                        <div style={{ fontSize: '0.8rem', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                          <Mail size={12} /> {u.email}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>User: {u.username}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Pass: {visiblePasswords[u.id] ? (u.password && u.password.startsWith('$2') ? '•••••••• [Cifrada BCrypt]' : u.password) : '••••••••'}
                        <button onClick={() => togglePasswordVisibility(u.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-muted)', display: 'flex' }} title={visiblePasswords[u.id] ? "Ocultar contraseña" : "Ver contraseña"}>
                          {visiblePasswords[u.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </td>
                    <td>
                      {u.role === 'ADMIN' ? (
                        <span className="badge badge-success">Administrador Total</span>
                      ) : u.role === 'AUDITOR' ? (
                        <span className="badge badge-info" style={{ background: '#e0f2fe', color: '#0369a1' }}>Docencia (Auditor)</span>
                      ) : u.role === 'DOCENCIA' ? (
                        <span className="badge badge-info" style={{ background: '#f3e8ff', color: '#7e22ce' }}>Subdirección de Docencia</span>
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

      {/* Configuración de Google OAuth (SSO Institucional) */}
      <div className="upel-card upel-card-accent-blue" style={{ padding: '1.75rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: '#eff6ff', borderRadius: '8px', color: '#2563eb' }}>
              <Globe size={22} />
            </div>
            <div>
              <div className="upel-section-subtitle" style={{ color: '#2563eb' }}>INTEGRACIÓN DE AUTENTICACIÓN</div>
              <h3 style={{ margin: '0.1rem 0 0', fontSize: '1.15rem', color: '#003366' }}>Configuración de Google OAuth (SSO Institucional)</h3>
              <p className="text-muted" style={{ margin: '0.2rem 0 0', fontSize: '0.85rem' }}>
                Permite a los docentes y directores iniciar sesión con su correo de Google / UPEL (@upel.edu.ve).
              </p>
            </div>
          </div>
          {googleSavedMsg && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#16a34a', fontWeight: 600, fontSize: '0.85rem' }}>
              <Check size={16} /> ¡Configuración guardada!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveGoogleConfig} style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 350px' }}>
            <label className="form-label">Google Client ID (OAuth 2.0)</label>
            <input 
              type="text" 
              className="filter-input w-full"
              placeholder="Ej. 1234567890-abcdefg.apps.googleusercontent.com"
              value={googleClientId}
              onChange={(e) => setGoogleClientIdState(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ alignSelf: 'flex-end', padding: '0.7rem 1.5rem', height: '42px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Key size={16} /> Guardar Client ID
          </button>
        </form>
      </div>

      {/* Configuración de Servidor SMTP Institucional (Webmail UPEL / Gmail) */}
      <div className="upel-card upel-card-accent-blue" style={{ padding: '1.75rem', marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: '#e0f2fe', borderRadius: '8px', color: '#003366' }}>
              <Server size={22} />
            </div>
            <div>
              <div className="upel-section-subtitle" style={{ color: '#0284c7' }}>SERVIDOR DE CORREO INSTITUCIONAL</div>
              <h3 style={{ margin: '0.1rem 0 0', fontSize: '1.15rem', color: '#003366' }}>Configuración SMTP (Webmail UPEL / Gmail Institucional)</h3>
              <p className="text-muted" style={{ margin: '0.2rem 0 0', fontSize: '0.85rem' }}>
                Permite enviar las Fichas de Oferta Académica directamente desde la cuenta oficial de la institución.
              </p>
            </div>
          </div>
          {smtpSavedMsg && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#16a34a', fontWeight: 600, fontSize: '0.85rem' }}>
              <Check size={16} /> ¡Configuración SMTP guardada!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveSmtpConfig} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <label className="form-label" style={{ fontWeight: 600 }}>Servidor SMTP (Host)</label>
            <input 
              type="text" 
              className="filter-input w-full"
              placeholder="mail.iprgr.upel.edu.ve o smtp.gmail.com"
              value={smtpConfig.smtpHost}
              onChange={(e) => setSmtpConfig({ ...smtpConfig, smtpHost: e.target.value })}
            />
          </div>
          <div>
            <label className="form-label" style={{ fontWeight: 600 }}>Puerto SMTP</label>
            <input 
              type="text" 
              className="filter-input w-full"
              placeholder="587 o 465"
              value={smtpConfig.smtpPort}
              onChange={(e) => setSmtpConfig({ ...smtpConfig, smtpPort: e.target.value })}
            />
          </div>
          <div>
            <label className="form-label" style={{ fontWeight: 600 }}>Usuario / Correo Remitente</label>
            <input 
              type="text" 
              className="filter-input w-full"
              placeholder="docencia@iprgr.upel.edu.ve"
              value={smtpConfig.smtpUser}
              onChange={(e) => setSmtpConfig({ ...smtpConfig, smtpUser: e.target.value })}
            />
          </div>
          <div>
            <label className="form-label" style={{ fontWeight: 600 }}>Contraseña / Clave de Aplicación</label>
            <input 
              type="password" 
              className="filter-input w-full"
              placeholder="••••••••"
              value={smtpConfig.smtpPass}
              onChange={(e) => setSmtpConfig({ ...smtpConfig, smtpPass: e.target.value })}
            />
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.88rem', color: '#1e293b' }}>
              <input 
                type="checkbox" 
                checked={smtpConfig.smtpSecure}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, smtpSecure: e.target.checked })}
                style={{ width: '16px', height: '16px' }}
              />
              Conexión Segura SSL/TLS directa (marcar para puerto 465)
            </label>
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#003366', borderColor: '#003366' }}
            >
              <Key size={16} /> Guardar Configuración SMTP
            </button>
          </div>
        </form>

        {/* Prueba de Envío SMTP / Resend */}
        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '1rem', marginTop: '0.5rem' }}>
          <label className="form-label" style={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>
            Probar Conexión de Correo (Enviar mensaje de verificación)
          </label>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input 
              type="email" 
              className="filter-input"
              style={{ flex: '1 1 280px' }}
              placeholder="Ingresa tu correo para recibir la prueba"
              value={testEmailTo}
              onChange={(e) => setTestEmailTo(e.target.value)}
            />
            <button 
              type="button" 
              onClick={handleTestMail}
              className="btn btn-outline"
              disabled={testingEmail}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderColor: '#003366', color: '#003366' }}
            >
              {testingEmail ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              <span>{testingEmail ? 'Probando...' : 'Enviar Correo de Prueba'}</span>
            </button>
          </div>

          {testEmailResult && (
            <div style={{ 
              marginTop: '0.75rem', padding: '0.6rem 1rem', borderRadius: '6px', fontSize: '0.85rem',
              background: testEmailResult.success ? '#ecfdf5' : '#fef2f2',
              color: testEmailResult.success ? '#065f46' : '#991b1b',
              border: `1px solid ${testEmailResult.success ? '#a7f3d0' : '#fecaca'}`,
              display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
              {testEmailResult.success ? <Check size={16} color="#10b981" /> : <AlertCircle size={16} color="#ef4444" />}
              <span>{testEmailResult.message || testEmailResult.error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Configuración de Resend API (Envío de Correos Institucionales) */}
      <div className="upel-card upel-card-accent-gold" style={{ padding: '1.75rem', marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: '#fef3c7', borderRadius: '8px', color: '#b45309' }}>
              <Mail size={22} />
            </div>
            <div>
              <div className="upel-section-subtitle" style={{ color: '#d97706' }}>SERVICIO DE COMUNICACIONES</div>
              <h3 style={{ margin: '0.1rem 0 0', fontSize: '1.15rem', color: '#003366' }}>Configuración de Resend API (Correos Institucionales)</h3>
              <p className="text-muted" style={{ margin: '0.2rem 0 0', fontSize: '0.85rem' }}>
                Permite enviar constancias y cargas académicas en PDF directamente al email de los profesores.
              </p>
            </div>
          </div>
          {resendSavedMsg && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#16a34a', fontWeight: 600, fontSize: '0.85rem' }}>
              <Check size={16} /> ¡API Key guardada!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveResendConfig} style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 350px' }}>
            <label className="form-label">Resend API Key (re_...)</label>
            <input 
              type="password" 
              className="filter-input w-full"
              placeholder="re_123456789_abcdefg..."
              value={resendApiKey}
              onChange={(e) => setResendApiKeyState(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ alignSelf: 'flex-end', padding: '0.7rem 1.5rem', height: '42px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#003366', borderColor: '#003366' }}
          >
            <Key size={16} /> Guardar Resend Key
          </button>
        </form>
      </div>

      {/* Configuración de WhatsApp API / Webhook (n8n / Evolution API) */}
      <div className="upel-card upel-card-accent-green" style={{ padding: '1.75rem', marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: '#dcfce7', borderRadius: '8px', color: '#15803d' }}>
              <MessageCircle size={22} />
            </div>
            <div>
              <div className="upel-section-subtitle" style={{ color: '#008744' }}>CANAL AUTOMATIZADO WHATSAPP</div>
              <h3 style={{ margin: '0.1rem 0 0', fontSize: '1.15rem', color: '#003366' }}>Configuración de WhatsApp API / Webhook Automático</h3>
              <p className="text-muted" style={{ margin: '0.2rem 0 0', fontSize: '0.85rem' }}>
                Conecta tu instancia de WhatsApp API (o webhook de n8n / Evolution API) para envíos automatizados directos.
              </p>
            </div>
          </div>
          {whatsappSavedMsg && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#16a34a', fontWeight: 600, fontSize: '0.85rem' }}>
              <Check size={16} /> ¡Configuración WhatsApp guardada!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveWhatsappConfig} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div>
            <label className="form-label">URL del Webhook / API Endpoint</label>
            <input 
              type="text" 
              className="filter-input w-full"
              placeholder="https://n8n.tu-dominio.com/webhook/upel-whatsapp"
              value={whatsappConfig.apiUrl || ''}
              onChange={(e) => setWhatsappConfigState({ ...whatsappConfig, apiUrl: e.target.value })}
            />
          </div>
          <div>
            <label className="form-label">Bearer Token / API Key (Opcional)</label>
            <input 
              type="password" 
              className="filter-input w-full"
              placeholder="Token de autorización"
              value={whatsappConfig.apiToken || ''}
              onChange={(e) => setWhatsappConfigState({ ...whatsappConfig, apiToken: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.7rem 1.5rem', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#008744', borderColor: '#008744' }}
            >
              <Send size={16} /> Guardar WhatsApp Config
            </button>
          </div>
        </form>
      </div>

      {/* Modal Institucional del Catálogo de Materias */}
      <Suspense fallback={null}>
        <CatalogoMateriasModal
          isOpen={isCatalogoModalOpen}
          onClose={() => setIsCatalogoModalOpen(false)}
        />
      </Suspense>

      <style>{`
        .w-full { width: 100%; }
        .form-label { display: block; margin-bottom: 0.3rem; font-size: 0.85rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.03em; }
      `}</style>
    </div>
  );
};

export default UserManagement;
