import React from 'react';
import { CheckCircle, Clock, ShieldAlert, Printer, Mail, Calendar, ChevronDown } from 'lucide-react';
import { isExpedienteCompleto, getMissingExpedienteFields } from '../../data';
import SendFichaEmailModal from '../SendFichaEmailModal';

export const RegistrationStatusView = ({
  registeredStaff,
  setRegisteredStaff,
  fichasLapsos = [],
  selectedLapso,
  setSelectedLapso,
  setFormData,
  formData,
  setFormStep,
  setStep,
  isSendFichaModalOpen,
  setIsSendFichaModalOpen,
  resetAccessState
}) => {
  if (!registeredStaff) return null;

  const lapsosList = fichasLapsos && fichasLapsos.length > 0 
    ? fichasLapsos 
    : [{
        periodo: registeredStaff.periodoAcademico || '2026-I',
        status: registeredStaff.status || 'Por Revisar',
        validadoPorJefe: registeredStaff.status === 'Validado' || registeredStaff.status === 'Activo',
        materias: (registeredStaff.status === 'Validado' || registeredStaff.status === 'Activo') ? (registeredStaff.materias || []) : [],
        department: registeredStaff.department,
        sedeCentro: registeredStaff.sedeCentro,
        semanas: registeredStaff.semanas || 15
      }];

  const activeLapsoId = selectedLapso || lapsosList[0]?.periodo || '2026-I';
  const currentFicha = lapsosList.find(l => l.periodo === activeLapsoId) || lapsosList[0];
  const isValidado = !!currentFicha.validadoPorJefe;
  const materiasAsignadas = Array.isArray(currentFicha.materias) ? currentFicha.materias : [];
  const totalHorasSemanal = materiasAsignadas.reduce((acc, m) => acc + (Number(m.horasSemanal) || Number(m.horas) || 0), 0);

  const expedienteValido = isExpedienteCompleto(registeredStaff);
  const camposFaltantes = !expedienteValido ? getMissingExpedienteFields(registeredStaff) : [];

  const handleVerImprimirFicha = () => {
    if (!expedienteValido) {
      alert('Su expediente se encuentra incompleto (' + camposFaltantes.join(', ') + '). Debe actualizar sus datos obligatorios antes de poder ver o imprimir la ficha.');
      const cleanStaff = Object.fromEntries(Object.entries(registeredStaff).map(([k, v]) => [k, v === null ? '' : v]));
      setFormData({ ...formData, ...cleanStaff });
      setFormStep(1);
      setStep(2);
      return;
    }
    setRegisteredStaff({
      ...registeredStaff,
      ...currentFicha,
      periodoAcademico: currentFicha.periodo,
      materias: currentFicha.materias || []
    });
    setStep(5);
  };

  const handleEnviarCorreoFicha = () => {
    if (!expedienteValido) {
      alert('Su expediente se encuentra incompleto (' + camposFaltantes.join(', ') + '). Debe actualizar sus datos obligatorios antes de solicitar el envío de la ficha.');
      const cleanStaff = Object.fromEntries(Object.entries(registeredStaff).map(([k, v]) => [k, v === null ? '' : v]));
      setFormData({ ...formData, ...cleanStaff });
      setFormStep(1);
      setStep(2);
      return;
    }
    setRegisteredStaff({
      ...registeredStaff,
      ...currentFicha,
      periodoAcademico: currentFicha.periodo,
      materias: currentFicha.materias || []
    });
    setIsSendFichaModalOpen(true);
  };

  return (
    <div className="animate-fade-in" style={{ 
      maxWidth: '750px', 
      margin: '0 auto', 
      textAlign: 'center', 
      background: '#ffffff', 
      padding: '2.5rem 2.25rem', 
      borderRadius: '16px', 
      boxShadow: '0 20px 45px rgba(0,0,0,0.2)',
      border: '1px solid #e2e8f0',
      color: '#0f172a'
    }}>
      {/* Encabezado del Docente */}
      <div style={{ marginBottom: '1.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.25rem' }}>
        <h3 style={{ margin: '0 0 0.35rem 0', color: '#0f172a', fontWeight: 800, fontSize: '21px' }}>
          Ficha de Oferta Académica del Docente
        </h3>
        <div style={{ fontSize: '16px', color: '#0047bb', fontWeight: 700 }}>
          {registeredStaff.nombres} {registeredStaff.apellidos}
        </div>
        <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '4px', display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span>Cédula: <strong style={{ color: '#0f172a' }}>{registeredStaff.cedula}</strong></span>
          <span>•</span>
          <span>Departamento: <strong style={{ color: '#0f172a' }}>{currentFicha.department || registeredStaff.department}</strong></span>
          <span>•</span>
          <span>Sede: <strong style={{ color: '#0f172a' }}>{currentFicha.sedeCentro || registeredStaff.sedeCentro || 'Rubio'}</strong></span>
        </div>
      </div>

      {/* Selector de Lapsos Académicos */}
      {lapsosList.length > 0 && (
        <div style={{ 
          marginBottom: '1.5rem', 
          background: '#f8fafc', 
          border: '1.5px solid #cbd5e1', 
          borderRadius: '12px', 
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          textAlign: 'left',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '8px', 
              background: '#eff6ff', 
              border: '1px solid #bfdbfe',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#0047bb',
              flexShrink: 0
            }}>
              <Calendar size={18} />
            </div>
            <div>
              <label htmlFor="selector-lapso-docente" style={{ fontSize: '12px', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', cursor: 'pointer', margin: 0 }}>
                Lapso / Período Académico:
              </label>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                Seleccione el período a consultar (2 por año)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '340px' }}>
              <select
                id="selector-lapso-docente"
                value={activeLapsoId}
                onChange={(e) => setSelectedLapso(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 2.2rem 0.6rem 0.85rem',
                  borderRadius: '8px',
                  border: '1.5px solid #0047bb',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  outline: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0, 71, 187, 0.08)',
                  appearance: 'none',
                  WebkitAppearance: 'none'
                }}
              >
                {lapsosList.map(itemLapso => {
                  const isVal = !!itemLapso.validadoPorJefe;
                  const numMat = (itemLapso.materias || []).length;
                  return (
                    <option key={itemLapso.periodo} value={itemLapso.periodo}>
                      Período {itemLapso.periodo} {isVal ? `— ✓ Validada (${numMat} mat.)` : `— ⏳ En Carga (${numMat} mat.)`}
                    </option>
                  );
                })}
              </select>
              <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#0047bb', display: 'flex', alignItems: 'center' }}>
                <ChevronDown size={16} />
              </div>
            </div>

            {isValidado ? (
              <span style={{
                fontSize: '11.5px', fontWeight: 700, padding: '5px 11px', borderRadius: '99px',
                background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0',
                display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap'
              }}>
                ✓ Validada ({materiasAsignadas.length} {materiasAsignadas.length === 1 ? 'materia' : 'materias'})
              </span>
            ) : (
              <span style={{
                fontSize: '11.5px', fontWeight: 700, padding: '5px 11px', borderRadius: '99px',
                background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a',
                display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap'
              }}>
                ⏳ Planificación en curso
              </span>
            )}
          </div>
        </div>
      )}

      {/* Contenido Condicional del Lapso Seleccionado */}
      {isValidado ? (
        <div style={{ padding: '2rem 1.75rem', background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '14px', textAlign: 'center' }}>
          <CheckCircle size={44} style={{ color: '#16a34a', margin: '0 auto 0.75rem auto' }} />
          <h4 style={{ color: '#15803d', margin: '0 0 0.4rem 0', fontWeight: 800, fontSize: '18px' }}>
            ¡Ficha Validada — Período {currentFicha.periodo}!
          </h4>
          <p style={{ color: '#166534', fontSize: '13.5px', margin: '0 0 1.25rem 0', lineHeight: '1.55', fontWeight: 500 }}>
            Su carga académica para el período <strong>{currentFicha.periodo}</strong> ha sido asignada formalmente por la Jefatura de Departamento y se encuentra 100% validada.
          </p>

          {/* Detalle de Asignaturas Validadas */}
          <div style={{ margin: '0 0 1.5rem 0', textAlign: 'left', background: '#ffffff', borderRadius: '10px', border: '1px solid #bbf7d0', overflow: 'hidden' }}>
            <div style={{ padding: '9px 14px', background: '#e6f6ee', borderBottom: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>
                Asignaturas Asignadas ({materiasAsignadas.length})
              </span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#166534' }}>
                Total: {totalHorasSemanal} Horas Semanales
              </span>
            </div>
            {materiasAsignadas.length > 0 ? (
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {materiasAsignadas.map((m, idx) => (
                  <div key={idx} style={{ padding: '10px 14px', borderBottom: idx < materiasAsignadas.length - 1 ? '1px solid #f1f5f9' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>
                        {m.nombre || m.materia}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        Cohorte: <strong style={{ color: '#334155' }}>{m.cohorte || '-'}</strong> · Sección: <strong style={{ color: '#334155' }}>{m.seccion || 'U'}</strong> · Cupos: <strong style={{ color: '#334155' }}>{(m.cupos !== undefined && m.cupos !== null && m.cupos !== '') ? m.cupos : 0}</strong> · Inscritos: <strong style={{ color: '#334155' }}>{(m.inscritos !== undefined && m.inscritos !== null && m.inscritos !== '') ? m.inscritos : 0}</strong> · Especialidad: <strong style={{ color: '#334155' }}>{m.especialidadDestino || currentFicha.especialidad || 'General'}</strong>
                      </div>
                    </div>
                    <span style={{ fontWeight: 800, color: '#0047bb', fontSize: '12.5px', background: '#eff6ff', padding: '3px 8px', borderRadius: '6px' }}>
                      {m.horasSemanal || m.horas || 0} hrs/sem
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                Ficha activa sin asignaturas directas registradas.
              </div>
            )}
          </div>

          {!expedienteValido ? (
            <div style={{
              padding: '1.25rem 1.5rem',
              background: '#fff1f2',
              border: '1.5px solid #fda4af',
              borderRadius: '12px',
              textAlign: 'center',
              marginTop: '1.25rem',
              boxShadow: '0 4px 14px rgba(225, 29, 72, 0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#be123c', fontWeight: 800, fontSize: '15px', marginBottom: '6px' }}>
                <ShieldAlert size={20} color="#e11d48" />
                Expediente Incompleto — Visualización de Ficha Bloqueada
              </div>
              <p style={{ color: '#9f1239', fontSize: '13px', margin: '0 0 10px 0', lineHeight: '1.5' }}>
                Por disposición institucional de Talento Humano, no se permite visualizar ni emitir la Ficha de Oferta Académica hasta que actualice los datos obligatorios de su expediente:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginBottom: '14px' }}>
                {camposFaltantes.map((field, fIdx) => (
                  <span key={fIdx} style={{ background: '#ffe4e6', color: '#9f1239', fontSize: '11.5px', fontWeight: 700, padding: '3px 10px', borderRadius: '6px', border: '1px solid #fecdd3' }}>
                    • {field}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  const cleanStaff = Object.fromEntries(Object.entries(registeredStaff).map(([k, v]) => [k, v === null ? '' : v]));
                  setFormData({ ...formData, ...cleanStaff });
                  setFormStep(1);
                  setStep(2);
                }}
                style={{
                  background: '#e11d48', color: '#ffffff', padding: '11px 24px', borderRadius: '8px',
                  fontWeight: 700, fontSize: '13.5px', border: 'none', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(225, 29, 72, 0.25)',
                  display: 'inline-flex', alignItems: 'center', gap: '6px'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#be123c'}
                onMouseOut={(e) => e.currentTarget.style.background = '#e11d48'}
              >
                Actualizar Mi Expediente Ahora
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                type="button"
                onClick={handleVerImprimirFicha}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: '#0047bb', color: '#ffffff', padding: '11px 20px', borderRadius: '8px',
                  fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0, 71, 187, 0.25)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#00368b'}
                onMouseOut={(e) => e.currentTarget.style.background = '#0047bb'}
              >
                <Printer size={18} /> Ver e Imprimir Ficha ({currentFicha.periodo})
              </button>
              <button 
                type="button"
                style={{ 
                  background: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '11px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '14px',
                  border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                  transition: 'all 0.2s'
                }} 
                onClick={handleEnviarCorreoFicha}
                onMouseOver={(e) => e.currentTarget.style.background = '#0369a1'}
                onMouseOut={(e) => e.currentTarget.style.background = '#0284c7'}
              >
                <Mail size={18} /> Enviar a mi Correo Institucional
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ padding: '2rem 1.75rem', background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '14px', textAlign: 'center' }}>
          <Clock size={44} style={{ color: '#d97706', margin: '0 auto 0.75rem auto' }} />
          <h4 style={{ color: '#b45309', margin: '0 0 0.5rem 0', fontWeight: 800, fontSize: '18px' }}>
            Lapso {currentFicha.periodo}: En Proceso de Carga por la Jefatura
          </h4>
          <p style={{ color: '#78350f', fontSize: '13.5px', lineHeight: '1.6', margin: '0 0 1.25rem 0', fontWeight: 500 }}>
            La Jefatura del Departamento de <strong style={{ color: '#92400e' }}>{currentFicha.department || registeredStaff.department}</strong> se encuentra actualmente estructurando y asignando la programación académica para el período <strong style={{ color: '#92400e' }}>{currentFicha.periodo}</strong>.
          </p>
          
          <div style={{ 
            padding: '12px 16px', 
            background: '#ffffff', 
            borderRadius: '10px', 
            border: '1.5px dashed #f59e0b', 
            fontSize: '12.5px', 
            color: '#92400e', 
            textAlign: 'left', 
            lineHeight: '1.55' 
          }}>
            🔒 <strong>Control Institucional de Carga:</strong> Su ficha y materias definitivas de este lapso aún no han sido validadas. Por políticas de control y confidencialidad, el sistema no muestra ninguna carga tentativa ni permite descargar la ficha oficial de este lapso hasta que la Jefatura concluya y valide formalmente la asignación.
          </div>
        </div>
      )}

      {/* Modal de Envío para el Docente */}
      <SendFichaEmailModal 
        isOpen={isSendFichaModalOpen}
        onClose={() => setIsSendFichaModalOpen(false)}
        staff={{
          ...registeredStaff,
          ...currentFicha,
          periodoAcademico: currentFicha.periodo,
          materias: currentFicha.materias || []
        }}
      />

      {/* Botones Inferiores de Navegación */}
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
        <button 
          type="button"
          style={{
            background: '#0047bb', color: '#ffffff', border: 'none', borderRadius: '8px',
            padding: '10px 22px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 3px 8px rgba(0, 71, 187, 0.2)'
          }} 
          onClick={() => {
            const cleanStaff = Object.fromEntries(Object.entries(registeredStaff).map(([k, v]) => [k, v === null ? '' : v]));
            setFormData({ ...formData, ...cleanStaff });
            setFormStep(1);
            setStep(2);
          }}
        >
          Actualizar mis Datos
        </button>
        <button 
          type="button"
          style={{
            background: '#f8fafc', color: '#334155', border: '1.5px solid #cbd5e1', borderRadius: '8px',
            padding: '10px 22px', fontSize: '14px', fontWeight: 700, cursor: 'pointer'
          }} 
          onClick={resetAccessState}
        >
          Cerrar Sesión / Volver al Inicio
        </button>
      </div>
    </div>
  );
};

export default RegistrationStatusView;
