import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, getCurrentUser } from '../data';
import { Lock, User, AlertCircle } from 'lucide-react';
import Footer from './Footer';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Si ya está logueado, redirigir
    const user = getCurrentUser();
    if (user) {
      if (user.role === 'ADMIN' || user.role === 'AUDITOR') {
        navigate('/');
      } else {
        navigate(`/departamento/${encodeURIComponent(user.department)}`);
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Por favor, ingrese sus credenciales.');
      return;
    }

    const user = await loginUser(username, password);
    if (user) {
      if (user.role === 'ADMIN' || user.role === 'AUDITOR') {
        navigate('/');
      } else {
        navigate(`/departamento/${encodeURIComponent(user.department)}`);
      }
    } else {
      setError('Usuario o contraseña incorrectos.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'url("/universidad.jpeg") no-repeat center center fixed', backgroundSize: 'cover', padding: '2rem' }}>
      <div className="surface animate-fade-in" style={{ width: '100%', maxWidth: '450px', padding: '3rem', borderRadius: 'var(--radius)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <img src="/logo.jpg" alt="Logo UPEL" style={{ height: '70px', marginBottom: '1rem' }} />
          <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '2rem' }}>UPEL - IPRGR</h1>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Unidad de Talento Humano</h2>
          <p style={{ marginTop: '0.5rem', fontWeight: 600 }}>Panel Administrativo</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {error && (
            <div style={{ padding: '1rem', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary-dark)' }}>Usuario</label>
            <div style={{ position: 'relative' }}>
              <User size={18} className="text-muted" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                className="filter-input" 
                style={{ width: '100%', paddingLeft: '2.8rem' }}
                placeholder="Nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary-dark)' }}>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} className="text-muted" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="password" 
                className="filter-input" 
                style={{ width: '100%', paddingLeft: '2.8rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '1rem', fontSize: '1rem' }}>
            Ingresar al Sistema
          </button>

        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            ¿Eres docente y necesitas llenar tu ficha? <br/>
            <a href="/registro" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginTop: '0.5rem' }}>Ir al Portal de Registro</a>
          </p>
        </div>

      </div>
      
      <div style={{ marginTop: 'auto', width: '100%' }}>
        <Footer color="white" subColor="rgba(255, 255, 255, 0.9)" />
      </div>
    </div>
  );
};

export default Login;
