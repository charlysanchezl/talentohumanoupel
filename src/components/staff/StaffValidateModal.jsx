import React from 'react';
import { createPortal } from 'react-dom';
import { CheckSquare, X, Edit, Calendar, Lock, ShieldCheck, History, Globe, Plus, Trash2, BookOpen, Clock, Users, Hash } from 'lucide-react';
import { formatAccountWithRoleMask } from '../../services/bankTxtExporter';
import { especialidades } from '../../data';

export const StaffValidateModal = ({
  staffToValidate,
  setStaffToValidate,
  setStaffToEdit,
  setStaffHistoryToView,
  validationForm,
  handleValidationFormChange,
  materiasForm,
  handleMateriaChange,
  removeMateria,
  addMateria,
  handleAddMateriaGlobal,
  handleSaveValidation,
  academicPeriodsList,
  academicPeriods = [],
  cursosList = [],
  user
}) => {
  if (!staffToValidate || typeof document === 'undefined') return null;

  return createPortal(
    <div className="upel-modal-overlay" onClick={() => setStaffToValidate(null)}>
      <div 
        className="upel-card upel-card-accent-green animate-fade-in" 
        style={{ width: '98%', maxWidth: '1200px', maxHeight: '95vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '16px', background: '#ffffff', margin: 'auto' }} 
        onClick={e => e.stopPropagation()}
      >
        {/* Header del Modal */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--primary-light)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'white', padding: '0.5rem', borderRadius: '50%', color: 'var(--primary)', boxShadow: 'var(--shadow-sm)' }}>
              <CheckSquare size={28} />
            </div>
            <div>
              <h2 style={{ marginBottom: 0, color: 'var(--primary-dark)', fontSize: '1.5rem' }}>Validación y Carga Académica</h2>
              <div style={{ color: 'var(--primary)', fontSize: '1rem', fontWeight: 500 }}>
                {staffToValidate.nombres} {staffToValidate.apellidos} - C.I: {staffToValidate.cedula}
              </div>
            </div>
          </div>
          <button onClick={() => setStaffToValidate(null)} style={{ background: 'var(--bg-app)', border: '1px solid var(--border-light)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
            <X size={20} className="text-muted" />
          </button>
        </div>
        
        {/* Cuerpo del Modal */}
        <div style={{ overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', flex: 1 }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div style={{ background: '#f8fafc', padding: '1.1rem 1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.45rem', marginBottom: '0.75rem' }}>
                Datos Personales y Fiscales
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.88rem' }}>
                <div><strong>RIF:</strong> {staffToValidate.rif || <span style={{ color: '#dc2626' }}>No registrado</span>}</div>
                <div><strong>Teléfono:</strong> {staffToValidate.telefonos || 'No registrado'}</div>
                <div><strong>Correo:</strong> {staffToValidate.correo || 'No registrado'}</div>
                <div><strong>Dirección:</strong> {staffToValidate.direccion || 'No registrada'}</div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1.1rem 1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.45rem', marginBottom: '0.75rem' }}>
                Datos Bancarios
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.88rem' }}>
                <div><strong>Banco:</strong> {staffToValidate.banco || <span style={{ color: '#dc2626' }}>⚠️ Sin Banco</span>}</div>
                <div><strong>Tipo:</strong> {staffToValidate.tipoCuenta || 'Ahorro'}</div>
                <div><strong>Cuenta:</strong> {staffToValidate.cuentaBancaria ? formatAccountWithRoleMask(staffToValidate.cuentaBancaria, user?.role) : <span style={{ color: '#dc2626' }}>⚠️ Sin Cuenta</span>}</div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1.1rem 1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.45rem', marginBottom: '0.75rem' }}>
                Perfil Académico
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.88rem' }}>
                <div><strong>Pregrado:</strong> {staffToValidate.titulosPregrado || 'No registrado'}</div>
                <div><strong>Categoría:</strong> {staffToValidate.categoriaDocente}</div>
                <div><strong>Centro:</strong> <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{staffToValidate.sedeCentro || 'Rubio'}</span></div>
                <div><strong>Especialidad:</strong> {staffToValidate.especialidad || (staffToValidate.materias && staffToValidate.materias.find(m => m.especialidadDestino)?.especialidadDestino) || staffToValidate.titulosPregrado || 'N/A'}</div>
              </div>
              <div style={{ marginTop: '0.65rem', paddingTop: '0.5rem', borderTop: '1px dashed #cbd5e1' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                  onClick={() => {
                    const target = staffToValidate;
                    setStaffToValidate(null);
                    setStaffToEdit(target);
                  }}
                >
                  <Edit size={14} style={{ marginRight: '4px' }} /> Editar Perfil Docente
                </button>
              </div>
            </div>
          </div>

          <form id="validateForm" onSubmit={handleSaveValidation} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Período y Vigencia */}
            <div style={{ background: '#f8fafc', padding: '1.25rem 1.5rem', borderRadius: '12px', border: '1.5px solid #cbd5e1' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={18} color="var(--primary)" />
                  <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>Período y Vigencia Oficial del Semestre</h3>
                </div>
                <span style={{ fontSize: '0.75rem', background: '#e2e8f0', color: '#475569', padding: '0.2rem 0.55rem', borderRadius: '4px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Lock size={12} /> Parámetros Fijados por Administrador
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label className="form-label" style={{ color: '#0f172a', fontWeight: 700 }}>Período Académico</label>
                  <select required name="periodoAcademico" value={validationForm.periodoAcademico} onChange={handleValidationFormChange} className="premium-select w-full" style={{ background: 'white', fontWeight: 600 }}>
                    {academicPeriodsList.length > 0 ? (
                      academicPeriodsList.map(p => (
                        <option key={p.id || p.nombre} value={p.nombre}>
                          {p.nombre} {p.estado === 'ACTIVO' ? '🟢 (En Curso)' : p.estado === 'PLANIFICACION' ? '🔵 (En Planificación)' : '⚪ (Cerrado)'}
                        </option>
                      ))
                    ) : (
                      academicPeriods.map(p => <option key={p} value={p}>{p}</option>)
                    )}
                  </select>
                  {(() => {
                    const selectedPeriodObj = academicPeriodsList.find(p => p.nombre === validationForm.periodoAcademico);
                    if (selectedPeriodObj && selectedPeriodObj.estado === 'PLANIFICACION') {
                      return (
                        <div style={{ marginTop: '0.45rem', fontSize: '0.78rem', color: '#991b1b', background: '#fef2f2', border: '1.5px solid #fecaca', padding: '0.5rem 0.75rem', borderRadius: '8px', lineHeight: '1.35', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Lock size={15} color="#dc2626" style={{ flexShrink: 0 }} />
                          <div>
                            <strong>Período No Abierto:</strong> El lapso <strong>{validationForm.periodoAcademico}</strong> está en Planificación y no permite cargar materias. Para habilitar la carga, debe ser activado oficialmente desde Gestión de Lapsos.
                          </div>
                        </div>
                      );
                    }
                    if (selectedPeriodObj && selectedPeriodObj.estado === 'CERRADO') {
                      return (
                        <div style={{ marginTop: '0.45rem', fontSize: '0.78rem', color: '#475569', background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.5rem 0.75rem', borderRadius: '8px', lineHeight: '1.35', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Lock size={15} color="#64748b" style={{ flexShrink: 0 }} />
                          <div>
                            <strong>Período Finalizado:</strong> El lapso <strong>{validationForm.periodoAcademico}</strong> se encuentra cerrado. No se permite modificar asignaturas.
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                <div>
                  <label className="form-label" style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Lock size={12} color="#64748b" /> Semanas Base (Normativa)
                  </label>
                  <input 
                    type="text" 
                    name="semanas" 
                    value={`${validationForm.semanas || 15} semanas`} 
                    readOnly 
                    disabled
                    className="premium-input w-full" 
                    style={{ background: '#f1f5f9', color: '#334155', cursor: 'not-allowed', fontWeight: 600 }} 
                  />
                </div>

                <div>
                  <label className="form-label" style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Lock size={12} color="#64748b" /> Fecha Inicio (Oficial)
                  </label>
                  <input 
                    type="text" 
                    name="fechaDesde" 
                    value={validationForm.fechaDesde || 'Fijada en Gestión de Lapsos'} 
                    readOnly 
                    disabled
                    className="premium-input w-full" 
                    style={{ background: '#f1f5f9', color: '#334155', cursor: 'not-allowed', fontWeight: 500 }} 
                  />
                </div>

                <div>
                  <label className="form-label" style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Lock size={12} color="#64748b" /> Fecha Culminación (Oficial)
                  </label>
                  <input 
                    type="text" 
                    name="fechaHasta" 
                    value={validationForm.fechaHasta || 'Fijada en Gestión de Lapsos'} 
                    readOnly 
                    disabled
                    className="premium-input w-full" 
                    style={{ background: '#f1f5f9', color: '#334155', cursor: 'not-allowed', fontWeight: 500 }} 
                  />
                </div>
              </div>

              <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem' }}>
                <ShieldCheck size={15} color="#16a34a" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Control Institucional:</strong> Las fechas y semanas son fijas y sincronizadas automáticamente desde el calendario general. Si existe una reprogramación de fechas, el <strong>Administrador del Sistema</strong> es quien la gestiona desde <em>Gestión de Lapsos</em>.
                </span>
              </div>
            </div>

            {/* Materias */}
            <div style={{ background: 'white', padding: '1.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--primary)', paddingBottom: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>Asignación de Materias (Oferta Académica)</h3>
                  <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.78rem', fontWeight: 700, padding: '0.2rem 0.65rem', borderRadius: '20px' }}>
                    {materiasForm.length} {materiasForm.length === 1 ? 'asignatura' : 'asignaturas'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button 
                    type="button" 
                    onClick={() => setStaffHistoryToView(staffToValidate)} 
                    className="btn btn-outline" 
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem', color: '#2563eb', borderColor: '#bfdbfe', background: '#eff6ff' }}
                    title="Ver cargas de períodos anteriores y copiarlas si se desea"
                  >
                    <History size={15} /> Kardex / Carga Anterior
                  </button>
                  {user?.role === 'ADMIN' && (
                    <button type="button" onClick={handleAddMateriaGlobal} className="btn btn-outline" style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}>
                      <Globe size={15} /> Nueva al Catálogo
                    </button>
                  )}
                </div>
              </div>

              <p className="text-muted" style={{ fontSize: '0.88rem', marginBottom: '1.25rem', lineHeight: '1.4' }}>
                Asigne las unidades curriculares correspondientes al docente. Especifique Sección, Cohorte, Cupos, Inscritos y las Horas Académicas.
              </p>

              {/* Lista ordenada de Materias */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {materiasForm.length === 0 && (
                  <div style={{
                    background: '#f8fafc',
                    border: '2px dashed #cbd5e1',
                    borderRadius: '12px',
                    padding: '2.5rem 1.5rem',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem'
                  }}>
                    <div style={{ background: '#e2e8f0', padding: '0.75rem', borderRadius: '50%', color: '#64748b' }}>
                      <BookOpen size={28} />
                    </div>
                    <div style={{ fontWeight: 700, color: '#334155', fontSize: '1rem' }}>
                      No hay materias asignadas en esta ficha
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '450px' }}>
                      Presione el botón <strong>"Añadir Asignatura"</strong> para comenzar a cargar la oferta académica del docente.
                    </div>
                  </div>
                )}

                {materiasForm.map((mat, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      background: '#ffffff', 
                      border: '1.5px solid #cbd5e1', 
                      borderRadius: '12px', 
                      overflow: 'hidden',
                      boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)'
                    }}
                  >
                    {/* Barra Superior de la Tarjeta de Materia */}
                    <div style={{
                      background: 'linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%)',
                      padding: '0.75rem 1.1rem',
                      borderBottom: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                        <span style={{ 
                          background: 'var(--primary, #002f6c)', 
                          color: '#ffffff', 
                          fontWeight: 800, 
                          fontSize: '0.75rem', 
                          padding: '0.2rem 0.6rem', 
                          borderRadius: '6px',
                          letterSpacing: '0.04em'
                        }}>
                          #{index + 1}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e293b' }}>
                          {mat.nombre ? mat.nombre : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Seleccione una materia...</span>}
                        </span>
                        {mat.seccion && (
                          <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                            Secc: {mat.seccion}
                          </span>
                        )}
                        {(mat.horasSemanal !== undefined && mat.horasSemanal !== '' && Number(mat.horasSemanal) > 0) && (
                          <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                            {mat.horasSemanal} h/sem
                          </span>
                        )}
                      </div>

                      <button 
                        type="button" 
                        onClick={() => removeMateria(index)} 
                        className="btn" 
                        style={{ 
                          background: '#fee2e2', 
                          color: '#dc2626', 
                          border: '1px solid #fecaca', 
                          padding: '0.35rem 0.75rem', 
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }} 
                        title="Eliminar esta materia de la asignación"
                      >
                        <Trash2 size={14} />
                        <span>Eliminar</span>
                      </button>
                    </div>

                    {/* Contenido del Formulario de la Materia */}
                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                      
                      {/* Fila 1: Materia y Especialidad */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                            <BookOpen size={13} color="var(--primary)" /> Unidad Curricular / Asignatura
                          </label>
                          <select 
                            value={mat.nombre} 
                            onChange={(e) => handleMateriaChange(index, 'nombre', e.target.value)} 
                            className="premium-select w-full" 
                            style={{ background: '#ffffff', fontSize: '0.88rem' }}
                          >
                            <option value="">Seleccione una materia del catálogo...</option>
                            {(Array.isArray(cursosList) ? cursosList : (cursosList?.default || [])).map((curso, idx) => (
                              <option key={idx} value={curso}>{curso}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                            <Users size={13} color="var(--primary)" /> Especialidad que atiende
                          </label>
                          <select 
                            value={mat.especialidadDestino || ''} 
                            onChange={(e) => handleMateriaChange(index, 'especialidadDestino', e.target.value)} 
                            className="premium-select w-full" 
                            style={{ background: '#ffffff', fontSize: '0.88rem' }}
                          >
                            <option value="">Seleccione especialidad...</option>
                            {especialidades.map(esp => (
                              <option key={esp} value={esp}>{esp}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Fila 2: Sub-bloques organizados (Control de Grupo + Horas) */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', alignItems: 'stretch' }}>
                        
                        {/* Sub-bloque A: Sección, Cupos, Inscritos, Cohorte */}
                        <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                            Control de Sección y Estudiantes
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '0.55rem' }}>
                            <div>
                              <label className="form-label" style={{ fontSize: '0.72rem', color: '#475569', marginBottom: '0.25rem' }}>Sección</label>
                              <input 
                                type="text" 
                                value={mat.seccion || ''} 
                                onChange={(e) => handleMateriaChange(index, 'seccion', e.target.value)} 
                                className="premium-input w-full" 
                                placeholder="Ej: A" 
                                style={{ background: 'white', textAlign: 'center', fontSize: '0.85rem', padding: '0.45rem 0.35rem' }} 
                              />
                            </div>
                            <div>
                              <label className="form-label" style={{ fontSize: '0.72rem', color: '#475569', marginBottom: '0.25rem' }}>Cohorte</label>
                              <input 
                                type="text" 
                                value={mat.cohorte || ''} 
                                onChange={(e) => handleMateriaChange(index, 'cohorte', e.target.value)} 
                                className="premium-input w-full" 
                                placeholder="Ej: 2024" 
                                style={{ background: 'white', textAlign: 'center', fontSize: '0.85rem', padding: '0.45rem 0.35rem' }} 
                              />
                            </div>
                            <div>
                              <label className="form-label" style={{ fontSize: '0.72rem', color: '#475569', marginBottom: '0.25rem' }}>Cupos</label>
                              <input 
                                type="number" 
                                min="0" 
                                value={mat.cupos || ''} 
                                onChange={(e) => handleMateriaChange(index, 'cupos', e.target.value)} 
                                className="premium-input w-full" 
                                placeholder="0"
                                style={{ background: 'white', textAlign: 'center', fontSize: '0.85rem', padding: '0.45rem 0.35rem' }} 
                              />
                            </div>
                            <div>
                              <label className="form-label" style={{ fontSize: '0.72rem', color: '#475569', marginBottom: '0.25rem' }}>Inscritos</label>
                              <input 
                                type="number" 
                                min="0" 
                                value={mat.inscritos || ''} 
                                onChange={(e) => handleMateriaChange(index, 'inscritos', e.target.value)} 
                                className="premium-input w-full" 
                                placeholder="0"
                                style={{ background: 'white', textAlign: 'center', fontSize: '0.85rem', padding: '0.45rem 0.35rem' }} 
                              />
                            </div>
                          </div>
                        </div>

                        {/* Sub-bloque B: Carga Horaria Resaltada */}
                        <div style={{ background: '#f0fdf4', padding: '0.85rem 1rem', borderRadius: '8px', border: '1.5px solid #bbf7d0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Clock size={12} color="#16a34a" /> Carga Horaria Académica
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                            <div>
                              <label className="form-label" style={{ fontSize: '0.72rem', fontWeight: 700, color: '#166534', marginBottom: '0.25rem' }}>H. Semanales</label>
                              <input 
                                type="number" 
                                min="0" 
                                value={mat.horasSemanal} 
                                onChange={(e) => handleMateriaChange(index, 'horasSemanal', e.target.value)} 
                                className="premium-input w-full" 
                                style={{ background: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: '0.95rem', color: '#15803d', borderColor: '#86efac', padding: '0.45rem 0.5rem' }} 
                              />
                            </div>
                            <div>
                              <label className="form-label" style={{ fontSize: '0.72rem', fontWeight: 700, color: '#166534', marginBottom: '0.25rem' }}>H. Lapso</label>
                              <input 
                                type="number" 
                                min="0" 
                                value={mat.horasLapso} 
                                onChange={(e) => handleMateriaChange(index, 'horasLapso', e.target.value)} 
                                className="premium-input w-full" 
                                style={{ background: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: '0.95rem', color: '#15803d', borderColor: '#86efac', padding: '0.45rem 0.5rem' }} 
                              />
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={addMateria} 
                style={{ 
                  marginTop: '1.25rem', 
                  width: '100%', 
                  borderStyle: 'dashed', 
                  borderWidth: '2px',
                  borderColor: 'var(--primary)',
                  color: 'var(--primary)',
                  padding: '0.75rem',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Plus size={18} /> Añadir Asignatura
              </button>
            </div>
          </form>
        </div>
        
        {/* Footer del Modal */}
        <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border-light)', background: 'var(--bg-app)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, borderBottomLeftRadius: 'var(--radius-lg)', borderBottomRightRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Materias</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{materiasForm.length}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total H. Semanales</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                {materiasForm.reduce((sum, m) => sum + (parseInt(m.horasSemanal) || 0), 0)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total H. Lapso</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                {materiasForm.reduce((sum, m) => sum + (parseInt(m.horasLapso) || 0), 0)}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button type="button" className="btn btn-outline" onClick={() => setStaffToValidate(null)}>Cancelar</button>
            {(() => {
              const selectedPeriodObj = academicPeriodsList.find(p => p.nombre === validationForm.periodoAcademico);
              const isBlocked = selectedPeriodObj?.estado === 'PLANIFICACION' || selectedPeriodObj?.estado === 'CERRADO';
              return (
                <button 
                  type="submit" 
                  form="validateForm" 
                  className="btn btn-primary" 
                  disabled={isBlocked}
                  style={{ 
                    padding: '0.8rem 1.5rem', 
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    ...(isBlocked ? { opacity: 0.55, cursor: 'not-allowed', background: '#64748b', borderColor: '#64748b' } : {})
                  }}
                  title={isBlocked ? "Período no abierto para carga de materias" : "Validar y Guardar Ficha"}
                >
                  {isBlocked ? <Lock size={20} /> : <CheckSquare size={20} />}
                  <span>{isBlocked ? 'Carga Bloqueada' : 'Validar y Guardar Ficha'}</span>
                </button>
              );
            })()}
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default StaffValidateModal;
