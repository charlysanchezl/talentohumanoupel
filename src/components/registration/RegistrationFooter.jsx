import React from 'react';

export const RegistrationFooter = () => {
  return (
    <footer id="colophon" style={{
      padding: '1.1rem 2rem',
      textAlign: 'center',
      background: '#009a44',
      boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.15)',
      position: 'relative',
      zIndex: 5,
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
  );
};

export default RegistrationFooter;
