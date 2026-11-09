import React from 'react';

const InstitutionalHeader = ({ subtitle = 'Subdirección de Docencia — Talento Humano' }) => {
  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '12px',
      padding: '0.65rem 1.25rem',
      border: '1px solid var(--border-light, #e2e8f0)',
      borderLeft: '5px solid var(--upel-green, #008744)',
      boxShadow: '0 1px 4px rgba(0, 102, 153, 0.04)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '0.75rem',
      marginBottom: '0.75rem'
    }}>
      {/* Cinta superior institucional (Verde UPEL & Azul UPEL) */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, var(--upel-green, #008744) 0%, var(--primary, #006699) 70%, var(--upel-gold, #f5a524) 100%)'
      }} />

      {/* Bloque Izquierdo: Logotipo UPEL sin bordes + Membrete Protocolar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
        {/* Logo oficial UPEL completamente visible */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <img 
            src="/logo.jpg" 
            alt="Logotipo Oficial UPEL" 
            style={{ 
              height: '40px', 
              width: 'auto',
              maxWidth: '65px',
              objectFit: 'contain',
              display: 'block'
            }} 
            onError={(e) => {
              e.target.src = '/logo.png';
            }}
          />
        </div>

        {/* Separador vertical sutil */}
        <div style={{
          width: '1.5px',
          height: '34px',
          backgroundColor: '#e2e8f0',
          borderRadius: '1px'
        }} />

        {/* Membrete Oficial en colores institucionales */}
        <div>
          <div style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.8px',
            color: 'var(--upel-green, #008744)',
            textTransform: 'uppercase'
          }}>
            República Bolivariana de Venezuela
          </div>
          
          <h2 style={{
            margin: '1px 0',
            fontSize: '15px',
            fontWeight: 800,
            letterSpacing: '0.1px',
            color: 'var(--primary, #0047bb)',
            lineHeight: 1.2
          }}>
            Universidad Pedagógica Experimental Libertador
          </h2>
          
          <div style={{
            fontSize: '11.5px',
            fontWeight: 600,
            color: 'var(--text-muted, #475569)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexWrap: 'wrap'
          }}>
            <span>Instituto Pedagógico Rural "Gervasio Rubio"</span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              backgroundColor: '#eff6ff',
              color: '#0047bb',
              fontSize: '10px',
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: '4px',
              border: '1px solid #bfdbfe',
              letterSpacing: '0.2px'
            }}>
              <svg width="12" height="10" viewBox="0 0 24 20" fill="none" stroke="#0047bb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 17h20" />
                <path d="M4 17V9" />
                <path d="M20 17V9" />
                <path d="M4 9c4-5 12-5 16 0" />
                <path d="M12 5v12" />
                <path d="M8 7v10" />
                <path d="M16 7v10" />
              </svg>
              <span>Ciudad Pontálida • Táchira</span>
            </span>
          </div>
        </div>
      </div>

      {/* Bloque Derecho: Lema de los Maestros + Certificación de Dependencia */}
      <div style={{
        textAlign: 'right',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'center'
      }}>
        <div style={{
          fontFamily: '"Dancing Script", cursive, Georgia, serif',
          fontSize: '17px',
          fontWeight: 700,
          color: 'var(--upel-green, #008744)',
          letterSpacing: '0.3px',
          lineHeight: 1.2
        }}>
          "La Universidad de los Maestros"
        </div>
        
        <div style={{
          background: 'var(--primary-light, #eff6ff)',
          border: '1px solid rgba(0, 71, 187, 0.25)',
          borderRadius: '99px',
          padding: '2px 10px',
          fontSize: '10.5px',
          fontWeight: 700,
          color: 'var(--primary, #0047bb)',
          marginTop: '2px',
          letterSpacing: '0.4px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <span>🏛️</span>
          <span>{subtitle.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};

export default InstitutionalHeader;
