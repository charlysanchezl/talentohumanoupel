import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Calendar, Clock, AlertCircle, CheckCircle2, Play, 
  Plus, Edit2, Save, ArrowRight, ShieldCheck, History, Info, Sparkles,
  AlertTriangle, Database, RotateCcw
} from 'lucide-react';
import { 
  getAcademicPeriodsList, 
  createAcademicPeriod, 
  updateAcademicPeriod, 
  activateAcademicPeriod,
  closeAcademicPeriod, 
  reactivateAcademicPeriod,
  getCurrentUser,
  getNextUpelPeriod,
  getHuerfanasData
} from '../data';

const PeriodManagementModal = ({ isOpen, onClose, onPeriodActivated, initialPeriodIdToEdit, onOpenPromover }) => {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPeriod, setEditingPeriod] = useState(null);
  const [editForm, setEditForm] = useState({ semanas: 15, fechaDesde: '', fechaHasta: '', observaciones: '', propagarADocentes: true });

  const [confirmActivationModal, setConfirmActivationModal] = useState(null);
  const [activationForm, setActivationForm] = useState({ fechaDesde: '', fechaHasta: '', semanas: 15, observaciones: '' });
  const [activationOrphans, setActivationOrphans] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleOpenActivationModal = (p) => {
    const today = new Date().toISOString().slice(0, 10);
    const sem = p.semanas || 15;
    let defHasta = p.fechaHasta || '';
    if (!defHasta && (p.fechaDesde || today)) {
      const baseDate = new Date(p.fechaDesde || today);
      baseDate.setDate(baseDate.getDate() + (sem * 7));
      try {
        defHasta = baseDate.toISOString().slice(0, 10);
      } catch (e) {
        defHasta = '';
      }
    }
    setActivationForm({
      fechaDesde: p.fechaDesde || today,
      fechaHasta: defHasta,
      semanas: sem,
      observaciones: p.observaciones || ''
    });
    setConfirmActivationModal(p);
  };

  const [selectedPeriodFilter, setSelectedPeriodFilter] = useState('Todos');
  const [customPeriodMode, setCustomPeriodMode] = useState(false);

  const currentUser = getCurrentUser();
  // La reprogramación, creación y activación de períodos está permitida para ADMIN, AUDITOR y DOCENCIA (Subdirección de Docencia)
  const canManage = ['ADMIN', 'DOCENCIA', 'AUDITOR'].includes(currentUser?.role);

  const fetchPeriods = async () => {
    setLoading(true);
    try {
      const data = await getAcademicPeriodsList();
      setPeriods(data || []);
      
      // Si se solicita editar un lapso inicial (ej. el activo), solo permitirlo si es Administrador del Sistema
      if (canManage && initialPeriodIdToEdit && data && data.length > 0) {
        const target = data.find(p => 
          p.id === initialPeriodIdToEdit || 
          p.nombre === initialPeriodIdToEdit || 
          (initialPeriodIdToEdit === 'ACTIVO' && p.estado === 'ACTIVO') ||
          p.estado === 'ACTIVO'
        );
        if (target) {
          setEditingPeriod(target.id);
          setEditForm({
            semanas: target.semanas || 15,
            fechaDesde: target.fechaDesde || '',
            fechaHasta: target.fechaHasta || '',
            observaciones: target.observaciones || '',
            propagarADocentes: true
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPeriods();
      setStatusMessage(null);
      setSelectedPeriodFilter('Todos');
    } else {
      setEditingPeriod(null);
    }
  }, [isOpen, initialPeriodIdToEdit]);

  useEffect(() => {
    if (confirmActivationModal && confirmActivationModal.nombre) {
      setActivationOrphans(null);
      getHuerfanasData(confirmActivationModal.nombre).then(data => {
        setActivationOrphans(data);
      }).catch(() => setActivationOrphans(null));
    }
  }, [confirmActivationModal]);

  if (!isOpen) return null;

  const currentActive = periods.find(p => p.estado === 'ACTIVO');
  const nextUpelSemester = getNextUpelPeriod(currentActive?.nombre);
  const planningPeriods = periods.filter(p => p.estado === 'PLANIFICACION');
  const closedPeriods = periods.filter(p => p.estado === 'CERRADO');

  const displayActive = (selectedPeriodFilter === 'Todos' || currentActive?.nombre === selectedPeriodFilter) ? currentActive : null;
  const displayPlanning = selectedPeriodFilter === 'Todos' 
    ? planningPeriods 
    : planningPeriods.filter(p => p.nombre === selectedPeriodFilter);
  const displayClosed = selectedPeriodFilter === 'Todos'
    ? closedPeriods
    : closedPeriods.filter(p => p.nombre === selectedPeriodFilter);

  const todayStr = new Date().toISOString().slice(0, 10);
  const isPeriodExpired = (p) => {
    return Boolean(p && p.fechaHasta && p.fechaHasta.trim() !== '' && p.fechaHasta < todayStr);
  };

  const handleClosePeriod = async (p) => {
    const expired = isPeriodExpired(p);
    let confirmMsg = `¿Confirma el CIERRE OFICIAL del lapso ${p.nombre}? Toda la programación académica actual, docentes y asignaturas quedarán 100% resguardadas en el histórico institucional.`;
    if (!expired && p.fechaHasta) {
      confirmMsg = `⚠️ ATENCIÓN: El período ${p.nombre} todavía se encuentra en curso (vigente hasta el ${p.fechaHasta}).\n\nEl sistema está configurado para cerrarlo de forma AUTOMÁTICA y segura por calendario al cumplirse esa fecha sin que tengas que intervenir.\n\n¿Estás completamente seguro de que deseas forzar un cierre anticipado extraordinario?`;
    }
    if (!window.confirm(confirmMsg)) {
      return;
    }
    setIsProcessing(true);
    try {
      const res = await closeAcademicPeriod(p.id, { motivo: 'Cierre oficial institucional por culminación de calendario' });
      if (res && res.success) {
        setStatusMessage({ type: 'success', text: res.message || `Período ${p.nombre} cerrado exitosamente.` });
        await fetchPeriods();
        if (onPeriodActivated) onPeriodActivated(p.nombre);
      } else {
        setStatusMessage({ type: 'error', text: res?.error || 'Error al cerrar el período.' });
      }
    } catch (e) {
      setStatusMessage({ type: 'error', text: e.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReactivatePeriod = async (p) => {
    if (!window.confirm(`¿Deseas REACTIVAR y reabrir el período ${p.nombre}? Esto restaurará el lapso como oficial en curso sin alterar la carga académica ni los docentes.`)) {
      return;
    }
    setIsProcessing(true);
    setStatusMessage(null);
    try {
      const res = await reactivateAcademicPeriod(p.id, { motivo: 'Reactivación solicitada por usuario' });
      if (res && res.success) {
        setStatusMessage({ type: 'success', text: res.message || `Período ${p.nombre} reactivado exitosamente.` });
        await fetchPeriods();
        if (onPeriodActivated) onPeriodActivated(p.nombre);
      } else {
        setStatusMessage({ type: 'error', text: res?.error || 'Error al reactivar el período.' });
      }
    } catch (e) {
      setStatusMessage({ type: 'error', text: e.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartEdit = (p) => {
    setEditingPeriod(p.id);
    setEditForm({
      semanas: p.semanas || 15,
      fechaDesde: p.fechaDesde || '',
      fechaHasta: p.fechaHasta || '',
      observaciones: p.observaciones || '',
      propagarADocentes: true
    });
  };

  const handleSaveEdit = async (id, isReprog = false) => {
    setIsProcessing(true);
    const res = await updateAcademicPeriod(id, editForm);
    setIsProcessing(false);
    if (res && res.success) {
      setEditingPeriod(null);
      fetchPeriods();
      setStatusMessage({ 
        type: 'success', 
        text: isReprog 
          ? '¡Reprogramación exitosa! Se actualizaron las fechas y el motivo del lapso activo en el calendario oficial sin alterar el cálculo de horas docentes (normativa estándar de 15 semanas).' 
          : 'Período actualizado con éxito.' 
      });
      const targetPeriod = periods.find(p => p.id === id);
      if (onPeriodActivated) {
        onPeriodActivated(targetPeriod?.nombre || 'Todos');
      }
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Error al actualizar período.' });
    }
  };

  const handleAutoOpenNextPeriod = async () => {
    setIsProcessing(true);
    setStatusMessage(null);
    const res = await createAcademicPeriod({
      nombre: nextUpelSemester,
      estado: 'PLANIFICACION',
      semanas: 15,
      observaciones: 'Apertura automática según régimen semestral UPEL (2 períodos por año: I y II)'
    });
    setIsProcessing(false);
    if (res && res.success) {
      fetchPeriods();
      setStatusMessage({ type: 'success', text: `Período ${nextUpelSemester} habilitado en modo Planificación según la secuencia semestral UPEL.` });
    } else {
      setStatusMessage({ type: 'error', text: res?.error || 'Error al habilitar el siguiente período.' });
    }
  };

  const handleConfirmActivate = async () => {
    if (!confirmActivationModal) return;

    if (!activationForm.fechaDesde || !activationForm.fechaHasta) {
      alert('Debe indicar la Fecha de Inicio y la Fecha de Culminación del nuevo período.');
      return;
    }
    if (activationForm.fechaHasta < activationForm.fechaDesde) {
      alert('La Fecha de Culminación no puede ser anterior a la Fecha de Inicio.');
      return;
    }

    setIsProcessing(true);
    setStatusMessage(null);

    const res = await activateAcademicPeriod({ 
      periodoId: confirmActivationModal.id, 
      nombre: confirmActivationModal.nombre,
      fechaDesde: activationForm.fechaDesde,
      fechaHasta: activationForm.fechaHasta,
      semanas: Number(activationForm.semanas) || 15,
      observaciones: activationForm.observaciones
    });

    setIsProcessing(false);
    setConfirmActivationModal(null);

    if (res && res.success) {
      setStatusMessage({ 
        type: 'success', 
        text: res.message || `¡Éxito! Se ha activado oficialmente el período ${res.periodoActivado}.` 
      });
      fetchPeriods();
      if (onPeriodActivated) {
        onPeriodActivated(res.periodoActivado);
      }
    } else {
      setStatusMessage({ 
        type: 'error', 
        text: res.error || 'Ocurrió un error al activar el período.' 
      });
    }
  };

  if (!isOpen) return null;

  const modalElement = (
    <div className="upel-modal-overlay" onClick={onClose}>
      <div style={{
        background: '#ffffff',
        borderRadius: '18px',
        width: '100%',
        maxWidth: '850px',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        border: '1px solid #cbd5e1',
        overflow: 'hidden',
        margin: 'auto'
      }} onClick={e => e.stopPropagation()}>
        {/* Cabecera */}
        <div style={{
          padding: '1.25rem 1.75rem',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #334155'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #0284c7, #0369a1)',
              borderRadius: '10px',
              padding: '0.6rem',
              display: 'flex',
              color: '#ffffff'
            }}>
              <Calendar size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
                Gestión Institucional de Lapsos Académicos
              </h2>
              <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                Planificación anticipada de carga docente y transición oficial de semestres
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.45rem',
              color: '#cbd5e1',
              cursor: 'pointer',
              display: 'flex'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Mensaje de estado */}
        {statusMessage && (
          <div style={{
            padding: '0.85rem 1.5rem',
            background: statusMessage.type === 'success' ? '#ecfdf5' : '#fef2f2',
            borderBottom: `1px solid ${statusMessage.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
            color: statusMessage.type === 'success' ? '#065f46' : '#991b1b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.9rem'
          }}>
            {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span style={{ fontWeight: 500 }}>{statusMessage.text}</span>
          </div>
        )}

        {!canManage && (
          <div style={{
            padding: '0.75rem 1.75rem',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.84rem',
            color: '#475569'
          }}>
            <ShieldCheck size={18} color="#0284c7" />
            <span>
              <strong>Modo Consulta Institucional:</strong> La creación, activación y reprogramación de lapsos académicos está reservada para el <strong>Administrador del Sistema, Auditor y Subdirección de Docencia</strong>.
            </span>
          </div>
        )}

        {/* Pestañas de navegación interna y Lista Desplegable de Todos los Períodos */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc',
          padding: '0.5rem 1.75rem 0.5rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
              Ciclo Semestral UPEL
            </span>
            <span style={{
              background: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
              fontSize: '0.73rem',
              fontWeight: 700,
              padding: '0.2rem 0.65rem',
              borderRadius: '999px',
              letterSpacing: '0.01em'
            }}>
              Régimen Oficial: 2 Períodos por Año (I y II)
            </span>
          </div>

          {/* LISTA DESPLEGABLE: TODOS LOS PERÍODOS ACADÉMICOS */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
              Período:
            </span>
            <select
              value={selectedPeriodFilter}
              onChange={(e) => {
                setSelectedPeriodFilter(e.target.value);
                setActiveTab('list');
              }}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                border: '1.5px solid #0284c7',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#0369a1',
                background: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(2, 132, 199, 0.15)',
                outline: 'none'
              }}
            >
              <option value="Todos">Todos los Períodos ({periods.length})</option>
              {periods.map(p => (
                <option key={p.id || p.nombre} value={p.nombre}>
                  {p.nombre} {p.estado === 'ACTIVO' ? '🟢 (En Curso)' : p.estado === 'PLANIFICACION' ? '🔵 (En Planificación)' : '⚪ (Cerrado)'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Contenido */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1.75rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Cargando información de períodos...</div>
            </div>
          ) : (
            /* Listado de Períodos */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Notificación de filtro activo por lista desplegable */}
              {selectedPeriodFilter !== 'Todos' && (
                <div style={{
                  background: '#f0f9ff',
                  border: '1.5px solid #bae6fd',
                  borderRadius: '12px',
                  padding: '0.75rem 1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: '#0369a1',
                  fontSize: '0.88rem'
                }}>
                  <span>Filtrando por período: <strong style={{ fontSize: '1rem', color: '#0284c7' }}>{selectedPeriodFilter}</strong></span>
                  <button
                    onClick={() => setSelectedPeriodFilter('Todos')}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #7dd3fc',
                      color: '#0284c7',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Ver Todos los Períodos
                  </button>
                </div>
              )}

              {/* 1. SECCIÓN: PERÍODO ACTIVO / EN CURSO */}
              {displayActive ? (() => {
                const isEditingActive = editingPeriod === displayActive.id;
                return (
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.75rem',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: '#0f172a',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        <span style={{ 
                          display: 'inline-block', 
                          width: '10px', 
                          height: '10px', 
                          borderRadius: '50%', 
                          background: '#10b981', 
                          boxShadow: '0 0 8px #10b981' 
                        }}></span>
                        <span>Semestre Vigente / En Curso</span>
                      </div>

                      {canManage && !isEditingActive && (
                        <button
                          type="button"
                          onClick={() => handleStartEdit(displayActive)}
                          style={{
                            background: '#ffffff',
                            border: '1.5px solid #16a34a',
                            color: '#15803d',
                            padding: '0.4rem 0.85rem',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = '#dcfce7';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = '#ffffff';
                          }}
                        >
                          <Edit2 size={14} /> Reprogramar Lapso Actual
                        </button>
                      )}
                    </div>

                    <div style={{
                      background: isEditingActive ? '#fffbeb' : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                      border: isEditingActive ? '2px solid #f59e0b' : '1.5px solid #86efac',
                      borderRadius: '14px',
                      padding: '1.25rem 1.5rem',
                      position: 'relative',
                      boxShadow: isEditingActive ? '0 4px 12px rgba(245, 158, 11, 0.15)' : 'none',
                      transition: 'all 0.2s ease'
                    }}>
                      {isEditingActive ? (
                        /* MODO EDICIÓN / REPROGRAMACIÓN DEL LAPSO ACTIVO */
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#b45309' }}>
                                  Reprogramación Académica: {displayActive.nombre}
                                </span>
                                <span style={{
                                  background: '#fef3c7',
                                  color: '#b45309',
                                  border: '1px solid #fde68a',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  padding: '0.2rem 0.55rem',
                                  borderRadius: '99px',
                                  textTransform: 'uppercase'
                                }}>
                                  En Curso
                                </span>
                              </div>
                              <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#92400e' }}>
                                Ajuste de semanas lectivas, fechas de culminación y registro oficial del motivo institucional.
                              </p>
                            </div>
                            <button 
                              type="button"
                              onClick={() => setEditingPeriod(null)}
                              style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                            >
                              <X size={20} />
                            </button>
                          </div>

                          <div style={{
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            borderRadius: '8px',
                            padding: '0.65rem 0.9rem',
                            fontSize: '0.8rem',
                            color: '#1e40af',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <Info size={18} style={{ flexShrink: 0, color: '#2563eb' }} />
                            <span>
                              <strong>Normativa UPEL:</strong> El cálculo de horas docentes se rige bajo la base curricular oficial de <strong>15 semanas</strong>. La reprogramación de fechas o semanas por contingencia actualiza el calendario académico oficial sin alterar la carga contractual ni el cálculo de horas de los docentes.
                            </span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', marginBottom: '0.85rem' }}>
                            <div>
                              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                                ⏱️ Semanas Académicas
                              </label>
                              <input 
                                type="number" 
                                min="1" 
                                max="30"
                                value={editForm.semanas} 
                                onChange={(e) => setEditForm({ ...editForm, semanas: e.target.value })} 
                                className="filter-input" 
                                style={{ width: '100%', borderColor: '#cbd5e1' }}
                                placeholder="Ej: 16"
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                                📅 Fecha de Inicio
                              </label>
                              <input 
                                type="date" 
                                value={editForm.fechaDesde} 
                                onChange={(e) => setEditForm({ ...editForm, fechaDesde: e.target.value })} 
                                className="filter-input" 
                                style={{ width: '100%', borderColor: '#cbd5e1' }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                                📅 Fecha Culminación (Reprogramada)
                              </label>
                              <input 
                                type="date" 
                                value={editForm.fechaHasta} 
                                onChange={(e) => setEditForm({ ...editForm, fechaHasta: e.target.value })} 
                                className="filter-input" 
                                style={{ width: '100%', borderColor: '#cbd5e1' }}
                              />
                            </div>
                          </div>

                          <div style={{ marginBottom: '0.85rem' }}>
                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                              📝 Motivo Institucional de Reprogramación / Justificación
                            </label>
                            <input 
                              type="text" 
                              value={editForm.observaciones} 
                              onChange={(e) => setEditForm({ ...editForm, observaciones: e.target.value })} 
                              className="filter-input" 
                              style={{ width: '100%', borderColor: '#cbd5e1' }}
                              placeholder="Ej: Extensión de 2 semanas por contingencia de servicios / Ajuste de calendario aprobado por Consejo"
                            />
                          </div>

                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '0.75rem',
                            paddingTop: '0.65rem',
                            borderTop: '1px solid #fed7aa'
                          }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#475569', cursor: 'pointer' }}>
                              <input 
                                type="checkbox" 
                                checked={editForm.propagarADocentes !== false} 
                                onChange={(e) => setEditForm({ ...editForm, propagarADocentes: e.target.checked })} 
                              />
                              <span>Actualizar fechas y vigencia en las fichas docentes (manteniendo horas en 15 semanas)</span>
                            </label>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button 
                                type="button"
                                onClick={() => setEditingPeriod(null)} 
                                className="btn btn-secondary" 
                                style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
                              >
                                Cancelar
                              </button>
                              <button 
                                type="button"
                                onClick={() => handleSaveEdit(displayActive.id, true)} 
                                disabled={isProcessing}
                                className="btn"
                                style={{ 
                                  background: '#d97706',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: '0.45rem 1rem', 
                                  fontSize: '0.85rem',
                                  fontWeight: 700,
                                  borderRadius: '8px',
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '0.4rem',
                                  cursor: 'pointer'
                                }}
                              >
                                <Save size={16} /> {isProcessing ? 'Guardando...' : 'Aplicar Reprogramación'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* MODO VISTA NORMAL */
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#166534' }}>
                                {displayActive.nombre}
                              </span>
                              <span style={{
                                background: isPeriodExpired(displayActive) ? '#dc2626' : '#166534',
                                color: '#ffffff',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                padding: '0.2rem 0.6rem',
                                borderRadius: '99px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem'
                              }}>
                                {isPeriodExpired(displayActive) ? '⏰ Culminado por Fecha' : 'Activo Oficial'}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginTop: '0.5rem', color: '#15803d', fontSize: '0.85rem', fontWeight: 500, flexWrap: 'wrap' }}>
                              <span>⏱️ {displayActive.semanas} semanas académicas</span>
                              {(displayActive.fechaDesde || displayActive.fechaHasta) && (
                                <span>📅 {displayActive.fechaDesde || 'Inicio'} al {displayActive.fechaHasta || 'Fin'}</span>
                              )}
                            </div>
                            {displayActive.observaciones && (
                              <div style={{ 
                                marginTop: '0.6rem', 
                                fontSize: '0.82rem', 
                                color: '#166534', 
                                background: 'rgba(255, 255, 255, 0.7)',
                                borderLeft: '3px solid #16a34a',
                                padding: '0.35rem 0.65rem',
                                borderRadius: '0 6px 6px 0'
                              }}>
                                <strong>Motivo / Nota:</strong> {displayActive.observaciones}
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', alignItems: 'flex-end' }}>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(displayActive)}
                              style={{
                                background: '#16a34a',
                                color: '#ffffff',
                                border: 'none',
                                padding: '0.65rem 1.25rem',
                                borderRadius: '10px',
                                fontSize: '0.92rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 4px 10px rgba(22, 163, 74, 0.35)',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = '#15803d';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = '#16a34a';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                            >
                              <Edit2 size={16} /> Reprogramar Lapso Actual ({displayActive.nombre})
                            </button>

                            {/* Indicador de cierre institucional automático */}
                            {displayActive.fechaHasta && !isPeriodExpired(displayActive) && (
                              <div style={{
                                background: '#f0fdf4',
                                border: '1px solid #86efac',
                                borderRadius: '8px',
                                padding: '0.4rem 0.75rem',
                                fontSize: '0.78rem',
                                color: '#166534',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                fontWeight: 600
                              }}>
                                <Clock size={14} color="#16a34a" />
                                <span>Cierre automático activo: Culmina el {displayActive.fechaHasta}</span>
                              </div>
                            )}

                            {canManage && (
                              <button
                                type="button"
                                onClick={() => handleClosePeriod(displayActive)}
                                disabled={isProcessing}
                                title={isPeriodExpired(displayActive) ? 'El período ya venció, cerrar oficialmente' : 'El sistema cerrará automáticamente al llegar a la fecha. Usa esto solo si necesitas cerrar antes.'}
                                style={{
                                  background: isPeriodExpired(displayActive) ? '#dc2626' : '#64748b',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: isPeriodExpired(displayActive) ? '0.65rem 1.25rem' : '0.45rem 0.9rem',
                                  borderRadius: '10px',
                                  fontSize: isPeriodExpired(displayActive) ? '0.92rem' : '0.78rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  boxShadow: isPeriodExpired(displayActive) ? '0 4px 10px rgba(220, 38, 38, 0.35)' : 'none',
                                  transition: 'all 0.2s ease',
                                  opacity: isPeriodExpired(displayActive) ? 1 : 0.85
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.filter = 'brightness(1.1)';
                                  e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.filter = 'none';
                                  e.currentTarget.style.transform = 'translateY(0)';
                                }}
                              >
                                <ShieldCheck size={15} /> 
                                {isPeriodExpired(displayActive) ? 'Cerrar Lapso Oficialmente' : 'Forzar Cierre Anticipado (Manual)'}
                              </button>
                            )}

                            <div style={{
                              background: 'rgba(255, 255, 255, 0.75)',
                              padding: '0.5rem 0.85rem',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              color: '#166534',
                              maxWidth: '300px',
                              border: '1px solid #bbf7d0',
                              lineHeight: '1.3'
                            }}>
                              <ShieldCheck size={16} style={{ display: 'inline', verticalAlign: '-3px', marginRight: '4px' }} />
                              Las cargas, materias y constancias actuales están ancladas a este lapso.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })() : (
                <div style={{
                  background: '#fef2f2',
                  border: '1.5px dashed #f87171',
                  borderRadius: '14px',
                  padding: '1.25rem 1.5rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#991b1b', fontWeight: 700, fontSize: '0.98rem' }}>
                        <AlertTriangle size={18} /> No hay un lapso académico activo en curso actualmente
                      </div>
                      <p style={{ margin: '0.4rem 0 0', fontSize: '0.82rem', color: '#7f1d1d' }}>
                        Si cerraste el período por error, puedes reactivarlo de inmediato sin alterar la carga docente ni asignaturas.
                      </p>
                    </div>
                    {canManage && closedPeriods.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleReactivatePeriod(closedPeriods[0])}
                        disabled={isProcessing}
                        style={{
                          background: '#0284c7',
                          color: '#ffffff',
                          border: 'none',
                          padding: '0.6rem 1.1rem',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          boxShadow: '0 4px 8px rgba(2, 132, 199, 0.3)'
                        }}
                      >
                        <RotateCcw size={15} /> Reabrir {closedPeriods[0].nombre}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 2. SECCIÓN: PERÍODOS EN PLANIFICACIÓN */}
              {(selectedPeriodFilter === 'Todos' || displayPlanning.length > 0) && (
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    marginBottom: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    <span style={{ 
                      display: 'inline-block', 
                      width: '10px', 
                      height: '10px', 
                      borderRadius: '50%', 
                      background: '#0284c7' 
                    }}></span>
                    <span>Período(s) en Planificación (Asignación Anticipada)</span>
                  </div>

                  {displayPlanning.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {displayPlanning.map(p => {
                      const isEditing = editingPeriod === p.id;
                      return (
                        <div key={p.id} style={{
                          background: '#f8fafc',
                          border: '1.5px solid #cbd5e1',
                          borderRadius: '14px',
                          padding: '1.25rem 1.5rem',
                          transition: 'all 0.2s ease'
                        }}>
                          {isEditing ? (
                            /* Modo Edición Rápida */
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>
                                  Editar configuración de {p.nombre}
                                </span>
                                <button 
                                  onClick={() => setEditingPeriod(null)}
                                  style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
                                >
                                  <X size={18} />
                                </button>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <div>
                                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Semanas</label>
                                  <input 
                                    type="number" 
                                    value={editForm.semanas} 
                                    onChange={(e) => setEditForm({ ...editForm, semanas: e.target.value })} 
                                    className="filter-input" 
                                    style={{ width: '100%' }}
                                  />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Desde</label>
                                  <input 
                                    type="date" 
                                    value={editForm.fechaDesde} 
                                    onChange={(e) => setEditForm({ ...editForm, fechaDesde: e.target.value })} 
                                    className="filter-input" 
                                    style={{ width: '100%' }}
                                  />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Hasta</label>
                                  <input 
                                    type="date" 
                                    value={editForm.fechaHasta} 
                                    onChange={(e) => setEditForm({ ...editForm, fechaHasta: e.target.value })} 
                                    className="filter-input" 
                                    style={{ width: '100%' }}
                                  />
                                </div>
                              </div>
                              <div style={{ marginBottom: '0.75rem' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Observaciones</label>
                                <input 
                                  type="text" 
                                  value={editForm.observaciones} 
                                  onChange={(e) => setEditForm({ ...editForm, observaciones: e.target.value })} 
                                  className="filter-input" 
                                  style={{ width: '100%' }}
                                />
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <button onClick={() => setEditingPeriod(null)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>Cancelar</button>
                                <button onClick={() => handleSaveEdit(p.id)} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                  <Save size={15} /> Guardar
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Modo Vista Normal */
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0369a1' }}>
                                    {p.nombre}
                                  </span>
                                  <span style={{
                                    background: '#e0f2fe',
                                    color: '#0369a1',
                                    border: '1px solid #bae6fd',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '99px',
                                    textTransform: 'uppercase'
                                  }}>
                                    En Planificación
                                  </span>

                                  {/* Etiqueta institucional del estado de carga anticipada */}
                                  {(p.docentesCount > 0) ? (
                                    <span style={{
                                      background: '#ecfdf5',
                                      color: '#065f46',
                                      border: '1px solid #a7f3d0',
                                      fontSize: '0.74rem',
                                      fontWeight: 700,
                                      padding: '0.2rem 0.65rem',
                                      borderRadius: '99px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.35rem'
                                    }}>
                                      <CheckCircle2 size={13} color="#059669" /> ✓ Carga anticipada preparada ({p.docentesCount} docentes)
                                    </span>
                                  ) : (
                                    <span style={{
                                      background: '#fffbeb',
                                      color: '#b45309',
                                      border: '1px solid #fde68a',
                                      fontSize: '0.74rem',
                                      fontWeight: 700,
                                      padding: '0.2rem 0.65rem',
                                      borderRadius: '99px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.35rem'
                                    }}>
                                      <AlertCircle size={13} color="#d97706" /> ⚠️ Sin carga académica precargada
                                    </span>
                                  )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginTop: '0.4rem', color: '#475569', fontSize: '0.85rem' }}>
                                  <span>⏱️ {p.semanas} semanas</span>
                                  {(p.fechaDesde || p.fechaHasta) && (
                                    <span>📅 {p.fechaDesde || 'Inicio'} al {p.fechaHasta || 'Fin'}</span>
                                  )}
                                  {p.observaciones && <span>📝 {p.observaciones}</span>}
                                </div>
                                <div style={{ marginTop: '0.35rem', fontSize: '0.8rem', color: '#64748b' }}>
                                  ✓ Los jefes de departamento ya pueden asignar carga y horarios para este período sin tocar las clases en curso.
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                                {onOpenPromover && (
                                  <button
                                    type="button"
                                    onClick={() => onOpenPromover(p.nombre)}
                                    title={`Replicar y promover carga de docentes hacia ${p.nombre}`}
                                    style={{
                                      background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                                      color: '#ffffff',
                                      border: 'none',
                                      borderRadius: '8px',
                                      padding: '0.55rem 0.95rem',
                                      fontSize: '0.82rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.4rem',
                                      boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
                                      transition: 'all 0.2s ease'
                                    }}
                                  >
                                    <RotateCcw size={14} /> Promover / Replicar Carga Docente
                                  </button>
                                )}

                                {canManage && (
                                  <button
                                    onClick={() => handleOpenActivationModal(p)}
                                    style={{
                                      background: 'linear-gradient(135deg, #16a34a, #15803d)',
                                      color: '#ffffff',
                                      border: 'none',
                                      borderRadius: '8px',
                                      padding: '0.55rem 1rem',
                                      cursor: 'pointer',
                                      fontSize: '0.85rem',
                                      fontWeight: 700,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.45rem',
                                      boxShadow: '0 4px 10px rgba(22, 163, 74, 0.25)'
                                    }}
                                  >
                                    <Play size={16} fill="white" /> Activar Período (Iniciar Semestre)
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{
                    padding: '1.25rem',
                    background: '#f8fafc',
                    border: '1px dashed #cbd5e1',
                    borderRadius: '12px',
                    textAlign: 'center',
                    color: '#64748b'
                  }}>
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem' }}>
                      No tienes ningún período abierto en planificación.
                    </p>
                    {canManage && (
                      <button
                        onClick={handleAutoOpenNextPeriod}
                        className="btn btn-primary"
                        disabled={isProcessing}
                        style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#2563eb' }}
                      >
                        <Plus size={14} /> Habilitar Próximo Semestre ({nextUpelSemester}) para Planificación
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

              {/* 3. SECCIÓN: HISTORIAL DE PERÍODOS CERRADOS */}
              {displayClosed.length > 0 && (
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#64748b',
                    marginBottom: '0.6rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    <History size={16} />
                    <span>Lapsos Académicos Concluidos / Histórico</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '0.65rem' }}>
                    {displayClosed.map(p => (
                      <div key={p.id} style={{
                        background: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '0.75rem 1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ fontWeight: 700, color: '#334155', fontSize: '0.95rem' }}>{p.nombre}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.semanas} semanas • Cerrado</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <span style={{
                            background: '#e2e8f0',
                            color: '#475569',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '99px'
                          }}>
                            Archivado
                          </span>
                          {canManage && (
                            <button
                              type="button"
                              onClick={() => handleReactivatePeriod(p)}
                              disabled={isProcessing}
                              title={`Reactivar y reabrir el período ${p.nombre}`}
                              style={{
                                background: '#0284c7',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '7px',
                                padding: '0.3rem 0.65rem',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                cursor: 'pointer',
                                boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.background = '#0369a1'}
                              onMouseOut={(e) => e.currentTarget.style.background = '#0284c7'}
                            >
                              <RotateCcw size={12} /> Reabrir
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mensaje cuando el filtro no coincide con ningún lapso */}
              {!displayActive && displayPlanning.length === 0 && displayClosed.length === 0 && (
                <div style={{
                  padding: '2.5rem',
                  background: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '12px',
                  textAlign: 'center',
                  color: '#64748b'
                }}>
                  <p style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', fontWeight: 600 }}>
                    No se encontró información registrada para el período "{selectedPeriodFilter}".
                  </p>
                  <button
                    onClick={() => setSelectedPeriodFilter('Todos')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem' }}
                  >
                    Restablecer y Ver Todos los Períodos
                  </button>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Modal Confirmación de Activación */}
        {confirmActivationModal && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001,
            padding: '1rem'
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '640px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              border: '1px solid #cbd5e1'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#16a34a', marginBottom: '1rem' }}>
                <Sparkles size={28} />
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>
                  ¿Activar el Período {confirmActivationModal.nombre}?
                </h3>
              </div>

              <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.5', margin: '0 0 1rem' }}>
                Estás a punto de dar inicio formal al período académico <strong>{confirmActivationModal.nombre}</strong>.
              </p>

              {/* Formulario Horizontal de Fechas Oficiales para el Nuevo Lapso */}
              <div style={{
                background: '#f0fdf4',
                border: '1.5px solid #86efac',
                borderRadius: '12px',
                padding: '0.9rem 1.15rem',
                marginBottom: '1.15rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#166534', fontWeight: 700, fontSize: '0.86rem' }}>
                    <Calendar size={17} color="#16a34a" />
                    <span>Fechas Oficiales de Vigencia (Calendario UPEL)</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 600, background: '#dcfce7', padding: '0.15rem 0.55rem', borderRadius: '99px' }}>
                    Calendario Oficial
                  </span>
                </div>
                
                {/* FILA HORIZONTAL DE FECHAS Y SEMANAS */}
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.65rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                      📅 Fecha de Inicio *
                    </label>
                    <input 
                      type="date"
                      value={activationForm.fechaDesde}
                      onChange={(e) => setActivationForm({ ...activationForm, fechaDesde: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.6rem',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        background: '#ffffff',
                        color: '#0f172a'
                      }}
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                      📅 Culminación *
                    </label>
                    <input 
                      type="date"
                      value={activationForm.fechaHasta}
                      onChange={(e) => setActivationForm({ ...activationForm, fechaHasta: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.6rem',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        background: '#ffffff',
                        color: '#0f172a'
                      }}
                    />
                  </div>

                  <div style={{ width: '95px', flexShrink: 0 }}>
                    <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                      ⏱️ Semanas
                    </label>
                    <input 
                      type="number"
                      min="1"
                      max="30"
                      value={activationForm.semanas}
                      onChange={(e) => setActivationForm({ ...activationForm, semanas: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.5rem',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        background: '#ffffff',
                        color: '#0f172a',
                        textAlign: 'center'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.73rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>
                    📝 Motivo / Observación Oficial (Opcional):
                  </label>
                  <input 
                    type="text"
                    value={activationForm.observaciones}
                    onChange={(e) => setActivationForm({ ...activationForm, observaciones: e.target.value })}
                    placeholder="Ej: Apertura formal aprobada por Consejo Directivo / Calendario Regular"
                    style={{
                      width: '100%',
                      padding: '0.4rem 0.65rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.8rem',
                      background: '#ffffff'
                    }}
                  />
                </div>
              </div>

              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                fontSize: '0.82rem',
                color: '#334155',
                lineHeight: '1.5',
                marginBottom: '1.5rem'
              }}>
                <div style={{ fontWeight: 700, marginBottom: '0.35rem', color: '#0f172a' }}>
                  Acciones que ejecutará el sistema:
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <li>
                    El lapso actual <strong>({currentActive ? currentActive.nombre : 'Vigente'})</strong> quedará cerrado y resguardado en el Kardex Histórico.
                  </li>
                  <li>
                    Las materias y horas que planificaste para <strong>{confirmActivationModal.nombre}</strong> pasarán a ser la carga activa oficial de cada docente.
                  </li>
                  <li>
                    Se abrirá automáticamente el siguiente período correlativo en modo planificación para continuar el ciclo universitario.
                  </li>
                </ul>
              </div>

              {/* Garantía Snap-Before-Change y Diagnóstico de Huérfanas (Fase 4) */}
              <div style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem',
                fontSize: '0.82rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e40af', fontWeight: 700 }}>
                  <ShieldCheck size={18} color="#2563eb" />
                  <span>Respaldo Preventivo "Snap-Before-Change" Activo</span>
                </div>
                <div style={{ color: '#1e3a8a', lineHeight: 1.4 }}>
                  El sistema generará una instantánea SQL completa de la base de datos de manera automática previo a la activación, blindando la información institucional ante cualquier eventualidad.
                </div>

                {activationOrphans && (
                  <div style={{
                    marginTop: '0.35rem',
                    paddingTop: '0.45rem',
                    borderTop: '1px dashed #bfdbfe',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: activationOrphans.huerfanasCount > 0 ? '#b45309' : '#15803d',
                    fontWeight: 700
                  }}>
                    {activationOrphans.huerfanasCount > 0 ? (
                      <>
                        <AlertTriangle size={18} color="#d97706" />
                        <span>
                          Detección Curricular: Se encontraron {activationOrphans.huerfanasCount} materias del catálogo sin profesor asignado en {confirmActivationModal.nombre}.
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={18} color="#16a34a" />
                        <span>
                          Verificación Curricular: 100% de asignaturas cubiertas ({activationOrphans.totalCatalogo} materias con docente).
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setConfirmActivationModal(null)}
                  className="btn btn-secondary"
                  disabled={isProcessing}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmActivate}
                  disabled={isProcessing}
                  style={{
                    background: 'linear-gradient(135deg, #16a34a, #15803d)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.6rem 1.25rem',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  {isProcessing ? 'Activando e iniciando lapso...' : 'Confirmar e Iniciar Lapso'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          padding: '1rem 1.75rem',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Universidad Pedagógica Experimental Libertador • I.P.R.G.R
          </span>
          <button onClick={onClose} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
            Listo
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalElement, document.body) : null;
};

export default PeriodManagementModal;
