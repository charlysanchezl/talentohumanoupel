import React from 'react';
import { Search, User, BookOpen, Lock } from 'lucide-react';

const StaffToolbar = ({
  searchTerm,
  setSearchTerm,
  filterPeriodo,
  setFilterPeriodo,
  academicPeriodsList,
  academicPeriods,
  filterStatus,
  setFilterStatus,
  filterSede,
  setFilterSede,
  staffList,
  activeTab,
  setActiveTab,
  theme
}) => {
  return (
    <>
      <div className="filters-bar" style={{ justifyContent: 'flex-start' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <Search size={18} className="text-muted" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            className="filter-input" 
            placeholder="Buscar por cédula o nombre..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '35px', width: '100%' }}
          />
        </div>

        <select 
          className="filter-select" 
          value={filterPeriodo} 
          onChange={(e) => setFilterPeriodo(e.target.value)}
          style={{ minWidth: '180px' }}
        >
          <option value="Todos">Todos los Períodos</option>
          {academicPeriodsList.length > 0 ? (
            academicPeriodsList.map(p => (
              <option key={p.id || p.nombre} value={p.nombre}>
                {p.nombre} {p.estado === 'ACTIVO' ? '🟢 (En Curso)' : p.estado === 'PLANIFICACION' ? '🔵 (En Planificación)' : '⚪ (Cerrado)'}
              </option>
            ))
          ) : (
            academicPeriods.map(period => (
              <option key={period} value={period}>{period}</option>
            ))
          )}
        </select>

        <select 
          className="filter-select" 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ minWidth: '150px' }}
        >
          <option value="Todos">Todos los Estados</option>
          <option value="Activo">Activos Vigentes</option>
          <option value="Por Vencer">Por Vencer (≤30d)</option>
          <option value="Vencido">Contratos Vencidos</option>
          <option value="Inactivo">Inactivos (Sin Carga)</option>
          <option value="Por Revisar">Por Revisar</option>
        </select>

        <select 
          className="filter-select" 
          value={filterSede} 
          onChange={(e) => setFilterSede(e.target.value)}
          style={{ minWidth: '150px' }}
        >
          <option value="Todos">Todas las Sedes</option>
          {Array.from(new Set(['Rubio', 'Sabana de Mendoza', ...staffList.map(s => s.sedeCentro).filter(Boolean)])).sort().map(sede => (
            <option key={sede} value={sede}>{sede}</option>
          ))}
        </select>
      </div>

      {/* Selector de Vistas (Pestañas) */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--border-light)', paddingBottom: '0.5rem' }}>
        <button 
          className={`btn ${activeTab === 'docentes' ? 'btn-primary' : 'btn-outline'}`}
          style={{ 
            padding: '0.6rem 1.2rem', 
            fontWeight: 600, 
            borderBottomLeftRadius: 0, 
            borderBottomRightRadius: 0, 
            borderBottom: activeTab === 'docentes' ? 'none' : '1px solid var(--border-light)', 
            background: activeTab === 'docentes' ? theme.color : 'transparent', 
            color: activeTab === 'docentes' ? 'white' : 'var(--text-muted)', 
            borderColor: activeTab === 'docentes' ? theme.color : 'transparent' 
          }}
          onClick={() => setActiveTab('docentes')}
        >
          <User size={18} /> Docentes Registrados
        </button>
        <button 
          className={`btn ${activeTab === 'oferta' ? 'btn-primary' : 'btn-outline'}`}
          style={{ 
            padding: '0.6rem 1.2rem', 
            fontWeight: 600, 
            borderBottomLeftRadius: 0, 
            borderBottomRightRadius: 0, 
            borderBottom: activeTab === 'oferta' ? 'none' : '1px solid var(--border-light)', 
            background: activeTab === 'oferta' ? theme.color : 'transparent', 
            color: activeTab === 'oferta' ? 'white' : 'var(--text-muted)', 
            borderColor: activeTab === 'oferta' ? theme.color : 'transparent' 
          }}
          onClick={() => setActiveTab('oferta')}
        >
          <BookOpen size={18} /> Oferta Académica Consolidada
        </button>
      </div>

      {filterPeriodo !== 'Todos' && academicPeriodsList.find(p => p.nombre === filterPeriodo)?.estado === 'PLANIFICACION' && (
        <div style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '10px', padding: '0.75rem 1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#1e40af' }}>
          <Lock size={20} color="#2563eb" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.84rem', lineHeight: 1.4 }}>
            <strong>Período Académico en Planificación ({filterPeriodo}):</strong> Este lapso aún no ha sido aperturado oficialmente. La asignación y carga de materias permanece bloqueada hasta que el período sea activado desde <strong>Gestión de Lapsos</strong>.
          </div>
        </div>
      )}
    </>
  );
};

export default StaffToolbar;
