import React from 'react';

const Footer = ({ fontSize = '1.8rem', color = 'var(--primary)', subColor = 'var(--text-muted, #666)' }) => {
  return (
    <div style={{
      textAlign: 'center',
      padding: '1.5rem',
      marginTop: 'auto', // Para empujarlo al fondo si el contenedor padre es flex column
      width: '100%',
      flexShrink: 0,
      zIndex: 50,
      background: 'transparent'
    }}>
      <p style={{
        fontFamily: '"Dancing Script", cursive',
        fontSize: fontSize,
        color: color,
        margin: 0,
        fontWeight: 600,
        textShadow: '1px 1px 2px rgba(0,0,0,0.05)'
      }}>
        "La Universidad de los Maestros"
      </p>
      <p style={{
        fontSize: '0.9rem',
        color: subColor,
        marginTop: '0.5rem',
        fontWeight: 500
      }}>
        ©2026 Unidad de Informática - UPEL- RUBIO Venezuela
      </p>
    </div>
  );
};

export default Footer;
