import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, BookOpen, Calendar, CheckSquare, ShieldCheck, Users, FileText, CheckCircle2, ChevronRight, AlertCircle, ArrowRight, Printer } from 'lucide-react';

const GuiaOrganizacionModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('fases');

  if (!isOpen) return null;

  return createPortal(
    <div className="upel-modal-overlay" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '1rem'
    }} onClick={onClose}>
      
      <div 
        className="upel-card upel-card-accent-tri animate-scale-up"
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '0',
          position: 'relative',
          background: '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(0, 51, 102, 0.25)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div style={{
          padding: '1.5rem 2rem 1.25rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #002f6c 0%, #001f4a 100%)',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <BookOpen size={22} color="#f59e0b" />
            </div>
            <div>
              <div className="upel-section-subtitle" style={{ color: '#008744', fontSize: '0.7rem' }}>
                SUBDIRECCIÓN DE DOCENCIA • MANUAL INSTITUCIONAL
              </div>
              <h2 style={{ margin: '0.15rem 0 0', color: '#002f6c', fontSize: '1.25rem', fontWeight: 800 }}>
                Protocolo de Organización y Carga Académica
              </h2>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Directrices oficiales para el flujo semestral, nomenclatura y validación de nómina
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: '#f1f5f9', border: 'none', cursor: 'pointer',
              color: '#64748b', padding: '0.4rem', borderRadius: '8px', display: 'flex'
            }}
            title="Cerrar ventana"
          >
            <X size={18} />
          </button>
        </div>

        {/* Pestañas de Navegación del Manual */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc',
          padding: '0 1.5rem',
          gap: '0.5rem',
          overflowX: 'auto'
        }}>
          <button
            onClick={() => setActiveTab('fases')}
            style={{
              padding: '0.85rem 1rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'fases' ? '2.5px solid #002f6c' : '2.5px solid transparent',
              color: activeTab === 'fases' ? '#002f6c' : '#64748b',
              fontWeight: activeTab === 'fases' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              whiteSpace: 'nowrap'
            }}
          >
            <Calendar size={16} /> 1. Ciclo en 4 Fases
          </button>

          <button
            onClick={() => setActiveTab('nomenclatura')}
            style={{
              padding: '0.85rem 1rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'nomenclatura' ? '2.5px solid #002f6c' : '2.5px solid transparent',
              color: activeTab === 'nomenclatura' ? '#002f6c' : '#64748b',
              fontWeight: activeTab === 'nomenclatura' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              whiteSpace: 'nowrap'
            }}
          >
            <FileText size={16} /> 2. Nomenclatura Oficial
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            style={{
              padding: '0.85rem 1rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'checklist' ? '2.5px solid #002f6c' : '2.5px solid transparent',
              color: activeTab === 'checklist' ? '#002f6c' : '#64748b',
              fontWeight: activeTab === 'checklist' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              whiteSpace: 'nowrap'
            }}
          >
            <CheckSquare size={16} /> 3. Checklist Pre-Nómina
          </button>

          <button
            onClick={() => setActiveTab('roles')}
            style={{
              padding: '0.85rem 1rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'roles' ? '2.5px solid #002f6c' : '2.5px solid transparent',
              color: activeTab === 'roles' ? '#002f6c' : '#64748b',
              fontWeight: activeTab === 'roles' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              whiteSpace: 'nowrap'
            }}
          >
            <Users size={16} /> 4. Matriz de Roles
          </button>
        </div>

        {/* Contenido Dinámico */}
        <div style={{ padding: '1.75rem 2rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* TAB 1: CICLO EN 4 FASES */}
          {activeTab === 'fases' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
                El flujo de trabajo institucional para cada período académico ordinario se divide en <strong>4 etapas secuenciales</strong>:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
                
                <div style={{ border: '1.5px solid #bfdbfe', borderRadius: '12px', padding: '1rem', background: '#eff6ff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <span style={{ background: '#2563eb', color: 'white', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>1</span>
                    <h4 style={{ margin: 0, color: '#1e40af', fontSize: '0.95rem' }}>Fase de Apertura y Parámetros</h4>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#334155' }}>
                    <strong>Responsable:</strong> Administrador del Sistema.<br/>
                    <strong>Acción:</strong> En *Gestión de Lapsos*, crea o activa el período (ej. `2026-I`), fija las 15 semanas oficiales, la fecha de inicio (`13/04/2026`) y fecha de fin (`02/10/2026`).
                  </div>
                </div>

                <div style={{ border: '1.5px solid #bbf7d0', borderRadius: '12px', padding: '1rem', background: '#f0fdf4' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <span style={{ background: '#16a34a', color: 'white', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>2</span>
                    <h4 style={{ margin: 0, color: '#166534', fontSize: '0.95rem' }}>Fase de Asignación y Carga</h4>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#334155' }}>
                    <strong>Responsable:</strong> Jefes de Departamento.<br/>
                    <strong>Acción:</strong> En su módulo de departamento, asignan materias, secciones, cupos y horas a cada docente adscrito. Verifican que la cuenta bancaria tenga sus 20 dígitos.
                  </div>
                </div>

                <div style={{ border: '1.5px solid #fed7aa', borderRadius: '12px', padding: '1rem', background: '#fff7ed' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <span style={{ background: '#ea580c', color: 'white', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>3</span>
                    <h4 style={{ margin: 0, color: '#9a3412', fontSize: '0.95rem' }}>Fase de Conciliación de Cruces</h4>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#334155' }}>
                    <strong>Responsable:</strong> Subdirección y Jefaturas.<br/>
                    <strong>Acción:</strong> En *Oferta Académica Consolidada*, se comprueban las materias interdisciplinarias (ej. TIC atendiendo a Educación Inicial o Inglés a Primaria) asegurando que no falte ninguna cohorte.
                  </div>
                </div>

                <div style={{ border: '1.5px solid #ddd6fe', borderRadius: '12px', padding: '1rem', background: '#f5f3ff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <span style={{ background: '#7c3aed', color: 'white', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>4</span>
                    <h4 style={{ margin: 0, color: '#5b21b6', fontSize: '0.95rem' }}>Fase de Emisión y Nómina</h4>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#334155' }}>
                    <strong>Responsable:</strong> Talento Humano / Docencia.<br/>
                    <strong>Acción:</strong> Exportación del archivo definitivo en Excel para Nómina y emisión de las Fichas Académicas Oficiales en PDF para archivo institucional y firma.
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: NOMENCLATURA OFICIAL */}
          {activeTab === 'nomenclatura' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
                Para evitar discrepancias en las búsquedas y reportes institucionales, se debe aplicar este estándar de escritura:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, color: '#002f6c', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    1. Nombres de Asignaturas (Unidades Curriculares)
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                    Utilizar siempre el nombre oficial en MAYÚSCULAS según el Catálogo Académico UPEL (ej. <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>TIC II</code>, <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>DIDÁCTICA GENERAL</code>). Evitar abreviaturas informales.
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, color: '#002f6c', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    2. Identificación de Secciones
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                    Utilizar números arábigos simples: <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>1</code>, <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>2</code>, <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>3</code> para diurno, o el código de cohorte establecido por el departamento (ej. <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>71</code> sabatino).
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, color: '#002f6c', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    3. Especialidad Destino
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                    Asignar con precisión la carrera a la que atiende la unidad curricular: <span className="badge badge-info" style={{ marginRight: '4px' }}>Educación Inicial</span> <span className="badge badge-info" style={{ marginRight: '4px' }}>Educación Primaria</span> <span className="badge badge-info" style={{ marginRight: '4px' }}>Matemática</span> <span className="badge badge-info">Educación Rural</span>.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CHECKLIST PRE-NÓMINA */}
          {activeTab === 'checklist' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
                Antes de dar clic en <strong>"Guardar Validación"</strong> para cada docente, el Jefe de Departamento debe cotejar estos 4 puntos indispensables:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.85rem', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                  <CheckCircle2 size={20} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 700, color: '#065f46', fontSize: '0.9rem' }}>1. Período y Lapso Oficial Activo</div>
                    <div style={{ fontSize: '0.8rem', color: '#047857' }}>Asegurar que figure el semestre activo (ej. `2026-I`) y las 15 semanas con fechas oficiales vigentes fijadas por administración.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.85rem', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                  <CheckCircle2 size={20} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 700, color: '#065f46', fontSize: '0.9rem' }}>2. Especialidad del Profesor Confirmada</div>
                    <div style={{ fontSize: '0.8rem', color: '#047857' }}>Verificar que el campo Especialidad no esté vacío en el perfil del docente ni en la materia asignada.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.85rem', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                  <CheckCircle2 size={20} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 700, color: '#065f46', fontSize: '0.9rem' }}>3. Cuenta Bancaria Válida (20 dígitos)</div>
                    <div style={{ fontSize: '0.8rem', color: '#047857' }}>Revisar que la cuenta del Banco de Venezuela contenga exactamente los 20 dígitos numéricos para evitar devoluciones en nómina.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.85rem', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                  <CheckCircle2 size={20} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 700, color: '#065f46', fontSize: '0.9rem' }}>4. Cuadratura de Horas Semanales</div>
                    <div style={{ fontSize: '0.8rem', color: '#047857' }}>Comprobar que el total de horas semanales no sobrepase la dedicación laboral del docente (ej. 8h o 12h en Tiempo Convencional).</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MATRIZ DE ROLES */}
          {activeTab === 'roles' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
                Distribución de responsabilidades para mantener la integridad de los datos en el sistema:
              </div>

              <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead style={{ background: '#f8fafc', borderBottom: '1.5px solid #cbd5e1' }}>
                    <tr>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#334155' }}>Rol</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#334155' }}>Responsabilidad Principal</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#334155' }}>Límite de Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#002f6c' }}>Administrador</td>
                      <td style={{ padding: '0.75rem 1rem' }}>Gestión de períodos, fechas oficiales, usuarios y respaldos en bóveda.</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>No altera asignaciones docentes sin consentimiento del Jefe de Dpto.</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#008744' }}>Jefe de Departamento</td>
                      <td style={{ padding: '0.75rem 1rem' }}>Asignación de carga académica, validación de materias y verificación de datos.</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>Solo gestiona los docentes adscritos a su respectivo departamento.</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#d97706' }}>Subdirección de Docencia</td>
                      <td style={{ padding: '0.75rem 1rem' }}>Supervisión de la Oferta Académica Consolidada y emisión de Fichas Oficiales.</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>Auditoría general y aprobación de cruces interdisciplinarios.</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#475569' }}>Personal Docente</td>
                      <td style={{ padding: '0.75rem 1rem' }}>Revisión de su Ficha de Oferta Académica y actualización de recaudos.</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>Modo consulta y reporte de discrepancias a su jefatura.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer del Modal */}
        <div style={{
          padding: '1rem 2rem',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Documento Institucional Oficial • UPEL IPRGR Rubio • Lapso 2026
          </div>
          <button 
            className="btn btn-primary"
            onClick={onClose}
            style={{ padding: '0.45rem 1.25rem', fontSize: '0.85rem' }}
          >
            Entendido
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default GuiaOrganizacionModal;
