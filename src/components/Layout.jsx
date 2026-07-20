import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Bell, ChevronRight, ShieldAlert, Users, ArrowLeft, Menu, X } from 'lucide-react';
import { departments, getCurrentUser, logoutUser } from '../data';
import Footer from './Footer';
import '../App.css';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = (e) => {
    e.preventDefault();
    logoutUser();
    navigate('/login');
  };

  if (!user) return null;

  const individualDepts = departments.filter(d => d !== 'Todos');
  const deptsToShow = (user.role === 'ADMIN' || user.role === 'AUDITOR')
    ? individualDepts 
    : individualDepts.filter(d => d === user.department);

  return (
    <div className="app-container" style={{ flexDirection: 'column', background: 'transparent' }}>
      {/* Top Navbar Moderno */}
      <header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '0 2rem', 
        height: '70px', 
        background: 'rgba(255, 255, 255, 0.8)', 
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-light)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Logo y Título */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {location.pathname !== '/' && (
            <button onClick={() => navigate(-1)} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: '1px solid var(--border-light)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text-main)' }}>
              <ArrowLeft size={16} /> Volver
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img src="/logo.jpg" alt="Logo UPEL" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
            <div>
              <h1 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--primary)' }}>UPEL IPRGR</h1>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Unidad de Talento Humano</div>
            </div>
          </div>
        </div>

        {/* Toggle Menú Móvil */}
        <button 
          className="mobile-menu-btn btn-outline" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', padding: '0.5rem' }}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Enlaces de Navegación y Perfil (Desktop y Mobile unificados por CSS o estado) */}
        <div 
          className={isMobileMenuOpen ? "mobile-nav-container open" : "desktop-nav"}
          style={{ 
            display: 'flex', 
            gap: '1.5rem', 
            alignItems: 'center',
            ...(isMobileMenuOpen ? {
              position: 'absolute',
              top: '70px',
              left: 0,
              width: '100%',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              flexDirection: 'column',
              padding: '2rem 1rem',
              borderBottom: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-md)',
              alignItems: 'stretch'
            } : {})
          }}
        >
          <nav style={{ 
            display: 'flex', 
            gap: '1.5rem', 
            alignItems: isMobileMenuOpen ? 'stretch' : 'center',
            flexDirection: isMobileMenuOpen ? 'column' : 'row'
          }}>
            {(user.role === 'ADMIN' || user.role === 'AUDITOR') && (
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} style={{ 
                display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', 
                color: location.pathname === '/' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: location.pathname === '/' ? 600 : 500,
                borderBottom: (!isMobileMenuOpen && location.pathname === '/') ? '2px solid var(--primary)' : '2px solid transparent',
                background: (isMobileMenuOpen && location.pathname === '/') ? 'var(--primary-light)' : 'transparent',
                padding: isMobileMenuOpen ? '1rem' : '1.3rem 0',
                borderRadius: isMobileMenuOpen ? 'var(--radius-sm)' : '0'
              }}>
                <LayoutDashboard size={18} /> Dashboard
              </Link>
            )}
            
            <Link to="/consultar" onClick={() => setIsMobileMenuOpen(false)} style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', 
              color: location.pathname === '/consultar' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: location.pathname === '/consultar' ? 600 : 500,
              borderBottom: (!isMobileMenuOpen && location.pathname === '/consultar') ? '2px solid var(--primary)' : '2px solid transparent',
              background: (isMobileMenuOpen && location.pathname === '/consultar') ? 'var(--primary-light)' : 'transparent',
              padding: isMobileMenuOpen ? '1rem' : '1.3rem 0',
              borderRadius: isMobileMenuOpen ? 'var(--radius-sm)' : '0'
            }}>
              <Users size={18} /> Consultar Docentes
            </Link>

            {user.role === 'ADMIN' && (
              <Link to="/usuarios" onClick={() => setIsMobileMenuOpen(false)} style={{ 
                display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', 
                color: location.pathname === '/usuarios' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: location.pathname === '/usuarios' ? 600 : 500,
                borderBottom: (!isMobileMenuOpen && location.pathname === '/usuarios') ? '2px solid var(--primary)' : '2px solid transparent',
                background: (isMobileMenuOpen && location.pathname === '/usuarios') ? 'var(--primary-light)' : 'transparent',
                padding: isMobileMenuOpen ? '1rem' : '1.3rem 0',
                borderRadius: isMobileMenuOpen ? 'var(--radius-sm)' : '0'
              }}>
                <Users size={18} /> Usuarios
              </Link>
            )}

            {/* Menú Desplegable o Enlaces de Departamentos */}
            {deptsToShow.map(dept => {
              const urlPath = `/departamento/${encodeURIComponent(dept)}`;
              const isActive = location.pathname === urlPath;
              return (
                <Link key={dept} to={urlPath} onClick={() => setIsMobileMenuOpen(false)} style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', 
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: isActive ? 600 : 500,
                  borderBottom: (!isMobileMenuOpen && isActive) ? '2px solid var(--primary)' : '2px solid transparent',
                  background: (isMobileMenuOpen && isActive) ? 'var(--primary-light)' : 'transparent',
                  padding: isMobileMenuOpen ? '1rem' : '1.3rem 0',
                  borderRadius: isMobileMenuOpen ? 'var(--radius-sm)' : '0'
                }}>
                  <ChevronRight size={16} /> {(user.role === 'ADMIN' || user.role === 'AUDITOR') ? dept : 'Mi Departamento'}
                </Link>
              );
            })}
          </nav>

          {/* Perfil y Opciones */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            marginTop: isMobileMenuOpen ? '1rem' : 0,
            paddingTop: isMobileMenuOpen ? '1rem' : 0,
            borderTop: isMobileMenuOpen ? '1px solid var(--border-light)' : 'none',
            justifyContent: isMobileMenuOpen ? 'space-between' : 'flex-start'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '36px', height: '36px', borderRadius: '50%', 
                background: 'var(--primary-light)', color: 'var(--primary)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' 
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {user.role === 'ADMIN' ? 'Admin' : (user.role === 'AUDITOR' ? 'Auditor' : 'Jefe')}
                </div>
              </div>
            </div>
            
            <button onClick={handleLogout} style={{ 
              background: 'none', border: '1px solid var(--danger)', color: 'var(--danger)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)', fontWeight: 600
            }} className="btn-outline">
              <LogOut size={18} /> Salir
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ flex: 1, padding: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
          <Outlet />
        </div>
        <Footer fontSize="1.5rem" />
      </main>
    </div>
  );
};

export default Layout;
