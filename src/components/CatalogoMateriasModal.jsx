import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, Plus, Search, X, CheckCircle2, AlertCircle, Sparkles, Filter, Hash } from 'lucide-react';
import { getCatalogoMaterias, addMateriaCatalogo, getCurrentUser } from '../data';
import { matchesSearch } from '../utils/searchHelper';
import { toastSuccess, toastError } from '../utils/toast';

const CatalogoMateriasModal = ({ isOpen, onClose, onCatalogoUpdated }) => {
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMateriaName, setNewMateriaName] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('TODAS');
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: '' }
  const [submitting, setSubmitting] = useState(false);

  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === 'ADMIN';

  const loadCatalogo = async () => {
    setLoading(true);
    try {
      const data = await getCatalogoMaterias();
      setMaterias(data || []);
      if (onCatalogoUpdated) onCatalogoUpdated(data || []);
    } catch (e) {
      console.error('Error cargando catálogo:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCatalogo();
      setSearchTerm('');
      setNewMateriaName('');
      setSelectedLetter('TODAS');
      setStatusMessage(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleAddMateria = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      setStatusMessage({ type: 'error', text: 'Operación denegada: Solo el Administrador del Sistema puede agregar materias.' });
      return;
    }

    const clean = (newMateriaName || '').trim().toUpperCase();
    if (!clean) {
      setStatusMessage({ type: 'error', text: 'Por favor ingrese el nombre de la materia.' });
      return;
    }

    // Verificar si ya existe en la lista local
    const exists = materias.some(m => m.trim().toUpperCase() === clean);
    if (exists) {
      setStatusMessage({ type: 'error', text: `La materia "${clean}" ya existe en el catálogo institucional.` });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await addMateriaCatalogo(clean);
      if (res && res.success) {
        toastSuccess(`¡Materia "${res.nombre || clean}" agregada exitosamente al catálogo!`);
        setStatusMessage({ type: 'success', text: `¡Materia "${res.nombre || clean}" agregada exitosamente!` });
        setNewMateriaName('');
        await loadCatalogo();
        setTimeout(() => setStatusMessage(null), 4000);
      } else {
        const msg = res?.message || 'Error al agregar la materia al catálogo.';
        toastError(msg);
        setStatusMessage({ type: 'error', text: msg });
      }
    } catch (err) {
      toastError('Error de conexión con el servidor.');
      setStatusMessage({ type: 'error', text: 'Error de conexión con el servidor.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Filtrado alfabético y de búsqueda
  const filteredMaterias = useMemo(() => {
    let result = materias;

    if (searchTerm.trim()) {
      result = result.filter(m => matchesSearch(m, searchTerm));
    }

    if (selectedLetter !== 'TODAS') {
      result = result.filter(m => {
        const first = (m || '').trim().charAt(0).toUpperCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return first === selectedLetter;
      });
    }

    return result;
  }, [materias, searchTerm, selectedLetter]);

  // Agrupación alfabética para vista organizada
  const groupedMaterias = useMemo(() => {
    const groups = {};
    filteredMaterias.forEach(mat => {
      const letter = (mat || '').trim().charAt(0).toUpperCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") || '#';
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(mat);
    });
    return groups;
  }, [filteredMaterias]);

  const availableLetters = useMemo(() => {
    const set = new Set();
    materias.forEach(mat => {
      const letter = (mat || '').trim().charAt(0).toUpperCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (letter) set.add(letter);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
  }, [materias]);

  if (!isOpen) return null;

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.72)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '1.25rem'
    }}>
      <div className="animate-scale-up" style={{
        background: '#ffffff',
        width: '100%',
        maxWidth: '850px',
        maxHeight: '92vh',
        borderRadius: '16px',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #cbd5e1'
      }}>
        {/* Encabezado Institucional */}
        <div style={{
          background: 'linear-gradient(135deg, #002f6c 0%, #001f4a 100%)',
          padding: '1.4rem 1.75rem',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '3px solid #008744'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '0.65rem',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.25)'
            }}>
              <BookOpen size={24} color="#ffffff" />
            </div>
            <div>
              <div style={{ color: '#93c5fd', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Subdirección de Docencia · Catálogo General
              </div>
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.02em' }}>
                Catálogo Oficial de Asignaturas
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '8px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.28)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'; }}
            title="Cerrar ventana"
          >
            <X size={20} />
          </button>
        </div>

        {/* Barra Informativa y Estadísticas */}
        <div style={{
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '0.85rem 1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{
              background: '#e0f2fe',
              color: '#0369a1',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <Hash size={13} /> {materias.length} Asignaturas Registradas
            </span>
            <span style={{
              background: '#dcfce7',
              color: '#15803d',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <CheckCircle2 size={13} /> Orden Alfabético Estricto A - Z
            </span>
          </div>
          <span style={{ fontSize: '11.5px', color: '#64748b', fontStyle: 'italic' }}>
            {isAdmin ? '🛡️ Acceso: Administrador de Informática' : '👁️ Modo Lectura'}
          </span>
        </div>

        {/* Contenido con scroll */}
        <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Mensajes de Alerta */}
          {statusMessage && (
            <div style={{
              padding: '0.85rem 1.1rem',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontSize: '13px',
              fontWeight: 600,
              background: statusMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
              color: statusMessage.type === 'success' ? '#166534' : '#991b1b',
              border: `1px solid ${statusMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`
            }}>
              {statusMessage.type === 'success' ? <CheckCircle2 size={18} color="#16a34a" /> : <AlertCircle size={18} color="#dc2626" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Formulario de Ingreso de Materias (Exclusivo Administrador) */}
          {isAdmin ? (
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #bfdbfe',
              borderRadius: '12px',
              padding: '1.25rem',
              boxShadow: '0 2px 8px rgba(0, 47, 108, 0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Plus size={17} color="#002f6c" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#002f6c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Ingresar Nueva Materia al Sistema
                </span>
              </div>
              <form onSubmit={handleAddMateria} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  required
                  placeholder="Escriba el nombre exacto de la materia (ej. INTRODUCCIÓN A LA FÍSICA)..."
                  value={newMateriaName}
                  onChange={(e) => setNewMateriaName(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: '280px',
                    padding: '10px 14px',
                    fontSize: '13.5px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    outline: 'none',
                    background: '#f8fafc',
                    textTransform: 'uppercase'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#002f6c'; e.target.style.background = '#ffffff'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc'; }}
                />
                <button
                  type="submit"
                  disabled={submitting || !newMateriaName.trim()}
                  style={{
                    padding: '10px 18px',
                    background: '#008744',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: submitting || !newMateriaName.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    opacity: submitting || !newMateriaName.trim() ? 0.65 : 1,
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 6px rgba(0, 135, 68, 0.2)'
                  }}
                  onMouseOver={(e) => { if (!submitting && newMateriaName.trim()) e.currentTarget.style.background = '#007038'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = '#008744'; }}
                >
                  <Plus size={16} />
                  <span>{submitting ? 'Guardando...' : 'Agregar al Catálogo'}</span>
                </button>
              </form>
              <div style={{ marginTop: '0.45rem', fontSize: '11.5px', color: '#64748b' }}>
                ℹ️ La nueva materia se agregará automáticamente en su lugar alfabético exacto (A - Z) y estará disponible de inmediato para todos los docentes y departamentos.
              </div>
            </div>
          ) : (
            <div style={{
              background: '#f1f5f9',
              border: '1px dashed #cbd5e1',
              borderRadius: '10px',
              padding: '0.85rem 1.25rem',
              fontSize: '12.5px',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>🔒 El ingreso de nuevas asignaturas está restringido exclusivamente al Administrador del Sistema.</span>
            </div>
          )}

          {/* Buscador y Filtro por Letra */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Buscar materia en el catálogo por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 38px',
                  fontSize: '13px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  outline: 'none'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#002f6c'; e.target.style.background = '#ffffff'; }}
                onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc'; }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{ position: 'absolute', right: '10px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Selector Rápido de Letra Inicial (Directorio A - Z) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              flexWrap: 'wrap',
              background: '#f1f5f9',
              padding: '6px 10px',
              borderRadius: '8px'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginRight: '4px' }}>FILTRAR:</span>
              <button
                type="button"
                onClick={() => setSelectedLetter('TODAS')}
                style={{
                  padding: '2px 8px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  borderRadius: '5px',
                  border: 'none',
                  cursor: 'pointer',
                  background: selectedLetter === 'TODAS' ? '#002f6c' : '#ffffff',
                  color: selectedLetter === 'TODAS' ? '#ffffff' : '#334155',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                TODAS ({materias.length})
              </button>
              {availableLetters.map(letra => (
                <button
                  key={letra}
                  type="button"
                  onClick={() => setSelectedLetter(letra)}
                  style={{
                    padding: '2px 7px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    borderRadius: '5px',
                    border: 'none',
                    cursor: 'pointer',
                    background: selectedLetter === letra ? '#008744' : '#ffffff',
                    color: selectedLetter === letra ? '#ffffff' : '#334155',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  {letra}
                </button>
              ))}
            </div>
          </div>

          {/* Listado Alfabético de Materias */}
          <div style={{
            flex: 1,
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            background: '#ffffff',
            padding: '1rem',
            minHeight: '260px'
          }}>
            {filteredMaterias.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                <BookOpen size={36} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>No se encontraron materias con el criterio indicado.</p>
                <p style={{ margin: '4px 0 0', fontSize: '12px' }}>Intente con otra palabra clave o seleccione "TODAS".</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {Object.keys(groupedMaterias).sort((a, b) => a.localeCompare(b, 'es')).map(letra => (
                  <div key={letra} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '0.6rem'
                    }}>
                      <span style={{
                        background: '#002f6c',
                        color: '#ffffff',
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        fontWeight: 800
                      }}>
                        {letra}
                      </span>
                      <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748b' }}>
                        {groupedMaterias[letra].length} {groupedMaterias[letra].length === 1 ? 'materia' : 'materias'}
                      </span>
                      <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                      gap: '0.45rem'
                    }}>
                      {groupedMaterias[letra].map((materia, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '7px 12px',
                            background: '#f8fafc',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            fontSize: '12.5px',
                            fontWeight: 600,
                            color: '#1e293b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.15s'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = '#f0fdf4';
                            e.currentTarget.style.borderColor = '#86efac';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = '#f8fafc';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                          }}
                        >
                          <span style={{ color: '#008744', fontSize: '11px', fontWeight: 700 }}>•</span>
                          <span style={{ flex: 1, wordBreak: 'break-word' }}>{materia}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pie del Modal */}
        <div style={{
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          padding: '0.85rem 1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#64748b'
        }}>
          <span>Mostrando {filteredMaterias.length} de {materias.length} asignaturas</span>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline"
            style={{ padding: '0.45rem 1.25rem', fontSize: '13px' }}
          >
            Cerrar Catálogo
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CatalogoMateriasModal;
