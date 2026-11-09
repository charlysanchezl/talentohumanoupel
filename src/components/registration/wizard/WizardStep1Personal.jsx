import React from 'react';
import { Lock, BookOpen, Building, Calendar, User } from 'lucide-react';
import GeminiDocumentScanner from '../../common/GeminiDocumentScanner';

export const WizardStep1Personal = ({ formData, setFormData, handleInputChange }) => {
  const handleScanPersonal = (data) => {
    if (!setFormData || !data) return;
    setFormData(prev => ({
      ...prev,
      apellidos: data.apellidos || prev.apellidos,
      nombres: data.nombres || prev.nombres,
      fechaNac: data.fechaNacimiento || prev.fechaNac,
      rif: data.rif || (data.cedulaNumero ? `V-${data.cedulaNumero}-0` : prev.rif)
    }));
  };
  return (
    <>
      <div style={{ background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', padding: '0.9rem', borderRadius: '10px', textAlign: 'center', fontWeight: 700, fontSize: '15px' }}>
        Paso 1: Datos Básicos y Contacto Personal
      </div>

      {/* Información de Adscripción Institucional (Bloqueada por Asignación Oficial UPEL) */}
      <section>
        <div style={{ background: '#ffffff', padding: '1.75rem 2rem', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.2rem', color: '#0047bb', fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            <Lock size={16} color="#0047bb" /> Asignación Institucional Oficial (UPEL)
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', maxWidth: '750px', margin: '0 auto', textAlign: 'left' }}>
            {/* Departamento */}
            <div style={{ background: '#f8fafc', padding: '0.9rem 1.1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem', fontWeight: 700 }}>
                Departamento Académico
              </span>
              <div style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <BookOpen size={17} color="#0047bb" />
                <span>{formData.department || 'Sin Asignar'}</span>
              </div>
            </div>

            {/* Sede / Centro */}
            <div style={{ background: '#f8fafc', padding: '0.9rem 1.1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem', fontWeight: 700 }}>
                Sede / Centro de Atención
              </span>
              <div style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Building size={17} color="#008744" />
                <span>{formData.sedeCentro || 'Rubio'}</span>
              </div>
            </div>

            {/* Período Académico */}
            <div style={{ background: '#f8fafc', padding: '0.9rem 1.1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem', fontWeight: 700 }}>
                Período Académico
              </span>
              <div style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={17} color="#d97706" />
                <span>{formData.periodoAcademico || '2026-I'}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '0.9rem', fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontWeight: 500 }}>
            <Lock size={13} color="#94a3b8" /> 
            <span>Estos datos han sido asignados oficialmente por su Jefatura de Departamento y no son modificables desde este portal.</span>
          </div>
        </div>
      </section>

      {/* Datos Personales */}
      <section style={{ background: '#ffffff', padding: '2rem 2.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 6px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h3 style={{ margin: 0, color: '#0047bb', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 800, fontSize: '18px' }}>
            <User size={20} color="#0047bb" /> DATOS PERSONALES
          </h3>
          <GeminiDocumentScanner 
            onApply={handleScanPersonal}
            documentHint="cedula"
            buttonLabel="Escanear Cédula con IA"
          />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div>
            <label className="form-label">Apellidos</label>
            <input required type="text" name="apellidos" value={formData.apellidos} onChange={handleInputChange} className="w11-input w-full" />
          </div>
          <div>
            <label className="form-label">Nombres</label>
            <input required type="text" name="nombres" value={formData.nombres} onChange={handleInputChange} className="w11-input w-full" />
          </div>

          <div>
            <label className="form-label">Cédula de Identidad (Bloqueada)</label>
            <input required type="text" readOnly name="cedula" value={formData.cedula} className="w11-input w-full" style={{ background: '#f1f5f9', color: '#475569', cursor: 'not-allowed', border: '1.5px solid #cbd5e1', fontWeight: 600 }} />
          </div>
          <div>
            <label className="form-label">Fecha de Nacimiento</label>
            <input required type="date" name="fechaNac" value={formData.fechaNac} onChange={handleInputChange} className="w11-input w-full" />
          </div>

          <div>
            <label className="form-label">RIF</label>
            <input required type="text" name="rif" value={formData.rif} onChange={handleInputChange} className="w11-input w-full" placeholder="Ej. V-12345678-9" />
          </div>
          <div>
            <label className="form-label">Correo Personal</label>
            <input required type="email" name="correo" value={formData.correo} onChange={handleInputChange} className="w11-input w-full" placeholder="Ej. docente@gmail.com" />
          </div>
          <div>
            <label className="form-label">Correo Institucional UPEL</label>
            <input type="email" name="correoInstitucional" value={formData.correoInstitucional || ''} onChange={handleInputChange} className="w11-input w-full" placeholder={`Ej. v${formData.cedula ? String(formData.cedula).replace(/\D/g, '') : '12345678'}@upel.edu.ve`} />
          </div>
          <div>
            <label className="form-label">Teléfonos</label>
            <input required type="text" name="telefonos" value={formData.telefonos} onChange={handleInputChange} className="w11-input w-full" placeholder="Ej. 0414-1234567" />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Dirección de Habitación</label>
            <input required type="text" name="direccion" value={formData.direccion} onChange={handleInputChange} className="w11-input w-full" />
          </div>

          {/* Contraseña de Acceso al Portal */}
          <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem', padding: '1.25rem', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
            <label className="form-label" style={{ color: '#166534', fontWeight: 700, marginBottom: '6px' }}>
              Contraseña de Acceso al Portal (Opcional)
            </label>
            <input 
              type="text" 
              name="clave" 
              value={formData.clave || ''} 
              onChange={handleInputChange} 
              className="w11-input w-full" 
              placeholder="Por defecto: últimos 4 dígitos de su cédula" 
              style={{ background: '#ffffff', color: '#0f172a', border: '1.5px solid #86efac' }}
            />
            <small style={{ color: '#166534', fontSize: '0.82rem', display: 'block', marginTop: '6px', fontWeight: 500 }}>
              * Si desea cambiar su contraseña de ingreso al portal, escriba una nueva clave aquí. Si la deja vacía, se mantendrán los últimos cuatro dígitos de su cédula.
            </small>
          </div>
        </div>
      </section>
    </>
  );
};

export default WizardStep1Personal;
