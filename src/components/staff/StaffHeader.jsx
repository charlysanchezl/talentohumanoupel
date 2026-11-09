import React from 'react';
import { Download, RefreshCw, Calendar, Plus } from 'lucide-react';
import { formatFechaEspanol } from '../../utils/staffExcelExportHelper';

const StaffHeader = ({
  currentDept,
  theme,
  user,
  academicPeriodsList,
  filterPeriodo,
  filterSede,
  ofertaConsolidada,
  setPreviewData,
  handleOpenAuditorPreview,
  setIsReplicateModalOpen,
  setIsPeriodModalOpen,
  setIsAddDocenteModalOpen,
  getInstitutionalHeaderSubtitle,
  normalizeDepartmentName
}) => {
  const handleExportOferta = () => {
    try {
      const activeOrSelectedPeriod = academicPeriodsList.find(p => (filterPeriodo !== 'Todos' ? p.nombre === filterPeriodo : p.estado === 'ACTIVO')) || academicPeriodsList[0];
      const isPlanning = activeOrSelectedPeriod?.estado === 'PLANIFICACION';
      const periodLabel = activeOrSelectedPeriod?.nombre || (filterPeriodo !== 'Todos' ? filterPeriodo : '2026-I');

      // REGLA ESTRICTA INSTITUCIONAL:
      // Si no hay asignaturas u oferta cargada para este período/departamento, NO exportar nada ni inventar datos vacíos.
      if (ofertaConsolidada.length === 0) {
        alert(`No hay oferta académica con carga validada disponible para el período "${periodLabel}"${currentDept !== 'Todos' ? ` en el departamento ${currentDept}` : ''}.\n\nEn el lapso activo solo se exportan docentes cuya asignación ha sido formalmente verificada y validada.`);
        return;
      }

      const lapsoVigenciaTexto = isPlanning
        ? `Período Académico en Planificación (${activeOrSelectedPeriod?.semanas || 15} semanas reglamentarias)`
        : (activeOrSelectedPeriod && activeOrSelectedPeriod.fechaDesde && activeOrSelectedPeriod.fechaHasta)
          ? `Lapso comprendido entre el ${formatFechaEspanol(activeOrSelectedPeriod.fechaDesde)} y el ${formatFechaEspanol(activeOrSelectedPeriod.fechaHasta)} (${activeOrSelectedPeriod.semanas || 15} semanas)`
          : `Régimen Lectivo: ${activeOrSelectedPeriod?.semanas || 15} semanas`;

      // Cabecera Institucional (Filas 0 a 6)
      const headerRows = [
        ["Universidad Pedagógica Experimental Libertador"],
        [getInstitutionalHeaderSubtitle(filterSede)],
        ["Subdirección de Docencia"],
        [`Asignación de Carga Académica Período Académico Ordinario ${periodLabel}${isPlanning ? ' (EN PLANIFICACIÓN)' : ''}`],
        [lapsoVigenciaTexto],
        ["Personal Fijo / Contratado"],
        [],
        [
          "UNIDAD CURRICULAR",
          "ESPECIALIDAD",
          "SECCIÓN",
          "CUPOS",
          "INSCRITOS",
          "PROFESOR",
          "CÉDULA DE IDENTIDAD",
          "COHORTE",
          "HORAS SEM.",
          "TOTAL HORAS",
          "DPTO",
          "SEDE/CENTRO",
          "TIPO DE PERSONAL",
          "OBSERVACIONES"
        ]
      ];

      // Datos mapeados exclusivamente desde la oferta consolidada real
      const dataRows = [];
      ofertaConsolidada.forEach(item => {
        const staff = item.staff || {};
        const profName = isPlanning
          ? "Pendiente por Asignar"
          : (`${staff.nombres || ''} ${staff.apellidos || ''}`.trim() || 'Docente UPEL');
        const rawCoh = (item.cohorte !== undefined && item.cohorte !== null && item.cohorte !== '') ? String(item.cohorte).trim() : '';
        const isPeriod = rawCoh === '2026-I' || rawCoh === '2026-II' || rawCoh === staff.periodoAcademico;
        const cohorteVal = (rawCoh && !isPeriod) ? rawCoh : '-';
        const docDpto = normalizeDepartmentName(staff.department) || currentDept || '';
        const docSede = staff.sedeCentro || (filterSede !== 'Todos' ? filterSede : "Rubio");
        const docTipo = isPlanning ? "Por Definir" : (staff.categoriaDocente || "FIJO");
        const docCedula = isPlanning ? "" : (staff.cedula || '');

        dataRows.push([
          item.nombre || "",
          item.especialidadDestino || staff.especialidad || "",
          item.seccion || item.secciones || "",
          (item.cupos !== undefined && item.cupos !== null && item.cupos !== '') ? item.cupos : (item.cupo || ""),
          (item.inscritos !== undefined && item.inscritos !== null && item.inscritos !== '') ? item.inscritos : (item.inscrito || ""),
          profName,
          docCedula,
          cohorteVal,
          item.horasSemanal !== undefined && item.horasSemanal !== null ? item.horasSemanal : "",
          item.horasLapso !== undefined && item.horasLapso !== null ? item.horasLapso : "",
          docDpto,
          docSede,
          docTipo,
          isPlanning ? "Oferta preliminar en planificación curricular" : ""
        ]);
      });

      const safePeriodFile = periodLabel.replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeDeptFile = (currentDept || 'Docentes').replace(/[^a-zA-Z0-9_-]/g, '_');

      setPreviewData({
        headerRows,
        dataRows,
        colsWidth: [
          { wch: 35 }, { wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, 
          { wch: 35 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, 
          { wch: 20 }, { wch: 15 }, { wch: 18 }, { wch: 25 }
        ],
        fileName: `Oferta_Academica_${safeDeptFile}_Lapso_${safePeriodFile}.xlsx`,
        sheetName: `Oferta_${safePeriodFile}`,
        title: `Vista Previa de la Oferta Académica - ${currentDept} (Lapso ${periodLabel})`
      });
    } catch (error) {
      console.error("Error al preparar exportación:", error);
      alert("Error al exportar: " + error.message);
    }
  };

  return (
    <div className="upel-card upel-card-accent-blue" style={{
      padding: '1rem 1.5rem',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #0047bb 0%, #002e7a 100%)', 
          color: 'white', 
          width: '44px', 
          height: '44px', 
          borderRadius: '10px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: '0 3px 10px rgba(0, 71, 187, 0.25)',
          flexShrink: 0
        }}>
          {theme.icon}
        </div>
        <div>
          <div className="upel-section-subtitle" style={{ fontSize: '0.72rem', marginBottom: '1px' }}>
            <span>🏛️</span> Subdirección de Docencia — Departamento Académico
          </div>
          <h1 style={{ margin: 0, color: '#0047bb', fontSize: '1.4rem', fontWeight: 800, lineHeight: 1.2 }}>{currentDept}</h1>
          <p style={{ margin: '1px 0 0', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500 }}>
            Gestión, validación y distribución de carga académica
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button className="btn btn-outline" onClick={handleExportOferta}>
          <Download size={18} />
          <span>Exportar Oferta (Vista Previa)</span>
        </button>

        <button 
          className="btn btn-primary" 
          style={{ 
            background: 'linear-gradient(135deg, #15803d, #166534)', 
            borderColor: '#15803d', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            fontWeight: 600,
            boxShadow: '0 2px 4px rgba(22, 101, 52, 0.2)'
          }}
          onClick={handleOpenAuditorPreview}
          title="Generar y abrir vista modal interactiva de exportación con todas las fichas completas: Banco, Cuenta Bancaria, RIF, Teléfonos, Correos y Carga Horaria para exportar a Excel o PDF"
        >
          <Download size={18} />
          <span>Exportar Fichas a Excel (Vista Modal)</span>
        </button>

        {(user?.role === 'JEFE' || user?.role === 'ADMIN' || user?.role === 'DOCENCIA') && (
          <button 
            className="btn btn-primary" 
            onClick={() => setIsReplicateModalOpen(true)} 
            style={{ background: '#2563eb', borderColor: '#2563eb', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            title="Promover o replicar carga académica hacia un nuevo período con checklist y resguardo de historial"
          >
            <RefreshCw size={18} />
            <span>Promover Período</span>
          </button>
        )}

        {['ADMIN', 'DOCENCIA'].includes(user?.role) && (
          <button 
            className="btn btn-primary" 
            onClick={() => setIsPeriodModalOpen(true)} 
            style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', borderColor: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            title="Administrar ciclo de períodos académicos y reprogramación (Admin / Subdirección de Docencia)"
          >
            <Calendar size={18} />
            <span>Gestión de Lapsos</span>
          </button>
        )}

        {(user?.role === 'JEFE' || user?.role === 'ADMIN') && (
          <button className="btn btn-primary" onClick={() => setIsAddDocenteModalOpen(true)} style={{ background: theme.color, borderColor: theme.color }}>
            <Plus size={18} />
            <span>Ingresar Docente</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default StaffHeader;
