import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Building2 } from 'lucide-react';

export const RegistrationHeader = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentDateTime.toLocaleDateString('es-VE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const capitalizedDate = formattedDate ? (formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)) : '';
  const formattedTime = currentDateTime.toLocaleTimeString('es-VE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return (
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
        <a href="https://upel.edu.ve" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src="/logo_upel_oficial_blanco.png" 
            alt="Universidad Pedagógica Experimental Libertador" 
            style={{ height: '46px', width: 'auto', maxWidth: '320px', objectFit: 'contain', display: 'block' }}
            onError={(e) => { e.target.src = '/logo.png'; }}
          />
        </a>
        <div style={{ width: '1.5px', height: '38px', background: 'rgba(255, 255, 255, 0.35)' }} />
        <div>
          <div style={{ color: '#ffffff', fontSize: '13px', fontWeight: 800, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
            Instituto Pedagógico Rural "Gervasio Rubio"
          </div>
          <div style={{ color: '#bfdbfe', fontSize: '11.5px', fontWeight: 600, letterSpacing: '0.2px' }}>
            Portal Docente · Subdirección de Docencia
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Reloj y Fecha en Vivo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(255, 255, 255, 0.12)',
          padding: '7px 16px',
          borderRadius: '30px',
          border: '1px solid rgba(255, 255, 255, 0.22)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#e0f2fe' }}>
            <Calendar size={14} color="#38bdf8" />
            <span>{capitalizedDate}</span>
          </div>
          <div style={{ width: '1px', height: '14px', background: 'rgba(255, 255, 255, 0.3)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 700, color: '#ffffff', letterSpacing: '0.3px' }}>
            <Clock size={14} color="#fde047" />
            <span>{formattedTime}</span>
          </div>
        </div>

        <a
          href="/login"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            padding: '7px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 700,
            border: '1px solid rgba(255, 255, 255, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            textDecoration: 'none',
            transition: 'all 0.2s',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#0047bb'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'; e.currentTarget.style.color = '#ffffff'; }}
        >
          <Building2 size={14} /> Acceso Administrativo
        </a>
      </div>
    </header>
  );
};

export default RegistrationHeader;
