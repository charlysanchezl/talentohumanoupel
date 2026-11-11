import React, { useState, useEffect } from 'react';
import { 
  getRegistrationStatus, 
  getAcademicPeriodsList, 
  getLoginBgConfig, 
  isExpedienteCompleto 
} from '../data';
import { ShieldAlert } from 'lucide-react';
import PrintableFicha from './PrintableFicha';
import MaintenanceLockscreen from './MaintenanceLockscreen';

// Subcomponentes modulares de Portal Docente y Wizard de Registro
import RegistrationFloatingMenu from './registration/RegistrationFloatingMenu';
import RegistrationHeader from './registration/RegistrationHeader';
import RegistrationFooter from './registration/RegistrationFooter';
import RegistrationAccessCard from './registration/RegistrationAccessCard';
import RegistrationForgotPassModal from './registration/RegistrationForgotPassModal';
import RegistrationFirstLoginModal from './registration/RegistrationFirstLoginModal';
import RegistrationStatusView from './registration/RegistrationStatusView';
import RegistrationSuccessCard from './registration/RegistrationSuccessCard';
import RegistrationWizard from './registration/wizard/RegistrationWizard';

const PublicRegistration = () => {
  // Steps: 1: Validar Cédula, 2: Formulario, 3: Exito Registro, 4: Ver Estado, 5: Imprimir Ficha, 6: Primer Ingreso Clave
  const [step, setStep] = useState(1); 
  const [formStep, setFormStep] = useState(1);
  const [cedulaInput, setCedulaInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [firstLoginError, setFirstLoginError] = useState('');
  
  // Modal de recuperación de contraseña
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotCedula, setForgotCedula] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  // Estados de autenticación y carga
  const [errorAuth, setErrorAuth] = useState('');
  const [portalToken, setPortalToken] = useState(() => (typeof window !== 'undefined' ? sessionStorage.getItem('upel_portal_token') || '' : ''));
  const [registeredStaff, setRegisteredStaff] = useState(null);
  const [fichasLapsos, setFichasLapsos] = useState([]);
  const [selectedLapso, setSelectedLapso] = useState('');
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [validatingName, setValidatingName] = useState('');
  const [isSendFichaModalOpen, setIsSendFichaModalOpen] = useState(false);

  // Fondo institucional
  const [bgImage, setBgImage] = useState('/universidad.jpeg');
  const [bgOpacity, setBgOpacity] = useState(0.55);

  // Formulario Docente
  const [formData, setFormData] = useState({
    department: '',
    apellidos: '', nombres: '', cedula: '', fechaNac: '', rif: '', correo: '', correoInstitucional: '', direccion: '', telefonos: '',
    cuentaBancaria: '', banco: '', tipoCuenta: 'Ahorro', titulosPregrado: '', titulosPostgrado: '', doctorado: '',
    categoriaDocente: 'Instructor', dedicacion: 'Tiempo Convencional', 
    periodoAcademico: `${new Date().getFullYear()}-${new Date().getMonth() < 6 ? 'I' : 'II'}`,
    semanas: 15, fechaDesde: '', fechaHasta: '', status: 'Por Revisar',
    sedeCentro: 'Rubio',
    clave: ''
  });

  useEffect(() => {
    getLoginBgConfig().then(cfg => {
      if (cfg) {
        if (cfg.bgUrl) setBgImage(cfg.bgUrl);
        if (cfg.opacity !== undefined) setBgOpacity(cfg.opacity);
      }
    });
  }, []);

  // Estado de Mantenimiento Institucional
  const [maintenanceConfig, setMaintenanceConfig] = useState(() => {
    try {
      const cached = localStorage.getItem('upel_maintenance_mode');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    fetch('/api/backup/maintenance-mode')
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        if (data.success && data.config) {
          setMaintenanceConfig(data.config);
          localStorage.setItem('upel_maintenance_mode', JSON.stringify(data.config));
        }
      })
      .catch(() => {});

    const handleUpdate = (e) => {
      if (e.detail) {
        setMaintenanceConfig(e.detail);
        localStorage.setItem('upel_maintenance_mode', JSON.stringify(e.detail));
      }
    };
    window.addEventListener('upel_maintenance_mode_changed', handleUpdate);
    return () => window.removeEventListener('upel_maintenance_mode_changed', handleUpdate);
  }, []);

  useEffect(() => {
    setIsRegistrationOpen(getRegistrationStatus());
    getAcademicPeriodsList().then(periods => {
      const active = (periods || []).find(p => p.estado === 'ACTIVO');
      if (active) {
        setFormData(prev => ({
          ...prev,
          periodoAcademico: active.nombre
        }));
      }
    }).catch(err => console.error(err));
  }, []);

  const resetAccessState = () => {
    setStep(1);
    setCedulaInput('');
    setPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    setFirstLoginError('');
    setFichasLapsos([]);
    setSelectedLapso('');
    setPortalToken('');
    if (typeof window !== 'undefined') sessionStorage.removeItem('upel_portal_token');
  };

  const handleValidateCedula = async (e) => {
    e.preventDefault();
    setErrorAuth('');
    
    if (!cedulaInput.trim()) return;
    const inputCed = cedulaInput.trim();
    const inputNumbers = inputCed.replace(/\D/g, '');

    if (!inputNumbers) {
      setErrorAuth('Por favor ingrese un número de cédula válido.');
      return;
    }

    if (!passwordInput.trim()) {
      setErrorAuth('Por favor ingrese su contraseña de acceso.');
      return;
    }

    let existingStaff = null;
    let isFirstTime = false;

    try {
      const res = await fetch('/api/docentes/validar-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cedula: inputCed, password: passwordInput.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        existingStaff = data.staff;
        isFirstTime = !!data.isFirstTime;
        if (data.portalToken) {
          setPortalToken(data.portalToken);
          if (typeof window !== 'undefined') sessionStorage.setItem('upel_portal_token', data.portalToken);
        }
        if (data.fichasLapsos && Array.isArray(data.fichasLapsos) && data.fichasLapsos.length > 0) {
          setFichasLapsos(data.fichasLapsos);
          const firstValidated = data.fichasLapsos.find(l => l.validadoPorJefe);
          setSelectedLapso(firstValidated ? firstValidated.periodo : data.fichasLapsos[0].periodo);
        }
      } else if (data.message) {
        setErrorAuth(data.message);
        return;
      }
    } catch {
      setErrorAuth('No se pudo conectar con el servidor para validar sus credenciales. Intente nuevamente.');
      return;
    }

    if (existingStaff) {
      setValidatingName(`${existingStaff.nombres} ${existingStaff.apellidos}`);
      setIsValidating(true);
      
      setTimeout(() => {
        setIsValidating(false);
        setRegisteredStaff(existingStaff);

        if (isFirstTime) {
          setNewPasswordInput('');
          setConfirmPasswordInput('');
          setFirstLoginError('');
          setStep(6);
        } else if (!isExpedienteCompleto(existingStaff)) {
          const cleanStaff = Object.fromEntries(Object.entries(existingStaff).map(([k, v]) => [k, v === null ? '' : v]));
          setFormData({
            ...formData,
            ...cleanStaff
          });
          setStep(2);
        } else {
          setStep(4);
        }
      }, 1800);
      return;
    }

    setErrorAuth('Cédula no encontrada. Su Jefe de Departamento debe registrarlo en el sistema antes de que pueda llenar su ficha.');
  };

  const handleFirstLoginPasswordChange = async (e) => {
    e.preventDefault();
    setFirstLoginError('');

    if (!newPasswordInput || newPasswordInput.trim().length < 4) {
      setFirstLoginError('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (newPasswordInput.trim() !== confirmPasswordInput.trim()) {
      setFirstLoginError('Las contraseñas no coinciden. Por favor verifíquelas.');
      return;
    }

    const cleanPass = newPasswordInput.trim();
    const activeToken = portalToken || (typeof window !== 'undefined' ? sessionStorage.getItem('upel_portal_token') : '') || '';
    try {
      const res = await fetch('/api/docentes/cambiar-clave-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {})
        },
        body: JSON.stringify({ cedula: registeredStaff.cedula, newPassword: cleanPass })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFirstLoginError(data.message || 'No se pudo actualizar la contraseña en el servidor. Intente nuevamente.');
        return;
      }
    } catch (netErr) {
      setFirstLoginError('No se pudo conectar con el servidor para actualizar la contraseña. Intente nuevamente.');
      return;
    }

    const updated = {
      ...registeredStaff
    };

    setRegisteredStaff(updated);

    if (!isExpedienteCompleto(updated)) {
      const cleanStaff = Object.fromEntries(Object.entries(updated).map(([k, v]) => [k, v === null ? '' : v]));
      setFormData({
        ...formData,
        ...cleanStaff
      });
      setStep(2);
    } else {
      setStep(4);
    }
  };

  const handleSkipPasswordChange = () => {
    if (!isExpedienteCompleto(registeredStaff)) {
      const cleanStaff = Object.fromEntries(Object.entries(registeredStaff).map(([k, v]) => [k, v === null ? '' : v]));
      setFormData({
        ...formData,
        ...cleanStaff
      });
      setStep(2);
    } else {
      setStep(4);
    }
  };

  const handleRecoverPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    const inputCed = forgotCedula.trim().replace(/\D/g, '');
    const inputMail = forgotEmail.trim().toLowerCase();

    if (!inputCed) {
      setForgotError('Por favor ingrese su número de cédula.');
      return;
    }
    if (!inputMail) {
      setForgotError('Por favor ingrese su correo electrónico registrado.');
      return;
    }

    setIsForgotLoading(true);
    try {
      const res = await fetch('/api/docentes/recuperar-clave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cedula: inputCed, email: inputMail })
      });
      const data = await res.json();
      setIsForgotLoading(false);
      if (res.ok && data.success) {
        setForgotSuccess(data.message);
      } else {
        setForgotError(data.message || 'No se pudo validar la solicitud de recuperación.');
      }
    } catch {
      setIsForgotLoading(false);
      setForgotError('Ocurrió un error al conectar con el servidor. Intente nuevamente.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'cuentaBancaria') {
      const onlyNums = value.replace(/\D/g, '');
      if (onlyNums.length <= 20) {
        setFormData({ ...formData, [name]: onlyNums });
      }
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formStep === 1 && (!formData.department || formData.department.trim() === '')) {
      alert('Por favor seleccione al menos un departamento académico al que pertenece.');
      return;
    }

    if (formStep < 4) {
      setFormStep(formStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Validación de RIF
    const rifRegex = /^[VEJGvejg]-\d{7,9}-?\d?$/i;
    if (formData.rif && !rifRegex.test(formData.rif)) {
      alert('El formato del RIF es inválido. Por favor use el formato V-12345678-9 o similar.');
      return;
    }

    // Validación de Edad Mínima (18 años)
    if (formData.fechaNac) {
      const birthDate = new Date(formData.fechaNac);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        alert('Debe ser mayor de 18 años para registrarse como docente en el sistema.');
        return;
      }
    }

    // Validación de Cuenta Bancaria
    if (formData.cuentaBancaria && formData.cuentaBancaria.length !== 20) {
      alert('El número de cuenta bancaria debe tener exactamente 20 dígitos.');
      return;
    }

    const baseStaff = registeredStaff || {};
    const updatedStaff = {
      ...baseStaff,
      ...formData,
      materias: baseStaff.materias || [],
      department: baseStaff.department || formData.department,
      sedeCentro: baseStaff.sedeCentro || formData.sedeCentro,
      periodoAcademico: baseStaff.periodoAcademico || formData.periodoAcademico,
      status: baseStaff.status === 'Activo' ? 'Activo' : 'Por Revisar'
    };

    const activeToken = portalToken || (typeof window !== 'undefined' ? sessionStorage.getItem('upel_portal_token') : '') || '';
    try {
      const res = await fetch('/api/docentes/portal-actualizar-ficha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {})
        },
        body: JSON.stringify(updatedStaff)
      });
      const resData = await res.json().catch(() => ({}));
      if (!res.ok || !resData.success) {
        alert(resData.message || resData.error || 'No se pudo actualizar su ficha en el servidor. Inicie sesión nuevamente en el portal.');
        return;
      }
      setRegisteredStaff(updatedStaff);
      setStep(3);
    } catch (err) {
      console.warn('Error al sincronizar ficha con el backend:', err);
      alert('Error de conexión con el servidor al guardar la ficha. Por favor intente nuevamente.');
    }
  };

  // BLOQUEO ESTRICTO POR MODO MANTENIMIENTO
  if (maintenanceConfig?.enabled && maintenanceConfig?.strictLockout) {
    return (
      <MaintenanceLockscreen 
        config={maintenanceConfig}
        onRefresh={async () => {
          try {
            const res = await fetch('/api/backup/maintenance-mode');
            const data = await res.json();
            if (data.success && data.config) {
              setMaintenanceConfig(data.config);
              localStorage.setItem('upel_maintenance_mode', JSON.stringify(data.config));
              if (!data.config.enabled || !data.config.strictLockout) {
                window.location.reload();
              }
            }
          } catch (e) {
            window.location.reload();
          }
        }}
      />
    );
  }

  // Paso 3: Pantalla de Registro Exitoso
  if (step === 3) {
    return (
      <RegistrationSuccessCard 
        department={formData.department}
        onFinish={() => {
          setStep(1);
          setCedulaInput('');
          setPasswordInput('');
          setNewPasswordInput('');
          setConfirmPasswordInput('');
          setFirstLoginError('');
          setFormData({...formData, cedula: '', nombres: '', apellidos: '', clave: ''});
        }}
      />
    );
  }

  // Paso 5: Vista de Impresión para el Docente
  if (step === 5 && registeredStaff) {
    return <PrintableFicha staff={registeredStaff} onBack={() => setStep(4)} />;
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: `linear-gradient(135deg, rgba(0, 32, 77, ${bgOpacity}) 0%, rgba(10, 25, 47, ${Math.min(Number(bgOpacity) + 0.15, 0.95)}) 100%), url("${bgImage}") center/cover no-repeat fixed`,
      fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif',
      position: 'relative'
    }}>
      {/* Botones Flotantes del Lateral Izquierdo Oficiales UPEL */}
      <RegistrationFloatingMenu />

      {/* Barra Principal Oficial UPEL (#masthead) */}
      <RegistrationHeader />

      {/* Contenedor Principal */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: step === 1 ? 'center' : 'flex-start',
        padding: step === 1 ? '2rem 1rem 3.5rem' : '1.5rem 1rem 3rem',
        width: '100%',
        position: 'relative'
      }}>
        {/* Banner si el registro está cerrado */}
        {!isRegistrationOpen && (
          <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '2.5rem 2rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #fecaca', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', textAlign: 'center' }}>
            <ShieldAlert size={56} style={{ color: '#dc2626', margin: '0 auto 1.2rem auto' }} />
            <h3 style={{ color: '#991b1b', marginBottom: '0.75rem', fontSize: '18px', fontWeight: 800 }}>Registro Cerrado Temporalmente</h3>
            <p style={{ color: '#475569', fontSize: '13.5px', lineHeight: '1.5' }}>
              Por motivos de seguridad y auditoría de datos, la Subdirección de Docencia ha restringido temporalmente las actualizaciones de ficha.
            </p>
            <p style={{ color: '#64748b', fontSize: '12px', marginTop: '1.2rem' }}>
              Comuníquese con la Subdirección de Docencia o Jefatura de Departamento si requiere asistencia.
            </p>
          </div>
        )}

        {/* PASO 1: TARJETA INSTITUCIONAL DEL PORTAL DOCENTE */}
        {step === 1 && isRegistrationOpen && (
          <RegistrationAccessCard 
            cedulaInput={cedulaInput}
            setCedulaInput={setCedulaInput}
            passwordInput={passwordInput}
            setPasswordInput={setPasswordInput}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            errorAuth={errorAuth}
            isValidating={isValidating}
            validatingName={validatingName}
            handleValidateCedula={handleValidateCedula}
            setIsForgotModalOpen={setIsForgotModalOpen}
            setForgotCedula={setForgotCedula}
            setForgotEmail={setForgotEmail}
            setForgotError={setForgotError}
            setForgotSuccess={setForgotSuccess}
          />
        )}

        <div className="animate-fade-in" style={{ position: 'relative', zIndex: 10, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: step === 1 ? '0' : '1rem' }}>
          {step > 1 && (
            <div style={{ position: 'relative', textAlign: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '1.5rem' }}>
              <img src="/logo.jpg" alt="Logo UPEL" style={{ height: '70px', marginBottom: '1rem', borderRadius: '50%', boxShadow: '0 4px 16px rgba(0,0,0,0.3)', background: '#ffffff', padding: '3px' }} />
              <div style={{ fontWeight: '800', fontSize: '1.1rem', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'white', textShadow: '1px 1px 4px rgba(0,0,0,0.6)' }}>
                República Bolivariana de Venezuela
              </div>
              <h1 style={{ color: 'white', marginBottom: '0.3rem', fontSize: '2.4rem', textShadow: '2px 2px 6px rgba(0,0,0,0.6)' }}>UPEL - IPRGR</h1>
              <h2 style={{ color: 'rgba(255,255,255,0.95)', textShadow: '1px 1px 4px rgba(0,0,0,0.6)', fontSize: '1.4rem' }}>Subdirección de Docencia</h2>
              <p className="subtitle" style={{ color: 'white', textShadow: '1px 1px 4px rgba(0,0,0,0.6)', fontSize: '1rem' }}>Actualización de Datos del Docente Contratado</p>
            </div>
          )}

          {/* PASO 6: PRIMER INGRESO - CAMBIO DE CONTRASEÑA */}
          {step === 6 && registeredStaff && (
            <RegistrationFirstLoginModal 
              registeredStaff={registeredStaff}
              showNewPass={showNewPass}
              setShowNewPass={setShowNewPass}
              newPasswordInput={newPasswordInput}
              setNewPasswordInput={setNewPasswordInput}
              confirmPasswordInput={confirmPasswordInput}
              setConfirmPasswordInput={setConfirmPasswordInput}
              firstLoginError={firstLoginError}
              handleFirstLoginPasswordChange={handleFirstLoginPasswordChange}
              handleSkipPasswordChange={handleSkipPasswordChange}
            />
          )}

          {/* PASO 4: ESTADO DEL REGISTRO */}
          {step === 4 && registeredStaff && (
            <RegistrationStatusView 
              registeredStaff={registeredStaff}
              setRegisteredStaff={setRegisteredStaff}
              fichasLapsos={fichasLapsos}
              selectedLapso={selectedLapso}
              setSelectedLapso={setSelectedLapso}
              setFormData={setFormData}
              formData={formData}
              setFormStep={setFormStep}
              setStep={setStep}
              isSendFichaModalOpen={isSendFichaModalOpen}
              setIsSendFichaModalOpen={setIsSendFichaModalOpen}
              resetAccessState={resetAccessState}
            />
          )}

          {/* PASO 2: FORMULARIO WIZARD */}
          {step === 2 && (
            <RegistrationWizard 
              formStep={formStep}
              setFormStep={setFormStep}
              formData={formData}
              setFormData={setFormData}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              registeredStaff={registeredStaff}
              setStep={setStep}
              setCedulaInput={setCedulaInput}
            />
          )}
        </div>
      </main>
      
      {/* Pie de Página Oficial UPEL */}
      <RegistrationFooter />

      {/* Modal: Recuperación de Contraseña */}
      <RegistrationForgotPassModal 
        isOpen={isForgotModalOpen}
        onClose={() => { setIsForgotModalOpen(false); setForgotSuccess(''); setForgotError(''); }}
        forgotCedula={forgotCedula}
        setForgotCedula={setForgotCedula}
        forgotEmail={forgotEmail}
        setForgotEmail={setForgotEmail}
        forgotError={forgotError}
        setForgotError={setForgotError}
        forgotSuccess={forgotSuccess}
        setForgotSuccess={setForgotSuccess}
        isForgotLoading={isForgotLoading}
        handleRecoverPassword={handleRecoverPassword}
        setCedulaInput={setCedulaInput}
        setPasswordInput={setPasswordInput}
      />

      <style>{`
        .w-full { width: 100%; }
        .form-label { display: block; margin-bottom: 0.45rem; font-size: 13px; font-weight: 600; color: #1e293b; }
        .w11-input, .w11-select {
          width: 100%; padding: 11px 14px; background: #ffffff; border: 1.5px solid #cbd5e1;
          border-radius: 8px; font-size: 14.5px; color: #0f172a; outline: none; transition: all 0.2s;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03); font-weight: 500;
        }
        .w11-input:focus, .w11-select:focus { 
          border-color: #0047bb; 
          box-shadow: 0 0 0 3px rgba(0, 71, 187, 0.15); 
          background: #ffffff; 
        }
        .w11-btn {
          background: #0047bb; color: #ffffff; border: none; padding: 11px 26px;
          border-radius: 8px; font-size: 14.5px; font-weight: 700; cursor: pointer; transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(0, 71, 187, 0.25);
        }
        .w11-btn:hover { background: #00368b; transform: translateY(-1px); }
        .w11-btn:active { transform: translateY(0); }
        .w11-btn-outline {
          background: #f8fafc; color: #334155; border: 1.5px solid #cbd5e1; padding: 11px 26px;
          border-radius: 8px; font-size: 14.5px; font-weight: 700; cursor: pointer; transition: all 0.2s;
        }
        .w11-btn-outline:hover { background: #e2e8f0; color: #0f172a; }
        option { color: #0f172a; background: #ffffff; }
      `}</style>
    </div>
  );
};

export default PublicRegistration;
