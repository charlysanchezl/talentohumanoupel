import React from 'react';
import { createPortal } from 'react-dom';
import { X, Edit, Trash2, Download, Printer } from 'lucide-react';
import { formatAccountWithRoleMask } from '../../services/bankTxtExporter';

export const StaffDetailModal = ({
  staffToView,
  setStaffToView,
  setStaffToEdit,
  handleDelete,
  setStaffToPrint,
  user
}) => {
  if (!staffToView || typeof document === 'undefined') return null;

  return createPortal(
    <div className="upel-modal-overlay" onClick={() => setStaffToView(null)}>
      <div 
        className="upel-card upel-card-accent-blue animate-fade-in" 
        style={{ width: '98%', maxWidth: '1000px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '16px', background: '#ffffff', margin: 'auto' }} 
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img 
              src="/upel.jpg" 
              alt="UPEL Logo" 
              style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '4px' }} 
              onError={(e) => { e.currentTarget.src = '/logo.jpg'; }}
            />
            <div>
              <h2 style={{ marginBottom: 0 }}>{staffToView.nombres} {staffToView.apellidos}</h2>
              <div className="subtitle">C.I: {staffToView.cedula} | {staffToView.department}</div>
            </div>
          </div>
          <button onClick={() => setStaffToView(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} className="text-muted" />
          </button>
        </div>
        
        <div style={{ overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <div className="form-label" style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#1e293b', textTransform: 'uppercase', marginBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.3rem' }}>Estatus y Lapso</div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="badge badge-success">{staffToView.status}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Vence: {staffToView.fechaFinContrato || staffToView.fechaHasta || 'Fin de Lapso'}</span>
              </div>
              <div style={{ fontSize: '0.85rem' }}><strong>Período:</strong> {staffToView.periodoAcademico || 'Actual'}</div>
              <div style={{ fontSize: '0.85rem' }}><strong>Semanas:</strong> {staffToView.semanas || 16}</div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <div className="form-label" style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#1e293b', textTransform: 'uppercase', marginBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.3rem' }}>Datos Personales y Fiscales</div>
              <div style={{ fontSize: '0.85rem', marginBottom: '0.2rem' }}><strong>RIF:</strong> {staffToView.rif || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No registrado</span>}</div>
              <div style={{ fontSize: '0.85rem', marginBottom: '0.2rem' }}><strong>Nacimiento:</strong> {staffToView.fechaNac || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No registrado</span>}</div>
              <div style={{ fontSize: '0.85rem', marginBottom: '0.2rem' }}><strong>Teléfono:</strong> {staffToView.telefonos || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No registrado</span>}</div>
              <div style={{ fontSize: '0.85rem', marginBottom: '0.2rem' }}><strong>Correo Personal:</strong> {staffToView.correo || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No registrado</span>}</div>
              <div style={{ fontSize: '0.85rem', marginBottom: '0.2rem' }}><strong>Correo Institucional:</strong> {staffToView.correoInstitucional || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No asignado</span>}</div>
              <div style={{ fontSize: '0.85rem' }}><strong>Dirección:</strong> {staffToView.direccion || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No registrada</span>}</div>
            </div>

            <div style={{ background: (staffToView.banco && staffToView.cuentaBancaria) ? '#f0fdf4' : '#fffbeb', border: (staffToView.banco && staffToView.cuentaBancaria) ? '1px solid #86efac' : '1px solid #fde68a', borderRadius: '8px', padding: '1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.3rem' }}>
                <div className="form-label" style={{ fontWeight: 'bold', fontSize: '0.85rem', color: (staffToView.banco && staffToView.cuentaBancaria) ? '#166534' : '#92400e', textTransform: 'uppercase', margin: 0 }}>Datos Bancarios</div>
                {(staffToView.banco && staffToView.cuentaBancaria) ? (
                  <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>Completo</span>
                ) : (
                  <span style={{ fontSize: '0.72rem', background: '#fef3c7', color: '#b45309', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>Incompleto</span>
                )}
              </div>
              <div style={{ fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                <strong>Banco:</strong> {staffToView.banco ? staffToView.banco : <span style={{ color: '#dc2626', fontWeight: 600 }}>⚠️ Sin Banco Asignado</span>}
              </div>
              <div style={{ fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                <strong>Tipo:</strong> {staffToView.tipoCuenta || 'Ahorro'}
              </div>
              <div style={{ fontSize: '0.85rem' }}>
                <strong>Cuenta:</strong> {staffToView.cuentaBancaria ? <code style={{ background: '#e2e8f0', padding: '0.15rem 0.35rem', borderRadius: '4px', fontSize: '0.82rem', letterSpacing: '0.5px' }}>{formatAccountWithRoleMask(staffToView.cuentaBancaria, user?.role)}</code> : <span style={{ color: '#dc2626', fontWeight: 600 }}>⚠️ Sin Cuenta Registrada</span>}
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <div className="form-label" style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#1e293b', textTransform: 'uppercase', marginBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.3rem' }}>Perfil Académico y Cargo</div>
              <div style={{ fontSize: '0.85rem', marginBottom: '0.2rem' }}><strong>Pregrado:</strong> {staffToView.titulosPregrado || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No registrado</span>}</div>
              <div style={{ fontSize: '0.85rem', marginBottom: '0.2rem' }}><strong>Postgrado:</strong> {staffToView.titulosPostgrado || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>N/A</span>}</div>
              <div style={{ fontSize: '0.85rem', marginBottom: '0.2rem' }}><strong>Doctorado:</strong> {staffToView.doctorado || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>N/A</span>}</div>
              <div style={{ fontSize: '0.85rem', marginBottom: '0.2rem' }}><strong>Categoría:</strong> {staffToView.categoriaDocente || 'Instructor'}</div>
              <div style={{ fontSize: '0.85rem', marginBottom: '0.2rem' }}><strong>Dedicación:</strong> {staffToView.dedicacion || 'Tiempo Convencional'}</div>
              <div style={{ fontSize: '0.85rem', marginBottom: '0.2rem' }}><strong>Centro de Atención:</strong> <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{staffToView.sedeCentro || 'Rubio'}</span></div>
              <div style={{ fontSize: '0.85rem' }}><strong>Especialidad:</strong> {staffToView.especialidad || (staffToView.materias && staffToView.materias.find(m => m.especialidadDestino)?.especialidadDestino) || staffToView.titulosPregrado || 'N/A'}</div>
            </div>
          </div>

          {staffToView.materias && staffToView.materias.length > 0 && (
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <div className="form-label" style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#1e293b', textTransform: 'uppercase', marginBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.3rem' }}>Materias / Oferta Académica</div>
              <div className="table-responsive" style={{ border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', minWidth: '400px', background: 'white' }}>
                  <thead style={{ background: '#334155', color: 'white' }}>
                    <tr>
                      <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left', border: '1px solid #475569' }}>Asignatura</th>
                      <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left', border: '1px solid #475569' }}>Atiende A</th>
                      <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center', border: '1px solid #475569' }}>Sección</th>
                      <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center', border: '1px solid #475569' }}>Cupos/Insc.</th>
                      <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center', border: '1px solid #475569' }}>Cohorte</th>
                      <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center', border: '1px solid #475569' }}>H. Semanales</th>
                      <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center', border: '1px solid #475569' }}>H. Lapso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffToView.materias.map((mat, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                        <td style={{ padding: '0.6rem 0.8rem', border: '1px solid #cbd5e1' }}><strong>{mat.nombre}</strong></td>
                        <td style={{ padding: '0.6rem 0.8rem', border: '1px solid #cbd5e1' }}>{mat.especialidadDestino || 'N/A'}</td>
                        <td style={{ padding: '0.6rem 0.8rem', textAlign: 'center', border: '1px solid #cbd5e1' }}><span className="badge badge-primary">{mat.seccion || '-'}</span></td>
                        <td style={{ padding: '0.6rem 0.8rem', textAlign: 'center', border: '1px solid #cbd5e1' }}>{mat.cupos || '0'} / {mat.inscritos || '0'}</td>
                        <td style={{ padding: '0.6rem 0.8rem', textAlign: 'center', border: '1px solid #cbd5e1' }}><span className="badge" style={{ background: '#f8fafc', color: '#1e293b', border: '1px solid #cbd5e1', fontWeight: 600 }}>{mat.cohorte || '-'}</span></td>
                        <td style={{ padding: '0.6rem 0.8rem', textAlign: 'center', border: '1px solid #cbd5e1', fontWeight: 600 }}>{mat.horasSemanal}</td>
                        <td style={{ padding: '0.6rem 0.8rem', textAlign: 'center', border: '1px solid #cbd5e1' }}>{mat.horasLapso}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        
        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-app)', flexWrap: 'wrap', gap: '0.75rem' }}>
          {(user?.role === 'ADMIN' || user?.role === 'JEFE') ? (
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', background: '#003366', borderColor: '#003366' }}
                onClick={() => {
                  const st = { ...staffToView };
                  setStaffToEdit(st);
                }}
              >
                <Edit size={16} /> Editar y Completar Perfil
              </button>
              <button 
                type="button" 
                className="btn btn-outline" 
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#dc2626', borderColor: '#fca5a5', background: '#fff1f2' }}
                onClick={() => handleDelete(staffToView)}
                title="Eliminar este docente del departamento"
              >
                <Trash2 size={16} /> Eliminar Docente
              </button>
            </div>
          ) : <div />}
          
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              className="btn btn-outline" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#15803d', borderColor: '#86efac', background: '#f0fdf4', fontWeight: 600 }}
              onClick={async () => {
                const { exportSingleDocenteFichaExcel } = await import('../../services/excelExporter');
                exportSingleDocenteFichaExcel(staffToView, user);
              }}
              title="Descargar Ficha Completa del Docente en formato Excel (.xlsx)"
            >
              <Download size={16} /> Exportar Ficha Excel
            </button>
            <button 
              type="button" 
              className="btn btn-outline" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
              onClick={() => setStaffToPrint(staffToView)}
            >
              <Printer size={16} /> Imprimir Ficha
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setStaffToView(null)}>Cerrar</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default StaffDetailModal;
