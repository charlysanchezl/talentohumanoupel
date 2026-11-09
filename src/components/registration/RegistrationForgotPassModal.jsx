import React from 'react';
import { createPortal } from 'react-dom';
import { KeyRound, X, CheckCircle, ShieldAlert, Info, User, Mail, ArrowRight, Loader2 } from 'lucide-react';

export const RegistrationForgotPassModal = ({
  isOpen,
  onClose,
  forgotCedula,
  setForgotCedula,
  forgotEmail,
  setForgotEmail,
  forgotError,
  forgotSuccess,
  isForgotLoading,
  handleRecoverPassword,
  setCedulaInput,
  setPasswordInput
}) => {
  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="upel-modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.78)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      zIndex: 999999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem 1rem',
      overflowY: 'auto'
    }}>
      <div className="animate-fade-in" style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '490px',
        maxHeight: 'calc(100vh - 2.5rem)',
        boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 0, 0, 0.08)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        margin: 'auto'
      }}>
        {/* Cabecera Azul Institucional UPEL */}
        <div style={{
          background: 'linear-gradient(135deg, #0047bb 0%, #002d72 100%)',
          padding: '1.25rem 1.5rem',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#ffffff'
            }}>
              <KeyRound size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em' }}>
                Recuperación de Contraseña
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)' }}>
                Portal Docente · UPEL
              </p>
            </div>
          </div>

          {/* Botón Cerrar */}
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
            title="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div style={{ padding: '1.5rem', color: '#1e293b' }}>
          {forgotSuccess ? (
            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: '#dcfce7', border: '2px solid #86efac',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.25rem auto', color: '#16a34a'
              }}>
                <CheckCircle size={36} />
              </div>
              <h4 style={{ color: '#15803d', fontSize: '19px', fontWeight: 700, marginBottom: '0.75rem' }}>
                ¡Identidad Verificada!
              </h4>
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '10px',
                padding: '1rem 1.15rem',
                color: '#166534',
                fontSize: '13.5px',
                lineHeight: '1.6',
                marginBottom: '1.5rem',
                textAlign: 'left'
              }}>
                {forgotSuccess}
              </div>

              <button
                type="button"
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  background: 'linear-gradient(135deg, #0047bb 0%, #003399 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0, 71, 187, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onClick={() => {
                  if (setCedulaInput) setCedulaInput(forgotCedula.toUpperCase());
                  if (setPasswordInput) setPasswordInput('');
                  onClose();
                }}
              >
                <span>Volver al Ingreso con mi Cédula</span>
                <ArrowRight size={17} />
              </button>
            </div>
          ) : (
            <div>
              {/* Banner informativo */}
              <div style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                color: '#1e40af',
                fontSize: '13px',
                lineHeight: '1.45'
              }}>
                <Info size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#0047bb' }} />
                <span>
                  Ingrese su <strong>Cédula de Identidad</strong> y el <strong>Correo Electrónico</strong> registrado en su ficha para verificar su identidad y restablecer su contraseña de acceso.
                </span>
              </div>

              <form onSubmit={handleRecoverPassword}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Cédula */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                      Cédula de Identidad <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                      <input
                        required
                        type="text"
                        value={forgotCedula}
                        onChange={(e) => setForgotCedula(e.target.value.toUpperCase())}
                        placeholder="Ej. V-12345678"
                        style={{
                          width: '100%',
                          padding: '11px 12px 11px 38px',
                          background: '#ffffff',
                          border: '1.5px solid #cbd5e1',
                          borderRadius: '8px',
                          fontSize: '14px',
                          color: '#0f172a',
                          outline: 'none',
                          boxSizing: 'border-box',
                          transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#0047bb';
                          e.target.style.boxShadow = '0 0 0 3px rgba(0, 71, 187, 0.15)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#cbd5e1';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>

                  {/* Correo Electrónico */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                      Correo Electrónico Registrado <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                      <input
                        required
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="ejemplo@upel.edu.ve o correo personal"
                        style={{
                          width: '100%',
                          padding: '11px 12px 11px 38px',
                          background: '#ffffff',
                          border: '1.5px solid #cbd5e1',
                          borderRadius: '8px',
                          fontSize: '14px',
                          color: '#0f172a',
                          outline: 'none',
                          boxSizing: 'border-box',
                          transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#0047bb';
                          e.target.style.boxShadow = '0 0 0 3px rgba(0, 71, 187, 0.15)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#cbd5e1';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    <span style={{ color: '#64748b', fontSize: '12px', display: 'block', marginTop: '5px' }}>
                      Debe coincidir con el correo personal o institucional de su expediente.
                    </span>
                  </div>

                  {/* Alerta de Error */}
                  {forgotError && (
                    <div className="animate-fade-in" style={{
                      padding: '11px 13px',
                      background: '#fef2f2',
                      border: '1px solid #fca5a5',
                      borderRadius: '8px',
                      color: '#991b1b',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '9px',
                      lineHeight: '1.4'
                    }}>
                      <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '1px', color: '#dc2626' }} />
                      <span>{forgotError}</span>
                    </div>
                  )}

                  {/* Acciones */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={onClose}
                      style={{
                        flex: 1,
                        padding: '11px 14px',
                        fontSize: '14px',
                        fontWeight: 600,
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        background: '#f8fafc',
                        color: '#475569',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#f8fafc'}
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      disabled={isForgotLoading}
                      style={{
                        flex: 1.6,
                        padding: '11px 16px',
                        fontSize: '14px',
                        fontWeight: 700,
                        background: isForgotLoading ? '#94a3b8' : 'linear-gradient(135deg, #0047bb 0%, #003399 100%)',
                        color: '#ffffff',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: isForgotLoading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 14px rgba(0, 71, 187, 0.25)',
                        transition: 'transform 0.1s ease, box-shadow 0.15s ease'
                      }}
                    >
                      {isForgotLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Verificando...</span>
                        </>
                      ) : (
                        <>
                          <span>Restablecer Clave</span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default RegistrationForgotPassModal;
