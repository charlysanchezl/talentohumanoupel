import { normalizeDepartmentName, getInstitutionalHeaderSubtitle } from '../data';

/**
 * Convierte fechas YYYY-MM-DD a formato institucional en español (ej: "03 de noviembre de 2026").
 */
export function formatFechaEspanol(fechaStr) {
  if (!fechaStr) return '';
  const s = String(fechaStr).trim();
  const parts = s.split('-');
  if (parts.length === 3) {
    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const anio = parts[0];
    const mesIdx = parseInt(parts[1], 10) - 1;
    const dia = parseInt(parts[2], 10);
    if (mesIdx >= 0 && mesIdx < 12 && !isNaN(dia)) {
      const diaStr = String(dia).padStart(2, '0');
      return `${diaStr} de ${meses[mesIdx]} de ${anio}`;
    }
  }
  return s;
}

/**
 * Genera el paquete de datos para la vista previa modal de Auditoría / Fichas a Excel.
 */
export function buildAuditorExportData({
  filteredAndSortedStaff = [],
  academicPeriodsList = [],
  filterPeriodo = 'Todos',
  filterDepartment = 'Todos',
  filterSede = 'Todos'
}) {
  const activeOrSelectedPeriod = academicPeriodsList.find(p => (filterPeriodo !== 'Todos' ? p.nombre === filterPeriodo : p.estado === 'ACTIVO')) || academicPeriodsList[0];
  const activePeriod = academicPeriodsList.find(p => p.estado === 'ACTIVO');
  const isPlanning = activeOrSelectedPeriod?.estado === 'PLANIFICACION';
  const periodLabel = activeOrSelectedPeriod?.nombre || (filterPeriodo !== 'Todos' ? filterPeriodo : '2026-I');

  const isLapsoActivo = activePeriod && (activeOrSelectedPeriod?.id === activePeriod.id || activeOrSelectedPeriod?.nombre === activePeriod.nombre || filterPeriodo === 'Todos');

  const staffToExport = filteredAndSortedStaff.filter(staff => {
    const hasMaterias = Array.isArray(staff.materias) && staff.materias.length > 0;
    if (!hasMaterias) return false;
    if (staff.status === 'Por Revisar') return false;

    const isDocenteLapsoActivo = activePeriod && (staff.periodoAcademico === activePeriod.nombre || !staff.periodoAcademico);
    if (isLapsoActivo && isDocenteLapsoActivo) {
      return staff.status === 'Validado' || staff.status === 'Activo';
    }
    return true;
  });

  if (staffToExport.length === 0) {
    alert(`No hay registros de docentes con carga académica para el período "${periodLabel}".\n\nEn el lapso activo solo se exportan docentes con carga validada, y en lapsos culminados aquellos con asignaciones académicas.`);
    return null;
  }

  const vigenciaTexto = isPlanning 
    ? 'Período en Planificación (Sin fechas lectivas)'
    : (activeOrSelectedPeriod && activeOrSelectedPeriod.fechaDesde && activeOrSelectedPeriod.fechaHasta)
      ? `Vigencia: ${formatFechaEspanol(activeOrSelectedPeriod.fechaDesde)} al ${formatFechaEspanol(activeOrSelectedPeriod.fechaHasta)} (${activeOrSelectedPeriod.semanas || 15} sem)`
      : `(${activeOrSelectedPeriod?.semanas || 15} sem)`;

  const headerRows = [
    ["UNIVERSIDAD PEDAGÓGICA EXPERIMENTAL LIBERTADOR"],
    ["INSTITUTO PEDAGÓGICO RURAL GERVASIO RUBIO - UNIDAD DE TALENTO HUMANO"],
    ["MATRIZ AUDITABLE DE TALENTO HUMANO Y FICHAS DE DOCENTES CONTRATADOS"],
    [`Período Académico: ${activeOrSelectedPeriod?.nombre || (filterPeriodo !== 'Todos' ? filterPeriodo : '2026-I')}${isPlanning ? ' (EN PLANIFICACIÓN)' : ''} | ${vigenciaTexto} | Departamento: ${filterDepartment} | Centro de Atención / Sede: ${filterSede} | Emisión: ${new Date().toLocaleDateString('es-VE')}`],
    [],
    [
      "N°",
      "CÉDULA",
      "DOCENTE (APELLIDOS Y NOMBRES)",
      "RIF",
      "BANCO",
      "TIPO CUENTA",
      "Nº CUENTA BANCARIA",
      "ESTATUS BANCO",
      "TELÉFONO",
      "CORREO PERSONAL",
      "CORREO INSTITUCIONAL",
      "DIRECCIÓN",
      "PREGRADO",
      "POSTGRADO",
      "DOCTORADO",
      "CATEGORÍA",
      "DEDICACIÓN",
      "DEPARTAMENTO",
      "SEDE/CENTRO",
      "ESPECIALIDAD",
      "PERÍODO",
      "ESTATUS",
      "CANT. MAT.",
      "H. SEM",
      "H. LAPSO",
      "ASIGNATURAS ASIGNADAS"
    ]
  ];

  const dataRows = staffToExport.map((staff, idx) => {
    const totSem = (staff.materias || []).reduce((sum, m) => sum + (parseInt(m.horasSemanal) || 0), 0);
    const totLap = (staff.materias || []).reduce((sum, m) => sum + (parseInt(m.horasLapso) || 0), 0);
    const matCount = (staff.materias || []).length;
    const matSummary = (staff.materias || []).map(m => {
      const sec = m.seccion || m.secciones || '';
      const cup = (m.cupos !== undefined && m.cupos !== null && m.cupos !== '') ? m.cupos : '';
      const ins = (m.inscritos !== undefined && m.inscritos !== null && m.inscritos !== '') ? m.inscritos : '';
      const coh = m.cohorte || '';
      const extra = [sec ? `Sec: ${sec}` : '', (cup !== '' || ins !== '') ? `Cup/Ins: ${cup || '-'}/${ins || '-'}` : '', coh ? `Cohorte: ${coh}` : ''].filter(Boolean).join(' | ');
      return `${m.nombre}${extra ? ` [${extra}]` : ''} (${m.horasSemanal}h)`;
    }).join('; ');
    const tieneBanco = Boolean(staff.banco && staff.cuentaBancaria);
    const statusDocente = (staff.status === 'Validado' || staff.status === 'Activo') ? 'Validado' : (staff.status || 'Por Revisar');

    return [
      idx + 1,
      staff.cedula || 'S/C',
      `${staff.apellidos || ''}, ${staff.nombres || ''}`.trim(),
      staff.rif || 'N/A',
      staff.banco || '⚠️ Sin Banco',
      staff.tipoCuenta || 'Ahorro',
      staff.cuentaBancaria ? String(staff.cuentaBancaria) : '⚠️ Sin Cuenta',
      tieneBanco ? 'Completo' : 'Incompleto',
      staff.telefonos || 'N/A',
      staff.correo || 'N/A',
      staff.correoInstitucional || 'N/A',
      staff.direccion || 'N/A',
      staff.titulosPregrado || 'N/A',
      staff.titulosPostgrado || 'N/A',
      staff.doctorado || 'N/A',
      staff.categoriaDocente || 'Instructor',
      staff.dedicacion || 'Tiempo Convencional',
      normalizeDepartmentName(staff.department) || 'N/A',
      staff.sedeCentro || 'Rubio',
      staff.especialidad || 'N/A',
      staff.periodoAcademico || 'N/A',
      statusDocente,
      matCount,
      totSem,
      totLap,
      matSummary || 'Sin asignaciones'
    ];
  });

  return {
    headerRows,
    dataRows,
    colsWidth: [
      { wch: 6 },  { wch: 14 }, { wch: 30 }, { wch: 15 }, { wch: 25 }, 
      { wch: 14 }, { wch: 24 }, { wch: 15 }, { wch: 16 }, { wch: 25 }, 
      { wch: 28 }, { wch: 30 }, { wch: 25 }, { wch: 22 }, { wch: 20 }, 
      { wch: 16 }, { wch: 20 }, { wch: 24 }, { wch: 16 }, { wch: 20 }, 
      { wch: 15 }, { wch: 14 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, 
      { wch: 45 }
    ],
    sheetName: `Fichas_${periodLabel.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
    fileName: `UPEL_Auditoria_Fichas_Docentes_Lapso_${periodLabel.replace(/[^a-zA-Z0-9_-]/g, '_')}.xlsx`,
    title: `Vista Previa de Exportación - Fichas Completas y Datos Bancarios (Lapso ${periodLabel})`
  };
}

/**
 * Genera el paquete de datos para la vista previa modal de Oferta Académica a Excel.
 */
export function buildOfertaExportData({
  ofertaConsolidada = [],
  academicPeriodsList = [],
  filterPeriodo = 'Todos',
  filterSede = 'Todos'
}) {
  const activeOrSelectedPeriod = academicPeriodsList.find(p => (filterPeriodo !== 'Todos' ? p.nombre === filterPeriodo : p.estado === 'ACTIVO')) || academicPeriodsList[0];
  const isPlanning = activeOrSelectedPeriod?.estado === 'PLANIFICACION';
  const periodLabel = activeOrSelectedPeriod?.nombre || (filterPeriodo !== 'Todos' ? filterPeriodo : '2026-I');

  if (ofertaConsolidada.length === 0) {
    alert(`No hay oferta académica con carga validada disponible para el período "${periodLabel}".\n\nEn el lapso activo solo se exportan docentes cuya carga académica ya ha sido formalmente verificada y validada por la Jefatura de Departamento.`);
    return null;
  }

  const lapsoVigenciaTexto = isPlanning
    ? `Período Académico en Planificación (${activeOrSelectedPeriod?.semanas || 15} semanas reglamentarias)`
    : (activeOrSelectedPeriod && activeOrSelectedPeriod.fechaDesde && activeOrSelectedPeriod.fechaHasta)
      ? `Lapso comprendido entre el ${formatFechaEspanol(activeOrSelectedPeriod.fechaDesde)} y el ${formatFechaEspanol(activeOrSelectedPeriod.fechaHasta)} (${activeOrSelectedPeriod.semanas || 15} semanas)`
      : `Régimen Lectivo: ${activeOrSelectedPeriod?.semanas || 15} semanas`;

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

  const dataRows = [];
  ofertaConsolidada.forEach(item => {
    const staff = item.staff || {};
    const profName = isPlanning
      ? "Pendiente por Asignar"
      : (`${staff.nombres || ''} ${staff.apellidos || ''}`.trim() || 'Docente UPEL');
    const docCedula = isPlanning ? "" : (staff.cedula || '');
    const rawCoh = (item.cohorte !== undefined && item.cohorte !== null && item.cohorte !== '') ? String(item.cohorte).trim() : '';
    const isPeriod = rawCoh === '2026-I' || rawCoh === '2026-II' || rawCoh === staff.periodoAcademico;
    const docPeriodo = (rawCoh && !isPeriod) ? rawCoh : '-';
    const docDpto = normalizeDepartmentName(staff.department) || '';
    const docSede = staff.sedeCentro || (filterSede !== 'Todos' ? filterSede : "Rubio");
    const docTipo = isPlanning ? "Por Definir" : (staff.categoriaDocente || "FIJO");

    dataRows.push([
      item.nombre || "",
      item.especialidadDestino || staff.especialidad || "",
      item.seccion || item.secciones || "",
      (item.cupos !== undefined && item.cupos !== null && item.cupos !== '') ? item.cupos : (item.cupo || ""),
      (item.inscritos !== undefined && item.inscritos !== null && item.inscritos !== '') ? item.inscritos : (item.inscrito || ""),
      profName,
      docCedula,
      docPeriodo,
      item.horasSemanal !== undefined && item.horasSemanal !== null ? item.horasSemanal : "",
      item.horasLapso !== undefined && item.horasLapso !== null ? item.horasLapso : "",
      docDpto,
      docSede,
      docTipo,
      isPlanning ? "Oferta preliminar en planificación curricular" : ""
    ]);
  });

  return {
    headerRows,
    dataRows,
    colsWidth: [
      { wch: 35 }, { wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, 
      { wch: 35 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, 
      { wch: 20 }, { wch: 15 }, { wch: 18 }, { wch: 25 }
    ],
    sheetName: `Oferta_${periodLabel.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
    fileName: `UPEL_Oferta_Academica_Lapso_${periodLabel.replace(/[^a-zA-Z0-9_-]/g, '_')}.xlsx`,
    title: `Vista Previa de la Oferta Académica - Lapso ${periodLabel}`
  };
}
