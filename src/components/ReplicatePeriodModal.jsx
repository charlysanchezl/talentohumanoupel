import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, CheckSquare, Square, ArrowRight, Calendar, AlertCircle, 
  CheckCircle2, RefreshCw, Users, BookOpen, Clock, Filter, Search,
  ShieldCheck, Info
} from 'lucide-react';
import { replicateAcademicPeriod, matchDepartment, getAcademicPeriodsList, getNextUpelPeriod, getStaffData } from '../data';

// Formateador de rango de fechas legible
const formatDateRange = (desde, hasta) => {
  if (!desde || !hasta) return 'Por definir en Gestión de Lapsos';
  const formatD = (d) => {
    try {
      const parts = d.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return d;
    } catch {
      return d;
    }
  };
  return `${formatD(desde)} al ${formatD(hasta)}`;
};

const ReplicatePeriodModal = ({ 
  isOpen, 
  onClose, 
  staffList, 
  sourceStaffList,
  currentDepartment = 'Todos', 
  currentDept,
  onSuccess,
  onReplicationSuccess,
  initialTargetPeriod,
  academicPeriodsList,
  onGoToLapsos
}) => {
  const currentYear = new Date().getFullYear();
  const [periodsData, setPeriodsData] = useState([]);
  const [internalStaffList, setInternalStaffList] = useState([]);

  const effectiveStaffList = (internalStaffList && internalStaffList.length > 0)
    ? internalStaffList
    : (staffList || sourceStaffList || []);
  const effectiveDepartment = (currentDepartment && currentDepartment !== 'Todos')
    ? currentDepartment
    : (currentDept || 'Todos');
  const effectiveOnSuccess = onSuccess || onReplicationSuccess;

  // Régimen Semestral UPEL: 2 períodos académicos por año (I y II)
  const availablePeriods = useMemo(() => {
    const upelSemesters = [];
    for (let y = currentYear - 1; y <= currentYear + 2; y++) {
      upelSemesters.push(`${y}-I`, `${y}-II`);
    }
    const dbNames = (periodsData || []).map(p => p.nombre);
    const merged = Array.from(new Set([...dbNames, ...upelSemesters]));
    return merged.sort((a, b) => {
      const [yA, tA] = a.split('-');
      const [yB, tB] = b.split('-');
      if (yA !== yB) return parseInt(yA) - parseInt(yB);
      return tA.localeCompare(tB);
    });
  }, [periodsData, currentYear]);

  // Estados del Formulario
  const [step, setStep] = useState(1); // 1: Parámetros del lapso, 2: Checklist de docentes, 3: Confirmación
  const [periodoOrigen, setPeriodoOrigen] = useState(`${currentYear}-I`);
  const [periodoDestino, setPeriodoDestino] = useState(initialTargetPeriod || `${currentYear}-II`);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Docentes seleccionados (Set de cédulas)
  const [selectedCedulas, setSelectedCedulas] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState(null);
  const [checklistPage, setChecklistPage] = useState(1);
  const CHECKLIST_PER_PAGE = 50;

  // Datos oficiales del período destino según Gestión de Lapsos
  const targetPlan = useMemo(() => {
    return (periodsData || []).find(p => p.nombre === periodoDestino);
  }, [periodsData, periodoDestino]);

  // Datos oficiales del período origen según Gestión de Lapsos
  const originPlan = useMemo(() => {
    return (periodsData || []).find(p => p.nombre === periodoOrigen);
  }, [periodsData, periodoOrigen]);

  // Sincronizar períodos fijos al abrir el modal desde la base de datos
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setResultMessage(null);
      setSearchTerm('');

      getAcademicPeriodsList().then(list => {
        const periodList = (list && list.length > 0) ? list : (academicPeriodsList || []);
        setPeriodsData(periodList);

        // 1. Período Origen Fijo: El período culminado (CERRADO más reciente, o ACTIVO en su defecto)
        const closedPeriod = periodList.find(p => p.estado === 'CERRADO');
        const activePeriod = periodList.find(p => p.estado === 'ACTIVO');
        const culminadoObj = closedPeriod || activePeriod;
        const origen = culminadoObj ? culminadoObj.nombre : `${currentYear}-I`;
        setPeriodoOrigen(origen);

        // 2. Período Destino Fijo: Siguiente período reglamentario
        const planPeriod = periodList.find(p => p.estado === 'PLANIFICACION');
        const nextComputed = getNextUpelPeriod(origen);
        const destino = initialTargetPeriod || (planPeriod ? planPeriod.nombre : nextComputed);
        setPeriodoDestino(destino);

        // Cargar los docentes del lapso culminado (origen)
        getStaffData(origen).then(docs => {
          if (docs && docs.length > 0) {
            setInternalStaffList(docs);
          }
        }).catch(() => {});
      });
    }
  }, [isOpen, currentYear, initialTargetPeriod, academicPeriodsList]);

  // Si se invoca dentro de un departamento específico (ej. Jefe de Dpto), se respeta su alcance
  const isDeptRestricted = effectiveDepartment && effectiveDepartment !== 'Todos';

  // Filtrar docentes pertenecientes al período origen (sin alterar departamentos)
  // La precarga del semestre en planificación se realiza únicamente para docentes cuya carga haya sido validada por el Jefe de Departamento
  const eligibleStaff = useMemo(() => {
    const isTargetPlan = targetPlan?.estado === 'PLANIFICACION';
    return (effectiveStaffList || []).filter(staff => {
      const matchPeriod = (staff.periodoAcademico === periodoOrigen) || (!staff.periodoAcademico && periodoOrigen === `${currentYear}-I`);
      const matchDept = !isDeptRestricted || matchDepartment(staff.department, effectiveDepartment);
      const isValidadoPorJefe = !isTargetPlan || ((staff.status === 'Validado' || staff.status === 'Activo') && Array.isArray(staff.materias) && staff.materias.length > 0);
      return matchPeriod && matchDept && isValidadoPorJefe;
    });
  }, [effectiveStaffList, periodoOrigen, isDeptRestricted, effectiveDepartment, currentYear, targetPlan]);

  // Al cambiar período origen o elegibles, pre-seleccionar a todos por defecto
  React.useEffect(() => {
    if (isOpen && eligibleStaff.length > 0) {
      setSelectedCedulas(new Set(eligibleStaff.map(s => s.cedula)));
    } else if (isOpen && eligibleStaff.length === 0) {
      setSelectedCedulas(new Set());
    }
  }, [isOpen, eligibleStaff]);

  // Lista visible de docentes con filtro de búsqueda
  const filteredEligibleStaff = useMemo(() => {
    if (!searchTerm.trim()) return eligibleStaff;
    const term = searchTerm.toLowerCase();
    return eligibleStaff.filter(s => 
      (s.nombres && s.nombres.toLowerCase().includes(term)) ||
      (s.apellidos && s.apellidos.toLowerCase().includes(term)) ||
      (s.cedula && s.cedula.toLowerCase().includes(term)) ||
      (s.department && s.department.toLowerCase().includes(term))
    );
  }, [eligibleStaff, searchTerm]);

  const totalChecklistPages = Math.max(1, Math.ceil(filteredEligibleStaff.length / CHECKLIST_PER_PAGE));
  const pagedEligibleStaff = useMemo(() => {
    return filteredEligibleStaff.slice((checklistPage - 1) * CHECKLIST_PER_PAGE, checklistPage * CHECKLIST_PER_PAGE);
  }, [filteredEligibleStaff, checklistPage]);

  useEffect(() => {
    setChecklistPage(1);
  }, [searchTerm, periodoOrigen]);

  // Manejadores de Selección
  const toggleSelectAll = () => {
    if (selectedCedulas.size === eligibleStaff.length) {
      setSelectedCedulas(new Set());
    } else {
      setSelectedCedulas(new Set(eligibleStaff.map(s => s.cedula)));
    }
  };

  const toggleDocente = (cedula) => {
    const next = new Set(selectedCedulas);
    if (next.has(cedula)) {
      next.delete(cedula);
    } else {
      next.add(cedula);
    }
    setSelectedCedulas(next);
  };

  // Cálculo de estadísticas de los docentes seleccionados
  const stats = useMemo(() => {
    let totalMaterias = 0;
    let totalHoras = 0;
    let count = 0;

    eligibleStaff.forEach(s => {
      if (selectedCedulas.has(s.cedula)) {
        count++;
        const mats = s.materias || [];
        totalMaterias += mats.length;
        mats.forEach(m => {
          totalHoras += (parseInt(m.horasSemanal) || 0);
        });
      }
    });

    return { count, totalMaterias, totalHoras };
  }, [eligibleStaff, selectedCedulas]);

  const handleExecuteReplication = async () => {
    if (selectedCedulas.size === 0) {
      alert('Debes seleccionar al menos un docente para replicar la carga.');
      return;
    }

    if (periodoOrigen === periodoDestino) {
      alert('El período de origen y el período de destino deben ser diferentes.');
      return;
    }

    setIsSubmitting(true);
    setResultMessage(null);

    try {
      const res = await replicateAcademicPeriod({
        periodoOrigen,
        periodoDestino,
        semanas: parseInt(targetPlan?.semanas) || 15,
        fechaDesde: targetPlan?.fechaDesde || '',
        fechaHasta: targetPlan?.fechaHasta || '',
        department: isDeptRestricted ? effectiveDepartment : 'Todos',
        cedulasSeleccionadas: Array.from(selectedCedulas)
      });

      if (res && res.success) {
        setResultMessage({
          type: 'success',
          text: `¡Promoción completada! Se replicaron ${res.count} docentes al período ${res.periodoDestino}. La carga del lapso anterior ${periodoOrigen} quedó resguardada en el Kardex Histórico.`
        });
        if (effectiveOnSuccess) effectiveOnSuccess();
      } else {
        setResultMessage({
          type: 'error',
          text: res?.error || 'Ocurrió un error al replicar el período académico.'
        });
      }
    } catch (err) {
      setResultMessage({
        type: 'error',
        text: err.message || 'Error de conexión con el servidor.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const modalElement = (
    <div className="upel-modal-overlay" onClick={onClose}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '850px',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        margin: 'auto'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Cabecera del Modal */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '10px',
              padding: '0.5rem',
              display: 'flex'
            }}>
              <RefreshCw size={22} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                Promover Carga al Próximo Semestre
              </h2>
              <p style={{ fontSize: '0.85rem', margin: '2px 0 0 0', opacity: 0.9 }}>
                Replicación con checklist y resguardo automático de historial (Kardex)
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Indicador de Pasos (Stepper) */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #f1f5f9',
          background: '#f8fafc',
          padding: '0.75rem 1.75rem',
          gap: '1.5rem',
          fontSize: '0.88rem',
          fontWeight: 600
        }}>
          <div 
            onClick={() => !resultMessage && setStep(1)}
            style={{
              cursor: !resultMessage ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: step === 1 ? '#2563eb' : '#64748b'
            }}
          >
            <span style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: step === 1 ? '#2563eb' : '#e2e8f0',
              color: step === 1 ? '#ffffff' : '#64748b',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem'
            }}>1</span>
            Parámetros y Fechas
          </div>

          <div 
            onClick={() => !resultMessage && setStep(2)}
            style={{
              cursor: !resultMessage ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: step === 2 ? '#2563eb' : '#64748b'
            }}
          >
            <span style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: step === 2 ? '#2563eb' : '#e2e8f0',
              color: step === 2 ? '#ffffff' : '#64748b',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem'
            }}>2</span>
            Checklist de Docentes ({selectedCedulas.size})
          </div>

          <div 
            onClick={() => !resultMessage && setStep(3)}
            style={{
              cursor: !resultMessage ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: step === 3 ? '#2563eb' : '#64748b'
            }}
          >
            <span style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: step === 3 ? '#2563eb' : '#e2e8f0',
              color: step === 3 ? '#ffffff' : '#64748b',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem'
            }}>3</span>
            Resumen y Confirmación
          </div>
        </div>

        {/* Cuerpo del Modal */}
        <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1 }}>
          
          {/* Alerta de Resultado */}
          {resultMessage && (
            <div style={{
              padding: '1.25rem',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start',
              backgroundColor: resultMessage.type === 'success' ? '#ecfdf5' : '#fef2f2',
              border: `1px solid ${resultMessage.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
              color: resultMessage.type === 'success' ? '#065f46' : '#991b1b'
            }}>
              {resultMessage.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
              <div>
                <h4 style={{ margin: '0 0 0.35rem 0', fontWeight: 700 }}>
                  {resultMessage.type === 'success' ? 'Replicación Exitosa' : 'Error en la Replicación'}
                </h4>
                <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.5 }}>
                  {resultMessage.text}
                </p>
                {resultMessage.type === 'success' && onGoToLapsos && (
                  <div style={{ marginTop: '0.85rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onGoToLapsos();
                      }}
                      style={{
                        background: '#16a34a',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.5rem 1rem',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)'
                      }}
                    >
                      <Calendar size={15} /> Ver en Gestión de Lapsos
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PASO 1: PARÁMETROS */}
          {step === 1 && !resultMessage && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={18} color="#2563eb" /> Definición de Períodos Académicos
                  </h3>
                  <span style={{ 
                    background: '#eff6ff', 
                    color: '#1d4ed8', 
                    border: '1px solid #bfdbfe', 
                    fontSize: '0.74rem', 
                    fontWeight: 700, 
                    padding: '0.2rem 0.65rem', 
                    borderRadius: '999px',
                    letterSpacing: '0.01em'
                  }}>
                    Régimen UPEL: 2 períodos por año (I y II)
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                  {/* Período Origen Fijo (Período Culminado) */}
                  <div style={{
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '1rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.02em', margin: 0 }}>
                        Período Origen (Desde donde se copia)
                      </label>
                      <span style={{
                        background: '#f1f5f9',
                        color: '#475569',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.55rem',
                        borderRadius: '6px'
                      }}>
                        🔒 Fijo (Culminado)
                      </span>
                    </div>
                    <div style={{
                      fontSize: '1.4rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      marginBottom: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span>{periodoOrigen}</span>
                      <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#475569', background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px' }}>
                        {originPlan?.estado === 'CERRADO' ? 'Culminado / Cerrado' : (originPlan?.estado || 'Lapso Culminado')}
                      </span>
                    </div>
                    <small style={{ color: '#64748b', display: 'block', fontSize: '0.78rem', lineHeight: 1.35 }}>
                      Carga docente que culminó sus actividades lectivas. Quedará resguardada en el Kardex Histórico.
                    </small>
                  </div>

                  {/* Período Destino Fijo (Siguiente Lapso Reglamentario) */}
                  <div style={{
                    background: '#eff6ff',
                    border: '2px solid #2563eb',
                    borderRadius: '10px',
                    padding: '1rem',
                    boxShadow: '0 2px 6px rgba(37, 99, 235, 0.1)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.02em', margin: 0 }}>
                        Período Destino (Al Promover)
                      </label>
                      <span style={{
                        background: '#2563eb',
                        color: '#ffffff',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.55rem',
                        borderRadius: '6px'
                      }}>
                        ⭐ Siguiente Lapso
                      </span>
                    </div>
                    <div style={{
                      fontSize: '1.4rem',
                      fontWeight: 800,
                      color: '#1e3a8a',
                      marginBottom: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span>{periodoDestino}</span>
                      <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#1e40af', background: '#dbeafe', padding: '2px 8px', borderRadius: '4px' }}>
                        {targetPlan?.estado === 'PLANIFICACION' ? 'En Planificación' : 'Siguiente Semestre'}
                      </span>
                    </div>
                    <small style={{ color: '#1e40af', display: 'block', fontSize: '0.78rem', lineHeight: 1.35 }}>
                      Siguiente semestre oficial donde se replicará la nómina para su planificación anticipada.
                    </small>
                  </div>
                </div>

                {/* Indicador de Alcance de la Promoción */}
                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                      Alcance de Docentes:
                    </span>
                    {isDeptRestricted ? (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        color: '#1e40af',
                        fontWeight: 700,
                        fontSize: '0.88rem'
                      }}>
                        <Filter size={15} color="#2563eb" />
                        <span>Departamento de {currentDepartment}</span>
                      </div>
                    ) : (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        background: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        color: '#334155',
                        fontWeight: 700,
                        fontSize: '0.88rem'
                      }}>
                        <Users size={15} color="#475569" />
                        <span>Institucional (Todos los Departamentos)</span>
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Cada docente conservará intacto su departamento y especialidad de adscripción.
                  </span>
                </div>
              </div>

              {/* Calendario y Parámetros del Período Destino (Gestión de Lapsos) */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={18} color="#2563eb" /> Parámetros Oficiales del Lapso {periodoDestino}
                  </h3>
                  <span style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: '#eff6ff', 
                    color: '#1d4ed8', 
                    border: '1px solid #bfdbfe', 
                    fontSize: '0.74rem', 
                    fontWeight: 700, 
                    padding: '0.2rem 0.65rem', 
                    borderRadius: '999px' 
                  }}>
                    <ShieldCheck size={14} /> Sincronizado con Gestión de Lapsos
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div style={{ background: '#ffffff', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Semanas Reglamentarias
                    </label>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b' }}>
                      {targetPlan?.semanas || 15} semanas
                    </div>
                    <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px', display: 'block' }}>
                      Normativa académica UPEL
                    </small>
                  </div>

                  <div style={{ background: '#ffffff', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Rango de Fechas Oficial
                    </label>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: (targetPlan?.fechaDesde && targetPlan?.fechaHasta) ? '#0f766e' : '#b45309' }}>
                      {formatDateRange(targetPlan?.fechaDesde, targetPlan?.fechaHasta)}
                    </div>
                    <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px', display: 'block' }}>
                      {(targetPlan?.fechaDesde && targetPlan?.fechaHasta) ? 'Establecido en Gestión de Lapsos' : 'Pendiente por fijar en Gestión de Lapsos'}
                    </small>
                  </div>

                  <div style={{ background: '#ffffff', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Estatus del Lapso
                    </label>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: targetPlan?.estado === 'ACTIVO' ? '#16a34a' : '#2563eb' }}>
                      {targetPlan?.estado || 'PLANIFICACIÓN'}
                    </div>
                    <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px', display: 'block' }}>
                      {targetPlan ? 'Registrado en el sistema' : 'Se iniciará en modo Planificación'}
                    </small>
                  </div>
                </div>

                <div style={{
                  marginTop: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.8rem',
                  color: '#64748b',
                  background: '#f1f5f9',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '6px'
                }}>
                  <Info size={15} color="#2563eb" style={{ flexShrink: 0 }} />
                  <span>
                    El régimen lectivo y las fechas son administrados centralizadamente desde el módulo <strong>Gestión de Lapsos</strong> para preservar la integridad institucional.
                  </span>
                </div>
              </div>

              {/* Mensaje Informativo */}
              <div style={{
                background: '#eff6ff',
                borderLeft: '4px solid #2563eb',
                padding: '1rem 1.25rem',
                borderRadius: '0 8px 8px 0',
                fontSize: '0.88rem',
                color: '#1e40af',
                lineHeight: 1.5
              }}>
                <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>
                  ✓ Resguardo y Planificación Anticipada Segura:
                </div>
                <div>
                  La carga actual del período <strong>{periodoOrigen}</strong> se mantiene 100% activa. Al replicar hacia <strong>{periodoDestino}</strong>, las materias quedarán pre-cargadas en modo planificación para que puedas editarlas y organizarlas con calma sin alterar las clases del semestre en curso.
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: CHECKLIST DE DOCENTES */}
          {step === 2 && !resultMessage && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Barra de control y búsqueda */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.75rem',
                background: '#f8fafc',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    onClick={toggleSelectAll}
                    style={{
                      background: selectedCedulas.size === eligibleStaff.length && eligibleStaff.length > 0 ? '#eff6ff' : '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '0.45rem 0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#1e293b'
                    }}
                  >
                    {selectedCedulas.size === eligibleStaff.length && eligibleStaff.length > 0 ? (
                      <CheckSquare size={16} color="#2563eb" />
                    ) : (
                      <Square size={16} color="#64748b" />
                    )}
                    {selectedCedulas.size === eligibleStaff.length && eligibleStaff.length > 0 ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                  </button>

                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#475569' }}>
                    <strong style={{ color: '#2563eb' }}>{selectedCedulas.size}</strong> de {eligibleStaff.length} docentes seleccionados
                  </span>
                </div>

                <div style={{ position: 'relative', minWidth: '240px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o cédula..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.85rem 0.45rem 2.2rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              {/* Lista Scrollable de Docentes */}
              <div style={{
                maxHeight: '45vh',
                overflowY: 'auto',
                border: '1px solid #e2e8f0',
                borderRadius: '10px'
              }}>
                {filteredEligibleStaff.length === 0 ? (
                  <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}>
                    <Users size={36} style={{ margin: '0 auto 0.5rem auto', opacity: 0.4 }} />
                    <p style={{ margin: 0, fontWeight: 500 }}>No se encontraron docentes en el período {periodoOrigen}</p>
                    <small>Verifica que el período de origen seleccionado tenga docentes asignados.</small>
                  </div>
                ) : (
                  pagedEligibleStaff.map((staff) => {
                    const isChecked = selectedCedulas.has(staff.cedula);
                    const materias = staff.materias || [];
                    const totalHorasSem = materias.reduce((acc, m) => acc + (parseInt(m.horasSemanal) || 0), 0);

                    return (
                      <div
                        key={staff.cedula}
                        onClick={() => toggleDocente(staff.cedula)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          padding: '0.85rem 1.25rem',
                          borderBottom: '1px solid #f1f5f9',
                          backgroundColor: isChecked ? '#f0fdf4' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s'
                        }}
                      >
                        <div>
                          {isChecked ? (
                            <CheckSquare size={20} color="#16a34a" />
                          ) : (
                            <Square size={20} color="#94a3b8" />
                          )}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                              {staff.nombres} {staff.apellidos}
                            </span>
                            <span style={{
                              fontSize: '0.75rem',
                              background: '#e2e8f0',
                              color: '#334155',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: 600
                            }}>
                              {staff.cedula}
                            </span>
                            <span style={{
                              fontSize: '0.75rem',
                              background: '#dbeafe',
                              color: '#1e40af',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}>
                              {staff.department}
                            </span>
                          </div>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.35rem' }}>
                            {materias.length === 0 ? (
                              <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                Sin materias registradas en {periodoOrigen}
                              </span>
                            ) : (
                              materias.map((m, idx) => (
                                <span 
                                  key={idx}
                                  style={{
                                    fontSize: '0.74rem',
                                    background: '#f8fafc',
                                    color: '#334155',
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    border: '1px solid #cbd5e1',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                  }}
                                >
                                  <span style={{ fontWeight: 600 }}>{m.nombre}</span>
                                  <span style={{ color: '#2563eb', fontWeight: 700 }}>({m.horasSemanal}h)</span>
                                  {m.seccion && (
                                    <span style={{ background: '#dbeafe', color: '#1e40af', padding: '1px 5px', borderRadius: '4px', fontWeight: 600, fontSize: '0.7rem' }}>
                                      Sec. {m.seccion}
                                    </span>
                                  )}
                                  {(m.cupos !== undefined && m.cupos !== null && m.cupos !== '') && (
                                    <span style={{ background: '#fce7f3', color: '#9d174d', padding: '1px 5px', borderRadius: '4px', fontWeight: 600, fontSize: '0.7rem' }}>
                                      Cupos: {m.cupos}
                                    </span>
                                  )}
                                  {(m.inscritos !== undefined && m.inscritos !== null && m.inscritos !== '') && (
                                    <span style={{ background: '#dcfce7', color: '#166534', padding: '1px 5px', borderRadius: '4px', fontWeight: 600, fontSize: '0.7rem' }}>
                                      Insc: {m.inscritos}
                                    </span>
                                  )}
                                </span>
                              ))
                            )}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', minWidth: '90px' }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>
                            {totalHorasSem} hrs/sem
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {materias.length} materia{materias.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Controles de paginación para fluidez total con 2000 docentes */}
              {filteredEligibleStaff.length > CHECKLIST_PER_PAGE && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderTop: 'none', borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px', fontSize: '0.82rem' }}>
                  <span style={{ color: '#64748b' }}>
                    Mostrando {(checklistPage - 1) * CHECKLIST_PER_PAGE + 1} - {Math.min(checklistPage * CHECKLIST_PER_PAGE, filteredEligibleStaff.length)} de <strong>{filteredEligibleStaff.length}</strong> docentes
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      disabled={checklistPage <= 1}
                      onClick={() => setChecklistPage(p => Math.max(1, p - 1))}
                      className="btn btn-outline"
                      style={{ padding: '3px 10px', fontSize: '0.78rem', background: '#ffffff', opacity: checklistPage <= 1 ? 0.5 : 1, cursor: checklistPage <= 1 ? 'not-allowed' : 'pointer' }}
                    >
                      ◀ Anterior
                    </button>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>
                      Pág. {checklistPage} de {totalChecklistPages}
                    </span>
                    <button
                      type="button"
                      disabled={checklistPage >= totalChecklistPages}
                      onClick={() => setChecklistPage(p => Math.min(totalChecklistPages, p + 1))}
                      className="btn btn-outline"
                      style={{ padding: '3px 10px', fontSize: '0.78rem', background: '#ffffff', opacity: checklistPage >= totalChecklistPages ? 0.5 : 1, cursor: checklistPage >= totalChecklistPages ? 'not-allowed' : 'pointer' }}
                    >
                      Siguiente ▶
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PASO 3: RESUMEN Y CONFIRMACIÓN */}
          {step === 3 && !resultMessage && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '1.5rem'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
                  Resumen de la Replicación
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>TRANSICIÓN DE LAPSO</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#2563eb', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>{periodoOrigen}</span>
                      <ArrowRight size={18} />
                      <span>{periodoDestino}</span>
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>DOCENTES SELECCIONADOS</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#16a34a', marginTop: '4px' }}>
                      {stats.count} profesores
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>MATERIAS Y HORAS TOTALES</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                      {stats.totalMaterias} materias ({stats.totalHoras} h/sem)
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>CALENDARIO (GESTIÓN DE LAPSOS)</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>
                      {targetPlan?.semanas || 15} semanas
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                      {formatDateRange(targetPlan?.fechaDesde, targetPlan?.fechaHasta)}
                    </div>
                  </div>
                </div>

                <div style={{
                  background: '#fef3c7',
                  borderLeft: '4px solid #f59e0b',
                  padding: '1rem 1.25rem',
                  borderRadius: '0 8px 8px 0',
                  color: '#92400e',
                  fontSize: '0.88rem',
                  lineHeight: 1.5
                }}>
                  <strong>¿Qué ocurrirá a continuación?:</strong>
                  <ul style={{ margin: '6px 0 0 0', paddingLeft: '1.25rem' }}>
                    <li>El historial completo de <strong>{periodoOrigen}</strong> quedará resguardado permanentemente.</li>
                    <li>Los {stats.count} docentes pasarán al período <strong>{periodoDestino}</strong> con sus materias clonadas.</li>
                    <li>El estatus de todos ellos será <strong>"Por Revisar"</strong>, permitiéndote entrar a modificar cualquier materia, aumentar/quitar horas o validar según los ajustes del nuevo semestre.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Pie del Modal con Botones */}
        <div style={{
          padding: '1rem 1.75rem',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem'
        }}>
          {resultMessage ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
              {resultMessage.type === 'success' && onGoToLapsos && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onGoToLapsos();
                  }}
                  style={{
                    background: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.65rem 1.25rem',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)'
                  }}
                >
                  <Calendar size={16} /> Ver en Gestión de Lapsos
                </button>
              )}
              <button
                onClick={onClose}
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.65rem 1.5rem',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cerrar Ventana
              </button>
            </div>
          ) : (
            <>
              <div>
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    disabled={isSubmitting}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '0.65rem 1.25rem',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      color: '#475569'
                    }}
                  >
                    Volver Atrás
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '0.65rem 1.25rem',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: '#475569'
                  }}
                >
                  Cancelar
                </button>

                {step < 3 ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    disabled={step === 2 && selectedCedulas.size === 0}
                    style={{
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.65rem 1.5rem',
                      fontSize: '0.92rem',
                      fontWeight: 600,
                      cursor: (step === 2 && selectedCedulas.size === 0) ? 'not-allowed' : 'pointer',
                      opacity: (step === 2 && selectedCedulas.size === 0) ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    Siguiente Paso <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={handleExecuteReplication}
                    disabled={isSubmitting || selectedCedulas.size === 0}
                    style={{
                      background: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.65rem 1.75rem',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        Replicando período...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={18} />
                        Confirmar y Replicar Carga
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalElement, document.body) : null;
};

export default ReplicatePeriodModal;
