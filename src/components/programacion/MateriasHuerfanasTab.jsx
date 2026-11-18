import React from 'react';
import { RefreshCw, Download, CheckCircle2, AlertTriangle, Search } from 'lucide-react';

const MateriasHuerfanasTab = ({
  filterPeriodo,
  setFilterPeriodo,
  targetAnalysisPeriod,
  academicPeriodsList,
  loadHuerfanas,
  loadingHuerfanas,
  handleExportHuerfanasExcel,
  huerfanasData,
  coveragePercent,
  filteredHuerfanas,
  orphanSearch,
  setOrphanSearch
}) => {
  return (
    <div className="animate-fade-in">
      {/* Barra Superior de Control */}
      <div className="upel-card upel-card-accent-blue" style={{ padding: '1.5rem 2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="upel-section-subtitle">DIAGNÓSTICO CURRICULAR AUTOMÁTICO</div>
            <h3 style={{ margin: '0.2rem 0 0.5rem', color: '#003366', fontSize: '1.25rem' }}>
              Materias Huérfanas (Sin Docente Asignado)
            </h3>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
              Compara el catálogo de asignaturas oficiales contra las cargas del período para detectar vacantes antes de iniciar el semestre.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              value={filterPeriodo === 'Todos' ? targetAnalysisPeriod : filterPeriodo}
              onChange={(e) => setFilterPeriodo(e.target.value)}
              style={{
                padding: '0.5rem 0.85rem',
                borderRadius: '8px',
                border: '1.5px solid #0284c7',
                fontWeight: 700,
                color: '#0369a1',
                fontSize: '0.9rem'
              }}
            >
              {academicPeriodsList.map(p => (
                <option key={p.id || p.nombre} value={p.nombre}>
                  Período {p.nombre} ({p.estado})
                </option>
              ))}
            </select>

            <button
              onClick={() => loadHuerfanas(targetAnalysisPeriod)}
              disabled={loadingHuerfanas}
              className="btn btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.85rem' }}
            >
              <RefreshCw size={16} className={loadingHuerfanas ? 'animate-spin' : ''} />
              <span>Actualizar</span>
            </button>

            <button
              onClick={handleExportHuerfanasExcel}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem' }}
            >
              <Download size={16} />
              <span>Exportar a Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tarjetas KPI de Cobertura */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="upel-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Catálogo Curricular Total
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#003366', marginTop: '0.35rem' }}>
            {huerfanasData?.totalCatalogo || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
            Asignaturas institucionales registradas
          </div>
        </div>

        <div className="upel-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
            Materias con Docente
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#059669', marginTop: '0.35rem' }}>
            {huerfanasData?.cubiertasCount || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
            Cubiertas con profesor asignado
          </div>
        </div>

        <div className="upel-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: (huerfanasData?.huerfanasCount > 0 ? '#dc2626' : '#16a34a'), textTransform: 'uppercase' }}>
            Materias Huérfanas (Déficit)
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: (huerfanasData?.huerfanasCount > 0 ? '#dc2626' : '#16a34a'), marginTop: '0.35rem' }}>
            {huerfanasData?.huerfanasCount || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
            {huerfanasData?.huerfanasCount > 0 ? 'Sin docente para este lapso' : 'Sin déficit docente'}
          </div>
        </div>

        <div className="upel-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>
            Tasa de Cobertura Curricular
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0284c7', marginTop: '0.35rem' }}>
            {coveragePercent}%
          </div>
          <div style={{
            marginTop: '0.5rem',
            height: '8px',
            background: '#e2e8f0',
            borderRadius: '99px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${coveragePercent}%`,
              background: coveragePercent === 100 ? '#16a34a' : '#0284c7',
              borderRadius: '99px',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>
      </div>

      {/* Banner de Diagnóstico */}
      {huerfanasData && (
        <div style={{
          padding: '1.25rem 1.5rem',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          background: huerfanasData.huerfanasCount === 0 ? '#f0fdf4' : '#fffbeb',
          border: `1.5px solid ${huerfanasData.huerfanasCount === 0 ? '#bbf7d0' : '#fde68a'}`,
          color: huerfanasData.huerfanasCount === 0 ? '#166534' : '#92400e'
        }}>
          {huerfanasData.huerfanasCount === 0 ? (
            <CheckCircle2 size={32} color="#16a34a" />
          ) : (
            <AlertTriangle size={32} color="#d97706" />
          )}
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem' }}>
              {huerfanasData.huerfanasCount === 0
                ? `¡Cobertura Curricular Plena para el Período ${targetAnalysisPeriod}!`
                : `Atención: Se detectaron ${huerfanasData.huerfanasCount} unidades curriculares sin docente en ${targetAnalysisPeriod}`}
            </div>
            <div style={{ fontSize: '0.86rem', marginTop: '0.2rem', lineHeight: '1.4' }}>
              {huerfanasData.huerfanasCount === 0
                ? 'El 100% de las materias del catálogo oficial están debidamente asignadas a profesores. No hay riesgo de asignaturas sin impartir.'
                : 'Estas materias pertenecen al catálogo académico institucional pero ningún profesor tiene secciones ni horas asignadas para ellas. Es prioritario abrir concurso docente o reasignar carga horaria antes del inicio del semestre.'}
            </div>
          </div>
        </div>
      )}

      {/* Tabla de Materias Huérfanas */}
      <div className="upel-card upel-card-accent-blue" style={{ padding: '1.75rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, color: '#003366', fontSize: '1.15rem' }}>
              Listado de Asignaturas Huérfanas
            </h3>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Mostrando {filteredHuerfanas.length} de {huerfanasData?.huerfanasCount || 0} materias sin asignar
            </div>
          </div>

          <div style={{ position: 'relative', minWidth: '280px' }}>
            <Search size={18} className="text-muted" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="filter-input w-full"
              placeholder="Buscar asignatura huérfana..."
              value={orphanSearch}
              onChange={(e) => setOrphanSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>

        <div className="table-container table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>N°</th>
                <th>Unidad Curricular (Catálogo Oficial)</th>
                <th>Estado de Cobertura</th>
                <th>Impacto Académico</th>
                <th>Acción Inmediata Sugerida</th>
              </tr>
            </thead>
            <tbody>
              {filteredHuerfanas.length > 0 ? (
                filteredHuerfanas.map((materia, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700, color: '#64748b' }}>{idx + 1}</td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                        {materia}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Código Catálogo UPEL • Nivel Pregrado
                      </div>
                    </td>
                    <td>
                      <span style={{
                        background: '#fee2e2',
                        color: '#991b1b',
                        border: '1px solid #fecaca',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '99px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        ⚠️ Sin Docente Asignado
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                        Riesgo de sección desierta en el semestre
                      </span>
                    </td>
                    <td>
                      <span style={{
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        border: '1px solid #bfdbfe',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 600
                      }}>
                        Apertura a Concurso / Reasignación
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#059669', background: '#f0fdf4' }}>
                    <CheckCircle2 size={36} color="#16a34a" style={{ margin: '0 auto 0.5rem' }} />
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                      {orphanSearch ? 'No se encontraron materias que coincidan con la búsqueda.' : '¡No hay materias huérfanas en este período!'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#166534', marginTop: '0.2rem' }}>
                      Todas las asignaturas del catálogo cuentan con docente asignado para {targetAnalysisPeriod}.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MateriasHuerfanasTab;
