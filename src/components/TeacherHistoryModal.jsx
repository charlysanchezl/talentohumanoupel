import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, History, Clock, BookOpen, CheckCircle, AlertCircle, Copy, Calendar, User } from 'lucide-react';
import { getTeacherHistory } from '../data';

const TeacherHistoryModal = ({ isOpen, onClose, staff, onCopyMaterias }) => {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriodo, setFilterPeriodo] = useState('Todos');

  useEffect(() => {
    if (isOpen && staff) {
      setLoading(true);
      setFilterPeriodo('Todos');
      getTeacherHistory(staff.cedula)
        .then(data => setHistoryList(data || []))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, staff]);

  const uniquePeriods = React.useMemo(() => {
    const set = new Set();
    historyList.forEach(item => {
      if (item.periodoAcademico) set.add(item.periodoAcademico);
    });
    return Array.from(set);
  }, [historyList]);

  const filteredHistory = React.useMemo(() => {
    if (filterPeriodo === 'Todos') return historyList;
    return historyList.filter(item => item.periodoAcademico === filterPeriodo);
  }, [historyList, filterPeriodo]);

  if (!isOpen || !staff) return null;

  const modalElement = (
    <div className="upel-modal-overlay" onClick={onClose}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '750px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        margin: 'auto'
      }} onClick={e => e.stopPropagation()}>
        {/* Encabezado */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              padding: '0.5rem',
              display: 'flex'
            }}>
              <History size={22} color="#38bdf8" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
                Kardex Histórico de Cargas Académicas
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                {staff.nombres} {staff.apellidos} &bull; C.I: {staff.cedula} &bull; {staff.department}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              color: '#ffffff'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Barra de Filtro de Período Académico */}
        {!loading && historyList.length > 0 && (
          <div style={{
            padding: '0.65rem 1.75rem',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
              Historial de Períodos:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <select
                value={filterPeriodo}
                onChange={(e) => setFilterPeriodo(e.target.value)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#1e293b',
                  background: '#ffffff',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="Todos">Todos los Períodos ({historyList.length})</option>
                {uniquePeriods.map(p => (
                  <option key={p} value={p}>Período {p}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Contenido */}
        <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              <History size={32} className="animate-spin" style={{ margin: '0 auto 0.5rem auto', color: '#2563eb' }} />
              <p>Consultando historial académico...</p>
            </div>
          ) : historyList.length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}>
              <Clock size={40} style={{ margin: '0 auto 0.75rem auto', opacity: 0.3 }} />
              <h4 style={{ margin: 0, fontWeight: 600, color: '#334155' }}>Sin registros históricos previos</h4>
              <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.88rem' }}>
                Este docente aún no cuenta con cierres o réplicas de períodos anteriores guardados.
              </p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}>
              <Clock size={40} style={{ margin: '0 auto 0.75rem auto', opacity: 0.3 }} />
              <h4 style={{ margin: 0, fontWeight: 600, color: '#334155' }}>No hay registros para el período seleccionado</h4>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {filteredHistory.map((item, index) => {
                const materias = item.materias || [];
                return (
                  <div 
                    key={index}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}
                  >
                    {/* Header de la tarjeta de período */}
                    <div style={{
                      background: '#f8fafc',
                      padding: '0.85rem 1.25rem',
                      borderBottom: '1px solid #e2e8f0',
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{
                          background: '#2563eb',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          padding: '3px 10px',
                          borderRadius: '6px'
                        }}>
                          Período {item.periodoAcademico}
                        </span>
                        <span style={{
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: item.status === 'Validado' ? '#ecfdf5' : '#fef3c7',
                          color: item.status === 'Validado' ? '#065f46' : '#92400e'
                        }}>
                          {item.status || 'Por Revisar'}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {item.semanas} semanas ({item.fechaDesde || 'N/A'} al {item.fechaHasta || 'N/A'})
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b' }}>
                          {item.totalHorasSemanal} hrs/sem
                        </span>
                        {onCopyMaterias && (
                          <button
                            onClick={() => {
                              onCopyMaterias(materias, item.periodoAcademico);
                              onClose();
                            }}
                            style={{
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              color: '#1d4ed8',
                              padding: '0.35rem 0.75rem',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem'
                            }}
                            title="Copiar estas materias al formulario de edición actual"
                          >
                            <Copy size={14} /> Usar esta carga
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Materias del período */}
                    <div style={{ padding: '1rem 1.25rem', background: '#ffffff' }}>
                      {materias.length === 0 ? (
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
                          Sin materias registradas en este lapso.
                        </p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {materias.map((m, mIdx) => (
                            <div 
                              key={mIdx}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0.5rem 0.75rem',
                                background: '#f8fafc',
                                borderRadius: '6px',
                                fontSize: '0.88rem'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <BookOpen size={16} color="#64748b" />
                                <span style={{ fontWeight: 600, color: '#1e293b' }}>{m.nombre}</span>
                                {m.especialidadDestino && (
                                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                    &bull; {m.especialidadDestino}
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>
                                {m.horasSemanal}h semanales &bull; {m.horasLapso}h lapso
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pie */}
        <div style={{
          padding: '0.85rem 1.75rem',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '0.5rem 1.25rem',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: '#334155'
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalElement, document.body) : null;
};

export default TeacherHistoryModal;
