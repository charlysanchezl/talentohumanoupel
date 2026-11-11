import React from 'react';
import { CheckSquare, Clock, Lock, Calculator, MoreHorizontal } from 'lucide-react';
import StaffPagination from './StaffPagination';
import { getDisplayEspecialidad } from '../../utils/contractStatus';

const ConsultarDocentesTable = ({
  paginatedStaff = [],
  filteredStaffCount = 0,
  currentPage = 1,
  totalPages = 1,
  setCurrentPage,
  itemsPerPage = 25,
  setItemsPerPage,
  academicPeriodsList = [],
  filterPeriodo = 'Todos',
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
            <th>Departamento</th>
            <th>Cédula</th>
            <th>Docente</th>
            <th>Centro de Atención</th>
            <th>Especialidad</th>
            <th>Materias Asignadas</th>
            <th>Estado Ficha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {paginatedStaff.length > 0 ? (
            paginatedStaff.map((staff, sIdx) => {
              const hasMaterias = Array.isArray(staff.materias) && staff.materias.length > 0;
              const isValidated = staff.status === 'Validado' || staff.status === 'Activo';
              const expedienteCompleto = isExpedienteCompleto ? isExpedienteCompleto(staff) : false;
              const nombreCompleto = staff.nombres ? `${staff.nombres} ${staff.apellidos}` : (staff.apellidos || staff.cedula);
              const totalHorasSem = (staff.materias || []).reduce((acc, m) => acc + (parseInt(m.horasSemanal) || 0), 0);

              return (
                <tr key={staff.cedula || staff.id || sIdx}>
                  <td>
                    <span className="badge badge-info" style={{ whiteSpace: 'nowrap' }}>{staff.department}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {staff.cedula}
                  </td>
                  <td>
                    <div className="user-name" style={{ fontWeight: 600 }}>{nombreCompleto}</div>
                    {staff.titulosPregrado && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{staff.titulosPregrado}</div>
                    )}
                  </td>
                  <td>
                    <span className="badge" style={{ background: '#f1f5f9', color: '#334155' }}>
                      {staff.sedeCentro || 'Rubio'}
                    </span>
                  </td>
                  <td>
                    {getDisplayEspecialidad(staff, '-')}
                  </td>
                  <td style={{ fontSize: '0.85rem', maxWidth: '280px' }}>
                    {staff.materias && staff.materias.length > 0 ? (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', gap: '0.4rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.82rem' }}>
                            {staff.materias.length} asig. ({totalHorasSem}h sem)
                          </span>
                          <span style={{ 
                            fontSize: '0.68rem', 
                            fontWeight: 800, 
                            padding: '1px 6px', 
                            borderRadius: '4px',
                            background: totalHorasSem > 16 ? '#fee2e2' : totalHorasSem >= 12 ? '#eff6ff' : '#ecfdf5',
                            color: totalHorasSem > 16 ? '#dc2626' : totalHorasSem >= 12 ? '#1d4ed8' : '#059669',
                            border: `1px solid ${totalHorasSem > 16 ? '#fca5a5' : totalHorasSem >= 12 ? '#bfdbfe' : '#a7f3d0'}`
                          }}>
                            {totalHorasSem > 16 ? '⚠️ Sobrecarga' : totalHorasSem >= 12 ? 'Tope Óptimo' : 'Carga Normal'}
                          </span>
                        </div>

                        {/* Mini barra de progreso (Termómetro de Carga Horaria) */}
                        <div style={{
                          width: '100%',
                          height: '5px',
                          background: '#e2e8f0',
                          borderRadius: '99px',
                          overflow: 'hidden',
                          marginBottom: '6px'
                        }}>
                          <div style={{
                            width: `${Math.min(100, Math.round((totalHorasSem / 12) * 100))}%`,
                            height: '100%',
                            background: totalHorasSem > 16 
                              ? 'linear-gradient(90deg, #ea580c, #dc2626)' 
                              : totalHorasSem >= 12 
                                ? 'linear-gradient(90deg, #2563eb, #002f6c)' 
                                : 'linear-gradient(90deg, #10b981, #059669)',
                            borderRadius: '99px',
                            transition: 'width 0.4s ease'
                          }}></div>
                        </div>

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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
                      <span className={`badge ${isValidated ? 'badge-success' : (hasMaterias ? 'badge-warning' : 'badge-danger')}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '1px 6px', fontSize: '0.68rem', borderRadius: '99px', background: !isValidated && hasMaterias ? '#fef3c7' : undefined, color: !isValidated && hasMaterias ? '#92400e' : undefined, border: !isValidated && hasMaterias ? '1px solid #fde68a' : undefined }}>
                        {isValidated ? <CheckSquare size={12} /> : <Clock size={12} />}
                        {isValidated ? 'Validado' : (hasMaterias ? 'Por Revisar' : 'Sin Carga')}
                      </span>
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
                            padding: '1px 6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {cInfo.label}
                          </span>
                        );
                      })()}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'nowrap', justifyContent: 'center' }}>
                      {/* Botón Principal: Modificar o Cargar Carga Académica */}
                      {(user?.role === 'ADMIN' || user?.role === 'JEFE') && (() => {
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
              <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                No se encontraron docentes con la cédula o nombre ingresado.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Paginación Modular Reutilizada */}
      <StaffPagination
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        totalCount={filteredStaffCount}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        label="docentes"
      />
    </div>
  );
};

export default ConsultarDocentesTable;
