import React, { useState } from 'react';
import { Users, Download, Calendar, RefreshCw, CreditCard, ChevronDown, Search, Lock } from 'lucide-react';
import { departments } from '../../data';

const ConsultarDocentesFilterBar = ({
  user,
  searchTerm,
  setSearchTerm,
  filterPeriodo,
  setFilterPeriodo,
  filterDepartment,
  setFilterDepartment,
  filterSede,
  setFilterSede,
  filterStatus,
  setFilterStatus,
  sedesList = [],
  academicPeriodsList = [],
  academicPeriods = [],
  activeTab,
  setActiveTab,
  filteredDocentesCount = 0,
  ofertaCount = 0,
  handleExportOfertaPreview,
  handleOpenAuditorPreview,
  setIsBankTxtModalOpen,
  setIsPeriodModalOpen,
  setIsReplicateModalOpen,
  setInitialPeriodIdToEdit,
  setTargetPeriodForReplication
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showGestionMenu, setShowGestionMenu] = useState(false);

  const isPeriodPlanning = filterPeriodo !== 'Todos' && academicPeriodsList.find(p => p.nombre === filterPeriodo)?.estado === 'PLANIFICACION';

  return (
    <>
      {/* Contenedor Principal Unificado: Mando, Filtros y Directorio */}
      <div className="upel-card upel-card-accent-blue" style={{ padding: '0.85rem 1.25rem', marginBottom: '1rem' }}>
        
        {/* Fila 1: Título del Módulo + Menús de Exportación y Gestión */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #0047bb 0%, #002e7a 100%)', 
              color: 'white', 
              width: '36px', 
              height: '36px', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 71, 187, 0.2)',
              flexShrink: 0
            }}>
              <Users size={19} />
            </div>
            <div>
              <h1 style={{ margin: 0, color: '#0047bb', fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.2 }}>Consultar Docentes</h1>
              <p style={{ margin: '1px 0 0', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500 }}>
                Directorio general de docentes contratados {user?.role === 'JEFE' ? `(${user.department})` : ''}
              </p>
            </div>
          </div>

          {/* Botones de Acción Agrupados en Desplegables */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Menú Desplegable Exportar */}
            <div style={{ position: 'relative' }}>
              <button 
                type="button"
                className="btn btn-outline" 
                onClick={() => { setShowExportMenu(!showExportMenu); setShowGestionMenu(false); }}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem', 
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  borderColor: '#cbd5e1'
                }}
                title="Descargar informes y exportaciones de nómina"
              >
                <Download size={14} color="#0047bb" />
                <span>Exportar</span>
                <ChevronDown size={14} style={{ transform: showExportMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {showExportMenu && (
                <div 
                  style={{
                    position: 'absolute',
                    top: '120%',
                    right: 0,
                    width: '260px',
                    background: '#ffffff',
                    borderRadius: '10px',
                    padding: '0.4rem',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    border: '1px solid var(--border-light, #e2e8f0)',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem'
                  }}
                  onMouseLeave={() => setShowExportMenu(false)}
                >
                  <button
                    type="button"
                    onClick={() => { setShowExportMenu(false); handleExportOfertaPreview(); }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#0047bb',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#eff6ff'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Download size={15} color="#0047bb" />
                    <div>
                      <div style={{ fontWeight: 700 }}>Exportar Oferta (Vista Previa)</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Matriz por unidades curriculares</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setShowExportMenu(false); handleOpenAuditorPreview(); }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#166534',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#f0fdf4'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Download size={15} color="#166534" />
                    <div>
                      <div style={{ fontWeight: 700 }}>Fichas a Excel (Vista Modal)</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Bancos, RIF y carga docente</div>
                    </div>
                  </button>

                  {(user?.role === 'ADMIN' || user?.role === 'DOCENCIA' || user?.role === 'AUDITOR') && setIsBankTxtModalOpen && (
                    <button
                      type="button"
                      onClick={() => { setShowExportMenu(false); setIsBankTxtModalOpen(true); }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: '#0369a1',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%'
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#f0f9ff'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <CreditCard size={15} color="#0284c7" />
                      <div>
                        <div style={{ fontWeight: 700 }}>TXT Bancario (BDV)</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Nómina Banco de Venezuela</div>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Menú Desplegable Gestión (JEFE / ADMIN / DOCENCIA) */}
            {(user?.role === 'JEFE' || user?.role === 'ADMIN' || user?.role === 'DOCENCIA') && (
              <div style={{ position: 'relative' }}>
                <button 
                  type="button"
                  className="btn btn-primary" 
                  onClick={() => { setShowGestionMenu(!showGestionMenu); setShowExportMenu(false); }}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.4rem', 
                    padding: '0.4rem 0.85rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    background: '#0047bb',
                    borderColor: '#0047bb'
                  }}
                  title="Gestión de lapsos y promoción de períodos"
                >
                  <Calendar size={14} />
                  <span>Gestión</span>
                  <ChevronDown size={14} style={{ transform: showGestionMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                {showGestionMenu && (
                  <div 
                    style={{
                      position: 'absolute',
                      top: '120%',
                      right: 0,
                      width: '230px',
                      background: '#ffffff',
                      borderRadius: '10px',
                      padding: '0.4rem',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                      border: '1px solid var(--border-light, #e2e8f0)',
                      zIndex: 100,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem'
                    }}
                    onMouseLeave={() => setShowGestionMenu(false)}
                  >
                    {/* PASO 1: GESTIÓN DE LAPSOS (FECHAS Y CALENDARIO) */}
                    {['ADMIN', 'DOCENCIA', 'AUDITOR'].includes(user?.role) && setIsPeriodModalOpen && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowGestionMenu(false);
                          if (setInitialPeriodIdToEdit) setInitialPeriodIdToEdit(null);
                          setIsPeriodModalOpen(true);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          padding: '0.6rem 0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: '#002e7a',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          cursor: 'pointer',
                          textAlign: 'left',
                          width: '100%',
                          borderBottom: '1px solid #f1f5f9'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#f0f9ff'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <Calendar size={16} color="#0284c7" style={{ flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 800, color: '#0369a1', fontSize: '0.82rem' }}>Paso 1: Gestión de Lapsos</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Fechas, aperturas y activación oficial</div>
                        </div>
                      </button>
                    )}

                    {/* PASO 2: PROMOVER CARGA DOCENTE (REPLICAR PLANTILLA) */}
                    {setIsReplicateModalOpen && (
                      <button
                        type="button"
                        onClick={() => { 
                          setShowGestionMenu(false); 
                          if (setTargetPeriodForReplication) setTargetPeriodForReplication(null);
                          setIsReplicateModalOpen(true); 
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          padding: '0.6rem 0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: '#0047bb',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          cursor: 'pointer',
                          textAlign: 'left',
                          width: '100%'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#eff6ff'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <RefreshCw size={16} color="#2563eb" style={{ flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 800, color: '#1d4ed8', fontSize: '0.82rem' }}>Paso 2: Promover Carga Docente</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Replicar y preparar plantilla al nuevo lapso</div>
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Fila 2: Filtros Compactos en 1 Sola Línea */}
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          flexWrap: 'wrap', 
          alignItems: 'center',
          padding: '0.45rem 0',
          borderTop: '1px solid #f1f5f9',
          borderBottom: '1px solid #f1f5f9'
        }}>
          {/* Buscador */}
          <div style={{ position: 'relative', flex: '1 1 220px', minWidth: '180px' }}>
            <Search size={15} className="text-muted" style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              className="filter-input" 
              placeholder="Buscar Cédula o Nombre..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.1rem', paddingRight: '0.5rem', paddingTop: '0.35rem', paddingBottom: '0.35rem', fontSize: '0.82rem' }}
              autoFocus
            />
          </div>

          {/* Período */}
          <select 
            className="filter-select"
            style={{ width: 'auto', minWidth: '150px', padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
            value={filterPeriodo}
            onChange={(e) => setFilterPeriodo(e.target.value)}
          >
            <option value="Todos">Todos los Períodos</option>
            {academicPeriodsList.length > 0 ? (
              academicPeriodsList.map(p => (
                <option key={p.id || p.nombre} value={p.nombre}>
                  {p.nombre} {p.estado === 'ACTIVO' ? '🟢 (En Curso)' : p.estado === 'PLANIFICACION' ? '🔵 (Planif.)' : '⚪ (Cerrado)'}
                </option>
              ))
            ) : (
              academicPeriods.map(p => <option key={p} value={p}>{p}</option>)
            )}
          </select>

          {/* Departamento */}
          <select 
            className="filter-select"
            style={{ width: 'auto', minWidth: '160px', padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
          >
            <option value="Todos">Todos los Departamentos</option>
            {departments.filter(d => d !== 'Todos').map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Centro de Atención */}
          <select 
            className="filter-select"
            style={{ width: 'auto', minWidth: '140px', padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
            value={filterSede}
            onChange={(e) => setFilterSede(e.target.value)}
          >
            <option value="Todos">Todas las Sedes</option>
            {sedesList.filter(s => s !== 'Todos' && s).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Filtro por Estado Contractual */}
          <select 
            className="filter-select"
            style={{ width: 'auto', minWidth: '140px', padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="Todos">Todos los Estados</option>
            <option value="Activo">Activos Vigentes</option>
            <option value="Por Vencer">Por Vencer (≤30d)</option>
            <option value="Vencido">Contratos Vencidos</option>
            <option value="Inactivo">Inactivos (Sin Carga)</option>
            <option value="Por Revisar">Por Revisar</option>
          </select>
        </div>

        {/* Fila 3: Pestañas de Vista y Contador de Resultados */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.45rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className={`btn ${activeTab === 'docentes' ? 'btn-primary' : 'btn-outline'}`}
              style={{ 
                padding: '0.35rem 0.85rem', 
                fontWeight: 700, 
                fontSize: '0.8rem',
                background: activeTab === 'docentes' ? '#0047bb' : 'transparent', 
                color: activeTab === 'docentes' ? 'white' : '#475569', 
                borderColor: activeTab === 'docentes' ? '#0047bb' : '#cbd5e1' 
              }}
              onClick={() => setActiveTab('docentes')}
            >
              Docentes ({filteredDocentesCount})
            </button>
            <button 
              className={`btn ${activeTab === 'oferta' ? 'btn-primary' : 'btn-outline'}`}
              style={{ 
                padding: '0.35rem 0.85rem', 
                fontWeight: 700, 
                fontSize: '0.8rem',
                background: activeTab === 'oferta' ? '#0047bb' : 'transparent', 
                color: activeTab === 'oferta' ? 'white' : '#475569', 
                borderColor: activeTab === 'oferta' ? '#0047bb' : '#cbd5e1' 
              }}
              onClick={() => setActiveTab('oferta')}
            >
              Oferta Consolidada ({ofertaCount})
            </button>
          </div>

          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600 }}>
            {activeTab === 'docentes' ? `${filteredDocentesCount} docentes encontrados` : `${ofertaCount} secciones ofertadas`}
          </div>
        </div>

      </div>

      {isPeriodPlanning && (
        <div style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '10px', padding: '0.75rem 1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#1e40af' }}>
          <Lock size={20} color="#2563eb" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.84rem', lineHeight: 1.4 }}>
            <strong>Período Académico en Planificación ({filterPeriodo}):</strong> Este lapso aún no ha sido aperturado oficialmente. La asignación y carga de materias permanece bloqueada hasta que el período sea activado desde <strong>Gestión de Lapsos</strong>.
          </div>
        </div>
      )}
    </>
  );
};

export default ConsultarDocentesFilterBar;
