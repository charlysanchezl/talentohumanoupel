import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { loginUser, getCurrentUser, loginWithGoogle, getGoogleClientId, getLoginBgConfig, getFlyerConfig } from '../data';
import InstitutionalFlyerModal from './InstitutionalFlyerModal';
import { 
  User, Users, AlertCircle, ArrowRight, 
  Loader2, Globe, Mail, X, Lock, Eye, EyeOff, Building2, HelpCircle,
  Laptop, FolderOpen, MapPin, Radio, GraduationCap, Calendar, Clock, Sparkles,
  AlertTriangle, ShieldAlert
} from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [institutionalEmail, setInstitutionalEmail] = useState('');
  const [bgImage, setBgImage] = useState('/universidad.jpeg');
  const [bgOpacity, setBgOpacity] = useState(0.55);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isFlyerOpen, setIsFlyerOpen] = useState(() => {
    try {
      const cached = localStorage.getItem('upel_flyer_config_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.enabled === false || parsed.autoOpen === false) return false;
      }
    } catch (e) {}
    return true; // Abre de inmediato apenas carga el login (estilo upel.edu.ve)
  });
  const [flyerConfig, setFlyerConfig] = useState(null);
  const [maintenanceMode, setMaintenanceMode] = useState(() => {
    try {
      const cached = localStorage.getItem('upel_maintenance_mode');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/backup/maintenance-mode')
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        if (data.success && data.config) {
          setMaintenanceMode(data.config);
          localStorage.setItem('upel_maintenance_mode', JSON.stringify(data.config));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    // Sincronizar y verificar estado oficial del flyer
    getFlyerConfig().then((cfg) => {
      if (cfg) {
        setFlyerConfig(cfg);
        if (cfg.enabled === false || cfg.autoOpen === false) {
          setIsFlyerOpen(false);
        }
      }
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentDateTime.toLocaleDateString('es-VE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).replace(/\./g, '');
  const capitalizedDate = formattedDate 
    ? formattedDate.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : '';
  const formattedTime = currentDateTime.toLocaleTimeString('es-VE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  useEffect(() => {
    getLoginBgConfig().then(cfg => {
      if (cfg) {
        if (cfg.bgUrl) setBgImage(cfg.bgUrl);
        if (cfg.opacity !== undefined) setBgOpacity(cfg.opacity);
      }
    });
  }, []);

  useEffect(() => {
    const user = getCurrentUser();
    if (user && !isLoggingIn) {
      if (user.role === 'ADMIN' || user.role === 'AUDITOR') {
        navigate('/');
      } else if (user.role === 'DOCENCIA') {
        navigate('/docencia');
      } else {
        navigate(`/departamento/${encodeURIComponent(user.department)}`);
      }
    }
  }, [navigate, isLoggingIn]);

  // Carga del script oficial de Google Identity Services (GSI)
  useEffect(() => {
    const clientId = getGoogleClientId();
    if (clientId) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false
          });
        }
      };
      document.body.appendChild(script);
      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, []);

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error decodificando token Google:', e);
      return null;
    }
  };

  const handleGoogleCredentialResponse = async (response) => {
    if (response?.credential) {
      const payload = parseJwt(response.credential);
      if (payload) {
        setIsLoggingIn(true);
        const user = await loginWithGoogle(payload);
        if (user) {
          proceedToRoute(user);
        } else {
          setIsLoggingIn(false);
          setError('No se pudo autenticar la cuenta de Google con el sistema.');
        }
      }
    }
  };

  const proceedToRoute = (user) => {
    // Si el modo mantenimiento con bloqueo estricto está activo, impedir acceso a no-ADMIN
    if (maintenanceMode?.enabled && maintenanceMode?.strictLockout && user.role !== 'ADMIN') {
      setIsLoggingIn(false);
      setError(`Acceso restringido: El sistema se encuentra en labores técnicas de mantenimiento institucional (${maintenanceMode.message || 'Pausa técnica'}). El acceso para docentes y directivos está temporalmente suspendido. Solo el Administrador técnico puede ingresar.`);
      return;
    }

    if (user.role === 'ADMIN' || user.role === 'AUDITOR') {
      navigate('/');
    } else if (user.role === 'DOCENCIA') {
      navigate('/docencia');
    } else {
      navigate(`/departamento/${encodeURIComponent(user.department)}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const cleanUser = (username || '').trim();
    const cleanPass = (password || '').trim();

    if (!cleanUser || !cleanPass) {
      setError('Por favor ingrese su usuario y contraseña.');
      return;
    }

    setIsLoggingIn(true);
    const result = await loginUser(cleanUser, cleanPass);
    const user = result?.user || (result?.id ? result : null);
    if (user) {
      proceedToRoute(user);
    } else {
      setIsLoggingIn(false);
      setError(result?.message || 'Credenciales incorrectas. Verifique su usuario y contraseña.');
    }
  };

  const handleGoogleBtnClick = () => {
    const clientId = getGoogleClientId();
    if (clientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setIsGoogleModalOpen(true);
        }
      });
    } else {
      setIsGoogleModalOpen(true);
    }
  };

  const handleInstitutionalEmailSubmit = async (e) => {
    e.preventDefault();
    if (!institutionalEmail.trim()) return;

    setIsGoogleModalOpen(false);
    setIsLoggingIn(true);

    const simulatedGoogleUser = {
      email: institutionalEmail.trim().toLowerCase(),
      name: institutionalEmail.split('@')[0].toUpperCase(),
      picture: `https://api.dicebear.com/7.x/initials/svg?seed=${institutionalEmail}`,
      sub: 'inst-' + Date.now()
    };

    const user = await loginWithGoogle(simulatedGoogleUser);
    if (user) {
      proceedToRoute(user);
    } else {
      setIsLoggingIn(false);
      setError('El correo institucional no está registrado en Talento Humano.');
    }
  };

  const floatingMenuItems = [
    { id: 'sistemas', label: 'Sistemas Académicos', href: 'https://upel.edu.ve/SISTEMAS/', icon: <Laptop size={19} /> },
    { id: 'repositorio', label: 'Repositorio', href: 'https://espacio.digital.upel.edu.ve/', icon: <FolderOpen size={19} /> },
    { id: 'ubicanos', label: 'Ubícanos', href: 'https://upel.edu.ve/catastro/', icon: <MapPin size={19} /> },
    { id: 'aulavirtual', label: 'Aula Virtual', href: 'https://aulavirtual.upel.edu.ve/', icon: <GraduationCap size={19} /> }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: `linear-gradient(135deg, rgba(0, 32, 77, ${bgOpacity}) 0%, rgba(10, 25, 47, ${Math.min(Number(bgOpacity) + 0.15, 0.95)}) 100%), url("${bgImage}") center/cover no-repeat fixed`,
      fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif',
      position: 'relative'
    }}>
      {/* Estilos específicos para la barra lateral flotante idéntica a upel.edu.ve */}
      <style>{`
        .upel-float-menu {
          position: fixed;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          z-index: 30;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .upel-float-item {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #009a44;
          color: #ffffff;
          padding: 10px 16px 10px 12px;
          border-radius: 0 8px 8px 0;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          box-shadow: 2px 4px 14px rgba(0, 0, 0, 0.22);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          border-left: 3px solid #007a36;
        }
        .upel-float-item:hover {
          background: #007a36;
          color: #ffffff;
          transform: translateX(4px);
          box-shadow: 4px 6px 18px rgba(0, 0, 0, 0.32);
        }
        .upel-float-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .upel-float-text {
          white-space: nowrap;
          letter-spacing: 0.2px;
        }
        @media (max-width: 1280px) {
          .upel-float-text {
            display: none;
          }
          .upel-float-item {
            padding: 10px 10px;
            border-radius: 0 6px 6px 0;
          }
        }
        @media (max-width: 768px) {
          .upel-float-menu {
            display: none;
          }
        }
        @media (max-height: 750px) {
          .upel-float-menu {
            top: 45%;
            gap: 4px;
          }
        }
      `}</style>

      {/* Botones Flotantes del Lateral Izquierdo Oficiales UPEL */}
      <aside className="upel-float-menu" aria-label="Enlaces Oficiales UPEL">
        {floatingMenuItems.map((item) => (
          <a
            key={item.id}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="upel-float-item"
            title={item.label}
          >
            <span className="upel-float-icon">{item.icon}</span>
            <span className="upel-float-text">{item.label}</span>
          </a>
        ))}
      </aside>

      {/* Barra Principal Oficial UPEL (#masthead) */}
      <header id="masthead" style={{
        background: '#0047bb',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
        padding: '0.8rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem',
        zIndex: 20,
        minHeight: '74px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          {/* Logotipo horizontal blanco auténtico de upel.edu.ve */}
          <a href="https://upel.edu.ve" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src="/logo_upel_oficial_blanco.png" 
              alt="Universidad Pedagógica Experimental Libertador" 
              style={{ height: '46px', width: 'auto', maxWidth: '320px', objectFit: 'contain', display: 'block' }}
              onError={(e) => {
                e.target.src = '/logo.png';
              }}
            />
          </a>

          {/* Separador vertical blanco */}
          <div style={{ width: '1.5px', height: '38px', background: 'rgba(255, 255, 255, 0.35)' }} />

          {/* Identificación del Instituto Pedagógico Rural Gervasio Rubio */}
          <div>
            <div style={{ color: '#ffffff', fontSize: '13px', fontWeight: 800, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
              Instituto Pedagógico Rural "Gervasio Rubio"
            </div>
            <div style={{ color: '#bfdbfe', fontSize: '11.5px', fontWeight: 600, letterSpacing: '0.2px' }}>
              Subdirección de Docencia · Talento Humano
            </div>
          </div>
        </div>

        {/* Lado Derecho: Reloj Ejecutivo Institucional y Sede */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.65rem' }}>
          {/* Reloj y Fecha Ejecutivo Glassmorphism */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(255, 255, 255, 0.10)',
            padding: '6px 14px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.20)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.18)',
            color: '#ffffff'
          }}>
            {/* Indicador de Sincronización en Vivo (Punto Verde Pulsante) */}
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#4ade80',
              boxShadow: '0 0 8px #4ade80',
              display: 'inline-block',
              flexShrink: 0
            }} title="Hora oficial sincronizada en tiempo real" />

            {/* Fecha */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, color: '#e0f2fe' }}>
              <Calendar size={13} style={{ color: '#93c5fd', flexShrink: 0 }} />
              <span>{capitalizedDate}</span>
            </div>

            {/* Separador vertical fino */}
            <div style={{ width: '1px', height: '14px', background: 'rgba(255, 255, 255, 0.25)', flexShrink: 0 }} />

            {/* Hora Digital Tabular */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '12.5px',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '0.4px',
              fontVariantNumeric: 'tabular-nums'
            }}>
              <Clock size={13} style={{ color: '#fcd34d', flexShrink: 0 }} />
              <span>{formattedTime}</span>
            </div>
          </div>

          {/* Badge lateral Sede Rubio */}
          <span style={{ 
            background: 'rgba(255, 255, 255, 0.10)', 
            color: '#ffffff', 
            padding: '6px 12px', 
            borderRadius: '10px', 
            fontSize: '11.5px', 
            fontWeight: 700,
            border: '1px solid rgba(255, 255, 255, 0.20)',
            backdropFilter: 'blur(10px)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.18)'
          }}>
            <Building2 size={13} style={{ color: '#93c5fd' }} /> Sede Rubio
          </span>
        </div>
      </header>

      {/* Contenido Central: Tarjeta Institucional UPEL (Opción A) */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem 3.5rem',
        position: 'relative'
      }}>
        <div className="animate-fade-in" style={{
          width: '100%',
          maxWidth: '430px',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Cabecera de la Tarjeta con Azul Institucional UPEL (#0047bb) */}
          <div style={{
            background: 'linear-gradient(135deg, #0047bb 0%, #002e7a 100%)',
            padding: '2rem 1.75rem 1.5rem',
            textAlign: 'center',
            color: '#ffffff',
            position: 'relative'
          }}>
            {/* Logo UPEL circular con resalte blanco */}
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 12px',
              borderRadius: '50%',
              background: '#ffffff',
              padding: '3px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <img 
                src="/logo.jpg" 
                alt="Emblema Oficial UPEL"
                style={{ width: '85%', height: '85%', objectFit: 'contain' }}
                onError={(e) => { e.target.src = '/logo.png'; }}
              />
            </div>

            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, letterSpacing: '0.5px', color: '#ffffff' }}>
              SIGOA - UPEL
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500 }}>
              Gestión de Oferta y Carga Académica
            </p>
            <div style={{
              marginTop: '8px',
              display: 'inline-block',
              background: 'rgba(255, 255, 255, 0.18)',
              padding: '2px 10px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#dbeafe',
              letterSpacing: '0.3px'
            }}>
              Subdirección de Docencia
            </div>
          </div>

          {/* Cuerpo del Formulario */}
          <div style={{ padding: '1.75rem 1.85rem 1.85rem' }}>
            {isLoggingIn ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <Loader2 size={36} color="#0047bb" className="animate-spin" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', color: '#1e293b', fontWeight: 700 }}>
                    Iniciando Sesión...
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                    Verificando credenciales...
                  </p>
                </div>
              </div>
            ) : (
              <>
                {error && (
                  <div style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    color: '#991b1b',
                    fontSize: '13px',
                    fontWeight: 500
                  }}>
                    <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
                    <span>{error}</span>
                  </div>
                )}

                {maintenanceMode?.enabled && maintenanceMode?.strictLockout && (
                  <div style={{
                    background: '#fffbeb',
                    border: '1px solid #f59e0b',
                    borderRadius: '8px',
                    padding: '0.85rem 1rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'flex-start',
                    fontSize: '12px',
                    color: '#92400e',
                    lineHeight: 1.45
                  }}>
                    <ShieldAlert size={18} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ display: 'block', fontSize: '12.5px', marginBottom: '2px' }}>
                        Modo Mantenimiento Activo
                      </strong>
                      {maintenanceMode.message || 'Labores técnicas en curso.'} El acceso está reservado temporalmente para la Unidad de Informática (ADMIN).
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  {/* Campo Usuario / Cédula */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Usuario o Cédula de Identidad
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <User size={18} style={{ position: 'absolute', left: '12px', color: '#64748b' }} />
                      <input 
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Ej. V-12345678 o usuario"
                        style={{
                          width: '100%',
                          padding: '11px 14px 11px 38px',
                          fontSize: '14px',
                          color: '#0f172a',
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          outline: 'none',
                          transition: 'all 0.2s'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#0047bb';
                          e.target.style.boxShadow = '0 0 0 3px rgba(0, 71, 187, 0.12)';
                          e.target.style.background = '#ffffff';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#cbd5e1';
                          e.target.style.boxShadow = 'none';
                          e.target.style.background = '#f8fafc';
                        }}
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Campo Contraseña */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155' }}>
                        Contraseña Institucional
                      </label>
                    </div>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Lock size={18} style={{ position: 'absolute', left: '12px', color: '#64748b' }} />
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        style={{
                          width: '100%',
                          padding: '11px 40px 11px 38px',
                          fontSize: '14px',
                          color: '#0f172a',
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          outline: 'none',
                          transition: 'all 0.2s'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#0047bb';
                          e.target.style.boxShadow = '0 0 0 3px rgba(0, 71, 187, 0.12)';
                          e.target.style.background = '#ffffff';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#cbd5e1';
                          e.target.style.boxShadow = 'none';
                          e.target.style.background = '#f8fafc';
                        }}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#64748b',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Botón Principal: Iniciar Sesión en Azul UPEL */}
                  <button 
                    type="submit"
                    style={{
                      marginTop: '0.4rem',
                      width: '100%',
                      padding: '12px',
                      background: '#0047bb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(0, 71, 187, 0.25)',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#00368b';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 71, 187, 0.35)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = '#0047bb';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 71, 187, 0.25)';
                    }}
                  >
                    <span>Ingresar al Sistema</span>
                    <ArrowRight size={17} />
                  </button>
                </form>

                {/* Separador Institucional */}
                <div style={{ display: 'flex', alignItems: 'center', margin: '1.4rem 0 1.1rem', color: '#94a3b8', fontSize: '11.5px' }}>
                  <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                  <span style={{ padding: '0 10px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                    o accede con
                  </span>
                  <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                </div>

                {/* Botón Correo Institucional UPEL (Google SSO) */}
                <button
                  type="button"
                  onClick={handleGoogleBtnClick}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.borderColor = '#94a3b8';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Correo Institucional (@upel.edu.ve)</span>
                </button>

                {/* Acceso Directo para Docentes Contratados en Verde UPEL (#008744) */}
                <div style={{ marginTop: '1.2rem' }}>
                  <button 
                    type="button"
                    onClick={() => {
                      if (maintenanceMode?.enabled && maintenanceMode?.strictLockout) {
                        setError(`Acceso suspendido: El Portal Docente se encuentra temporalmente deshabilitado por labores de mantenimiento institucional (${maintenanceMode.message || 'Pausa técnica'}).`);
                        return;
                      }
                      navigate('/registro');
                    }}
                    style={{
                      width: '100%',
                      padding: '11px 16px',
                      background: (maintenanceMode?.enabled && maintenanceMode?.strictLockout) ? '#f1f5f9' : '#f0fdf4',
                      border: (maintenanceMode?.enabled && maintenanceMode?.strictLockout) ? '1.5px solid #cbd5e1' : '1.5px solid #008744',
                      borderRadius: '8px',
                      color: (maintenanceMode?.enabled && maintenanceMode?.strictLockout) ? '#64748b' : '#008744',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      cursor: (maintenanceMode?.enabled && maintenanceMode?.strictLockout) ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                      boxShadow: (maintenanceMode?.enabled && maintenanceMode?.strictLockout) ? 'none' : '0 2px 6px rgba(0, 135, 68, 0.08)'
                    }}
                    onMouseOver={(e) => {
                      if (maintenanceMode?.enabled && maintenanceMode?.strictLockout) return;
                      e.currentTarget.style.background = '#008744';
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 135, 68, 0.25)';
                    }}
                    onMouseOut={(e) => {
                      if (maintenanceMode?.enabled && maintenanceMode?.strictLockout) return;
                      e.currentTarget.style.background = '#f0fdf4';
                      e.currentTarget.style.color = '#008744';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 135, 68, 0.08)';
                    }}
                  >
                    <Users size={17} />
                    <span>
                      {maintenanceMode?.enabled && maintenanceMode?.strictLockout 
                        ? 'Portal Docente (Suspendido por Mantenimiento)' 
                        : 'Portal Docente / Consulta de Ficha'}
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Pie de la Tarjeta con Asistencia */}
          <div style={{
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            padding: '0.85rem 1.5rem',
            textAlign: 'center',
            fontSize: '11.5px',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}>
            <HelpCircle size={14} color="#94a3b8" />
            <span>Soporte: Subdirección de Docencia · IPRGR</span>
          </div>
        </div>
      </main>

      {/* Pie de Página Oficial UPEL (Verde #009a44 auténtico de colophon en upel.edu.ve) */}
      <footer id="colophon" style={{
        padding: '1.1rem 2rem',
        textAlign: 'center',
        background: '#009a44',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.15)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        color: '#ffffff'
      }}>
        <div style={{
          fontFamily: '"Dancing Script", cursive',
          color: '#ffffff',
          fontSize: '23px',
          fontWeight: 700,
          textShadow: '0 1px 3px rgba(0,0,0,0.3)'
        }}>
          "La Universidad de los Maestros"
        </div>
        <div style={{
          color: 'rgba(255, 255, 255, 0.95)',
          fontSize: '12px',
          fontWeight: 500
        }}>
          © {new Date().getFullYear()} Universidad Pedagógica Experimental Libertador · Instituto Pedagógico Rural "Gervasio Rubio"
        </div>
        <div style={{
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '11px',
          fontWeight: 500,
          marginTop: '2px'
        }}>
          Desarrollado por la Unidad de Informática
        </div>
      </footer>

      {/* MODAL: Inicio de sesión rápido con Correo Institucional */}
      {isGoogleModalOpen && createPortal(
        <div className="upel-modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 99999, padding: '1rem'
        }}>
          <div className="surface animate-scale-up" style={{
            width: '100%', maxWidth: '420px', maxHeight: '92vh', overflowY: 'auto', borderRadius: '18px',
            padding: '2rem', boxShadow: 'var(--shadow-lg)', background: 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ padding: '0.5rem', background: '#eff6ff', borderRadius: '8px', color: '#2563eb' }}>
                  <Globe size={22} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#1e293b' }}>
                  Acceso Institucional UPEL
                </h3>
              </div>
              <button 
                onClick={() => setIsGoogleModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1.2rem 0', lineHeight: '1.5' }}>
              Ingresa tu correo institucional registrado (ej: <code>profesor@upel.edu.ve</code> o tu cuenta Google vinculada) para iniciar sesión directamente.
            </p>

            <form onSubmit={handleInstitutionalEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>Correo Institucional</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    type="email" 
                    required
                    className="filter-input w-full"
                    placeholder="usuario@upel.edu.ve"
                    value={institutionalEmail}
                    onChange={(e) => setInstitutionalEmail(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    autoFocus
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setIsGoogleModalOpen(false)} 
                  className="btn btn-outline"
                  style={{ fontSize: '0.85rem' }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
                >
                  Ingresar al Sistema <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL: Flyer Institucional Oficial UPEL (Comunicado emergente idéntico a upel.edu.ve) */}
      <InstitutionalFlyerModal
        isOpen={isFlyerOpen}
        onClose={() => setIsFlyerOpen(false)}
        onUpdated={(newCfg) => setFlyerConfig(newCfg)}
      />

    </div>
  );
};

export default Login;
