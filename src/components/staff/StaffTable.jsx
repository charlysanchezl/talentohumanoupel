import React from 'react';
import { CheckSquare, Clock, Lock, Calculator, MoreHorizontal } from 'lucide-react';
import StaffPagination from './StaffPagination';

const StaffTable = ({
  paginatedDocentes,
  filteredStaffCount,
  currentPageDocentes,
  totalPagesDocentes,
  setCurrentPageDocentes,
  itemsPerPage,
  setItemsPerPage,
  academicPeriodsList,
  filterPeriodo,
  user,
  handleOpenValidate,
  activeActionMenu,
  setActiveActionMenu,
  isExpedienteCompleto,
  getDocenteContractStatus,
  getStatusBadgeInfo
}) => {
  return (
    <div className="table-container table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>Docente</th>
            <th>Títulos</th>
            <th>Materias Asignadas</th>
            <th>Vigencia</th>
            <th>Estado Ficha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {paginatedDocentes.length > 0 ? (
            paginatedDocentes.map((staff, sIdx) => {
              const hasMaterias = Array.isArray(staff.materias) && staff.materias.length > 0;
              const isValidated = hasMaterias && (staff.status === 'Validado' || staff.status === 'Activo');
              const expedienteCompleto = isExpedienteCompleto ? isExpedienteCompleto(staff) : false;
              const nombreCompleto = staff.nombres ? `${staff.nombres} ${staff.apellidos}` : (staff.apellidos || staff.cedula);
              const inicial1 = (staff.nombres ? staff.nombres.trim().charAt(0) : (staff.apellidos ? staff.apellidos.trim().charAt(0) : 'D')).toUpperCase();
              const inicial2 = (staff.apellidos && staff.nombres ? staff.apellidos.trim().charAt(0) : '').toUpperCase();

              return (
                <tr key={staff.cedula || staff.id || sIdx}>
                  <td>
                    <div className="user-cell">
                      <div className="avatar">
                        {inicial1}{inicial2}
                      </div>
                      <div className="user-cell-info">
                        <span className="user-name">{nombreCompleto}</span>
                        <span className="user-email">C.I: {staff.cedula}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }} title={staff.titulosPregrado}>
                      {staff.titulosPregrado || '-'}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{staff.categoriaDocente}</div>
                  </td>
                  <td style={{ fontSize: '0.82rem', maxWidth: '270px' }}>
                    {staff.materias && staff.materias.length > 0 ? (
                      <div>
                        {(() => {
                          const totHoras = staff.materias.reduce((acc, m) => acc + (parseInt(m.horasSemanal) || 0), 0);
                          return (
                            <>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px', gap: '0.4rem' }}>
                                <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.78rem' }}>
                                  {staff.materias.length} asig. ({totHoras}h sem)
                                </span>
                                <span style={{ 
                                  fontSize: '0.66rem', 
                                  fontWeight: 800, 
                                  padding: '1px 5px', 
                                  borderRadius: '4px',
                                  background: totHoras > 16 ? '#fee2e2' : totHoras >= 12 ? '#eff6ff' : '#ecfdf5',
                                  color: totHoras > 16 ? '#dc2626' : totHoras >= 12 ? '#1d4ed8' : '#059669',
                                  border: `1px solid ${totHoras > 16 ? '#fca5a5' : totHoras >= 12 ? '#bfdbfe' : '#a7f3d0'}`
                                }}>
                                  {totHoras > 16 ? 'Sobrecarga' : totHoras >= 12 ? 'Tope Óptimo' : 'Carga Normal'}
                                </span>
                              </div>
                              <div style={{
                                width: '100%',
                                height: '3.5px',
                                background: '#e2e8f0',
                                borderRadius: '99px',
                                overflow: 'hidden',
                                marginBottom: '4px'
                              }}>
                                <div style={{
                                  width: `${Math.min(100, Math.round((totHoras / 12) * 100))}%`,
                                  height: '100%',
                                  background: totHoras > 16 
                                    ? 'linear-gradient(90deg, #ea580c, #dc2626)' 
                                    : totHoras >= 12 
                                      ? 'linear-gradient(90deg, #2563eb, #002f6c)' 
                                      : 'linear-gradient(90deg, #10b981, #059669)',
                                  borderRadius: '99px',
                                  transition: 'width 0.4s ease'
                                }}></div>
                              </div>
                            </>
                          );
                        })()}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {staff.materias.slice(0, 2).map((m, i) => (
                            <div key={i} style={{ 
                              fontSize: '0.75rem', 
                              background: '#f8fafc', 
                              border: '1px solid #f1f5f9', 
                              borderRadius: '4px', 
                              padding: '1px 5px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              <strong style={{ color: 'var(--text-main)' }}>{m.nombre}</strong>
                              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>({m.horasSemanal}h)</span>
                              {m.seccion && <span style={{ background: '#eff6ff', color: '#1d4ed8', fontSize: '0.67rem', padding: '0 3px', borderRadius: '3px', fontWeight: 600 }}>Sec. {m.seccion}</span>}
                              {m.cupos !== undefined && m.cupos !== null && m.cupos !== '' && (
                                <span style={{ background: '#f0fdf4', color: '#15803d', fontSize: '0.67rem', padding: '0 3px', borderRadius: '3px' }}>
                                  {m.inscritos || 0}/{m.cupos}
                                </span>
                              )}
                            </div>
                          ))}
                          {staff.materias.length > 2 && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, paddingLeft: '2px' }}>
                              +{staff.materias.length - 2} materia(s) más...
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontStyle: 'italic' }}>Sin materias asignadas</span>
                    )}
                  </td>
                  <td>
                    <span style={{ 
                      fontSize: '0.74rem', 
                      fontWeight: 600, 
                      color: '#334155', 
                      background: '#f8fafc', 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      border: '1px solid #e2e8f0', 
                      display: 'inline-block',
                      whiteSpace: 'nowrap'
                    }}>
                      {staff.fechaDesde || 'N/A'} al {staff.fechaHasta || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {isValidated ? (
                          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '1px 6px', fontSize: '0.68rem', borderRadius: '99px' }}>
                            <CheckSquare size={12} /> Validado
                          </span>
                        ) : hasMaterias ? (
                          <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '1px 6px', fontSize: '0.68rem', borderRadius: '99px', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
                            <Clock size={12} /> Por Revisar
                          </span>
                        ) : (
                          <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '1px 6px', fontSize: '0.68rem', borderRadius: '99px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' }}>
                            <Clock size={12} /> Sin Carga
                          </span>
                        )}
                        {(() => {
                          const cStatus = getDocenteContractStatus ? getDocenteContractStatus(staff, academicPeriodsList) : staff.status;
                          if (!isValidated && cStatus === 'Por Revisar') return null;
                          const cInfo = getStatusBadgeInfo ? getStatusBadgeInfo(cStatus) : { color: '#334155', bg: '#f1f5f9', border: '#cbd5e1', label: cStatus };
                          return (
                            <span style={{
                              fontSize: '0.66rem',
                              fontWeight: 700,
                              color: cInfo.color,
                              background: cInfo.bg,
                              border: `1px solid ${cInfo.border}`,
                              borderRadius: '99px',
                              padding: '1px 6px'
                            }}>
                              {cInfo.label}
                            </span>
                          );
                        })()}
                      </div>
                      <span style={{ 
                        fontSize: '0.68rem', 
                        fontWeight: 600, 
                        color: expedienteCompleto ? '#15803d' : '#b45309',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        {expedienteCompleto ? '✓ Completo' : '⚠ Incompleto'}
                      </span>
                    </div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'nowrap' }}>
                      {/* Botón Principal: Modificar o Cargar Carga Académica */}
                      {(user?.role === 'JEFE' || user?.role === 'ADMIN') && (() => {
                        const isPeriodPlanning = filterPeriodo !== 'Todos' && academicPeriodsList.find(p => p.nombre === filterPeriodo)?.estado === 'PLANIFICACION';
                        return (
                          <button 
                            className="btn btn-primary" 
                            style={{ 
                              padding: '0.3rem 0.6rem', 
                              fontSize: '0.78rem', 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '0.3rem', 
                              fontWeight: 700,
                              ...(isPeriodPlanning ? { opacity: 0.55, cursor: 'not-allowed', background: '#64748b', borderColor: '#64748b' } : {})
                            }}
                            onClick={() => handleOpenValidate(staff)}
                            title={isPeriodPlanning ? `Período ${filterPeriodo} en planificación (No abierto para carga de materias)` : (hasMaterias ? "Modificar Carga Académica" : "Cargar materias y validar")}
                          >
                            {isPeriodPlanning ? <Lock size={13} /> : (hasMaterias ? <Calculator size={13} /> : <CheckSquare size={13} />)}
                            <span>{isPeriodPlanning ? 'Bloqueado' : (hasMaterias ? 'Modificar' : 'Cargar')}</span>
                          </button>
                        );
                      })()}

                      {/* Menú Compacto de Opciones y Ficha (⋯) */}
                      <div className="row-actions-dropdown">
                        <button
                          type="button"
                          className="btn btn-outline row-actions-trigger-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            const spaceBelow = window.innerHeight - rect.bottom;
                            const openUpwards = spaceBelow < 280 && rect.top > 280;
                            setActiveActionMenu(prev => (prev?.cedula === staff.cedula) ? null : {
                              cedula: staff.cedula,
                              staff: staff,
                              top: rect.bottom + 4,
                              bottom: window.innerHeight - rect.top + 4,
                              right: Math.max(12, window.innerWidth - rect.right),
                              openUpwards
                            });
                          }}
                          style={{
                            padding: '0.3rem 0.5rem',
                            fontSize: '0.78rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: activeActionMenu?.cedula === staff.cedula ? '#002f6c' : '#475569',
                            borderColor: activeActionMenu?.cedula === staff.cedula ? '#002f6c' : '#cbd5e1',
                            background: activeActionMenu?.cedula === staff.cedula ? '#f1f5f9' : 'transparent',
                            borderRadius: '6px'
                          }}
                          title="Más opciones del docente"
                        >
                          <MoreHorizontal size={15} />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                No hay docentes registrados en este departamento que coincidan con la búsqueda.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <StaffPagination 
        currentPage={currentPageDocentes}
        totalPages={totalPagesDocentes}
        setCurrentPage={setCurrentPageDocentes}
        totalCount={filteredStaffCount}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        label="docentes"
      />
    </div>
  );
};

export default StaffTable;
