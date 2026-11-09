import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, User, Building2, LayoutDashboard, Megaphone, ShieldCheck, Database, Calendar, BookOpen, ArrowRight, X } from 'lucide-react';
import { getStaffData, departments, getCurrentUser } from '../data';

const CommandPalette = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      getStaffData().then(data => setStaffList(data || [])).catch(() => {});
      setSearchTerm('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(true); // open trigger
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const term = searchTerm.toLowerCase().trim();

  const currentUser = getCurrentUser();

  // Filtrar Módulos
  const pages = [
    { title: 'Directorio de Docentes', path: '/consultar', icon: User, category: 'Módulos' },
    { title: 'Oferta Académica Consolidada', path: '/consultar', icon: BookOpen, category: 'Módulos' },
    { title: 'Avisos y Circulares', path: '/avisos', icon: Megaphone, category: 'Módulos' },
    { title: 'Dashboard General', path: '/', icon: LayoutDashboard, category: 'Módulos' },
    ...(currentUser?.role === 'ADMIN' ? [{ title: 'Bóveda de Respaldos', path: '/respaldos', icon: Database, category: 'Módulos' }] : []),
  ].filter(p => !term || p.title.toLowerCase().includes(term));

  // Filtrar Departamentos
  const depts = departments
    .filter(d => d !== 'Todos' && (!term || d.toLowerCase().includes(term)))
    .map(d => ({ title: `Departamento de ${d}`, dept: d, icon: Building2, category: 'Departamentos' }));

  // Filtrar Docentes
  const teachers = staffList
    .filter(s => {
      if (!term) return false;
      const fullName = `${s.nombres || ''} ${s.apellidos || ''}`.toLowerCase();
      const ci = (s.cedula || '').toLowerCase();
      const esp = (s.especialidad || '').toLowerCase();
      const dpto = (s.department || '').toLowerCase();
      return fullName.includes(term) || ci.includes(term) || esp.includes(term) || dpto.includes(term);
    })
    .slice(0, 6)
    .map(s => ({
      title: `${s.nombres} ${s.apellidos}`,
      subtitle: `C.I: ${s.cedula} • ${s.especialidad || s.department}`,
      cedula: s.cedula,
      dept: s.department,
      icon: User,
      category: 'Docentes'
    }));

  const allResults = [...pages.slice(0, 3), ...depts.slice(0, 3), ...teachers];

  const handleSelect = (item) => {
    onClose();
    if (item.path) {
      navigate(item.path);
    } else if (item.dept && !item.cedula) {
      navigate(`/departamento/${encodeURIComponent(item.dept)}`);
    } else if (item.cedula) {
      navigate(`/consultar?search=${encodeURIComponent(item.cedula)}`);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (allResults.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + allResults.length) % (allResults.length || 1));
    } else if (e.key === 'Enter' && allResults[selectedIndex]) {
      e.preventDefault();
      handleSelect(allResults[selectedIndex]);
    }
  };

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: '12vh',
      zIndex: 99999
    }} onClick={onClose}>
      
      <div 
        style={{
          width: '100%',
          maxWidth: '620px',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 51, 102, 0.3), 0 0 0 1px rgba(226, 232, 240, 0.8)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Barra de Entrada */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #e2e8f0',
          background: '#ffffff'
        }}>
          <Search size={20} color="#002f6c" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleInputKeyDown}
            placeholder="Buscar docente por cédula, nombre, departamento, materia..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
              color: '#0f172a',
              fontFamily: 'inherit',
              background: 'transparent'
            }}
          />
          <span style={{
            fontSize: '0.7rem',
            background: '#f1f5f9',
            color: '#64748b',
            padding: '0.2rem 0.45rem',
            borderRadius: '6px',
            fontWeight: 700,
            border: '1px solid #e2e8f0'
          }}>
            ESC
          </span>
        </div>

        {/* Lista de Resultados */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '0.5rem' }}>
          {allResults.length > 0 ? (
            allResults.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.7rem 0.9rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    background: isSelected ? '#f0fdf4' : 'transparent',
                    border: isSelected ? '1px solid #86efac' : '1px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      background: isSelected ? '#059669' : '#f1f5f9',
                      color: isSelected ? '#ffffff' : '#002f6c',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: isSelected ? '#065f46' : '#0f172a' }}>
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                      {item.category}
                    </span>
                    <ArrowRight size={14} color={isSelected ? '#059669' : '#cbd5e1'} />
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.88rem' }}>
              No se encontraron coincidencias para "{searchTerm}"
            </div>
          )}
        </div>

        {/* Pie de Ayuda */}
        <div style={{
          padding: '0.6rem 1.25rem',
          borderTop: '1px solid #f1f5f9',
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.72rem',
          color: '#64748b'
        }}>
          <div>
            Navegar con <kbd style={{ background: '#e2e8f0', padding: '1px 4px', borderRadius: '3px' }}>↑</kbd> <kbd style={{ background: '#e2e8f0', padding: '1px 4px', borderRadius: '3px' }}>↓</kbd> y seleccionar con <kbd style={{ background: '#e2e8f0', padding: '1px 4px', borderRadius: '3px' }}>Enter</kbd>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>Búsqueda Rápida SIGOA 3.0</span>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default CommandPalette;
