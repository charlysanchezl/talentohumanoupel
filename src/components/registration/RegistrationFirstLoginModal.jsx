import React from 'react';
import { KeyRound, Eye, EyeOff, ShieldAlert, ArrowRight } from 'lucide-react';

export const RegistrationFirstLoginModal = ({
  registeredStaff,
  showNewPass,
  setShowNewPass,
  newPasswordInput,
  setNewPasswordInput,
  confirmPasswordInput,
  setConfirmPasswordInput,
  firstLoginError,
  handleFirstLoginPasswordChange,
  handleSkipPasswordChange
}) => {
  if (!registeredStaff) return null;

  return (
    <div className="animate-fade-in" style={{ 
      maxWidth: '500px', 
      margin: '4vh auto 0 auto', 
      padding: '2.5rem 2rem', 
      background: '#ffffff', 
      borderRadius: '16px', 
      boxShadow: '0 20px 50px rgba(0,0,0,0.25)', 
      border: '1px solid #e2e8f0', 
      color: '#0f172a', 
      textAlign: 'center' 
    }}>
      <div style={{ marginBottom: '22px' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: '#eff6ff', border: '2px solid #0047bb',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.25rem auto', color: '#0047bb'
        }}>
          <KeyRound size={32} />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
          Actualización de Seguridad
        </h2>
        <p style={{ fontSize: '14px', color: '#475569', margin: 0, fontWeight: 500 }}>
          Bienvenido(a), <strong style={{ color: '#0f172a' }}>{registeredStaff.nombres} {registeredStaff.apellidos}</strong>
        </p>
        <div style={{ marginTop: '14px', padding: '12px 14px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '13px', color: '#1e40af', textAlign: 'left', lineHeight: '1.45', fontWeight: 500 }}>
          🔒 <strong>Primer ingreso:</strong> Por motivos de seguridad y resguardo de sus datos personales y bancarios, por favor establezca una nueva contraseña personal para el ingreso al portal.
        </div>
      </div>

      <form onSubmit={handleFirstLoginPasswordChange}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
              Nueva Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                required 
                type={showNewPass ? 'text' : 'password'} 
                value={newPasswordInput} 
                onChange={(e) => setNewPasswordInput(e.target.value)} 
                className="w11-input"
                style={{ width: '100%', paddingRight: '42px', paddingLeft: '14px', paddingTop: '10px', paddingBottom: '10px', letterSpacing: showNewPass ? '1px' : '2px', background: '#ffffff', color: '#0f172a', border: '1.5px solid #cbd5e1' }}
                placeholder="Mínimo 4 caracteres"
                autoFocus
              />
              <button 
                type="button" 
                onClick={() => setShowNewPass(!showNewPass)}
                style={{
                  position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px',
                  color: '#64748b', borderRadius: '4px'
                }}
                title={showNewPass ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
              Confirmar Nueva Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                required 
                type={showNewPass ? 'text' : 'password'} 
                value={confirmPasswordInput} 
                onChange={(e) => setConfirmPasswordInput(e.target.value)} 
                className="w11-input"
                style={{ width: '100%', paddingRight: '42px', paddingLeft: '14px', paddingTop: '10px', paddingBottom: '10px', letterSpacing: showNewPass ? '1px' : '2px', background: '#ffffff', color: '#0f172a', border: '1.5px solid #cbd5e1' }}
                placeholder="Repita la nueva contraseña"
              />
            </div>
          </div>

          {firstLoginError && (
            <div className="animate-fade-in" style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
              <ShieldAlert size={18} style={{ flexShrink: 0, color: '#dc2626' }} />
              <span>{firstLoginError}</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <button 
              type="submit" 
              className="w11-btn"
              style={{
                width: '100%', padding: '12px', fontSize: '15px', fontWeight: 700,
                background: '#0047bb', color: 'white', border: 'none', borderRadius: '8px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: '0 4px 12px rgba(0, 71, 187, 0.25)',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#00368b'}
              onMouseOut={(e) => e.currentTarget.style.background = '#0047bb'}
            >
              <span>Guardar Contraseña y Continuar</span>
              <ArrowRight size={18} />
            </button>

            <button 
              type="button" 
              onClick={handleSkipPasswordChange}
              style={{
                width: '100%', padding: '10px', fontSize: '13.5px',
                color: '#475569', border: '1.5px solid #cbd5e1',
                borderRadius: '8px', cursor: 'pointer', background: '#f8fafc', fontWeight: 600
              }}
            >
              Continuar con la clave por defecto
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegistrationFirstLoginModal;
