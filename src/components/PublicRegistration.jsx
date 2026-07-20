import React, { useState } from 'react';
import { getStaffData, createStaff, getRegistrationStatus } from '../data';
import { CheckCircle, ShieldAlert, Clock, Printer } from 'lucide-react';
import PrintableFicha from './PrintableFicha';
import Footer from './Footer';

const PublicRegistration = () => {
  // Steps: 1: Validar Cédula, 2: Formulario, 3: Exito Registro, 4: Ver Estado, 5: Imprimir Ficha
  const [step, setStep] = useState(1); 
  const [cedulaInput, setCedulaInput] = useState('');
  const [errorAuth, setErrorAuth] = useState('');
  const [registeredStaff, setRegisteredStaff] = useState(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);

  React.useEffect(() => {
    setIsRegistrationOpen(getRegistrationStatus());
  }, []);

  // Estado del Formulario
  const [formData, setFormData] = useState({
    department: '',
    apellidos: '', nombres: '', cedula: '', fechaNac: '', rif: '', correo: '', direccion: '', telefonos: '',
    cuentaBancaria: '', banco: '', tipoCuenta: 'Ahorro', titulosPregrado: '', titulosPostgrado: '', doctorado: '',
    categoriaDocente: 'Instructor', dedicacion: 'Tiempo Convencional', 
    periodoAcademico: `${new Date().getFullYear()}-${new Date().getMonth() < 6 ? 'I' : 'II'}`,
    semanas: 15, fechaDesde: '', fechaHasta: '', status: 'Por Revisar'
  });

  const academicPeriods = React.useMemo(() => {
    const year = new Date().getFullYear();
    return [
      `${year}-I`, `${year}-II`,
      `${year + 1}-I`, `${year + 1}-II`,
      `${year + 2}-I`, `${year + 2}-II`
    ];
  }, []);

  const handleValidateCedula = async (e) => {
    e.preventDefault();
    setErrorAuth('');
    
    if (!cedulaInput.trim()) return;
    const inputCed = cedulaInput.trim();
    const inputNumbers = inputCed.replace(/\D/g, ''); // Extraer solo números

    // 1. Verificar si ya está registrado en la BD de Talento Humano
    const staffList = await getStaffData();
    const existingStaff = staffList.find(s => {
      const dbNumbers = String(s.cedula).replace(/\D/g, '');
      return dbNumbers === inputNumbers;
    });

    if (existingStaff) {
      // Si el docente ya existe pero no ha llenado sus datos personales (ej. teléfono vacío)
      if (!existingStaff.telefonos) {
        // Asegurarnos de que los nulls no rompan los inputs controlados
        const cleanStaff = Object.fromEntries(Object.entries(existingStaff).map(([k, v]) => [k, v === null ? '' : v]));
        setFormData({
          ...formData,
          ...cleanStaff
        });
        setStep(2); // Ir al formulario para que complete sus datos
        return;
      }

      setRegisteredStaff(existingStaff);
      setStep(4); // Pantalla de Estado
      return;
    }

    // 2. Si no está registrado, permitimos que se registre como nuevo
    // Le pediremos que elija su departamento en el paso 2
    setFormData({
      ...formData,
      cedula: inputCed,
      department: '' // El usuario deberá seleccionarlo
    });
    setStep(2);
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

    const staffList = await getStaffData();
    const existingIndex = staffList.findIndex(s => s.cedula === formData.cedula);

    if (existingIndex >= 0) {
      // Actualizar registro existente (ej. pre-cargado)
      const updatedStaff = { ...staffList[existingIndex], ...formData };
      
      // Preservar materias o estatus si el Jefe ya las había asignado
      updatedStaff.materias = staffList[existingIndex].materias || [];
      // Si ya estaba Activo (validado por el jefe), mantenerlo Activo. 
      // Si no, pasa de "Por Revisar" a "Por Revisar" (se mantiene igual).
      updatedStaff.status = staffList[existingIndex].status === 'Activo' ? 'Activo' : 'Por Revisar';
      
      await createStaff(updatedStaff);
    } else {
      // Guardar nuevo en la base de datos simulada
      const newStaff = {
        ...formData,
        materias: [],
        id: Date.now().toString()
      };
      await createStaff(newStaff);
    }
    
    // Ya no se requiere remover de autorizados porque se eliminó esa función


    setStep(3);
  };

  if (step === 3) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'url("/fondo.png") no-repeat center center fixed', backgroundSize: 'cover' }}>
        <div className="surface animate-fade-in" style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px', width: '90%' }}>
          <CheckCircle size={64} style={{ color: 'var(--success)', margin: '0 auto 1.5rem auto' }} />
          <h2 style={{ marginBottom: '1rem' }}>¡Registro Exitoso!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Tus datos han sido enviados correctamente a la Unidad de Talento Humano del departamento de <strong>{formData.department}</strong>.
            El Jefe de Departamento validará tu información y completará tu Oferta Académica.
          </p>
          <button className="btn btn-primary" onClick={() => {
            setStep(1);
            setCedulaInput('');
            setFormData({...formData, cedula: '', nombres: '', apellidos: ''});
          }}>Finalizar</button>
        </div>
      </div>
    );
  }

  // Vista de Impresión para el Docente
  if (step === 5 && registeredStaff) {
    return <PrintableFicha staff={registeredStaff} onBack={() => setStep(4)} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'url("/fondo.png") no-repeat center center fixed', backgroundSize: 'cover', padding: '2rem 1rem' }}>
      <div className="surface animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem' }}>
        
        <div style={{ position: 'relative', textAlign: 'center', marginBottom: '3rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '2rem' }}>
          <a href="/login" style={{ position: 'absolute', top: 0, right: 0, textDecoration: 'none', color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-app)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
            Acceso Administrativo
          </a>
          <img src="/logo.jpg" alt="Logo UPEL" style={{ height: '70px', marginBottom: '1rem' }} />
          <div style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            República Bolivariana de Venezuela
          </div>
          <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '2.5rem' }}>UPEL - IPRGR</h1>
          <h2>Unidad de Talento Humano</h2>
          <p className="subtitle">Formulario de Actualización de Datos del Docente Contratado</p>
        </div>

        {/* SI EL REGISTRO ESTÁ CERRADO */}
        {!isRegistrationOpen && (
          <div style={{ maxWidth: '500px', margin: '0 auto', padding: '3rem 2rem', background: 'var(--danger-bg)', borderRadius: 'var(--radius)', border: '1px solid var(--danger)', textAlign: 'center' }}>
            <ShieldAlert size={64} style={{ color: 'var(--danger)', margin: '0 auto 1.5rem auto' }} />
            <h3 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Registro Cerrado Temporalmente</h3>
            <p style={{ color: 'var(--danger)', fontWeight: 500 }}>
              Por motivos de seguridad y confiabilidad de datos, el administrador ha deshabilitado el portal de registro público.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '1.5rem' }}>
              Comuníquese con la Unidad de Talento Humano si necesita registrar su ficha o validar su información.
            </p>
          </div>
        )}

        {step === 1 && isRegistrationOpen && (
          <div style={{ maxWidth: '500px', margin: '0 auto', padding: '2rem', background: 'var(--bg-app)', borderRadius: 'var(--radius)', border: '1px solid var(--border-light)' }}>
            <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Ingreso al Sistema</h3>
            <form onSubmit={handleValidateCedula}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ textAlign: 'center' }}>Por favor, ingrese su Cédula de Identidad</label>
                <input 
                  required 
                  type="text" 
                  value={cedulaInput} 
                  onChange={(e) => setCedulaInput(e.target.value)} 
                  className="filter-input w-full" 
                  style={{ textAlign: 'center', fontSize: '1.2rem', padding: '1rem' }}
                  placeholder="Ej. V-12345678"
                  autoFocus
                />
                <p className="text-muted" style={{ textAlign: 'center', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  Use su cédula para registrarse por primera vez o para consultar el estado de su ficha.
                </p>
              </div>
              
              {errorAuth && (
                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <ShieldAlert size={20} style={{ flexShrink: 0 }} />
                  <span>{errorAuth}</span>
                </div>
              )}

              <button type="submit" className="btn btn-primary w-full" style={{ padding: '1rem', fontSize: '1.1rem' }}>
                Continuar
              </button>
            </form>
          </div>
        )}

        {/* --- ESTADO DEL REGISTRO (Paso 4) --- */}
        {step === 4 && registeredStaff && (
          <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '2rem' }}>Estado de su Ficha: {registeredStaff.nombres} {registeredStaff.apellidos}</h3>
            
            {registeredStaff.status === 'Por Revisar' ? (
              <div style={{ padding: '2rem', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 'var(--radius)' }}>
                <Clock size={48} style={{ color: '#d97706', margin: '0 auto 1rem auto' }} />
                <h4 style={{ color: '#92400e', marginBottom: '0.5rem' }}>En Proceso de Revisión</h4>
                <p style={{ color: '#92400e', fontSize: '0.95rem' }}>
                  Su ficha ha sido recibida por Talento Humano. En este momento, el Jefe del Departamento de <strong>{registeredStaff.department}</strong> debe asignarle su carga académica (Materias). 
                  <br/><br/>Por favor, vuelva a consultar más tarde.
                </p>
              </div>
            ) : (
              <div style={{ padding: '2rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius)' }}>
                <CheckCircle size={48} style={{ color: '#16a34a', margin: '0 auto 1rem auto' }} />
                <h4 style={{ color: '#166534', marginBottom: '0.5rem' }}>¡Ficha Validada!</h4>
                <p style={{ color: '#166534', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                  Su carga académica ha sido asignada y su ficha está completamente lista. 
                  Puede visualizarla o imprimirla en formato PDF para proceder con la firma.
                </p>
                <button className="btn btn-primary" style={{ margin: '0 auto' }} onClick={() => setStep(5)}>
                  <Printer size={18} /> Ver e Imprimir Ficha
                </button>
              </div>
            )}

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => {
                const cleanStaff = Object.fromEntries(Object.entries(registeredStaff).map(([k, v]) => [k, v === null ? '' : v]));
                setFormData({ ...formData, ...cleanStaff });
                setStep(2);
              }}>
                Actualizar mis Datos
              </button>
              <button className="btn btn-outline" onClick={() => { setStep(1); setCedulaInput(''); }}>
                Volver al Inicio
              </button>
            </div>
          </div>
        )}

        {/* --- FORMULARIO DE REGISTRO (Paso 2) --- */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            <div style={{ background: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: 'var(--radius-sm)', textAlign: 'center', fontWeight: 500 }}>
              Por favor complete o actualice su información.
            </div>

            {/* Información del Departamento y Periodo */}
            <section>
               <div style={{ background: 'var(--primary-light)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', maxWidth: '600px', margin: '0 auto' }}>
                    <div>
                      <label className="form-label" style={{ color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>Departamento Académico al que pertenece</label>
                      {formData.department ? (
                        <input 
                          type="text"
                          readOnly
                          value={formData.department}
                          className="filter-input w-full"
                          style={{ fontSize: '1.1rem', padding: '0.8rem', background: '#f1f5f9', cursor: 'not-allowed', color: '#64748b', border: '1px solid #cbd5e1' }}
                        />
                      ) : (
                        <select 
                          required 
                          name="department" 
                          value={formData.department} 
                          onChange={handleInputChange} 
                          className="filter-select w-full"
                          style={{ fontSize: '1.1rem', padding: '0.8rem', background: 'white' }}
                        >
                          <option value="">Seleccione su departamento...</option>
                          <option value="Matemáticas">Matemáticas</option>
                          <option value="Pedagogía">Pedagogía</option>
                          <option value="Agroindustrial">Agroindustrial</option>
                          <option value="Ciencias Sociales">Ciencias Sociales</option>
                        </select>
                      )}
                    </div>
                    <div>
                      <label className="form-label" style={{ color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>Período Académico</label>
                      <input 
                        type="text"
                        readOnly
                        value={formData.periodoAcademico}
                        className="filter-input w-full"
                        style={{ fontSize: '1.1rem', padding: '0.8rem', background: '#f1f5f9', cursor: 'not-allowed', color: '#64748b', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  </div>
               </div>
            </section>

            {/* Datos Personales */}
            <section style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ borderBottom: '2px solid var(--primary-light)', paddingBottom: '0.75rem', marginBottom: '2rem', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                👤 DATOS PERSONALES
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {/* Fila 1 */}
                <div>
                  <label className="form-label">Apellidos</label>
                  <input required type="text" name="apellidos" value={formData.apellidos} onChange={handleInputChange} className="filter-input w-full" />
                </div>
                <div>
                  <label className="form-label">Nombres</label>
                  <input required type="text" name="nombres" value={formData.nombres} onChange={handleInputChange} className="filter-input w-full" />
                </div>

                {/* Fila 2 */}
                <div>
                  <label className="form-label">Cédula de Identidad</label>
                  <input required type="text" readOnly name="cedula" value={formData.cedula} className="filter-input w-full" style={{ background: '#f1f5f9', color: '#64748b', cursor: 'not-allowed', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label className="form-label">Fecha de Nacimiento</label>
                  <input required type="date" name="fechaNac" value={formData.fechaNac} onChange={handleInputChange} className="filter-input w-full" />
                </div>

                {/* Fila 3 */}
                <div>
                  <label className="form-label">RIF</label>
                  <input required type="text" name="rif" value={formData.rif} onChange={handleInputChange} className="filter-input w-full" placeholder="Ej. V-12345678-9" />
                </div>
                <div>
                  <label className="form-label">Correo Electrónico</label>
                  <input required type="email" name="correo" value={formData.correo} onChange={handleInputChange} className="filter-input w-full" placeholder="Ej. docente@correo.com" />
                </div>
                <div>
                  <label className="form-label">Teléfonos</label>
                  <input required type="text" name="telefonos" value={formData.telefonos} onChange={handleInputChange} className="filter-input w-full" placeholder="Ej. 0414-1234567" />
                </div>

                {/* Fila 4 (Ancha) */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Dirección de Habitación</label>
                  <input required type="text" name="direccion" value={formData.direccion} onChange={handleInputChange} className="filter-input w-full" />
                </div>
              </div>

              <h4 style={{ marginTop: '2.5rem', marginBottom: '1.5rem', color: 'var(--primary)', fontSize: '1.1rem' }}>Información Bancaria</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', background: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid #e2e8f0' }}>
                <div>
                  <label className="form-label">Banco</label>
                  <select name="banco" value={formData.banco} onChange={handleInputChange} className="filter-select w-full" required>
                    <option value="">Seleccione un banco...</option>
                    <option value="Banco de Venezuela">Banco de Venezuela</option>
                    <option value="Banesco">Banesco</option>
                    <option value="Banco Mercantil">Banco Mercantil</option>
                    <option value="BBVA Provincial">BBVA Provincial</option>
                    <option value="Banco Nacional de Crédito (BNC)">Banco Nacional de Crédito (BNC)</option>
                    <option value="Bancaribe">Bancaribe</option>
                    <option value="Banco Exterior">Banco Exterior</option>
                    <option value="Banco del Tesoro">Banco del Tesoro</option>
                    <option value="Bancamiga">Bancamiga</option>
                    <option value="Banplus">Banplus</option>
                    <option value="Banco Plaza">Banco Plaza</option>
                    <option value="100% Banco">100% Banco</option>
                    <option value="Banco Fondo Común (BFC)">Banco Fondo Común (BFC)</option>
                    <option value="Banco Activo">Banco Activo</option>
                    <option value="Banco Caroní">Banco Caroní</option>
                    <option value="Banco Sofitasa">Banco Sofitasa</option>
                    <option value="Banco Digital de los Trabajadores">Banco Digital de los Trabajadores</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Tipo Cuenta</label>
                  <select name="tipoCuenta" value={formData.tipoCuenta} onChange={handleInputChange} className="filter-select w-full">
                    <option value="Ahorro">Ahorro</option>
                    <option value="Corriente">Corriente</option>
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Nro. de Cuenta Bancaria</label>
                  <input required type="text" name="cuentaBancaria" value={formData.cuentaBancaria} onChange={handleInputChange} className="filter-input w-full" maxLength="20" placeholder="Ingrese los 20 dígitos de su cuenta" style={{ letterSpacing: '2px', fontFamily: 'monospace', fontSize: '1.1rem' }} />
                </div>
              </div>
            </section>

            {/* Datos Académicos */}
            <section style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ borderBottom: '2px solid var(--primary-light)', paddingBottom: '0.75rem', marginBottom: '2rem', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🎓 PERFIL ACADÉMICO
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Títulos de Pregrado</label>
                  <input required type="text" name="titulosPregrado" value={formData.titulosPregrado} onChange={handleInputChange} className="filter-input w-full" placeholder="Ej. Lcdo. en Educación Mención Matemáticas" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Títulos de Postgrado</label>
                  <input type="text" name="titulosPostgrado" value={formData.titulosPostgrado || ''} onChange={handleInputChange} className="filter-input w-full" placeholder="Si no posee, deje en blanco" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Doctorado</label>
                  <input type="text" name="doctorado" value={formData.doctorado || ''} onChange={handleInputChange} className="filter-input w-full" placeholder="Si no posee, deje en blanco" />
                </div>
                <div>
                  <label className="form-label">Categoría Docente</label>
                  <input required type="text" name="categoriaDocente" value={formData.categoriaDocente} onChange={handleInputChange} className="filter-input w-full" placeholder="Ej. INSTRUCTOR" />
                </div>
                <div>
                  <label className="form-label">Dedicación</label>
                  <input required type="text" name="dedicacion" value={formData.dedicacion} onChange={handleInputChange} className="filter-input w-full" placeholder="Ej. TIEMPO CONVENCIONAL" />
                </div>
              </div>
            </section>

            <div style={{ padding: '2rem', background: '#f8fafc', border: '1px dashed var(--border-light)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                <em>Nota: La asignación de materias (Oferta Académica) será validada por el Jefe de Departamento. Podrás imprimir tu ficha luego de la validación.</em>
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem', gap: '1rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>
                Atrás
              </button>
              <button type="submit" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
                Enviar Mis Datos
              </button>
            </div>
            
          </form>
        )}

      </div>
      
      <Footer />
      
      <style>{`
        .w-full { width: 100%; }
        .form-label { display: block; margin-bottom: 0.5rem; font-size: 0.85rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.03em; }
      `}</style>
    </div>
  );
};

export default PublicRegistration;
