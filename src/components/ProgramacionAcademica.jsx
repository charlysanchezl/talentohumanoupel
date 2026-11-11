import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { lazyWithRetry } from '../utils/lazyWithRetry';
import { 
  BookOpen, Search, Printer, Download, MapPin, AlertTriangle, 
  CheckCircle2, BarChart3, FileSpreadsheet, Layers, Building2, 
  Users, Clock, ShieldCheck, ArrowRight, RefreshCw, HelpCircle,
  GraduationCap
} from 'lucide-react';
import { 
  getStaffData, 
  getCurrentUser, 
  getOfertaStatus, 
  sedesInstitucionales, 
  getInstitutionalHeaderSubtitle, 
  getAcademicPeriodsList, 
  especialidades,
  getHuerfanasData,
  getNecesidadesDocentesData,
  normalizeDepartmentName
} from '../data';
import { formatFechaEspanol } from '../utils/staffExcelExportHelper';

const ExcelPreviewModal = lazyWithRetry(() => import('./ExcelPreviewModal'));

const ProgramacionAcademica = () => {
  const [activeTab, setActiveTab] = useState('oferta'); // 'oferta' | 'huerfanas' | 'consejo'
  const [staffList, setStaffList] = useState([]);
  const [selectedEspecialidad, setSelectedEspecialidad] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [filterPeriodo, setFilterPeriodo] = useState('Todos');
  const [filterSede, setFilterSede] = useState('Todos');
  const [academicPeriodsList, setAcademicPeriodsList] = useState([]);

  // Estados para Materias Huérfanas (Fase 4)
  const [huerfanasData, setHuerfanasData] = useState(null);
  const [loadingHuerfanas, setLoadingHuerfanas] = useState(false);
  const [orphanSearch, setOrphanSearch] = useState('');

  // Estados para Cuadro de Necesidades (Fase 5)
  const [necesidadesData, setNecesidadesData] = useState(null);
  const [loadingNecesidades, setLoadingNecesidades] = useState(false);

  const user = getCurrentUser();
  const isEnabled = getOfertaStatus();

  const academicPeriods = useMemo(() => {
    if (academicPeriodsList && academicPeriodsList.length > 0) {
      return academicPeriodsList.map(p => p.nombre);
    }
    const year = new Date().getFullYear();
    return [
      `${year}-I`, `${year}-II`,
      `${year + 1}-I`, `${year + 1}-II`,
      `${year + 2}-I`, `${year + 2}-II`
    ];
  }, [academicPeriodsList]);

  // Período activo actual por defecto
  const currentActivePeriod = useMemo(() => {
    const act = academicPeriodsList.find(p => p.estado === 'ACTIVO');
    if (act) return act.nombre;
    if (academicPeriodsList.length > 0) return academicPeriodsList[0].nombre;
    return '2026-I';
  }, [academicPeriodsList]);

  // Período objetivo para análisis de Huérfanas y Consejo Directivo
  const targetAnalysisPeriod = useMemo(() => {
    if (filterPeriodo && filterPeriodo !== 'Todos') return filterPeriodo;
    return currentActivePeriod;
  }, [filterPeriodo, currentActivePeriod]);

  // Detección institucional: Si el lapso seleccionado está en fase de PLANIFICACIÓN preliminar
  const isPeriodPlanificacion = useMemo(() => {
    const currentToCheck = (filterPeriodo && filterPeriodo !== 'Todos') ? filterPeriodo : targetAnalysisPeriod;
    const periodObj = academicPeriodsList.find(p => p.nombre === currentToCheck);
    return periodObj ? periodObj.estado === 'PLANIFICACION' : (currentToCheck && currentToCheck.includes('II'));
  }, [filterPeriodo, targetAnalysisPeriod, academicPeriodsList]);

  // Carga inicial de personal y lista de períodos
  useEffect(() => {
    const fetchData = async () => {
      const staff = await getStaffData(filterPeriodo);
      setStaffList(staff || []);
      try {
        const pList = await getAcademicPeriodsList();
        setAcademicPeriodsList(pList || []);
      } catch (e) {}
    };
    fetchData();
  }, [filterPeriodo]);

  // Carga de Materias Huérfanas (Fase 4)
  const loadHuerfanas = async (periodoToLoad) => {
    const p = periodoToLoad || targetAnalysisPeriod;
    setLoadingHuerfanas(true);
    try {
      const data = await getHuerfanasData(p);
      setHuerfanasData(data);
    } catch (err) {
      console.error('Error cargando huérfanas:', err);
    } finally {
      setLoadingHuerfanas(false);
    }
  };

  // Carga de Cuadro de Necesidades (Fase 5)
  const loadNecesidades = async (periodoToLoad) => {
    const p = periodoToLoad || targetAnalysisPeriod;
    setLoadingNecesidades(true);
    try {
      const data = await getNecesidadesDocentesData(p);
      setNecesidadesData(data);
    } catch (err) {
      console.error('Error cargando necesidades docentes:', err);
    } finally {
      setLoadingNecesidades(false);
    }
  };

  // Carga automática al cambiar de pestaña o de período
  useEffect(() => {
    if (activeTab === 'huerfanas') {
      loadHuerfanas(targetAnalysisPeriod);
    } else if (activeTab === 'consejo') {
      loadNecesidades(targetAnalysisPeriod);
    }
  }, [activeTab, targetAnalysisPeriod]);

  // Datos filtrados para Oferta por Especialidad (Tab 1)
  // Datos filtrados para Oferta por Especialidad (Tab 1)
  const filteredData = useMemo(() => {
    // REGLA ESTRICTA INSTITUCIONAL:
    // Si el período seleccionado se encuentra en PLANIFICACIÓN, NO se muestran datos de oferta por especialidad.
    // La asignación y carga de especialidades permanece bloqueada hasta que el período sea activado oficialmente.
    if (isPeriodPlanificacion) {
      return [];
    }

    let results = [];
    const activePeriodName = academicPeriodsList.find(p => p.estado === 'ACTIVO')?.nombre || currentActivePeriod || '2026-II';
    
    staffList.forEach(staff => {
      if (filterPeriodo !== 'Todos' && staff.periodoAcademico !== filterPeriodo) {
        return;
      }
      if (filterSede !== 'Todos' && staff.sedeCentro !== filterSede) {
        return;
      }

      // REGLA INSTITUCIONAL UPEL: En la oferta institucional del lapso activo,
      // solo debe mostrarse la carga académica formalmente verificada y validada por la Jefatura (status 'Activo' o 'Validado').
      const targetPeriod = filterPeriodo !== 'Todos' ? filterPeriodo : staff.periodoAcademico;
      const isLapsoActivo = targetPeriod && activePeriodName && targetPeriod === activePeriodName;
      if (isLapsoActivo) {
        const isValidada = staff.status === 'Validado' || staff.status === 'Activo';
        if (!isValidada) return;
      }

      if (staff.materias && staff.materias.length > 0) {
        const materiasEspecialidad = (!selectedEspecialidad || selectedEspecialidad === 'Todos')
          ? staff.materias
          : staff.materias.filter(m => m.especialidadDestino === selectedEspecialidad);

        if (materiasEspecialidad.length > 0) {
          const searchLower = searchTerm.toLowerCase();
          const fullName = `${staff.nombres || ''} ${staff.apellidos || ''}`.toLowerCase();
          
          if (!searchTerm || fullName.includes(searchLower) || staff.cedula?.toLowerCase().includes(searchLower)) {
            results.push({
              ...staff,
              materiasFiltradas: materiasEspecialidad
            });
          }
        }
      }
    });

    return results.sort((a, b) => {
      if (a.department === b.department) {
        return (a.apellidos || '').localeCompare(b.apellidos || '');
      }
      return (a.department || '').localeCompare(b.department || '');
    });
  }, [staffList, selectedEspecialidad, searchTerm, filterPeriodo, filterSede, isPeriodPlanificacion, academicPeriodsList, currentActivePeriod]);

  // EXPORTACIÓN EXCEL: Oferta Académica
  const handleExportExcel = () => {
    try {
      if (isPeriodPlanificacion) {
        alert(`Operación bloqueada: El período académico "${targetAnalysisPeriod}" se encuentra en PLANIFICACIÓN.\n\nNo se permite exportar oferta docente por especialidad porque el período aún no está aperturado ni activo.\nSolo se pueden consultar y exportar períodos cerrados o activos.`);
        return;
      }

      if (filteredData.length === 0) {
        alert(`No hay datos de oferta académica con carga validada disponibles para el período "${targetAnalysisPeriod}".\n\nEn el lapso activo solo se exportan docentes cuya asignación ha sido formalmente verificada y validada.`);
        return;
      }

      const activeOrSelectedPeriod = academicPeriodsList.find(p => p.nombre === targetAnalysisPeriod) || academicPeriodsList.find(p => p.estado === 'ACTIVO') || academicPeriodsList[0];
      const periodLabel = activeOrSelectedPeriod?.nombre || targetAnalysisPeriod;

      const lapsoVigenciaTexto = isPeriodPlanificacion
        ? `Período Académico en Planificación (${activeOrSelectedPeriod?.semanas || 15} semanas reglamentarias)`
        : (activeOrSelectedPeriod && activeOrSelectedPeriod.fechaDesde && activeOrSelectedPeriod.fechaHasta)
          ? `Lapso comprendido entre el ${formatFechaEspanol(activeOrSelectedPeriod.fechaDesde)} y el ${formatFechaEspanol(activeOrSelectedPeriod.fechaHasta)} (${activeOrSelectedPeriod.semanas || 15} semanas)`
          : `Régimen Lectivo: ${activeOrSelectedPeriod?.semanas || 15} semanas`;

      const headerRows = [
        ["Universidad Pedagógica Experimental Libertador"],
        [getInstitutionalHeaderSubtitle(filterSede)],
        ["Subdirección de Docencia"],
        [`Asignación de Carga Académica Período Académico Ordinario ${periodLabel}`],
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

      const dataRows = [];
      filteredData.forEach(staff => {
        staff.materiasFiltradas.forEach(mat => {
          dataRows.push([
            mat.nombre,
            mat.especialidadDestino || selectedEspecialidad || "General",
            mat.seccion || mat.secciones || "",
            (mat.cupos !== undefined && mat.cupos !== null && mat.cupos !== '') ? mat.cupos : (mat.cupo || ""),
            (mat.inscritos !== undefined && mat.inscritos !== null && mat.inscritos !== '') ? mat.inscritos : (mat.inscrito || ""),
            isPeriodPlanificacion ? "Pendiente por Asignar" : `${staff.apellidos} ${staff.nombres}`,
            isPeriodPlanificacion ? "" : staff.cedula,
            (mat.cohorte && mat.cohorte !== staff.periodoAcademico && mat.cohorte !== '2026-I' && mat.cohorte !== '2026-II') ? mat.cohorte : "",
            mat.horasSemanal,
            mat.horasLapso,
            normalizeDepartmentName(staff.department) || "General",
            staff.sedeCentro || "Rubio",
            isPeriodPlanificacion ? "Por Definir" : (staff.categoriaDocente || "FIJO"),
            isPeriodPlanificacion ? "Oferta preliminar en planificación curricular" : ""
          ]);
        });
      });

      setPreviewData({
        headerRows,
        dataRows,
        colsWidth: [
          { wch: 35 }, { wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, 
          { wch: 35 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, 
          { wch: 20 }, { wch: 15 }, { wch: 18 }, { wch: 25 }
        ],
        fileName: `Oferta_Academica_${((selectedEspecialidad && selectedEspecialidad !== 'Todos') ? selectedEspecialidad : 'Consolidada').replace(/[^a-zA-Z0-9_-]/g, '_')}_Lapso_${targetAnalysisPeriod.replace(/[^a-zA-Z0-9_-]/g, '_')}.xlsx`,
        sheetName: `Oferta_${targetAnalysisPeriod.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
        title: `Vista Previa de la Oferta Académica - Lapso ${targetAnalysisPeriod}`
      });
    } catch (error) {
      alert("Error al preparar exportación: " + error.message);
      console.error(error);
    }
  };

  // EXPORTACIÓN EXCEL: Materias Huérfanas (Fase 4)
  const handleExportHuerfanasExcel = () => {
    try {
      const list = huerfanasData?.huerfanas || [];
      if (list.length === 0) {
        alert('Actualmente no hay materias huérfanas en este período (100% de cobertura alcanzada).');
        return;
      }

      const headerRows = [
        ["Universidad Pedagógica Experimental Libertador"],
        ["Instituto Pedagógico Rural 'Gervasio Rubio'"],
        ["Subdirección de Docencia • Coordinación de Planificación Curricular"],
        [`Reporte Preventivo de Materias Huérfanas (Sin Docente Asignado) - Período ${targetAnalysisPeriod}`],
        [`Fecha de Emisión: ${new Date().toLocaleDateString('es-VE')} | Total Vacantes: ${list.length}`],
        [],
        [
          "N°",
          "UNIDAD CURRICULAR (CATÁLOGO OFICIAL)",
          "ESTADO DE ASIGNACIÓN",
          "DÉFICIT HORARIO ESTIMADO",
          "ACCIÓN RECOMENDADA",
          "OBSERVACIÓN INSTITUCIONAL"
        ]
      ];

      const dataRows = list.map((matName, idx) => [
        idx + 1,
        matName,
        "SIN DOCENTE ASIGNADO",
        "Requerido en Concurso / Reasignación",
        "Apertura de Concurso o Distribución Interna",
        "Materia activa en catálogo curricular UPEL"
      ]);

      setPreviewData({
        headerRows,
        dataRows,
        colsWidth: [
          { wch: 8 }, { wch: 45 }, { wch: 26 }, { wch: 32 }, { wch: 38 }, { wch: 38 }
        ],
        fileName: `Materias_Huerfanas_${targetAnalysisPeriod}.xlsx`
      });
    } catch (error) {
      alert("Error al preparar exportación de materias huérfanas: " + error.message);
    }
  };

  // EXPORTACIÓN EXCEL: Cuadro de Necesidades para Consejo Directivo (Fase 5)
  const handleExportConsejoExcel = () => {
    try {
      if (!necesidadesData || !necesidadesData.resumen) {
        alert('No hay datos disponibles para el período seleccionado.');
        return;
      }

      const { resumen, porDepartamento, porSede, porDedicacion, porEspecialidad } = necesidadesData;

      const headerRows = [
        ["Universidad Pedagógica Experimental Libertador"],
        ["Instituto Pedagógico Rural 'Gervasio Rubio'"],
        ["Subdirección de Docencia • Consejo Directivo"],
        [`Cuadro Consolidado de Necesidades y Distribución de Carga Académica - Período ${targetAnalysisPeriod}`],
        [`Docentes: ${resumen.totalDocentes} | Horas Semanales: ${resumen.totalHorasSemanal} | Horas Lapso: ${resumen.totalHorasLapso} | Promedio: ${resumen.promedioHorasDocente} hrs/docente`],
        [],
        [
          "SECCIÓN / CRITERIO",
          "N° DOCENTES / SECCIONES",
          "HORAS SEMANALES",
          "HORAS LAPSO",
          "% PARTICIPACIÓN",
          "OBSERVACIONES"
        ]
      ];

      const dataRows = [];

      // SECCIÓN 1: DEPARTAMENTOS ACADÉMICOS
      dataRows.push(["=== DISTRIBUCIÓN POR DEPARTAMENTOS ACADÉMICOS ===", "", "", "", "", ""]);
      (porDepartamento || []).forEach(d => {
        dataRows.push([
          d.departamento,
          d.docentes,
          d.horasSemanal,
          d.horasLapso,
          `${d.porcentajeCarga}%`,
          "Carga departamental consolidada"
        ]);
      });
      dataRows.push([
        "TOTAL DEPARTAMENTOS",
        resumen.totalDocentes,
        resumen.totalHorasSemanal,
        resumen.totalHorasLapso,
        "100.0%",
        "Total General"
      ]);
      dataRows.push([]);

      // SECCIÓN 2: DISTRIBUCIÓN TERRITORIAL (SEDES)
      dataRows.push(["=== DISTRIBUCIÓN TERRITORIAL POR SEDES Y EXTENSIONES ===", "", "", "", "", ""]);
      (porSede || []).forEach(s => {
        dataRows.push([
          `Sede / Centro: ${s.sede}`,
          s.docentes,
          s.horasSemanal,
          s.horasLapso,
          resumen.totalHorasSemanal > 0 ? `${((s.horasSemanal / resumen.totalHorasSemanal) * 100).toFixed(1)}%` : '0%',
          "Distribución territorial"
        ]);
      });
      dataRows.push([]);

      // SECCIÓN 3: DEDICACIÓN DOCENTE
      dataRows.push(["=== DISTRIBUCIÓN POR RÉGIMEN DE DEDICACIÓN ===", "", "", "", "", ""]);
      (porDedicacion || []).forEach(ded => {
        dataRows.push([
          ded.dedicacion,
          ded.docentes,
          ded.horasSemanal,
          "-",
          resumen.totalHorasSemanal > 0 ? `${((ded.horasSemanal / resumen.totalHorasSemanal) * 100).toFixed(1)}%` : '0%',
          "Condición docente"
        ]);
      });
      dataRows.push([]);

      // SECCIÓN 4: ESPECIALIDADES
      dataRows.push(["=== DEMANDA Y COBERTURA POR ESPECIALIDADES UPEL ===", "", "", "", "", ""]);
      (porEspecialidad || []).forEach(esp => {
        dataRows.push([
          esp.especialidad,
          `${esp.secciones} secc. (${esp.docentes} docentes)`,
          esp.horasSemanal,
          "-",
          resumen.totalHorasSemanal > 0 ? `${((esp.horasSemanal / resumen.totalHorasSemanal) * 100).toFixed(1)}%` : '0%',
          "Especialidad atendida"
        ]);
      });

      setPreviewData({
        headerRows,
        dataRows,
        colsWidth: [
          { wch: 45 }, { wch: 26 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 32 }
        ],
        fileName: `Cuadro_Necesidades_Consejo_Directivo_${targetAnalysisPeriod}.xlsx`
      });
    } catch (error) {
      alert("Error al preparar exportación para Consejo Directivo: " + error.message);
    }
  };

  // Filtrado en memoria de materias huérfanas
  const filteredHuerfanas = useMemo(() => {
    if (!huerfanasData || !huerfanasData.huerfanas) return [];
    if (!orphanSearch.trim()) return huerfanasData.huerfanas;
    const q = orphanSearch.toLowerCase().trim();
    return huerfanasData.huerfanas.filter(h => h.toLowerCase().includes(q));
  }, [huerfanasData, orphanSearch]);

  const coveragePercent = useMemo(() => {
    if (!huerfanasData || !huerfanasData.totalCatalogo) return 100;
    const covered = huerfanasData.cubiertasCount || (huerfanasData.totalCatalogo - huerfanasData.huerfanasCount);
    return Math.min(100, Math.max(0, Math.round((covered / huerfanasData.totalCatalogo) * 100)));
  }, [huerfanasData]);

  if (user?.role !== 'ADMIN' && !isEnabled) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>Módulo Deshabilitado</h2>
        <p className="text-muted">El administrador ha bloqueado temporalmente el acceso a la Oferta Institucional.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header Institucional UPEL Compacto */}
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
            background: 'var(--primary)', color: 'white', width: '44px', height: '44px', 
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 3px 10px rgba(0, 51, 102, 0.18)',
            flexShrink: 0
          }}>
            <BookOpen size={22} />
          </div>
          <div>
            <div className="upel-section-subtitle" style={{ fontSize: '0.72rem', marginBottom: '1px' }}>SUBDIRECCIÓN DE DOCENCIA • OFERTA TRANSVERSAL Y PLANIFICACIÓN</div>
            <h1 className="upel-section-title" style={{ margin: '1px 0', fontSize: '1.4rem', lineHeight: 1.2 }}>Programación Académica</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Gestión estratégica de la oferta curricular, diagnóstico de vacantes y necesidades para el Consejo Directivo
            </p>
          </div>
        </div>

        {/* Acciones de Cabecera y Badge de Lapso */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <div style={{
            background: '#eff6ff',
            border: '1.5px solid #bfdbfe',
            borderRadius: '12px',
            padding: '0.6rem 1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <Clock size={20} color="#0047bb" />
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                Período de Análisis
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0047bb' }}>
                {targetAnalysisPeriod}
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleExportExcel}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              padding: '0.65rem 1.25rem',
              fontWeight: 700,
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 51, 102, 0.2)',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
            title="Exportar Oferta Académica a Excel (.xlsx)"
          >
            <Download size={18} />
            <span>Exportar Oferta Académica (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* PESTAÑAS ESTRATÉGICAS DE NAVEGACIÓN */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '0.75rem'
      }}>
        <button
          onClick={() => setActiveTab('oferta')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            borderRadius: '10px',
            border: activeTab === 'oferta' ? '2px solid #003366' : '1px solid #cbd5e1',
            background: activeTab === 'oferta' ? '#003366' : '#ffffff',
            color: activeTab === 'oferta' ? '#ffffff' : '#334155',
            fontWeight: 700,
            fontSize: '0.92rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: activeTab === 'oferta' ? '0 4px 12px rgba(0, 51, 102, 0.2)' : 'none'
          }}
        >
          <BookOpen size={18} />
          <span>Oferta por Especialidad</span>
        </button>

        <button
          onClick={() => setActiveTab('huerfanas')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            borderRadius: '10px',
            border: activeTab === 'huerfanas' ? '2px solid #b45309' : '1px solid #cbd5e1',
            background: activeTab === 'huerfanas' ? '#b45309' : '#ffffff',
            color: activeTab === 'huerfanas' ? '#ffffff' : '#334155',
            fontWeight: 700,
            fontSize: '0.92rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: activeTab === 'huerfanas' ? '0 4px 12px rgba(180, 83, 9, 0.2)' : 'none'
          }}
        >
          <AlertTriangle size={18} />
          <span>Materias Huérfanas (Sin Asignar)</span>
          {huerfanasData && (
            <span style={{
              background: activeTab === 'huerfanas' ? '#ffffff' : (huerfanasData.huerfanasCount > 0 ? '#ef4444' : '#16a34a'),
              color: activeTab === 'huerfanas' ? '#b45309' : '#ffffff',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '0.15rem 0.55rem',
              borderRadius: '99px'
            }}>
              {huerfanasData.huerfanasCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('consejo')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            borderRadius: '10px',
            border: activeTab === 'consejo' ? '2px solid #059669' : '1px solid #cbd5e1',
            background: activeTab === 'consejo' ? '#059669' : '#ffffff',
            color: activeTab === 'consejo' ? '#ffffff' : '#334155',
            fontWeight: 700,
            fontSize: '0.92rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: activeTab === 'consejo' ? '0 4px 12px rgba(5, 150, 105, 0.2)' : 'none'
          }}
        >
          <BarChart3 size={18} />
          <span>Cuadro de Necesidades (Consejo Directivo)</span>
          <span style={{
            background: activeTab === 'consejo' ? '#ffffff' : '#e6f6ee',
            color: activeTab === 'consejo' ? '#059669' : '#008744',
            fontSize: '0.7rem',
            fontWeight: 800,
            padding: '0.15rem 0.5rem',
            borderRadius: '99px'
          }}>
            Oficial
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* PESTAÑA 1: OFERTA ACADÉMICA POR ESPECIALIDAD                              */}
      {/* ========================================================================= */}
      {activeTab === 'oferta' && (
        <>
          <div className="upel-card upel-card-accent-blue" style={{ padding: '1.75rem 2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div className="upel-section-subtitle">FILTRADO Y CRITERIOS</div>
                <h3 style={{ margin: '0.2rem 0 0', color: '#003366', fontSize: '1.2rem' }}>Filtrar Oferta Académica</h3>
              </div>
              <button
                className="btn btn-outline"
                onClick={handleExportExcel}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 1.15rem',
                  fontWeight: 700,
                  backgroundColor: '#f0fdf4',
                  color: '#166534',
                  borderColor: '#86efac',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
                title="Exportar Oferta Académica a Excel (.xlsx)"
              >
                <FileSpreadsheet size={18} color="#166534" />
                <span>Exportar Oferta (.xlsx)</span>
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label className="form-label">Especialidad Destino</label>
                <select 
                  className="filter-select w-full" 
                  value={selectedEspecialidad} 
                  onChange={(e) => setSelectedEspecialidad(e.target.value)}
                >
                  <option value="Todos">Todas las Especialidades (Consolidado)</option>
                  {especialidades.map(esp => (
                    <option key={esp} value={esp}>{esp}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Período Académico</label>
                <select 
                  className="filter-select w-full" 
                  value={filterPeriodo} 
                  onChange={(e) => setFilterPeriodo(e.target.value)}
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
              </div>

              <div>
                <label className="form-label">Sede / Centro</label>
                <select 
                  className="filter-select w-full" 
                  value={filterSede} 
                  onChange={(e) => setFilterSede(e.target.value)}
                >
                  <option value="Todos">Todas las Sedes</option>
                  {sedesInstitucionales.map(sede => (
                    <option key={sede} value={sede}>{sede}</option>
                  ))}
                </select>
              </div>
              
              {selectedEspecialidad && (
                <div>
                  <label className="form-label">Buscar Docente (Opcional)</label>
                  <div style={{ position: 'relative' }}>
                    <Search size={18} className="text-muted" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                      type="text" 
                      className="filter-input w-full" 
                      placeholder="Nombre o Cédula..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {selectedEspecialidad && (
            <div className="upel-card upel-card-accent-blue" style={{ padding: '1.75rem 2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div className="upel-section-subtitle">RESULTADOS POR ESPECIALIDAD</div>
                  <h3 style={{ margin: '0.2rem 0 0', color: '#003366', fontSize: '1.2rem' }}>
                    Docentes asignados a <span style={{ color: 'var(--primary)' }}>{selectedEspecialidad}</span>
                  </h3>
                </div>
                <button className="btn btn-outline" onClick={handleExportExcel}>
                  <Download size={18} /> Exportar Excel
                </button>
              </div>

              <div className="table-container table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Dpto. Origen</th>
                      <th>Docente</th>
                      <th>Sede / Centro</th>
                      <th>Materia / Unidad Curricular</th>
                      <th>Especialidad</th>
                      <th>Sección</th>
                      <th>Cupos/Insc.</th>
                      <th>Cohorte</th>
                      <th>Horas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length > 0 ? (
                      filteredData.map((staff, idx) => (
                        <tr key={idx}>
                          <td>
                            <span className="badge badge-info">{normalizeDepartmentName(staff.department)}</span>
                          </td>
                          <td>
                            {isPeriodPlanificacion ? (
                              <div>
                                <span className="badge" style={{ background: '#fef3c7', color: '#92400e', fontWeight: 700, border: '1px solid #fde68a' }}>
                                  ⏳ Pendiente por Asignar
                                </span>
                                <div className="text-muted" style={{ fontSize: '0.72rem', marginTop: '0.2rem' }}>Fase de Planificación</div>
                              </div>
                            ) : (
                              <>
                                <div className="user-name" style={{ fontWeight: 600 }}>{staff.nombres ? `${staff.nombres} ${staff.apellidos}` : (staff.apellidos || staff.cedula)}</div>
                                <div className="user-email">C.I: {staff.cedula}</div>
                              </>
                            )}
                          </td>
                          <td>
                            <span className="badge" style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' }}>
                              {staff.sedeCentro || 'Rubio'}
                            </span>
                          </td>
                          <td>
                            <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                              {staff.materiasFiltradas.map((mat, i) => (
                                <li key={i} style={{ padding: '0.2rem 0', fontWeight: 500 }}>
                                  {mat.nombre}
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td>
                            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                              {staff.materiasFiltradas.map((mat, i) => (
                                <li key={i} style={{ padding: '0.2rem 0', color: 'var(--text-main)' }}>
                                  {mat.especialidadDestino || selectedEspecialidad}
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td>
                            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                              {staff.materiasFiltradas.map((mat, i) => (
                                <li key={i} style={{ padding: '0.2rem 0', textAlign: 'center' }}>
                                  <span className="badge badge-primary">{mat.seccion || '-'}</span>
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td>
                            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                              {staff.materiasFiltradas.map((mat, i) => (
                                <li key={i} style={{ padding: '0.2rem 0', textAlign: 'center' }}>
                                  {mat.cupos || '0'} / {mat.inscritos || '0'}
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td>
                            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                              {staff.materiasFiltradas.map((mat, i) => (
                                <li key={i} style={{ padding: '0.2rem 0', textAlign: 'center' }}>
                                  <span className="badge" style={{ background: '#f8fafc', color: '#1e293b', border: '1px solid #cbd5e1', fontWeight: 600 }}>
                                    {mat.cohorte || '-'}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td>
                            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                              {staff.materiasFiltradas.map((mat, i) => (
                                <li key={i} style={{ padding: '0.2rem 0', color: 'var(--primary-dark)', fontWeight: 600 }}>
                                  {mat.horasSemanal} hrs
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" style={{ textAlign: 'center', padding: '3rem' }}>
                          {isPeriodPlanificacion ? (
                            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', color: '#1e40af', background: '#eff6ff', padding: '1.5rem 2rem', borderRadius: '12px', border: '1.5px solid #bfdbfe' }}>
                              <div style={{ fontWeight: 800, fontSize: '1rem' }}>
                                🔒 Período Académico en Planificación ({targetAnalysisPeriod})
                              </div>
                              <div style={{ fontSize: '0.86rem', color: '#3b82f6', maxWidth: '600px' }}>
                                Este período aún no ha sido aperturado oficialmente. La asignación de unidades curriculares y oferta docente por especialidad permanece en resguardo y se mostrará una vez activado el lapso lectivo. Puede consultar la oferta de los períodos concluidos o cerrados.
                              </div>
                            </div>
                          ) : (
                            <div style={{ color: 'var(--text-muted)' }}>
                              No hay docentes asignados para dar clases a esta especialidad en el período seleccionado.
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 2: DETECCIÓN PREVENTIVA DE MATERIAS HUÉRFANAS (FASE 4)            */}
      {/* ========================================================================= */}
      {activeTab === 'huerfanas' && (
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
                    ? `El 100% de las materias del catálogo oficial están debidamente asignadas a profesores. No hay riesgo de asignaturas sin impartir.`
                    : `Estas materias pertenecen al catálogo académico institucional pero ningún profesor tiene secciones ni horas asignadas para ellas. Es prioritario abrir concurso docente o reasignar carga horaria antes del inicio del semestre.`}
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
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 3: CUADRO CONSOLIDADO DE NECESIDADES (CONSEJO DIRECTIVO - FASE 5)  */}
      {/* ========================================================================= */}
      {activeTab === 'consejo' && (
        <div className="animate-fade-in">
          {/* Barra Superior con Selector de Período y Botón de Descarga Oficial */}
          <div className="upel-card upel-card-accent-blue" style={{ padding: '1.75rem 2rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div className="upel-section-subtitle">INFORME EJECUTIVO DE CARGA DOCENTE</div>
                <h3 style={{ margin: '0.2rem 0 0.4rem', color: '#003366', fontSize: '1.35rem' }}>
                  Cuadro Consolidado de Necesidades Docentes (Consejo Directivo)
                </h3>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
                  Matriz oficial de horas, dedicaciones, distribución territorial y cobertura curricular para toma de decisiones y aprobaciones rectorales.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <select
                  value={filterPeriodo === 'Todos' ? targetAnalysisPeriod : filterPeriodo}
                  onChange={(e) => setFilterPeriodo(e.target.value)}
                  style={{
                    padding: '0.55rem 0.95rem',
                    borderRadius: '8px',
                    border: '1.5px solid #059669',
                    fontWeight: 700,
                    color: '#065f46',
                    fontSize: '0.92rem'
                  }}
                >
                  {academicPeriodsList.map(p => (
                    <option key={p.id || p.nombre} value={p.nombre}>
                      Período {p.nombre} ({p.estado})
                    </option>
                  ))}
                </select>

                <button 
                  onClick={() => loadNecesidades(targetAnalysisPeriod)} 
                  disabled={loadingNecesidades}
                  className="btn btn-outline"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 0.95rem' }}
                >
                  <RefreshCw size={16} className={loadingNecesidades ? 'animate-spin' : ''} />
                  <span>Actualizar</span>
                </button>

                <button 
                  onClick={handleExportConsejoExcel}
                  className="btn btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, #059669, #047857)',
                    borderColor: '#047857',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.55rem 1.25rem',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
                  }}
                >
                  <FileSpreadsheet size={18} />
                  <span>Descargar Cuadro Consejo Directivo (.xlsx)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tarjetas KPI Ejecutivas */}
          {necesidadesData && necesidadesData.resumen && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
              <div className="upel-card" style={{ padding: '1.25rem', borderLeft: '4px solid #003366' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Docentes en el Período
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#003366', marginTop: '0.35rem' }}>
                  {necesidadesData.resumen.totalDocentes}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Talento humano asignado
                </div>
              </div>

              <div className="upel-card" style={{ padding: '1.25rem', borderLeft: '4px solid #0284c7' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Total Horas Semanales
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0284c7', marginTop: '0.35rem' }}>
                  {necesidadesData.resumen.totalHorasSemanal} <span style={{ fontSize: '1rem', fontWeight: 600 }}>hrs/sem</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Carga horaria semanal activa
                </div>
              </div>

              <div className="upel-card" style={{ padding: '1.25rem', borderLeft: '4px solid #059669' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Total Horas Semestrales
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669', marginTop: '0.35rem' }}>
                  {necesidadesData.resumen.totalHorasLapso} <span style={{ fontSize: '1rem', fontWeight: 600 }}>hrs</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Proyección a 15 semanas UPEL
                </div>
              </div>

              <div className="upel-card" style={{ padding: '1.25rem', borderLeft: '4px solid #d97706' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Promedio Horas / Docente
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#d97706', marginTop: '0.35rem' }}>
                  {necesidadesData.resumen.promedioHorasDocente} <span style={{ fontSize: '1rem', fontWeight: 600 }}>hrs/doc</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Intensidad docente promedio
                </div>
              </div>
            </div>
          )}

          {/* MATRIZ 1: CONSOLIDADO POR DEPARTAMENTO ACADÉMICO */}
          <div className="upel-card upel-card-accent-blue" style={{ padding: '1.75rem 2rem', marginBottom: '2rem' }}>
            <div className="upel-section-subtitle">MATRIZ 1 • DISTRIBUCIÓN DEPARTAMENTAL</div>
            <h3 style={{ margin: '0.2rem 0 1.25rem', color: '#003366', fontSize: '1.2rem' }}>
              Distribución de Carga Docente por Departamento Académico
            </h3>

            <div className="table-container table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Departamento Académico</th>
                    <th style={{ textAlign: 'center' }}>N° Docentes</th>
                    <th style={{ textAlign: 'center' }}>Horas Semanales</th>
                    <th style={{ textAlign: 'center' }}>Horas Lapso</th>
                    <th style={{ textAlign: 'center' }}>% Participación</th>
                    <th>Distribución Visual</th>
                  </tr>
                </thead>
                <tbody>
                  {necesidadesData?.porDepartamento?.length > 0 ? (
                    necesidadesData.porDepartamento.map((dpto, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>
                          {dpto.departamento}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>
                          <span className="badge badge-info">{dpto.docentes}</span>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: '#003366' }}>
                          {dpto.horasSemanal} hrs
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>
                          {dpto.horasLapso} hrs
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: '#059669' }}>
                          {dpto.porcentajeCarga}%
                        </td>
                        <td>
                          <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden', minWidth: '120px' }}>
                            <div style={{
                              height: '100%',
                              width: `${dpto.porcentajeCarga}%`,
                              background: '#003366',
                              borderRadius: '99px'
                            }} />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        No hay registros departamentales para este período.
                      </td>
                    </tr>
                  )}
                </tbody>
                {necesidadesData?.resumen && (
                  <tfoot>
                    <tr style={{ background: '#f8fafc', fontWeight: 800, borderTop: '2px solid #cbd5e1' }}>
                      <td>TOTAL INSTITUCIONAL</td>
                      <td style={{ textAlign: 'center' }}>{necesidadesData.resumen.totalDocentes}</td>
                      <td style={{ textAlign: 'center', color: '#003366' }}>{necesidadesData.resumen.totalHorasSemanal} hrs</td>
                      <td style={{ textAlign: 'center' }}>{necesidadesData.resumen.totalHorasLapso} hrs</td>
                      <td style={{ textAlign: 'center', color: '#059669' }}>100.0%</td>
                      <td>-</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* MATRIZ 2 & 3: TERRITORIAL (SEDES) Y DEDICACIÓN */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Sedes */}
            <div className="upel-card upel-card-accent-blue" style={{ padding: '1.5rem 1.75rem' }}>
              <div className="upel-section-subtitle">MATRIZ 2 • DISTRIBUCIÓN TERRITORIAL</div>
              <h3 style={{ margin: '0.2rem 0 1rem', color: '#003366', fontSize: '1.15rem' }}>
                Sedes y Extensiones Académicas
              </h3>
              <div className="table-container table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Sede / Centro</th>
                      <th style={{ textAlign: 'center' }}>Docentes</th>
                      <th style={{ textAlign: 'center' }}>Horas Sem.</th>
                      <th style={{ textAlign: 'center' }}>Horas Lapso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {necesidadesData?.porSede?.length > 0 ? (
                      necesidadesData.porSede.map((s, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600 }}>{s.sede}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span className="badge badge-primary">{s.docentes}</span>
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 700, color: '#0369a1' }}>
                            {s.horasSemanal} hrs
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {s.horasLapso} hrs
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>
                          Sin datos de sedes
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Dedicaciones */}
            <div className="upel-card upel-card-accent-blue" style={{ padding: '1.5rem 1.75rem' }}>
              <div className="upel-section-subtitle">MATRIZ 3 • CONDICIÓN DOCENTE</div>
              <h3 style={{ margin: '0.2rem 0 1rem', color: '#003366', fontSize: '1.15rem' }}>
                Régimen de Dedicación Docente
              </h3>
              <div className="table-container table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Régimen de Dedicación</th>
                      <th style={{ textAlign: 'center' }}>Docentes</th>
                      <th style={{ textAlign: 'center' }}>Horas Sem.</th>
                      <th style={{ textAlign: 'center' }}>Promedio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {necesidadesData?.porDedicacion?.length > 0 ? (
                      necesidadesData.porDedicacion.map((ded, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600 }}>{ded.dedicacion}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span className="badge badge-info">{ded.docentes}</span>
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 700, color: '#059669' }}>
                            {ded.horasSemanal} hrs
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {ded.docentes > 0 ? (ded.horasSemanal / ded.docentes).toFixed(1) : 0} hrs/doc
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>
                          Sin datos de dedicación
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* MATRIZ 4: DEMANDA Y COBERTURA POR ESPECIALIDADES */}
          <div className="upel-card upel-card-accent-blue" style={{ padding: '1.75rem 2rem' }}>
            <div className="upel-section-subtitle">MATRIZ 4 • COBERTURA CURRICULAR TRANSVERSAL</div>
            <h3 style={{ margin: '0.2rem 0 1.25rem', color: '#003366', fontSize: '1.2rem' }}>
              Demanda y Cobertura en las 14 Especialidades UPEL
            </h3>

            <div className="table-container table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Especialidad Académica</th>
                    <th style={{ textAlign: 'center' }}>Secciones Activas</th>
                    <th style={{ textAlign: 'center' }}>Docentes Asignados</th>
                    <th style={{ textAlign: 'center' }}>Horas Semanales</th>
                    <th>Estado de Cobertura</th>
                  </tr>
                </thead>
                <tbody>
                  {necesidadesData?.porEspecialidad?.length > 0 ? (
                    necesidadesData.porEspecialidad.map((esp, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>
                          {esp.especialidad}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="badge badge-primary">{esp.secciones}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="badge badge-info">{esp.docentes}</span>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: '#003366' }}>
                          {esp.horasSemanal} hrs
                        </td>
                        <td>
                          <span style={{
                            background: esp.secciones > 0 ? '#ecfdf5' : '#fef2f2',
                            color: esp.secciones > 0 ? '#065f46' : '#991b1b',
                            border: `1px solid ${esp.secciones > 0 ? '#a7f3d0' : '#fecaca'}`,
                            padding: '0.2rem 0.55rem',
                            borderRadius: '99px',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}>
                            {esp.secciones > 0 ? '✓ Atendida' : '⚠️ Sin secciones'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        Sin asignación de especialidades registrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE VISTA PREVIA EXCEL / PDF */}
      {previewData && (
        <Suspense fallback={null}>
          <ExcelPreviewModal 
            isOpen={true}
            onClose={() => setPreviewData(null)}
            headerRows={previewData.headerRows}
            dataRows={previewData.dataRows}
            colsWidth={previewData.colsWidth}
            fileName={previewData.fileName}
            title="Vista Previa de Exportación Institucional"
          />
        </Suspense>
      )}

      <style>{`
        .w-full { width: 100%; }
        .form-label { display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight: 600; color: var(--text-muted); }
      `}</style>
    </div>
  );
};

export default ProgramacionAcademica;
