import React from 'react';
import { createPortal } from 'react-dom';
import { Edit, User, CreditCard, GraduationCap, BookOpen, Trash2 } from 'lucide-react';
import { departments, sedesInstitucionales } from '../../data';

export const LISTA_BANCOS = [
  "Banco de Venezuela",
  "Banco Digital de los Trabajadores",
  "Banco Mercantil",
  "Banesco",
  "Banco Provincial (BBVA)",
  "Banco Nacional de Crédito (BNC)",
  "Banco del Tesoro",
  "Banco Exterior",
  "Bancamiga",
  "Banco Fondo Común (BFC)",
  "Banco Plaza",
  "100% Banco",
  "Banco Activo",
  "Banco Caroní",
  "Banco Sofitasa",
  "DELSUR Banco Universal",
  "Bancrecer"
];

export const CATEGORIAS_DOCENTE = [
  "Instructor",
  "Asistente",
  "Agregado",
  "Asociado",
  "Titular"
];

export const DEDICACIONES_DOCENTE = [
  "Tiempo Convencional",
  "Medio Tiempo",
  "Tiempo Completo",
  "Dedicación Exclusiva"
];

export const StaffEditModal = ({
  staffToEdit,
  setStaffToEdit,
  handleEditChange,
  handleSaveEdit,
  handleDelete,
  user
}) => {
  if (!staffToEdit || typeof document === 'undefined') return null;

  return createPortal(
    <div className="upel-modal-overlay" onClick={() => setStaffToEdit(null)}>
      <div 
        className="upel-card upel-card-accent-blue animate-fade-in" 
        style={{ width: '98%', maxWidth: '850px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', background: '#ffffff', borderRadius: '16px', overflow: 'hidden', margin: 'auto' }} 
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Edit size={20} />
            </div>
            <div>
              <h2 style={{ marginBottom: 0, fontSize: '1.25rem' }}>Perfil y Datos del Docente</h2>
              <div className="subtitle" style={{ fontSize: '0.85rem' }}>C.I: <strong>{staffToEdit.cedula}</strong> &bull; Complete o actualice datos bancarios, fiscales y académicos</div>
            </div>
          </div>
          <button onClick={() => setStaffToEdit(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>&times;</span>
          </button>
        </div>
        
        <form onSubmit={handleSaveEdit} style={{ overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Sección 1: Datos Personales y de Identificación */}
          <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem' }}>
              <User size={18} color="var(--primary)" />
              <strong style={{ fontSize: '0.9rem', color: '#1e293b', textTransform: 'uppercase' }}>1. Información Personal y Fiscal</strong>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="form-label">Cédula de Identidad</label>
                <input type="text" value={staffToEdit.cedula} disabled className="filter-input w-full" style={{ background: '#e2e8f0', cursor: 'not-allowed', fontWeight: 'bold' }} />
              </div>
              <div>
                <label className="form-label">RIF Personal</label>
                <input type="text" name="rif" value={staffToEdit.rif || ''} onChange={handleEditChange} placeholder="Ej. V-12345678-0" className="filter-input w-full" />
              </div>
              <div>
                <label className="form-label">Fecha de Nacimiento</label>
                <input type="text" name="fechaNac" value={staffToEdit.fechaNac || ''} onChange={handleEditChange} placeholder="DD/MM/AAAA o AAAA-MM-DD" className="filter-input w-full" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="form-label">Nombres <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="text" name="nombres" value={staffToEdit.nombres || ''} onChange={handleEditChange} className="filter-input w-full" required />
              </div>
              <div>
                <label className="form-label">Apellidos <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="text" name="apellidos" value={staffToEdit.apellidos || ''} onChange={handleEditChange} className="filter-input w-full" required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="form-label">Teléfono(s) de Contacto</label>
                <input type="text" name="telefonos" value={staffToEdit.telefonos || ''} onChange={handleEditChange} placeholder="Ej. 0414-1234567" className="filter-input w-full" />
              </div>
              <div>
                <label className="form-label">Correo Personal</label>
                <input type="email" name="correo" value={staffToEdit.correo || ''} onChange={handleEditChange} placeholder="docente@gmail.com" className="filter-input w-full" />
              </div>
              <div>
                <label className="form-label">Correo Institucional</label>
                <input type="email" name="correoInstitucional" value={staffToEdit.correoInstitucional || ''} onChange={handleEditChange} placeholder="usuario.iprgr@upel.edu.ve" className="filter-input w-full" />
              </div>
            </div>

            <div>
              <label className="form-label">Dirección de Habitación</label>
              <input type="text" name="direccion" value={staffToEdit.direccion || ''} onChange={handleEditChange} placeholder="Dirección completa de residencia" className="filter-input w-full" />
            </div>
          </div>

          {/* Sección 2: Datos Bancarios */}
          <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '10px', padding: '1.1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem', borderBottom: '1px solid #bbf7d0', paddingBottom: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={18} color="#15803d" />
                <strong style={{ fontSize: '0.9rem', color: '#166534', textTransform: 'uppercase' }}>2. Datos Bancarios (Acreditación de Honorarios / Nómina)</strong>
              </div>
              <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#15803d', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>Requerido para Contratación</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label className="form-label" style={{ color: '#166534' }}>Entidad Bancaria</label>
                <select 
                  name="banco" 
                  value={staffToEdit.banco || ''} 
                  onChange={handleEditChange} 
                  className="filter-select w-full"
                  style={{ background: 'white' }}
                >
                  <option value="">-- Seleccione el Banco --</option>
                  {LISTA_BANCOS.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                  {staffToEdit.banco && !LISTA_BANCOS.includes(staffToEdit.banco) && (
                    <option value={staffToEdit.banco}>{staffToEdit.banco}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="form-label" style={{ color: '#166534' }}>Tipo de Cuenta</label>
                <select 
                  name="tipoCuenta" 
                  value={staffToEdit.tipoCuenta || 'Ahorro'} 
                  onChange={handleEditChange} 
                  className="filter-select w-full"
                  style={{ background: 'white' }}
                >
                  <option value="Ahorro">Ahorro</option>
                  <option value="Corriente">Corriente</option>
                </select>
              </div>

              <div style={{ gridColumn: 'span 1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" style={{ color: '#166534' }}>Número de Cuenta (20 Dígitos)</label>
                  <span style={{ fontSize: '0.72rem', color: (staffToEdit.cuentaBancaria?.length === 20) ? '#16a34a' : '#ea580c', fontWeight: 600 }}>
                    {staffToEdit.cuentaBancaria?.length || 0}/20
                  </span>
                </div>
                <input 
                  type="text" 
                  name="cuentaBancaria" 
                  value={staffToEdit.cuentaBancaria || ''} 
                  onChange={handleEditChange} 
                  maxLength={20}
                  placeholder="01020380580100067920" 
                  className="filter-input w-full" 
                  style={{ fontFamily: 'monospace', letterSpacing: '0.5px', background: 'white' }}
                />
              </div>
            </div>
          </div>

          {/* Sección 3: Perfil Académico y Escalafón */}
          <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem' }}>
              <GraduationCap size={18} color="var(--primary)" />
              <strong style={{ fontSize: '0.9rem', color: '#1e293b', textTransform: 'uppercase' }}>3. Perfil Académico y Escalafón</strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="form-label">Título de Pregrado</label>
                <input type="text" name="titulosPregrado" value={staffToEdit.titulosPregrado || ''} onChange={handleEditChange} placeholder="Ej. Lic. en Educación Agropecuaria" className="filter-input w-full" />
              </div>
              <div>
                <label className="form-label">Título de Postgrado (Maestría / Esp.)</label>
                <input type="text" name="titulosPostgrado" value={staffToEdit.titulosPostgrado || ''} onChange={handleEditChange} placeholder="Ej. MSc. en Gerencia Educativa" className="filter-input w-full" />
              </div>
              <div>
                <label className="form-label">Doctorado</label>
                <input type="text" name="doctorado" value={staffToEdit.doctorado || ''} onChange={handleEditChange} placeholder="Ej. Doctor en Educación" className="filter-input w-full" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label">Categoría Docente</label>
                <select name="categoriaDocente" value={staffToEdit.categoriaDocente || 'Instructor'} onChange={handleEditChange} className="filter-select w-full">
                  {CATEGORIAS_DOCENTE.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Dedicación</label>
                <select name="dedicacion" value={staffToEdit.dedicacion || 'Tiempo Convencional'} onChange={handleEditChange} className="filter-select w-full">
                  {DEDICACIONES_DOCENTE.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Sección 4: Adscripción Institucional */}
          <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem' }}>
              <BookOpen size={18} color="var(--primary)" />
              <strong style={{ fontSize: '0.9rem', color: '#1e293b', textTransform: 'uppercase' }}>4. Adscripción y Centro de Atención</strong>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Departamento Académico</label>
              <select
                className="premium-input w-full"
                value={staffToEdit.department}
                disabled={user?.role === 'JEFE'}
                onChange={(e) => setStaffToEdit({ ...staffToEdit, department: e.target.value })}
              >
                {departments.filter(d => d !== 'Todos').map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label">Centro de Atención / Sede</label>
                <select 
                  name="sedeCentro" 
                  value={staffToEdit.sedeCentro || 'Rubio'} 
                  onChange={handleEditChange} 
                  className="filter-select w-full" 
                  required
                >
                  {sedesInstitucionales.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                  {staffToEdit.sedeCentro && !sedesInstitucionales.includes(staffToEdit.sedeCentro) && (
                    <option value={staffToEdit.sedeCentro}>{staffToEdit.sedeCentro}</option>
                  )}
                </select>
              </div>
              <div>
                <label className="form-label">Especialidad</label>
                <input type="text" name="especialidad" value={staffToEdit.especialidad || ''} onChange={handleEditChange} placeholder="Ej. Educación Rural" className="filter-input w-full" />
              </div>
            </div>
          </div>

          {/* Sección 5: Clave Portal */}
          <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem' }}>
              <User size={18} color="var(--primary)" />
              <strong style={{ fontSize: '0.9rem', color: '#1e293b', textTransform: 'uppercase' }}>5. Acceso al Portal Institucional</strong>
            </div>
            <div>
              <label className="form-label">Contraseña Portal Docente (Opcional)</label>
              <input 
                type="text" 
                name="clave" 
                value={staffToEdit.clave || ''} 
                onChange={handleEditChange} 
                placeholder="Por defecto: últimos 4 dígitos de cédula" 
                className="filter-input w-full" 
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                Si se deja en blanco, el docente ingresará con los últimos 4 dígitos de su cédula.
              </div>
            </div>
          </div>
          
          <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {(user?.role === 'ADMIN' || user?.role === 'JEFE') ? (
              <button 
                type="button" 
                className="btn btn-outline" 
                style={{ color: '#dc2626', borderColor: '#fca5a5', background: '#fff1f2', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                onClick={() => handleDelete(staffToEdit)}
              >
                <Trash2 size={16} /> Eliminar Docente
              </button>
            ) : <div />}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setStaffToEdit(null)}>Cancelar</button>
              <button type="submit" className="btn btn-primary" style={{ minWidth: '150px' }}>💾 Guardar Cambios</button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default StaffEditModal;
