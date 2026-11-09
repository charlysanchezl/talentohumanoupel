import React from 'react';
import { createPortal } from 'react-dom';
import { Plus, X, Lock, CreditCard } from 'lucide-react';
import { sedesInstitucionales } from '../../data';
import { LISTA_BANCOS } from './StaffEditModal';
import GeminiDocumentScanner from '../common/GeminiDocumentScanner';

export const StaffCreateModal = ({
  isOpen,
  onClose,
  newDocente,
  setNewDocente,
  handleSubmit,
  currentDept,
  theme,
  academicPeriodsList,
  academicPeriods = []
}) => {
  if (!isOpen || typeof document === 'undefined') return null;

  const handleScanApply = (data) => {
    if (!data) return;
    setNewDocente(prev => ({
      ...prev,
      cedula: data.cedula ? data.cedula : (data.cedulaNumero ? `V-${data.cedulaNumero}` : prev.cedula),
      nombres: data.nombres || prev.nombres,
      apellidos: data.apellidos || prev.apellidos,
      fechaNac: data.fechaNacimiento || prev.fechaNac,
      titulo: data.tituloObtenido || prev.titulo,
      universidad: data.universidad || prev.universidad
    }));
  };

  return createPortal(
    <div 
      className="upel-modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflowY: 'auto',
        padding: '1rem 0.75rem',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      <div 
        className="upel-card upel-card-accent-blue animate-fade-in" 
        style={{ 
          width: '96%', 
          maxWidth: '1020px', 
          maxHeight: 'min(92vh, 92dvh)', 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden', 
          borderRadius: '16px', 
          background: '#ffffff', 
          margin: 'auto',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          position: 'relative'
        }} 
        onClick={e => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div style={{ padding: '1.25rem 1.6rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ background: theme?.color || 'var(--primary)', color: 'white', padding: '0.55rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>Ingresar Nuevo Docente</h2>
              <div className="subtitle" style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.2rem' }}>
                Adscripción al Departamento: <strong style={{ color: theme?.color || 'var(--primary)' }}>{currentDept}</strong>
              </div>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem', borderRadius: '8px', color: '#94a3b8' }}
            title="Cerrar ventana"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Contenido Scrollable Panorámico (2 Columnas) */}
        <form 
          id="addDocenteForm" 
          onSubmit={handleSubmit} 
          style={{ 
            overflowY: 'auto', 
            overflowX: 'hidden', 
            flex: '1 1 auto', 
            minHeight: 0, 
            padding: '1.25rem 1.6rem 1.5rem 1.6rem', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.15rem',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e1 #f8fafc'
          }}
        >
          {/* Grid Horizontal de 2 Columnas */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 440px), 1fr))',
            gap: '1.25rem',
            alignItems: 'start'
          }}>
            {/* Columna Izquierda: Departamento + Datos Personales */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Bloque Fijo: Departamento Académico */}
              <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '0.9rem 1.1rem' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1e293b', marginBottom: '0.4rem', fontWeight: 700 }}>
                  <Lock size={14} color="#64748b" /> Departamento de Adscripción (Fijo)
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.62rem 0.85rem',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  background: '#e2e8f0',
                  color: '#0f172a',
                  fontWeight: 700,
                  fontSize: '0.92rem'
                }}>
                  <span>{currentDept}</span>
                  <span style={{ fontSize: '0.72rem', color: '#334155', background: '#cbd5e1', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    FIJO
                  </span>
                </div>
                <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.35rem', display: 'block' }}>
                  * Estás en el departamento de {currentDept}. El nuevo docente quedará asignado exclusivamente a este departamento.
                </small>
              </div>

              {/* Datos Básicos de Identificación */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 1.1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.8rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', textTransform: 'uppercase' }}>
                    Identificación Personal
                  </span>
                  <GeminiDocumentScanner 
                    onApply={handleScanApply}
                    buttonLabel="Escanear con Cámara / IA"
                  />
                </div>

                <div style={{ marginBottom: '0.85rem' }}>
                  <label className="form-label">Cédula de Identidad <span style={{ color: '#ef4444' }}>*</span></label>
                  <input 
                    required 
                    type="text" 
                    value={newDocente.cedula} 
                    onChange={(e) => setNewDocente({...newDocente, cedula: e.target.value})} 
                    className="premium-input w-full" 
                    placeholder="Ej. V-12345678"
                    style={{ fontWeight: 700 }}
                    autoFocus
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))', gap: '0.85rem' }}>
                  <div>
                    <label className="form-label">Nombres <span style={{ color: '#ef4444' }}>*</span></label>
                    <input 
                      required 
                      type="text" 
                      value={newDocente.nombres} 
                      onChange={(e) => setNewDocente({...newDocente, nombres: e.target.value})} 
                      className="premium-input w-full" 
                      placeholder="Ej. Juan Carlos"
                    />
                  </div>
                  <div>
                    <label className="form-label">Apellidos <span style={{ color: '#ef4444' }}>*</span></label>
                    <input 
                      required 
                      type="text" 
                      value={newDocente.apellidos} 
                      onChange={(e) => setNewDocente({...newDocente, apellidos: e.target.value})} 
                      className="premium-input w-full" 
                      placeholder="Ej. Pérez Gómez"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Columna Derecha: Condiciones + Datos Bancarios */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Sede y Período */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 1.1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.8rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem', textTransform: 'uppercase' }}>
                  Condiciones Académicas
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))', gap: '0.85rem' }}>
                  <div>
                    <label className="form-label">Centro de Atención (Sede) <span style={{ color: '#ef4444' }}>*</span></label>
                    <select
                      value={newDocente.sedeCentro || 'Rubio'} 
                      onChange={(e) => setNewDocente({...newDocente, sedeCentro: e.target.value})} 
                      className="premium-input w-full"
                      style={{ background: 'white', fontWeight: 600, cursor: 'pointer' }}
                    >
                      {sedesInstitucionales.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Período Académico</label>
                    <select
                      value={newDocente.periodoAcademico || (academicPeriodsList.find(p => p.estado === 'ACTIVO')?.nombre || academicPeriods[0] || '')} 
                      onChange={(e) => setNewDocente({...newDocente, periodoAcademico: e.target.value})} 
                      className="premium-input w-full"
                      style={{ background: 'white', fontWeight: 600, cursor: 'pointer' }}
                    >
                      {academicPeriodsList.length > 0 ? (
                        academicPeriodsList.map(p => (
                          <option key={p.id || p.nombre} value={p.nombre}>
                            {p.nombre} {p.estado === 'ACTIVO' ? '🟢 (En Curso)' : p.estado === 'PLANIFICACION' ? '🔵 (Planif.)' : ''}
                          </option>
                        ))
                      ) : (
                        academicPeriods.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* Datos Bancarios Opcionales */}
              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '1rem 1.1rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.45rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem', textTransform: 'uppercase' }}>
                  <CreditCard size={16} color="var(--primary)" /> Datos Bancarios (Opcional)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Banco</label>
                    <select 
                      value={newDocente.banco || ''} 
                      onChange={(e) => setNewDocente({ ...newDocente, banco: e.target.value })} 
                      className="premium-input w-full" 
                      style={{ background: 'white', fontSize: '0.85rem' }}
                    >
                      <option value="">Seleccione banco...</option>
                      {LISTA_BANCOS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Tipo de Cuenta</label>
                    <select 
                      value={newDocente.tipoCuenta || 'Ahorro'} 
                      onChange={(e) => setNewDocente({ ...newDocente, tipoCuenta: e.target.value })} 
                      className="premium-input w-full" 
                      style={{ background: 'white', fontSize: '0.85rem' }}
                    >
                      <option value="Ahorro">Ahorro</option>
                      <option value="Corriente">Corriente</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Nº de Cuenta (20 Dígitos)</label>
                  <input 
                    type="text" 
                    value={newDocente.cuentaBancaria || ''} 
                    onChange={(e) => setNewDocente({ ...newDocente, cuentaBancaria: e.target.value.replace(/\D/g, '').slice(0, 20) })} 
                    placeholder="Ej. 01020380580100067920" 
                    maxLength={20}
                    className="premium-input w-full" 
                    style={{ background: 'white', fontSize: '0.88rem', fontFamily: 'monospace' }}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Botones de Acción */}
          <div style={{ 
            marginTop: '0.5rem',
            paddingTop: '1.2rem', 
            borderTop: '1.5px solid #e2e8f0', 
            display: 'flex', 
            justifyContent: 'flex-end', 
            alignItems: 'center', 
            gap: '0.85rem', 
            background: '#ffffff',
            flexWrap: 'wrap',
            paddingBottom: '0.5rem'
          }}>
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={onClose}
              style={{ padding: '0.65rem 1.6rem', fontSize: '0.9rem', fontWeight: 600 }}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ 
                background: theme?.color || 'var(--primary)', 
                borderColor: theme?.color || 'var(--primary)',
                padding: '0.65rem 2rem',
                fontSize: '0.92rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                boxShadow: '0 4px 14px rgba(0, 71, 187, 0.25)'
              }}
            >
              <Plus size={18} />
              <span>Registrar Docente</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default StaffCreateModal;
