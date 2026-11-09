import React from 'react';

const Footer = ({ fontSize = '1.8rem', color = 'var(--primary)', subColor = 'var(--text-muted, #666)' }) => {
  return (
    <div style={{
      textAlign: 'center',
      padding: '1.5rem',
      marginTop: 'auto',
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
        fontSize: '0.85rem',
        color: subColor,
        marginTop: '0.4rem',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px'
      }}>
        <span>© {new Date().getFullYear()} Unidad de Informática • UPEL - Rubio</span>
        <span>•</span>
        <span style={{ color: 'var(--upel-green, #008744)', fontWeight: 600 }}>La Ciudad Pontálida • Estado Táchira</span>
      </p>
    </div>
  );
};

export default Footer;
