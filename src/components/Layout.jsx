import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, ChevronRight, ChevronLeft, ChevronDown, ShieldAlert, Users, ArrowLeft, Menu, X, Building2, Sparkles, Play, Wifi, WifiOff, RefreshCw, CheckCircle2, Database, Radio, Info, Calendar, BookOpen, Search, Image as ImageIcon, Settings, AlertTriangle } from 'lucide-react';
import { departments, matchDepartment, getCurrentUser, logoutUser, getOfertaStatus, getAcademicPeriodsList, getFlyerConfig } from '../data';
import { subscribeSyncStatus, triggerAutoSync, getSyncQueue, clearQueue } from '../services/offlineManager';
import Footer from './Footer';

// Carga perezosa (Lazy Loading) de modales para acelerar el renderizado del Layout
const AboutModal = lazy(() => import('./AboutModal'));
const PeriodManagementModal = lazy(() => import('./PeriodManagementModal'));
const GuiaOrganizacionModal = lazy(() => import('./GuiaOrganizacionModal'));
const CommandPalette = lazy(() => import('./CommandPalette'));
const LoginBgModal = lazy(() => import('./LoginBgModal'));
const InstitutionalFlyerModal = lazy(() => import('./InstitutionalFlyerModal'));
const CatalogoMateriasModal = lazy(() => import('./CatalogoMateriasModal'));
import '../App.css';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('upel_sidebar_collapsed') === 'true';
  });
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [isSecurityDropdownOpen, setIsSecurityDropdownOpen] = useState(false);
  const [ofertaEnabled, setOfertaEnabled] = useState(getOfertaStatus());
  const [syncState, setSyncState] = useState({ isOnline: true, isSyncing: false, queueCount: 0 });
  const [showSyncDetails, setShowSyncDetails] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isGuiaModalOpen, setIsGuiaModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [activePeriodName, setActivePeriodName] = useState('');
  const [isLoginBgModalOpen, setIsLoginBgModalOpen] = useState(false);
  const [isFlyerModalOpen, setIsFlyerModalOpen] = useState(false);
  const [isCatalogoModalOpen, setIsCatalogoModalOpen] = useState(false);
  const flyerConfigState = useState(null);
  const [flyerConfig, setFlyerConfig] = flyerConfigState;
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [maintenanceBanner, setMaintenanceBanner] = useState(null);

  const deptDropdownRef = useRef(null);
  const securityDropdownRef = useRef(null);
  const toolsMenuRef = useRef(null);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('upel_sidebar_collapsed', String(next));
      return next;
    });
  };


  useEffect(() => {
    // Suscripción al estado de sincronización offline/online
    const unsubscribeSync = subscribeSyncStatus((status) => {
      setSyncState(status);
    });

    const handleStatusChange = () => {
      setOfertaEnabled(getOfertaStatus());
    };
    window.addEventListener('upel_oferta_status_changed', handleStatusChange);
    window.addEventListener('storage', handleStatusChange);

    getAcademicPeriodsList().then(list => {
      const act = (list || []).find(p => p.estado === 'ACTIVO');
      if (act) setActivePeriodName(act.nombre);
    }).catch(() => {});

    // Comprobación y apertura automática del Flyer Institucional (Estilo UPEL.EDU.VE)
    getFlyerConfig().then(cfg => {
      if (cfg) setFlyerConfig(cfg);
      if (cfg && cfg.enabled && cfg.autoOpen) {
        const seen = sessionStorage.getItem('upel_flyer_seen_session');
        if (!seen) {
          setIsFlyerModalOpen(true);
          sessionStorage.setItem('upel_flyer_seen_session', 'true');
        }
      }
    }).catch(() => {});

    const handleFlyerUpdate = (e) => {
      if (e.detail) {
        setFlyerConfig(e.detail);
      }
    };
    window.addEventListener('upel_flyer_updated', handleFlyerUpdate);

    // Consulta de estado de Modo Mantenimiento
    fetch('/api/backup/maintenance-mode')
      .then(res => {
        if (!res.ok) throw new Error('Status: ' + res.status);
        return res.json();
      })
      .then(data => {
        if (data.success && data.config?.enabled) {
          setMaintenanceBanner(data.config);
        }
      })
      .catch(() => {
        try {
          const cached = localStorage.getItem('upel_maintenance_mode');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.enabled) setMaintenanceBanner(parsed);
          }
        } catch (e) {}
      });

    const handleMaintenanceUpdate = (e) => {
      if (e.detail) {
        setMaintenanceBanner(e.detail.enabled ? e.detail : null);
      }
    };
    window.addEventListener('upel_maintenance_mode_changed', handleMaintenanceUpdate);

    // Cerrar dropdowns al hacer click afuera de ellos
    const handleDocumentClick = (e) => {
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(e.target)) {
        setIsDeptDropdownOpen(false);
      }
      if (securityDropdownRef.current && !securityDropdownRef.current.contains(e.target)) {
        setIsSecurityDropdownOpen(false);
      }
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target)) {
        setIsToolsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleDocumentClick);

    return () => {
      unsubscribeSync();
      window.removeEventListener('upel_oferta_status_changed', handleStatusChange);
      window.removeEventListener('storage', handleStatusChange);
      window.removeEventListener('upel_flyer_updated', handleFlyerUpdate);
      window.removeEventListener('upel_maintenance_mode_changed', handleMaintenanceUpdate);
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, []);

  // Cerrar dropdowns al navegar a otra ruta
  useEffect(() => {
    setIsDeptDropdownOpen(false);
    setIsSecurityDropdownOpen(false);
    setIsToolsMenuOpen(false);
  }, [location.pathname]);

  const handleManualSync = async () => {
    setSyncMessage('Sincronizando con la base de datos central...');
    const res = await triggerAutoSync();
    if (res.success) {
      const count = res.succeeded ?? res.processed ?? 0;
      setSyncMessage(count > 0 ? `¡${count} cambio(s) sincronizado(s) con éxito!` : 'Todo al día con el servidor.');
      setTimeout(() => setSyncMessage(''), 3500);
    } else {
      setSyncMessage(res.error || 'Error al conectar');
      setTimeout(() => setSyncMessage(''), 5000);
    }
  };

  const handleClearStuckQueue = () => {
    if (window.confirm('¿Desea descartar y limpiar el cambio pendiente local para restablecer la sincronización en cero?')) {
      clearQueue();
      setSyncMessage('Registro pendiente descartado.');
      setTimeout(() => setSyncMessage(''), 3000);
    }
  };

  const handleLogout = (e) => {
    e.preventDefault();
    logoutUser();
    navigate('/login');
  };

  if (!user) return null;

  const individualDepts = departments.filter(d => d !== 'Todos');
  const deptsToShow = (user.role === 'ADMIN' || user.role === 'AUDITOR')
    ? individualDepts 
    : (user.role === 'DOCENCIA' ? [] : individualDepts.filter(d => matchDepartment(d, user.department)));

  const getActiveSectionLabel = () => {
    if (location.pathname === '/') return 'Subdirección de Docencia';
    if (location.pathname.startsWith('/departamento/')) {
      const raw = decodeURIComponent(location.pathname.replace('/departamento/', ''));
      return `Departamento de ${raw}`;
    }
    if (location.pathname.startsWith('/consultar-docentes')) return 'Registro Central de Docentes';
    if (location.pathname.startsWith('/programacion-academica')) return 'Programación Académica';
    if (location.pathname.startsWith('/horarios')) return 'Carga Horaria y Horarios';
    if (location.pathname.startsWith('/auditoria')) return 'Auditoría y Trazabilidad';
    if (location.pathname.startsWith('/respaldo')) return 'Bóveda de Respaldo';
    if (location.pathname.startsWith('/seguridad')) return 'Seguridad y Permisos';
    if (location.pathname.startsWith('/usuarios')) return 'Gestión de Usuarios';
    return 'Subdirección de Docencia';
  };

  return (
    <div className="app-container">
      {/* Sidebar Mobile Overlay */}
      <div 
        className={`mobile-overlay ${isMobileMenuOpen ? 'open' : ''}`} 
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header" style={{
          padding: isSidebarCollapsed ? '0.75rem 0.4rem' : '0.75rem 0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
          minHeight: '52px',
          gap: '0.5rem'
        }}>
          {!isSidebarCollapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0, overflow: 'hidden' }}>
              <img 
                src="/logo.jpg" 
                alt="Logo Oficial UPEL" 
                style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '6px', background: '#ffffff', padding: '2px', boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)', flexShrink: 0 }} 
                onError={(e) => { e.target.src = '/logo.png'; }}
              />
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <h1 style={{ fontSize: '0.92rem', margin: 0, color: 'var(--primary)', fontWeight: 800, letterSpacing: '0.3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  SIGOA-I.P.R.G.R
                </h1>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  Subdirección de Docencia
                </div>
              </div>
            </div>
          ) : (
            <img 
              src="/logo.jpg" 
              alt="Logo Oficial UPEL" 
              style={{ width: '34px', height: '34px', objectFit: 'contain', borderRadius: '6px', background: '#ffffff', padding: '2px', boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)' }} 
              onError={(e) => { e.target.src = '/logo.png'; }}
              title="SIGOA - I.P.R.G.R"
            />
          )}

          {/* Botón de Colapso / Expansión del Sidebar (Desktop) */}
          <button
            type="button"
            onClick={toggleSidebarCollapse}
            className="sidebar-collapse-btn"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '0.25rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            title={isSidebarCollapsed ? "Expandir barra lateral" : "Colapsar barra lateral para más espacio"}
          >
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <div className="sidebar-nav">
          {/* Categoría: Gestión Académica */}
          <div className="sidebar-section-title">
            {!isSidebarCollapsed ? <span>Gestión Académica</span> : <span className="sidebar-section-dot" />}
          </div>

          {(user.role === 'ADMIN' || user.role === 'AUDITOR') && (
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} 
              className={`sidebar-link ${location.pathname === '/' ? 'active' : ''}`}
              title="Dashboard"
            >
              <span className="sidebar-icon-wrap" style={{ color: '#002f6c' }}><LayoutDashboard size={16} /></span>
              {!isSidebarCollapsed && <span>Dashboard</span>}
            </Link>
          )}

          <Link to="/consultar" onClick={() => setIsMobileMenuOpen(false)}
            className={`sidebar-link ${location.pathname === '/consultar' ? 'active' : ''}`}
            title="Consultar Docentes"
          >
            <span className="sidebar-icon-wrap" style={{ color: '#059669' }}><Users size={16} /></span>
            {!isSidebarCollapsed && <span>Consultar Docentes</span>}
          </Link>

          {(user.role === 'ADMIN' || (ofertaEnabled && (user.role === 'DOCENCIA' || user.role === 'JEFE' || user.role === 'AUDITOR'))) && (
            <Link to="/docencia" onClick={() => setIsMobileMenuOpen(false)}
              className={`sidebar-link ${location.pathname === '/docencia' ? 'active' : ''}`}
              title="Oferta Institucional"
            >
              <span className="sidebar-icon-wrap" style={{ color: '#0284c7' }}><Building2 size={16} /></span>
              {!isSidebarCollapsed && <span>Oferta Institucional</span>}
            </Link>
          )}

          {(user.role === 'ADMIN' || user.role === 'AUDITOR' || user.role === 'DOCENCIA') && (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsPeriodModalOpen(true);
              }}
              className="sidebar-link"
              style={{ width: '100%', cursor: 'pointer', background: 'transparent', border: 'none', fontFamily: 'inherit', textAlign: 'left', display: 'flex', alignItems: 'center' }}
              title={activePeriodName ? `Gestión de Lapsos (${activePeriodName})` : "Gestión de Lapsos"}
            >
              <span className="sidebar-icon-wrap" style={{ color: '#0284c7' }}><Calendar size={16} /></span>
              {!isSidebarCollapsed && (
                <>
                  <span>Gestión de Lapsos</span>
                  {activePeriodName && (
                    <span style={{
                      marginLeft: 'auto',
                      background: '#e0f2fe',
                      color: '#0369a1',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '0.1rem 0.35rem',
                      borderRadius: '99px'
                    }}>
                      {activePeriodName}
                    </span>
                  )}
                </>
              )}
            </button>
          )}

          {/* Menú Desplegable o Enlaces de Departamentos */}
          {(user.role === 'ADMIN' || user.role === 'AUDITOR') ? (
            <div>
              <button 
                onClick={() => {
                  if (isSidebarCollapsed) {
                    setIsSidebarCollapsed(false);
                    localStorage.setItem('upel_sidebar_collapsed', 'false');
                    setIsDeptDropdownOpen(true);
                  } else {
                    setIsDeptDropdownOpen(!isDeptDropdownOpen);
                  }
                }}
                className={`sidebar-link ${location.pathname.includes('/departamento/') ? 'active' : ''}`}
                style={{ width: '100%', cursor: 'pointer', background: 'transparent', border: 'none', fontFamily: 'inherit' }}
                title="Departamentos"
              >
                <span className="sidebar-icon-wrap" style={{ color: '#6366f1' }}><Building2 size={16} /></span>
                {!isSidebarCollapsed && (
                  <>
                    <span>Departamentos</span>
                    <ChevronDown size={14} style={{ marginLeft: 'auto', transform: isDeptDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: '#94a3b8' }} />
                  </>
                )}
              </button>
              
              {!isSidebarCollapsed && isDeptDropdownOpen && (
                <div style={{ 
                  display: 'flex', flexDirection: 'column', gap: '0.15rem',
                  padding: '0.25rem 0 0.25rem 1.25rem',
                  borderLeft: '2px solid #e2e8f0',
                  marginLeft: '1rem',
                  marginTop: '0.15rem'
                }}>
                  {deptsToShow.map(dept => {
                    const urlPath = `/departamento/${encodeURIComponent(dept)}`;
                    const isActive = location.pathname === urlPath;
                    return (
                      <Link key={dept} to={urlPath} onClick={() => setIsMobileMenuOpen(false)}
                        className={`sidebar-link ${isActive ? 'active' : ''}`}
                        style={{ padding: '0.3rem 0.5rem', fontSize: '0.78rem' }}
                        title={dept}
                      >
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dept}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ) : deptsToShow.map(dept => {
            const urlPath = `/departamento/${encodeURIComponent(dept)}`;
            const isActive = location.pathname === urlPath;
            return (
              <Link key={dept} to={urlPath} onClick={() => setIsMobileMenuOpen(false)}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                title={`Mi Departamento: ${dept}`}
              >
                <span className="sidebar-icon-wrap" style={{ color: '#6366f1' }}><Building2 size={16} /></span>
                {!isSidebarCollapsed && <span>Mi Departamento</span>}
              </Link>
            );
          })}

          {/* Categoría: Seguridad y Control (Admin y Auditor) */}
          {(user.role === 'ADMIN' || user.role === 'AUDITOR') && (
            <>
              <div className="sidebar-section-title" style={{ marginTop: '0.4rem' }}>
                {!isSidebarCollapsed ? <span>Seguridad y Control</span> : <span className="sidebar-section-dot" />}
              </div>

              {/* Gestión de Cuentas exclusivo para Administrador de Informática */}
              {user.role === 'ADMIN' && (
                <Link to="/usuarios" onClick={() => setIsMobileMenuOpen(false)}
                  className={`sidebar-link ${location.pathname === '/usuarios' ? 'active' : ''}`}
                  title="Usuarios"
                >
                  <span className="sidebar-icon-wrap" style={{ color: '#3b82f6' }}><Users size={16} /></span>
                  {!isSidebarCollapsed && <span>Usuarios</span>}
                </Link>
              )}

              {/* Catálogo Central de Materias (Solo Administrador) */}
              {user.role === 'ADMIN' && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsCatalogoModalOpen(true);
                  }}
                  className="sidebar-link"
                  style={{ width: '100%', cursor: 'pointer', background: 'transparent', border: 'none', fontFamily: 'inherit', textAlign: 'left', display: 'flex', alignItems: 'center' }}
                  title="Catálogo de Materias"
                >
                  <span className="sidebar-icon-wrap" style={{ color: '#8b5cf6' }}><BookOpen size={16} /></span>
                  {!isSidebarCollapsed && <span>Catálogo de Materias</span>}
                </button>
              )}
              
              {/* Bitácora de Auditoría para Fiscalización y Control */}
              <Link to="/auditoria" onClick={() => setIsMobileMenuOpen(false)}
                className={`sidebar-link ${location.pathname === '/auditoria' ? 'active' : ''}`}
                title="Bitácora de Auditoría"
              >
                <span className="sidebar-icon-wrap" style={{ color: '#dc2626' }}><ShieldAlert size={16} /></span>
                {!isSidebarCollapsed && <span>Bitácora</span>}
              </Link>

              {/* Bóveda y Mantenimiento del Sistema (Solo Administrador) */}
              {user.role === 'ADMIN' && (
                <Link to="/respaldos" onClick={() => setIsMobileMenuOpen(false)}
                  className={`sidebar-link ${location.pathname === '/respaldos' ? 'active' : ''}`}
                  title="Bóveda & Mantenimiento"
                >
                  <span className="sidebar-icon-wrap" style={{ color: '#0891b2' }}><Database size={16} /></span>
                  {!isSidebarCollapsed && <span>Bóveda & Mantenimiento</span>}
                </Link>
              )}
            </>
          )}

          {/* Categoría: Servicios Avanzados */}
          {(user.role === 'ADMIN' || user.role === 'DOCENCIA' || user.role === 'JEFE' || user.role === 'AUDITOR') && (
            <>
              <div className="sidebar-section-title" style={{ marginTop: '0.4rem' }}>
                {!isSidebarCollapsed ? <span>Servicios Avanzados</span> : <span className="sidebar-section-dot" />}
              </div>

              <Link to="/mesh" onClick={() => setIsMobileMenuOpen(false)}
                className={`sidebar-link ${location.pathname === '/mesh' ? 'active' : ''}`}
                title="Malla P2P"
              >
                <span className="sidebar-icon-wrap" style={{ color: '#0284c7' }}><Radio size={16} /></span>
                {!isSidebarCollapsed && (
                  <>
                    <span>Malla P2P</span>
                    <span style={{
                      marginLeft: 'auto',
                      background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                      color: '#ffffff',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      padding: '0.08rem 0.35rem',
                      borderRadius: '99px',
                      letterSpacing: '0.04em'
                    }}>
                      P2P
                    </span>
                  </>
                )}
              </Link>
            </>
          )}
        </div>

        <div className="sidebar-footer" style={{
          padding: isSidebarCollapsed ? '0.6rem 0.4rem' : '0.6rem 0.75rem',
          borderTop: '1px solid #f1f5f9',
          background: '#ffffff'
        }}>
          {!isSidebarCollapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flex: 1 }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '8px', 
                    background: 'linear-gradient(135deg, #002f6c 0%, #001f4a 100%)', 
                    color: '#ffffff', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    fontWeight: '800', fontSize: '0.85rem',
                    boxShadow: '0 2px 5px rgba(0, 47, 108, 0.2)'
                  }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="status-pulse-green" style={{
                    position: 'absolute', bottom: '-1px', right: '-1px',
                    border: '1.5px solid #ffffff', width: '7px', height: '7px'
                  }} title="Sesión activa" />
                </div>
                <div style={{ overflow: 'hidden', minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {user.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '1px' }}>
                    <span style={{
                      fontSize: '0.64rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      background: user.role === 'ADMIN' ? '#dbeafe' : (user.role === 'DOCENCIA' ? '#dcfce7' : '#fef3c7'),
                      color: user.role === 'ADMIN' ? '#1e40af' : (user.role === 'DOCENCIA' ? '#166534' : '#92400e')
                    }}>
                      {user.role}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>• Online</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleLogout} 
                className="sidebar-logout-icon-btn" 
                title="Cerrar Sesión"
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fee2e2',
                  color: '#dc2626',
                  cursor: 'pointer',
                  padding: '0.35rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s',
                  flexShrink: 0
                }}
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ position: 'relative' }} title={`${user.name} (${user.role})`}>
                <div style={{ 
                  width: '32px', height: '32px', borderRadius: '8px', 
                  background: 'linear-gradient(135deg, #002f6c 0%, #001f4a 100%)', 
                  color: '#ffffff', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontWeight: '800', fontSize: '0.85rem',
                  boxShadow: '0 2px 5px rgba(0, 47, 108, 0.2)'
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="status-pulse-green" style={{
                  position: 'absolute', bottom: '-1px', right: '-1px',
                  border: '1.5px solid #ffffff', width: '7px', height: '7px'
                }} />
              </div>
              
              <button 
                onClick={handleLogout} 
                className="sidebar-logout-icon-btn" 
                title="Cerrar Sesión"
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fee2e2',
                  color: '#dc2626',
                  cursor: 'pointer',
                  padding: '0.35rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s'
                }}
              >
                <LogOut size={15} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className={`main-wrapper ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <header className="top-header">
          {/* Bloque Izquierdo: Menú Móvil, Volver + Cintillo Institucional Oficial UPEL del Login */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: '1 1 auto' }}>
            <button 
              className="mobile-menu-btn btn-outline" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '0.4rem', marginLeft: '-0.5rem' }}
            >
              <Menu size={22} />
            </button>
            
            {location.pathname !== '/' && (
              <button 
                onClick={() => navigate(-1)} 
                className="btn-outline" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.35rem', 
                  background: 'rgba(255, 255, 255, 0.16)', 
                  border: '1px solid rgba(255, 255, 255, 0.28)', 
                  padding: '0.3rem 0.65rem', 
                  borderRadius: '6px', 
                  cursor: 'pointer', 
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  flexShrink: 0
                }}
              >
                <ArrowLeft size={14} /> Volver
              </button>
            )}

            {/* Logotipo horizontal blanco auténtico de upel.edu.ve (idéntico al Login) */}
            <a href="https://upel.edu.ve" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <img 
                src="/logo_upel_oficial_blanco.png" 
                alt="Universidad Pedagógica Experimental Libertador" 
                style={{ 
                  height: '42px', 
                  width: 'auto', 
                  maxWidth: '300px', 
                  objectFit: 'contain', 
                  display: 'block' 
                }} 
                onError={(e) => { e.target.src = '/logo.png'; }}
              />
            </a>

            {/* Separador vertical blanco */}
            <div style={{ width: '1.5px', height: '36px', background: 'rgba(255, 255, 255, 0.35)', borderRadius: '1px', flexShrink: 0 }} />

            {/* Identificación del Instituto Pedagógico Rural Gervasio Rubio y Sección Dinámica */}
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, justifyContent: 'center', lineHeight: 1.2 }}>
              <div style={{
                color: '#ffffff',
                fontSize: '12.5px',
                fontWeight: 800,
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                Instituto Pedagógico Rural "Gervasio Rubio"
              </div>
              <div style={{
                color: '#bfdbfe',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.2px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                Subdirección de Docencia · {getActiveSectionLabel()}
              </div>
            </div>
          </div>

          {/* Bloque Derecho Integrado: Buscador Ctrl+K, Conectividad BD y Menú Sistema */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
            
            {/* Buscador Rápido Ctrl+K */}
            <div 
              onClick={() => setIsCommandPaletteOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.28)',
                padding: '0.32rem 0.7rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.78rem',
                color: '#ffffff',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.55)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.24)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.28)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'; }}
              title="Haga clic o presione Ctrl + K para buscar docentes, materias o departamentos"
            >
              <Search size={13} color="#bfdbfe" />
              <span style={{ fontSize: '0.78rem', color: '#e0f2fe' }}>Buscar...</span>
              <kbd style={{
                background: 'rgba(255, 255, 255, 0.22)',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                borderRadius: '4px',
                padding: '0.05rem 0.3rem',
                fontSize: '0.65rem',
                fontWeight: 700,
                color: '#ffffff'
              }}>
                Ctrl K
              </kbd>
            </div>

            {/* Widget de Conectividad & Sincronización Offline */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', position: 'relative' }}>
              <div 
                onClick={() => setShowSyncDetails(!showSyncDetails)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.32rem 0.7rem',
                  borderRadius: '99px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: syncState.isSyncing 
                    ? 'rgba(59, 130, 246, 0.35)' 
                    : (!syncState.isOnline || syncState.queueCount > 0) 
                      ? 'rgba(245, 158, 11, 0.35)' 
                      : 'rgba(16, 185, 129, 0.25)',
                  color: '#ffffff',
                  border: `1px solid ${
                    syncState.isSyncing 
                      ? 'rgba(191, 219, 254, 0.5)' 
                      : (!syncState.isOnline || syncState.queueCount > 0) 
                        ? 'rgba(253, 230, 138, 0.5)' 
                        : 'rgba(167, 243, 208, 0.4)'
                  }`,
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s ease'
                }}
                title="Haga clic para ver detalles de conectividad y sincronización"
              >
                {syncState.isSyncing ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" color="#bfdbfe" />
                    <span>Sincronizando...</span>
                  </>
                ) : !syncState.isOnline ? (
                  <>
                    <WifiOff size={13} color="#fde047" />
                    <span>Offline</span>
                    {syncState.queueCount > 0 && (
                      <span style={{ 
                        background: '#dc2626', color: 'white', borderRadius: '99px', 
                        padding: '0.05rem 0.35rem', fontSize: '0.65rem' 
                      }}>
                        {syncState.queueCount}
                      </span>
                    )}
                  </>
                ) : syncState.queueCount > 0 ? (
                  <>
                    <RefreshCw size={13} color="#fde047" />
                    <span>{syncState.queueCount} pend.</span>
                  </>
                ) : (
                  <>
                    <span style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: '#4ade80',
                      display: 'inline-block',
                      boxShadow: '0 0 0 2px rgba(74, 222, 128, 0.4)'
                    }} />
                    <span>BD En Línea</span>
                  </>
                )}
              </div>

              {/* Botón de Sincronización Manual */}
              <button
                type="button"
                onClick={handleManualSync}
                disabled={syncState.isSyncing}
                className="btn btn-outline"
                style={{
                  padding: '0.32rem 0.55rem',
                  borderRadius: '99px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.16)',
                  border: '1px solid rgba(255, 255, 255, 0.28)',
                  color: '#ffffff'
                }}
                title="Sincronizar cambios locales con la base de datos MySQL central"
              >
                <RefreshCw size={12} className={syncState.isSyncing ? 'animate-spin' : ''} />
              </button>

              {/* Popover / Menú con Detalles de Conectividad */}
              {showSyncDetails && (
                <div style={{
                  position: 'absolute',
                  top: '115%',
                  right: 0,
                  width: '280px',
                  background: 'white',
                  borderRadius: '12px',
                  padding: '1rem',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                  border: '1px solid var(--border-light)',
                  zIndex: 100
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                      Estado de Conectividad
                    </span>
                    <button 
                      onClick={() => setShowSyncDetails(false)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 0.75rem 0', lineHeight: 1.4 }}>
                    {syncState.isOnline 
                      ? 'Conexión activa con el servidor central de la UPEL y MySQL.'
                      : 'Trabajando en modo local desconectado. Todas las modificaciones se guardan y se sincronizarán al volver la red.'}
                  </p>

                  <div style={{ 
                    padding: '0.6rem', 
                    borderRadius: '8px', 
                    background: 'var(--bg-app)', 
                    fontSize: '0.75rem',
                    marginBottom: '0.75rem' 
                  }}>
                    <div><strong>Cambios pendientes:</strong> {syncState.queueCount}</div>
                    <div><strong>Servidor:</strong> http://{window.location.hostname}:3001</div>
                  </div>

                  {syncMessage && (
                    <div style={{ 
                      fontSize: '0.75rem', 
                      padding: '0.4rem', 
                      borderRadius: '6px', 
                      background: '#eff6ff', 
                      color: '#1d4ed8', 
                      marginBottom: '0.6rem',
                      textAlign: 'center'
                    }}>
                      {syncMessage}
                    </div>
                  )}

                  <button
                    onClick={handleManualSync}
                    disabled={syncState.isSyncing}
                    className="btn btn-primary"
                    style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem', justifyContent: 'center' }}
                  >
                    {syncState.isSyncing ? 'Sincronizando...' : 'Forzar Sincronización Ahora'}
                  </button>

                  {syncState.queueCount > 0 && (
                    <button
                      type="button"
                      onClick={handleClearStuckQueue}
                      disabled={syncState.isSyncing}
                      className="btn btn-outline"
                      style={{
                        width: '100%',
                        fontSize: '0.75rem',
                        padding: '0.35rem',
                        marginTop: '0.5rem',
                        color: '#dc2626',
                        borderColor: '#fca5a5',
                        background: '#fef2f2',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      title="Si la transacción pendiente tiene un conflicto o quedó atascada, descártela para continuar normalmente"
                    >
                      Descartar Pendiente ({syncState.queueCount})
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Menú Desplegable Compacto: Sistema y Herramientas */}
            <div ref={toolsMenuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
                style={{
                  background: isToolsMenuOpen ? 'rgba(255, 255, 255, 0.28)' : 'rgba(255, 255, 255, 0.16)',
                  border: '1px solid rgba(255, 255, 255, 0.28)',
                  borderRadius: '8px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontWeight: 700,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                  backdropFilter: 'blur(8px)'
                }}
                title="Herramientas del sistema, protocolo y configuración institucional"
              >
                <Settings size={14} color="#bfdbfe" />
                <span>Sistema</span>
                {flyerConfig?.enabled !== false && (
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#4ade80'
                  }} title="Flyer activo" />
                )}
                <ChevronDown size={14} style={{ transform: isToolsMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: '#bfdbfe' }} />
              </button>

              {isToolsMenuOpen && (
                <div 
                  style={{
                    position: 'absolute',
                    top: '120%',
                    right: 0,
                    width: '240px',
                    background: '#ffffff',
                    borderRadius: '12px',
                    padding: '0.5rem',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                    border: '1px solid var(--border-light, #e2e8f0)',
                    zIndex: 200,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem'
                  }}
                  onMouseLeave={() => setIsToolsMenuOpen(false)}
                >
                  <button
                    type="button"
                    onClick={() => { setIsGuiaModalOpen(true); setIsToolsMenuOpen(false); }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#166534',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      transition: 'background 0.15s'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#f0fdf4'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <BookOpen size={15} color="#059669" />
                    <span>Protocolo Oficial</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setIsAboutModalOpen(true); setIsToolsMenuOpen(false); }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#003366',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      transition: 'background 0.15s'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#eff6ff'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Info size={15} color="#008744" />
                    <span>Acerca de SIGOA v2.0</span>
                  </button>

                  {(user.role === 'ADMIN' || user.role === 'AUDITOR' || user.role === 'DOCENCIA') && (
                    <button
                      type="button"
                      onClick={() => { setIsFlyerModalOpen(true); setIsToolsMenuOpen(false); }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: '#92400e',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%',
                        transition: 'background 0.15s'
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#fef3c7'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Sparkles size={15} color="#d97706" />
                        <span>Flyer Institucional</span>
                      </div>
                      <span style={{
                        fontSize: '0.65rem',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        background: flyerConfig?.enabled !== false ? '#16a34a' : '#64748b',
                        color: '#ffffff',
                        fontWeight: 800
                      }}>
                        {flyerConfig?.enabled !== false ? 'ON' : 'OFF'}
                      </span>
                    </button>
                  )}

                  {user.role === 'ADMIN' && (
                    <button
                      type="button"
                      onClick={() => { setIsLoginBgModalOpen(true); setIsToolsMenuOpen(false); }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: '#1d4ed8',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%',
                        transition: 'background 0.15s'
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#eff6ff'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <ImageIcon size={15} color="#2563eb" />
                      <span>Fondo de Login</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Barra de Navegación Horizontal Oficial (Reemplazo Horizontal de 18.png) */}
        <nav className="horizontal-navbar" aria-label="Navegación Principal">
          <div className="horizontal-nav-links">
            {/* 1. Dashboard (Admin y Auditor) */}
            {(user.role === 'ADMIN' || user.role === 'AUDITOR') && (
              <Link 
                to="/" 
                className={`horizontal-nav-link ${location.pathname === '/' ? 'active' : ''}`}
                title="Panel de Control y Estadísticas"
              >
                <LayoutDashboard size={15} color="#002f6c" />
                <span>Dashboard</span>
              </Link>
            )}

            {/* 2. Consultar Docentes */}
            <Link 
              to="/consultar" 
              className={`horizontal-nav-link ${location.pathname === '/consultar' ? 'active' : ''}`}
              title="Registro Central y Consulta de Docentes"
            >
              <Users size={15} color="#059669" />
              <span>Consultar Docentes</span>
            </Link>

            {/* 3. Oferta Institucional */}
            {(user.role === 'ADMIN' || (ofertaEnabled && (user.role === 'DOCENCIA' || user.role === 'JEFE' || user.role === 'AUDITOR'))) && (
              <Link 
                to="/docencia" 
                className={`horizontal-nav-link ${location.pathname === '/docencia' ? 'active' : ''}`}
                title="Oferta Académica Institucional"
              >
                <Building2 size={15} color="#0284c7" />
                <span>Oferta Institucional</span>
              </Link>
            )}

            {/* 4. Gestión de Lapsos */}
            {(user.role === 'ADMIN' || user.role === 'AUDITOR' || user.role === 'DOCENCIA') && (
              <button
                type="button"
                onClick={() => setIsPeriodModalOpen(true)}
                className="horizontal-nav-link"
                title={activePeriodName ? `Gestión de Lapsos Académicos (${activePeriodName})` : "Gestión de Lapsos"}
              >
                <Calendar size={15} color="#0284c7" />
                <span>Gestión de Lapsos</span>
                {activePeriodName && (
                  <span style={{
                    background: '#e0f2fe',
                    color: '#0369a1',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.4rem',
                    borderRadius: '99px'
                  }}>
                    {activePeriodName}
                  </span>
                )}
              </button>
            )}

            {/* 5. Departamentos (Desplegable) */}
            {(user.role === 'ADMIN' || user.role === 'AUDITOR') ? (
              <div className="horizontal-nav-dropdown" ref={deptDropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsDeptDropdownOpen(!isDeptDropdownOpen);
                    setIsSecurityDropdownOpen(false);
                  }}
                  className={`horizontal-nav-link ${location.pathname.includes('/departamento/') ? 'active' : ''}`}
                  title="Departamentos Académicos"
                >
                  <Building2 size={15} color="#6366f1" />
                  <span>Departamentos</span>
                  <ChevronDown size={13} style={{ transform: isDeptDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }} />
                </button>

                {isDeptDropdownOpen && (
                  <div 
                    className="horizontal-dropdown-menu" 
                    style={{ maxHeight: '320px', overflowY: 'auto' }}
                  >
                    {deptsToShow.map(dept => {
                      const urlPath = `/departamento/${encodeURIComponent(dept)}`;
                      const isActive = location.pathname === urlPath;
                      return (
                        <Link 
                          key={dept} 
                          to={urlPath} 
                          onClick={() => setIsDeptDropdownOpen(false)}
                          className={`horizontal-dropdown-item ${isActive ? 'active' : ''}`}
                        >
                          <Building2 size={13} color="#6366f1" />
                          <span>{dept}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : deptsToShow.map(dept => {
              const urlPath = `/departamento/${encodeURIComponent(dept)}`;
              const isActive = location.pathname === urlPath;
              return (
                <Link 
                  key={dept} 
                  to={urlPath} 
                  className={`horizontal-nav-link ${isActive ? 'active' : ''}`}
                  title={`Mi Departamento: ${dept}`}
                >
                  <Building2 size={15} color="#6366f1" />
                  <span>Mi Departamento</span>
                </Link>
              );
            })}

            {/* 6. Seguridad y Control (Admin y Auditor) */}
            {(user.role === 'ADMIN' || user.role === 'AUDITOR') && (
              <div className="horizontal-nav-dropdown" ref={securityDropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsSecurityDropdownOpen(!isSecurityDropdownOpen);
                    setIsDeptDropdownOpen(false);
                  }}
                  className={`horizontal-nav-link ${(location.pathname === '/usuarios' || location.pathname === '/auditoria' || location.pathname === '/respaldos') ? 'active' : ''}`}
                  title="Seguridad, Usuarios y Auditoría"
                >
                  <ShieldAlert size={15} color="#dc2626" />
                  <span>Seguridad & Control</span>
                  <ChevronDown size={13} style={{ transform: isSecurityDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }} />
                </button>

                {isSecurityDropdownOpen && (
                  <div 
                    className="horizontal-dropdown-menu" 
                  >
                    {user.role === 'ADMIN' && (
                      <Link 
                        to="/usuarios" 
                        onClick={() => setIsSecurityDropdownOpen(false)}
                        className={`horizontal-dropdown-item ${location.pathname === '/usuarios' ? 'active' : ''}`}
                      >
                        <Users size={14} color="#3b82f6" />
                        <span>Gestión de Usuarios</span>
                      </Link>
                    )}
                    {user.role === 'ADMIN' && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsSecurityDropdownOpen(false);
                          setIsCatalogoModalOpen(true);
                        }}
                        className="horizontal-dropdown-item"
                      >
                        <BookOpen size={14} color="#8b5cf6" />
                        <span>Catálogo de Materias</span>
                      </button>
                    )}
                    <Link 
                      to="/auditoria" 
                      onClick={() => setIsSecurityDropdownOpen(false)}
                      className={`horizontal-dropdown-item ${location.pathname === '/auditoria' ? 'active' : ''}`}
                    >
                      <ShieldAlert size={14} color="#dc2626" />
                      <span>Bitácora de Auditoría</span>
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link 
                        to="/respaldos" 
                        onClick={() => setIsSecurityDropdownOpen(false)}
                        className={`horizontal-dropdown-item ${location.pathname === '/respaldos' ? 'active' : ''}`}
                      >
                        <Database size={14} color="#0891b2" />
                        <span>Bóveda & Mantenimiento</span>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 7. Malla P2P */}
            {(user.role === 'ADMIN' || user.role === 'DOCENCIA' || user.role === 'JEFE' || user.role === 'AUDITOR') && (
              <Link 
                to="/mesh" 
                className={`horizontal-nav-link ${location.pathname === '/mesh' ? 'active' : ''}`}
                title="Malla P2P Distribuida"
              >
                <Radio size={15} color="#0284c7" />
                <span>Malla P2P</span>
                <span style={{
                  background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                  color: '#ffffff',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  padding: '0.08rem 0.35rem',
                  borderRadius: '99px'
                }}>
                  P2P
                </span>
              </Link>
            )}
          </div>

          {/* Bloque Derecho de la Barra Horizontal: Usuario y Salir */}
          <div className="horizontal-user-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <div style={{ 
                width: '28px', height: '28px', borderRadius: '7px', 
                background: 'linear-gradient(135deg, #002f6c 0%, #001f4a 100%)', 
                color: '#ffffff', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontWeight: '800', fontSize: '0.78rem'
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name}
                </span>
                <span style={{
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: user.role === 'ADMIN' ? '#1e40af' : (user.role === 'DOCENCIA' ? '#166534' : '#92400e')
                }}>
                  {user.role} · Online
                </span>
              </div>
            </div>

            <button 
              onClick={handleLogout} 
              className="horizontal-logout-btn"
              title="Cerrar Sesión Segura"
            >
              <LogOut size={13} />
              <span>Salir</span>
            </button>
          </div>
        </nav>

        <main className="content-area">
          {maintenanceBanner?.enabled && location.pathname !== '/respaldos' && (
            <div style={{
              margin: '1rem 1.5rem 0',
              padding: '0.85rem 1.25rem',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
              border: '1px solid #f59e0b',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.15)'
            }}>
              <AlertTriangle size={20} color="#b45309" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.85rem', color: '#92400e', lineHeight: 1.4 }}>
                <strong>Aviso de Mantenimiento Institucional:</strong> {maintenanceBanner.message} {maintenanceBanner.estimatedEnd ? `(Finalización estimada: ${maintenanceBanner.estimatedEnd})` : ''}
              </div>
            </div>
          )}
          <Outlet />
        </main>
        
        <div style={{ padding: '0 2rem' }}>
          <Footer fontSize="1.2rem" />
        </div>

        <Suspense fallback={null}>
          {/* Modal de Flyer Institucional (Popup Oficial UPEL con Subida de Imagen) */}
          <InstitutionalFlyerModal 
            isOpen={isFlyerModalOpen} 
            onClose={() => setIsFlyerModalOpen(false)} 
          />

          {/* Modal de Personalización de Fondo de Login */}
          <LoginBgModal 
            isOpen={isLoginBgModalOpen} 
            onClose={() => setIsLoginBgModalOpen(false)} 
          />

          {/* Modal de Reconocimiento y Ficha Técnica de la Unidad de Informática */}
          <AboutModal 
            isOpen={isAboutModalOpen} 
            onClose={() => setIsAboutModalOpen(false)} 
          />

          {/* Modal de Guía y Protocolo Oficial de Organización */}
          <GuiaOrganizacionModal
            isOpen={isGuiaModalOpen}
            onClose={() => setIsGuiaModalOpen(false)}
          />

          {/* Modal Institucional de Gestión y Activación de Lapsos Académicos */}
          <PeriodManagementModal
            isOpen={isPeriodModalOpen}
            onClose={() => setIsPeriodModalOpen(false)}
            onPeriodActivated={(newP) => {
              setActivePeriodName(newP);
              window.location.reload();
            }}
          />

          {/* Modal Institucional del Catálogo de Materias (Solo Administrador) */}
          {user.role === 'ADMIN' && (
            <CatalogoMateriasModal
              isOpen={isCatalogoModalOpen}
              onClose={() => setIsCatalogoModalOpen(false)}
            />
          )}

          {/* Buscador Rápido Global (Command Palette Ctrl+K) */}
          <CommandPalette
            isOpen={isCommandPaletteOpen}
            onClose={() => setIsCommandPaletteOpen(false)}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default Layout;
