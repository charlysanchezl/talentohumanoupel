import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, ArrowRight, ShieldAlert, Loader2, Building2, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const RegistrationAccessCard = ({
  cedulaInput,
  setCedulaInput,
  passwordInput,
  setPasswordInput,
  showPassword,
  setShowPassword,
  errorAuth,
  isValidating,
  validatingName,
  handleValidateCedula,
  setIsForgotModalOpen,
  setForgotCedula,
  setForgotEmail,
  setForgotError,
  setForgotSuccess
}) => {
  const [isFaqOpen, setIsFaqOpen] = useState(false);

  return (
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
      {/* Cabecera de la Tarjeta en Azul UPEL */}
      <div style={{
        background: 'linear-gradient(135deg, #0047bb 0%, #002e7a 100%)',
        padding: '2rem 1.75rem 1.5rem',
        textAlign: 'center',
        color: '#ffffff',
        position: 'relative'
      }}>
        {/* Logo Oficial UPEL circular con resalte blanco */}
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
          PORTAL DOCENTE
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500 }}>
          Consulta de Ficha y Asignación Académica
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
          Subdirección de Docencia · IPRGR
        </div>
      </div>

      {/* Cuerpo del Formulario */}
      <div style={{ padding: '1.75rem 1.85rem 1.85rem' }}>
        {isValidating ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Loader2 size={36} color="#0047bb" className="animate-spin" />
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#1e293b', fontWeight: 700 }}>
                Verificando Credenciales...
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                {validatingName ? `Bienvenido, ${validatingName}` : 'Consultando expediente en la base de datos...'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {errorAuth && (
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
                <ShieldAlert size={18} color="#dc2626" style={{ flexShrink: 0 }} />
                <span>{errorAuth}</span>
              </div>
            )}

            <form onSubmit={handleValidateCedula} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Campo Cédula de Identidad */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Cédula de Identidad
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <User size={18} style={{ position: 'absolute', left: '12px', color: '#64748b' }} />
                  <input 
                    type="text"
                    required
                    value={cedulaInput}
                    onChange={(e) => setCedulaInput(e.target.value.toUpperCase())}
                    placeholder="Ej. V-12345678"
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 38px',
                      fontSize: '14px',
                      color: '#0f172a',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      outline: 'none',
                      transition: 'all 0.2s',
                      letterSpacing: '0.5px'
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
                    Contraseña de Acceso
                  </label>
                  <span 
                    onClick={() => {
                      setForgotCedula(cedulaInput);
                      setForgotEmail('');
                      setForgotError('');
                      setForgotSuccess('');
                      setIsForgotModalOpen(true);
                    }}
                    style={{ fontSize: '11.5px', color: '#0047bb', cursor: 'pointer', fontWeight: 600 }}
                  >
                    ¿Olvidó su clave?
                  </span>
                </div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '12px', color: '#64748b' }} />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••"
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
                <div style={{ marginTop: '4px', fontSize: '11px', color: '#64748b' }}>
                  * Primer ingreso: últimos 4 dígitos de su Cédula.
                </div>
              </div>

              {/* Botón Principal: Ingresar y Consultar en Azul UPEL */}
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
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#0047bb';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>Ingresar y Consultar Ficha</span>
                <ArrowRight size={17} />
              </button>
            </form>

            {/* Separador Institucional */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '1.4rem 0 1.1rem', color: '#94a3b8', fontSize: '11.5px' }}>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              <span style={{ padding: '0 10px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                o bien
              </span>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            </div>

            {/* Botón Acceso Administrativo (Login Principal) en Verde UPEL */}
            <button 
              type="button"
              onClick={() => window.location.href = '/login'}
              style={{
                width: '100%',
                padding: '11px 16px',
                background: '#f0fdf4',
                border: '1.5px solid #008744',
                borderRadius: '8px',
                color: '#008744',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#008744';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#f0fdf4';
                e.currentTarget.style.color = '#008744';
              }}
            >
              <Building2 size={16} />
              <span>Acceso Administrativo (Autoridades)</span>
            </button>

            {/* Acordeón de Guía y Preguntas Frecuentes */}
            <div style={{ marginTop: '1.25rem', textAlign: 'left' }}>
              <button
                type="button"
                onClick={() => setIsFaqOpen(!isFaqOpen)}
                style={{
                  width: '100%',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: isFaqOpen ? '8px 8px 0 0' : '8px',
                  padding: '9px 12px',
                  color: '#334155',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12.5px',
                  fontWeight: 600
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HelpCircle size={15} color="#0047bb" />
                  <span>Preguntas Frecuentes del Docente</span>
                </div>
                {isFaqOpen ? <ChevronUp size={15} color="#64748b" /> : <ChevronDown size={15} color="#64748b" />}
              </button>

              {isFaqOpen && (
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderTop: 'none',
                  borderRadius: '0 0 8px 8px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {[
                    { q: '🔑 Clave inicial:', a: 'Corresponde a los últimos 4 dígitos de su Cédula.' },
                    { q: '📄 Ficha Oficial:', a: 'Al ingresar, podrá ver su carga y pulsar "Imprimir Ficha" para PDF.' },
                    { q: '⏳ Estatus "Por Revisar":', a: 'Su Departamento está asignando materias para el lapso.' }
                  ].map((item, idx) => (
                    <div key={idx} style={{ fontSize: '11.5px', color: '#475569' }}>
                      <strong style={{ color: '#0047bb' }}>{item.q}</strong> {item.a}
                    </div>
                  ))}
                </div>
              )}
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
  );
};

export default RegistrationAccessCard;
