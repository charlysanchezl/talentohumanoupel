import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Users, AlertTriangle, CheckCircle, Clock, Download, Database, TrendingUp, MoreVertical, ChevronRight, ChevronDown, Image as ImageIcon, Eye, X, MapPin, FileText, FileSpreadsheet, Sparkles, CalendarOff } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getStaffData, getCurrentUser, getAuthHeaders, sedesInstitucionales, getInstitutionalHeaderSubtitle, getUsers, getCatalogoMaterias, getAcademicPeriodsList, splitDepartments, matchDepartment, API_URL } from '../data';
import { getDocenteContractStatus, getStatusBadgeInfo } from '../utils/contractStatus';

const Dashboard = () => {
  const [staffList, setStaffList] = useState([]);
  const [systemUsers, setSystemUsers] = useState([]);
  const [filterPeriodo, setFilterPeriodo] = useState('Todos');
  const [filterSede, setFilterSede] = useState('Todos');
  const [showActions, setShowActions] = useState(false);
  const [showExports, setShowExports] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [academicPeriodsList, setAcademicPeriodsList] = useState([]);
  
  const exportsMenuRef = useRef(null);
  const actionsMenuRef = useRef(null);

  const user = getCurrentUser();

  const academicPeriods = React.useMemo(() => {
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

  useEffect(() => {
    const fetchData = async () => {
      const [data, usersData, periodsData] = await Promise.all([
        getStaffData(filterPeriodo),
        getUsers(),
        getAcademicPeriodsList()
      ]);
      setStaffList(data || []);
      setSystemUsers(usersData || []);
      setAcademicPeriodsList(periodsData || []);
    };
    fetchData();
  }, [filterPeriodo]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (exportsMenuRef.current && !exportsMenuRef.current.contains(e.target)) {
        setShowExports(false);
      }
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(e.target)) {
        setShowActions(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const activePeriod = academicPeriodsList.find(p => p.estado === 'ACTIVO');

  const filteredStaffList = staffList.filter(s => {
    const matchPeriod = filterPeriodo === 'Todos' || s.periodoAcademico === filterPeriodo;
    const matchSede = filterSede === 'Todos' || (s.sedeCentro || 'Rubio') === filterSede;
    return matchPeriod && matchSede;
  });

  // Evaluación dinámica inteligente de estatus contractual por calendario y horas
  const staffWithContractStatus = React.useMemo(() => {
    return filteredStaffList.map(s => {
      const statusContrato = getDocenteContractStatus(s, academicPeriodsList);
      const fechaFin = s.fechaHasta || s.fechaFinContrato || academicPeriodsList.find(p => p.nombre === s.periodoAcademico)?.fechaHasta || '';
      return {
        ...s,
        statusContrato,
        fechaFinContrato: fechaFin
      };
    });
  }, [filteredStaffList, academicPeriodsList]);
  
  const totalStaff = staffWithContractStatus.length;
  const activeStaff = staffWithContractStatus.filter(s => s.statusContrato === 'Activo').length;
  const porRevisarStaff = staffWithContractStatus.filter(s => s.statusContrato === 'Por Revisar').length;
  const warningStaff = staffWithContractStatus.filter(s => s.statusContrato === 'Por Vencer').length;
  const expiredStaff = staffWithContractStatus.filter(s => s.statusContrato === 'Vencido').length;
  const inactiveStaff = staffWithContractStatus.filter(s => s.statusContrato === 'Inactivo').length;
  const planningStaff = staffWithContractStatus.filter(s => s.statusContrato === 'Planificación').length;

  // Docentes con oferta consolidada validada (status === 'Activo' || status === 'Validado')
  const staffConOfertaConsolidada = React.useMemo(() => {
    return filteredStaffList.filter(s => {
      const isDocenteLapsoActivo = activePeriod && (
        s.periodoAcademico === activePeriod.nombre || 
        (!s.periodoAcademico && (filterPeriodo === activePeriod.nombre || filterPeriodo === 'Todos'))
      );
      if (isDocenteLapsoActivo) {
        const isValidado = s.status === 'Validado' || s.status === 'Activo';
        const hasMaterias = Array.isArray(s.materias) && s.materias.length > 0;
        return isValidado && hasMaterias;
      }
      return Array.isArray(s.materias) && s.materias.length > 0;
    });
  }, [filteredStaffList, activePeriod, filterPeriodo]);

  // Datos para el gráfico de barras (Departamentos)
  const deptData = React.useMemo(() => {
    const counts = {};
    staffWithContractStatus.forEach(s => {
      const dept = s.department || 'Sin Departamento';
      counts[dept] = (counts[dept] || 0) + 1;
    });
    return Object.keys(counts)
      .map(key => ({ name: key, Docentes: counts[key] }))
      .sort((a,b) => b.Docentes - a.Docentes);
  }, [staffWithContractStatus]);

  // Datos para el gráfico circular (Estatus Contractual Dinámico)
  const statusData = React.useMemo(() => {
    return [
      { name: 'Activos Vigentes', value: activeStaff, color: '#008744' },
      { name: 'Por Revisar (Carga)', value: porRevisarStaff, color: '#ea580c' },
      { name: 'Por Vencer (≤30d)', value: warningStaff, color: '#d97706' },
      { name: 'Contratos Vencidos', value: expiredStaff, color: '#dc2626' },
      { name: 'Inactivos (Sin Carga)', value: inactiveStaff, color: '#64748b' },
      { name: 'En Planificación', value: planningStaff, color: '#0047bb' },
    ].filter(item => item.value > 0);
  }, [activeStaff, porRevisarStaff, warningStaff, expiredStaff, inactiveStaff, planningStaff]);

  // Datos por Sede / Extensión (Docentes y Carga de Horas Semanales sobre Oferta Consolidada / Histórica)
  const sedeData = React.useMemo(() => {
    const sedesMap = {};
    sedesInstitucionales.forEach(sede => {
      sedesMap[sede] = { Docentes: 0, Horas: 0, Materias: 0 };
    });

    staffConOfertaConsolidada.forEach(s => {
      const sede = s.sedeCentro || 'Rubio';
      if (!sedesMap[sede]) {
        sedesMap[sede] = { Docentes: 0, Horas: 0, Materias: 0 };
      }
      sedesMap[sede].Docentes += 1;

      const totalHoras = (s.materias || []).reduce((acc, m) => acc + (parseInt(m.horasSemanal) || 0), 0);
      sedesMap[sede].Horas += totalHoras;
      sedesMap[sede].Materias += (s.materias || []).length;
    });

    return Object.keys(sedesMap).map(sede => ({
      name: sede,
      Docentes: sedesMap[sede].Docentes,
      Horas: sedesMap[sede].Horas,
      Materias: sedesMap[sede].Materias
    })).sort((a, b) => b.Docentes - a.Docentes);
  }, [staffConOfertaConsolidada]);

  // Generador de Informe Ejecutivo Consolidado en PDF Oficial (Subdirección de Docencia)
  const handleDownloadExecutiveReport = async () => {
    try {
      setIsGeneratingPdf(true);
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
      ]);
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Cargar Logo UPEL en Base64
      let logoBase64 = null;
      try {
        const logoResp = await fetch('/upel.jpg');
        if (logoResp.ok) {
          const blob = await logoResp.blob();
          logoBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        }
      } catch (imgErr) {
        console.warn('Logo no disponible:', imgErr);
      }

      // Cálculos Analíticos Globales sobre la Oferta Consolidada Validada
      const totalDocentesValidados = staffConOfertaConsolidada.length;
      const totalHorasGlobal = staffConOfertaConsolidada.reduce((acc, s) => {
        return acc + (s.materias || []).reduce((mAcc, m) => mAcc + (parseInt(m.horasSemanal) || 0), 0);
      }, 0);

      const totalAsignaturasGlobal = staffConOfertaConsolidada.reduce((acc, s) => acc + (s.materias || []).length, 0);
      const promedioHorasDocente = totalDocentesValidados > 0 ? (totalHorasGlobal / totalDocentesValidados).toFixed(1) : '0';
      const tasaVencimiento = totalDocentesValidados > 0 ? ((warningStaff / totalDocentesValidados) * 100).toFixed(1) : '0';

      // 1. Franja decorativa superior Oficial UPEL (Azul #006699 y Verde #008744)
      doc.setFillColor(0, 102, 153); // Azul Institucional UPEL (#006699)
      doc.rect(0, 0, 210, 4.5, 'F');
      doc.setFillColor(0, 135, 68);  // Verde Institucional UPEL (#008744)
      doc.rect(0, 4.5, 210, 2, 'F');

      // Incrustar Logo UPEL
      if (logoBase64) {
        doc.addImage(logoBase64, 'JPEG', 14, 10, 20, 20);
      }

      // 2. Encabezado Institucional
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(0, 51, 77); // --primary-dark
      doc.text('REPÚBLICA BOLIVARIANA DE VENEZUELA', 38, 14.5);
      doc.text('UNIVERSIDAD PEDAGÓGICA EXPERIMENTAL LIBERTADOR', 38, 19);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const subtitle = getInstitutionalHeaderSubtitle(filterSede);
      doc.text(subtitle, 38, 23.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(0, 102, 153); // Azul UPEL
      doc.text('SUBDIRECCIÓN DE DOCENCIA', 38, 28);

      // Línea divisoria elegante
      doc.setDrawColor(0, 102, 153);
      doc.setLineWidth(0.5);
      doc.line(14, 32.5, 196, 32.5);

      // Título del Informe
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(0, 102, 153); // Azul Oficial UPEL
      doc.text('INFORME EJECUTIVO DE GESTIÓN Y DISTRIBUCIÓN ACADÉMICA', 14, 39);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      const fechaHoy = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      doc.text(`Período Académico: ${filterPeriodo}  |  Ámbito de Cobertura: ${filterSede === 'Todos' ? 'Consolidado General (Todas las Sedes)' : 'Extensión ' + filterSede}  |  Emisión: ${fechaHoy}`, 14, 43.5);

      // 3. Bloque de Diagnóstico y Síntesis Ejecutiva Automatizada con ajuste de texto (splitTextToSize)
      const selectedPeriodObj = academicPeriodsList.find(p => p.nombre === filterPeriodo);
      const isPeriodoCerrado = selectedPeriodObj?.estado === 'CERRADO' || (activePeriod && filterPeriodo !== 'Todos' && filterPeriodo !== activePeriod.nombre);

      const rubioData = sedeData.find(s => s.name === 'Rubio') || { Docentes: 0, Horas: 0 };
      const sabanaData = sedeData.find(s => s.name === 'Sabana de Mendoza') || { Docentes: 0, Horas: 0 };
      const encontradosData = sedeData.find(s => s.name === 'Encontrados') || { Docentes: 0, Horas: 0 };
      const foraneosDoc = sabanaData.Docentes + encontradosData.Docentes;
      const pctForaneo = totalDocentesValidados > 0 ? ((foraneosDoc / totalDocentesValidados) * 100).toFixed(1) : 0;

      const textoCompleto = isPeriodoCerrado
        ? `El lapso académico culminado ${filterPeriodo} registró una nómina académica consolidada de ${totalDocentesValidados} docentes con carga académica ejecutada y un volumen global de ${totalHorasGlobal} horas semanales en ${totalAsignaturasGlobal} asignaturas (promedio de ${promedioHorasDocente} hrs/docente). La distribución territorial reflejó: Sede Rubio (${rubioData.Docentes} doc. / ${rubioData.Horas} hrs), Extensión Sabana de Mendoza (${sabanaData.Docentes} doc. / ${sabanaData.Horas} hrs) y Extensión Encontrados (${encontradosData.Docentes} doc. / ${encontradosData.Horas} hrs). El período se encuentra formalmente cerrado, culminado y auditado.`
        : `La Subdirección de Docencia administra una plantilla de ${totalDocentesValidados} docentes con oferta consolidada validada y un volumen global de ${totalHorasGlobal} horas semanales en ${totalAsignaturasGlobal} asignaturas (promedio de ${promedioHorasDocente} hrs/docente). Las extensiones foráneas (Sabana de Mendoza: ${sabanaData.Docentes} doc. / ${sabanaData.Horas} hrs; Encontrados: ${encontradosData.Docentes} doc. / ${encontradosData.Horas} hrs) representan el ${pctForaneo}% del cuerpo académico. Se registran ${warningStaff} contratos con requerimiento de renovación (${tasaVencimiento}% de la nómina).`;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      // Ajustar líneas exactamente al ancho interno de la caja (174 mm)
      const lineasDiagnostico = doc.splitTextToSize(textoCompleto, 174);
      const boxHeight = Math.max(16, 7 + (lineasDiagnostico.length * 3.4));

      doc.setFillColor(230, 242, 248); // --primary-light (#e6f2f8)
      doc.setDrawColor(0, 102, 153);
      doc.roundedRect(14, 46.5, 182, boxHeight, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(0, 102, 153);
      doc.text('SÍNTESIS DIAGNÓSTICA Y CONCLUSIÓN DE LA GESTIÓN DOCENTE:', 18, 51.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(0, 51, 77);
      doc.text(lineasDiagnostico, 18, 56);

      // 4. Tarjetas de KPIs Estratégicos
      autoTable(doc, {
        startY: 46.5 + boxHeight + 3,
        head: [isPeriodoCerrado
          ? ['DOCENTES DEL LAPSO', 'ESTATUS PERÍODO', 'HORAS SEMANALES', 'PROMEDIO HORAS/DOC', 'ASIGNATURAS']
          : ['DOCENTES VALIDADOS', 'ACTIVOS VIGENTES', 'HORAS SEMANALES', 'PROMEDIO HORAS/DOC', 'EN RIESGO (VENCER)']
        ],
        body: [isPeriodoCerrado
          ? [
              `${totalDocentesValidados}`,
              'CULMINADO (CERRADO)',
              `${totalHorasGlobal} hrs`,
              `${promedioHorasDocente} hrs/doc`,
              `${totalAsignaturasGlobal}`
            ]
          : [
              `${totalDocentesValidados}`,
              `${activeStaff}`,
              `${totalHorasGlobal} hrs`,
              `${promedioHorasDocente} hrs/doc`,
              `${warningStaff} (${tasaVencimiento}%)`
            ]
        ],
        theme: 'plain',
        styles: {
          halign: 'center',
          fontSize: 8.5,
          fontStyle: 'bold',
          textColor: [0, 51, 77],
          fillColor: [230, 246, 238], // Verde institucional suave (--upel-green-light #e6f6ee)
          lineWidth: 0.2,
          lineColor: [0, 135, 68],
          cellPadding: 2.8
        },
        headStyles: {
          fillColor: [0, 102, 153], // Azul UPEL #006699
          textColor: [255, 255, 255],
          fontSize: 7.2,
          fontStyle: 'bold'
        }
      });

      // 5. Tabla 1: Consolidado y Semáforo Contractual por Sede
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(0, 51, 102);
      const table1Y = doc.lastAutoTable.finalY + 7;
      doc.text(isPeriodoCerrado ? '1. DISTRIBUCIÓN TERRITORIAL Y COBERTURA ACADÉMICA DEL LAPSO CULMINADO' : '1. DISTRIBUCIÓN TERRITORIAL Y SEMÁFORO CONTRACTUAL POR SEDE', 14, table1Y);

      const sedeTableRows = sedeData.map(s => {
        const pctDocentes = totalDocentesValidados > 0 ? ((s.Docentes / totalDocentesValidados) * 100).toFixed(1) + '%' : '0%';
        const pctHoras = totalHorasGlobal > 0 ? ((s.Horas / totalHorasGlobal) * 100).toFixed(1) + '%' : '0%';
        
        // Desglose de estatus para esta sede específica sobre oferta validada
        const teachersInSede = staffConOfertaConsolidada.filter(st => (st.sedeCentro || 'Rubio') === s.name);
        const activosInSede = isPeriodoCerrado
          ? teachersInSede.length
          : teachersInSede.filter(st => st.status === 'Activo' || st.status === 'Validado').length;
        const porVencerInSede = isPeriodoCerrado
          ? 0
          : teachersInSede.filter(st => st.statusContrato === 'Por Vencer').length;
        const inactivosInSede = isPeriodoCerrado
          ? 0
          : teachersInSede.filter(st => st.statusContrato === 'Inactivo').length;

        return [
          s.name,
          `${s.Docentes}`,
          pctDocentes,
          `${s.Horas} hrs`,
          pctHoras,
          `${activosInSede}`,
          `${porVencerInSede}`,
          `${inactivosInSede}`,
          `${s.Materias}`
        ];
      });

      // Fila total consolidada
      sedeTableRows.push([
        'TOTAL GENERAL',
        `${totalDocentesValidados}`,
        '100%',
        `${totalHorasGlobal} hrs`,
        '100%',
        `${isPeriodoCerrado ? totalDocentesValidados : activeStaff}`,
        `${isPeriodoCerrado ? 0 : warningStaff}`,
        `${isPeriodoCerrado ? 0 : inactiveStaff}`,
        `${totalAsignaturasGlobal}`
      ]);

      autoTable(doc, {
        startY: table1Y + 2.5,
        head: [isPeriodoCerrado
          ? [['SEDE / EXTENSIÓN', 'DOCENTES', '% DOC.', 'HORAS SEM.', '% HORAS', 'CULMINADOS', 'POR VENCER', 'INACTIVOS', 'ASIGNATURAS']]
          : [['SEDE / EXTENSIÓN', 'DOCENTES', '% DOC.', 'HORAS SEM.', '% HORAS', 'ACTIVOS', 'POR VENCER', 'INACTIVOS', 'ASIGNATURAS']]
        ],
        body: sedeTableRows,
        theme: 'grid',
        headStyles: {
          fillColor: [0, 102, 153], // Azul Institucional UPEL (#006699)
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 7.5,
          halign: 'center'
        },
        styles: {
          fontSize: 7.2,
          cellPadding: 2.2,
          textColor: [0, 51, 77]
        },
        columnStyles: {
          0: { fontStyle: 'bold', halign: 'left' },
          1: { halign: 'center' },
          2: { halign: 'center' },
          3: { halign: 'center', fontStyle: 'bold' },
          4: { halign: 'center' },
          5: { halign: 'center', textColor: [0, 135, 68], fontStyle: 'bold' }, // Verde UPEL (#008744)
          6: { halign: 'center', textColor: [217, 119, 6], fontStyle: 'bold' },  // Ámbar
          7: { halign: 'center', textColor: [220, 38, 38], fontStyle: 'bold' },  // Rojo
          8: { halign: 'center' }
        },
        didParseCell: (data) => {
          if (data.row.index === sedeTableRows.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [230, 242, 248]; // --primary-light (#e6f2f8)
            data.cell.styles.textColor = [0, 51, 77];
          }
        }
      });

      // 6. Tabla 2: Matriz Departamental por Sedes
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(0, 102, 153);
      const table2Y = doc.lastAutoTable.finalY + 7;
      doc.text('2. COBERTURA POR DEPARTAMENTO ACADÉMICO Y SEDES', 14, table2Y);

      const deptRows = deptData.map(d => {
        const dptoTeachers = staffConOfertaConsolidada.filter(s => matchDepartment(s.department, d.name));
        const rubioCount = dptoTeachers.filter(s => (s.sedeCentro || 'Rubio') === 'Rubio').length;
        const sabanaCount = dptoTeachers.filter(s => s.sedeCentro === 'Sabana de Mendoza').length;
        const encontradosCount = dptoTeachers.filter(s => s.sedeCentro === 'Encontrados').length;
        const horasDpto = dptoTeachers.reduce((acc, s) => acc + (s.materias || []).reduce((mAcc, m) => mAcc + (parseInt(m.horasSemanal) || 0), 0), 0);
        const asignaturasDpto = dptoTeachers.reduce((acc, s) => acc + (s.materias || []).length, 0);

        return [
          d.name,
          `${dptoTeachers.length}`,
          `${rubioCount}`,
          `${sabanaCount}`,
          `${encontradosCount}`,
          `${asignaturasDpto}`,
          `${horasDpto} hrs`
        ];
      });

      autoTable(doc, {
        startY: table2Y + 2.5,
        head: [['DEPARTAMENTO', 'TOTAL', 'RUBIO', 'SABANA MDOZA.', 'ENCONTRADOS', 'ASIGNATURAS', 'TOTAL HORAS']],
        body: deptRows,
        theme: 'grid',
        headStyles: {
          fillColor: [0, 77, 115], // Azul UPEL Dark (#004d73)
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 7.5,
          halign: 'center'
        },
        styles: {
          fontSize: 7.2,
          cellPadding: 2,
          textColor: [0, 51, 77]
        },
        columnStyles: {
          0: { halign: 'left', fontStyle: 'bold' },
          1: { halign: 'center', fontStyle: 'bold' },
          2: { halign: 'center' },
          3: { halign: 'center' },
          4: { halign: 'center' },
          5: { halign: 'center' },
          6: { halign: 'center', fontStyle: 'bold' }
        }
      });

      // 7. Tabla 3: Ranking de Asignaturas con Mayor Carga Horaria y Demanda
      const materiasCountMap = {};
      staffConOfertaConsolidada.forEach(s => {
        (s.materias || []).forEach(m => {
          const key = m.nombre ? m.nombre.trim().toUpperCase() : 'SIN ASIGNAR';
          if (!materiasCountMap[key]) {
            materiasCountMap[key] = {
              nombre: key,
              especialidad: m.especialidadDestino || 'Tronco Común',
              secciones: 0,
              horas: 0,
              docentes: new Set(),
              sedes: new Set()
            };
          }
          materiasCountMap[key].secciones += 1;
          materiasCountMap[key].horas += parseInt(m.horasSemanal) || 0;
          materiasCountMap[key].docentes.add(`${s.nombres} ${s.apellidos}`);
          materiasCountMap[key].sedes.add(s.sedeCentro || 'Rubio');
        });
      });

      const topMaterias = Object.values(materiasCountMap)
        .sort((a, b) => b.horas - a.horas)
        .slice(0, 6);

      let table3Y = doc.lastAutoTable.finalY + 7;
      if (table3Y > 230) {
        doc.addPage();
        table3Y = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(0, 102, 153);
      doc.text('3. PRINCIPALES ASIGNATURAS POR VOLUMEN HORARIO Y ATENCIÓN TERRITORIAL', 14, table3Y);

      const topMateriasRows = topMaterias.map(m => [
        m.nombre,
        m.especialidad,
        `${m.secciones}`,
        `${m.docentes.size}`,
        Array.from(m.sedes).join(', '),
        `${m.horas} hrs/sem`
      ]);

      autoTable(doc, {
        startY: table3Y + 2.5,
        head: [['ASIGNATURA CON MAYOR CARGA', 'ESPECIALIDAD ATENDIDA', 'SECCIONES', 'DOCENTES', 'SEDES PRESENTES', 'CARGA SEMANAL']],
        body: topMateriasRows,
        theme: 'grid',
        headStyles: {
          fillColor: [0, 135, 68], // Verde Institucional UPEL (#008744)
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 7.2,
          halign: 'center'
        },
        styles: {
          fontSize: 7,
          cellPadding: 2,
          textColor: [0, 51, 77]
        },
        columnStyles: {
          0: { halign: 'left', fontStyle: 'bold' },
          1: { halign: 'left' },
          2: { halign: 'center' },
          3: { halign: 'center' },
          4: { halign: 'center' },
          5: { halign: 'center', fontStyle: 'bold' }
        }
      });

      // 8. Firma Institucional Única (Subdirección de Docencia)
      let finalY = doc.lastAutoTable.finalY + 18;
      if (finalY > 260) {
        doc.addPage();
        finalY = 30;
      }

      const subdirectoraUser = systemUsers.find(u => 
        (u.username && u.username.toLowerCase().includes('docencia')) ||
        (u.name && u.name.toLowerCase().includes('narvaez')) ||
        u.role === 'DOCENCIA'
      );
      const subdirectoraNombre = subdirectoraUser?.name || 'Dra. Carmen Narvaez';

      doc.setDrawColor(0, 102, 153);
      doc.setLineWidth(0.5);

      const centerX = 105; // Centro exacto horizontal
      doc.line(centerX - 42, finalY, centerX + 42, finalY);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(0, 51, 77); // --primary-dark
      doc.text(subdirectoraNombre.toUpperCase(), centerX, finalY + 4.5, { align: 'center' });
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(0, 102, 153); // Azul UPEL #006699
      doc.text('Subdirectora de Docencia', centerX, finalY + 8.5, { align: 'center' });
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('UPEL - Instituto Pedagógico Rural Gervasio Rubio', centerX, finalY + 12.5, { align: 'center' });

      // 9. Numeración formal de páginas y pie de seguridad institucional
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);

        // Pie de página oficial
        doc.setDrawColor(0, 102, 153);
        doc.setLineWidth(0.3);
        doc.line(14, 285, 196, 285);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(0, 102, 153);
        doc.text('UPEL I.P.R. Gervasio Rubio — Sistema de Gestión y Organización Académica (SIGOA)', 14, 289);
        doc.setTextColor(100, 116, 139);
        doc.text(`Página ${i} de ${totalPages}  |  Doc. Oficial`, 196, 289, { align: 'right' });
      }

      const safePeriodo = filterPeriodo.replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeSede = filterSede.replace(/[^a-zA-Z0-9_-]/g, '_');
      doc.save(`UPEL_Informe_Ejecutivo_Subdireccion_Docencia_${safePeriodo}_${safeSede}.pdf`);
    } catch (err) {
      console.error('Error generando informe ejecutivo PDF:', err);
      alert('Error al generar el informe en PDF: ' + err.message);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExportingExcel(true);
      const catalogo = await getCatalogoMaterias();
      const { exportInstitutionalExcel } = await import('../services/excelExporter');
      await exportInstitutionalExcel({ 
        staffList: staffConOfertaConsolidada, 
        materiasCatalogo: catalogo, 
        user,
        periodName: filterPeriodo
      });
    } catch (err) {
      console.error('Error exportando Excel institucional:', err);
      alert('Error al generar el libro Excel: ' + err.message);
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleMigrate = async () => {
    if (!window.confirm('¿Está seguro de migrar los datos locales a MySQL?')) return;
    
    try {
      const localData = JSON.parse(localStorage.getItem('upel_staff_v5') || '[]');
      if (localData.length === 0) {
        alert('No hay datos locales para migrar.');
        return;
      }
      
      const response = await fetch(`${API_URL}/migrate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ docentes: localData })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`¡Migración exitosa! Se han migrado ${data.count} docentes a la base de datos.`);
      } else {
        alert('Error en la migración: ' + data.error);
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el servidor Node.js.');
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header del Dashboard con Contenedor Institucional UPEL Compacto */}
      <div className="upel-card upel-card-accent-blue" style={{
        padding: '0.65rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        position: 'relative',
        zIndex: 100,
        overflow: 'visible'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
            <TrendingUp size={19} />
          </div>
          <div>
            <h1 style={{ margin: 0, color: '#0047bb', fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.2 }}>Panel de Control</h1>
            <p style={{ margin: '1px 0 0', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500 }}>
              Análisis general del personal académico y carga docente
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select 
            className="filter-select" 
            value={filterPeriodo} 
            onChange={(e) => setFilterPeriodo(e.target.value)}
            style={{ minWidth: '150px', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
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
            value={filterSede} 
            onChange={(e) => setFilterSede(e.target.value)}
            style={{ minWidth: '150px', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
          >
            <option value="Todos">Todas las Sedes</option>
            {sedesInstitucionales.map(sede => (
              <option key={sede} value={sede}>Sede: {sede}</option>
            ))}
          </select>

          {/* Menú Desplegable Unificado de Exportaciones */}
          <div ref={exportsMenuRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowExports(prev => !prev);
              }}
              disabled={isGeneratingPdf || isExportingExcel}
              className="btn btn-primary"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.45rem', 
                padding: '0.45rem 0.95rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                background: '#0047bb',
                borderColor: '#0047bb',
                boxShadow: '0 2px 8px rgba(0, 71, 187, 0.2)'
              }}
              title="Descargar informes ejecutivos y libros de datos en PDF o Excel"
            >
              <Download size={15} />
              <span>{isGeneratingPdf ? 'Generando PDF...' : isExportingExcel ? 'Generando Excel...' : 'Exportar Informes'}</span>
              <ChevronDown size={14} style={{ transform: showExports ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {showExports && (
              <div 
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  width: '270px',
                  background: '#ffffff',
                  borderRadius: '12px',
                  padding: '0.5rem',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.22), 0 2px 10px rgba(0,0,0,0.1)',
                  border: '1px solid #cbd5e1',
                  zIndex: 99999,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  animation: 'fadeInDropdown 0.15s ease-out'
                }}
              >
                <button
                  type="button"
                  onClick={() => { setShowExports(false); handleDownloadExecutiveReport(); }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#0047bb',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'background 0.15s'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#eff6ff'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <FileText size={16} color="#0047bb" />
                  <div>
                    <div style={{ fontWeight: 700 }}>Informe Ejecutivo PDF</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Reporte formal Subdirección</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => { setShowExports(false); handleExportExcel(); }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#008744',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'background 0.15s'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#f0fdf4'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <FileSpreadsheet size={16} color="#008744" />
                  <div>
                    <div style={{ fontWeight: 700 }}>Matriz Distributiva Excel</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Libro Excel multipestaña (.xlsx)</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    setShowExports(false);
                    try {
                      setIsExportingExcel(true);
                      const { exportAuditorFichasCompletasExcel } = await import('../services/excelExporter');
                      await exportAuditorFichasCompletasExcel({ 
                        staffList: staffConOfertaConsolidada, 
                        user, 
                        periodName: filterPeriodo, 
                        departmentName: 'Todos', 
                        sedeName: filterSede 
                      });
                    } catch (err) {
                      console.error(err);
                      alert('Error al exportar fichas de auditoría: ' + err.message);
                    } finally {
                      setIsExportingExcel(false);
                    }
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#006633',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'background 0.15s'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#f0fdf4'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Download size={16} color="#006633" />
                  <div>
                    <div style={{ fontWeight: 700 }}>Fichas y Nómina Excel</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Datos bancarios y nómina completa</div>
                  </div>
                </button>
              </div>
            )}
          </div>



          {user?.role === 'ADMIN' && (
            <div ref={actionsMenuRef} style={{ position: 'relative' }}>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActions(prev => !prev);
                }}
                className="btn btn-outline" 
                style={{ padding: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Acciones de Base de Datos"
              >
                <MoreVertical size={20} />
              </button>

              {showActions && (
                <div style={{ 
                  position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                  background: 'white', borderRadius: '12px', boxShadow: '0 12px 30px rgba(0,0,0,0.22), 0 2px 10px rgba(0,0,0,0.1)',
                  border: '1px solid #cbd5e1', width: '220px', zIndex: 99999, overflow: 'hidden',
                  animation: 'fadeInDropdown 0.15s ease-out'
                }}>
                  <Link to="/respaldos" onClick={() => setShowActions(false)} style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', width: '100%', 
                    border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left',
                    color: 'var(--primary)', borderBottom: '1px solid var(--border-light)', textDecoration: 'none'
                  }}>
                    <Database size={16} /> <span style={{ fontWeight: 600 }}>Bóveda de Respaldos</span>
                  </Link>
                  <button onClick={() => { setShowActions(false); handleMigrate(); }} style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', width: '100%', 
                    border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left',
                    color: 'var(--warning-dark)'
                  }}>
                    <Database size={16} /> <span style={{ fontWeight: 500 }}>Migrar a MySQL</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>




      {/* Tarjetas de Estadísticas estilo UPEL Institucional con Estatus Dinámico */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
        gap: '0.75rem' 
      }}>
        {/* Total Registrados */}
        <div className="upel-stat-card upel-card-accent-blue" style={{ padding: '0.55rem 0.95rem' }}>
          <div>
            <div className="upel-stat-label" style={{ fontSize: '0.72rem' }}>Total en Nómina</div>
            <div className="upel-stat-value" style={{ color: '#0047bb', fontSize: '1.45rem' }}>{totalStaff}</div>
          </div>
          <div className="upel-stat-icon-wrapper" style={{ width: '38px', height: '38px', background: '#eff6ff', color: '#0047bb' }}>
            <Users size={19} />
          </div>
        </div>

        {/* Activos Vigentes */}
        <div className="upel-stat-card upel-card-accent-green" style={{ padding: '0.55rem 0.95rem' }}>
          <div>
            <div className="upel-stat-label" style={{ fontSize: '0.72rem' }}>Activos Vigentes</div>
            <div className="upel-stat-value" style={{ color: '#008744', fontSize: '1.45rem' }}>{activeStaff}</div>
          </div>
          <div className="upel-stat-icon-wrapper" style={{ width: '38px', height: '38px', background: '#e6f6ee', color: '#008744' }}>
            <CheckCircle size={19} />
          </div>
        </div>

        {/* Por Revisar */}
        <div className="upel-stat-card" style={{ padding: '0.55rem 0.95rem', borderLeft: '4px solid #ea580c' }}>
          <div>
            <div className="upel-stat-label" style={{ fontSize: '0.72rem' }}>Por Revisar (Carga)</div>
            <div className="upel-stat-value" style={{ color: '#ea580c', fontSize: '1.45rem' }}>{porRevisarStaff}</div>
          </div>
          <div className="upel-stat-icon-wrapper" style={{ width: '38px', height: '38px', background: '#fff7ed', color: '#ea580c' }}>
            <Clock size={19} />
          </div>
        </div>

        {/* Por Vencer */}
        <div className="upel-stat-card upel-card-accent-amber" style={{ padding: '0.55rem 0.95rem' }}>
          <div>
            <div className="upel-stat-label" style={{ fontSize: '0.72rem' }}>Por Vencer (≤30d)</div>
            <div className="upel-stat-value" style={{ color: '#d97706', fontSize: '1.45rem' }}>{warningStaff}</div>
          </div>
          <div className="upel-stat-icon-wrapper" style={{ width: '38px', height: '38px', background: '#fef3c7', color: '#d97706' }}>
            <AlertTriangle size={19} />
          </div>
        </div>

        {/* Contratos Vencidos */}
        <div className="upel-stat-card upel-card-accent-rose" style={{ padding: '0.55rem 0.95rem' }}>
          <div>
            <div className="upel-stat-label" style={{ fontSize: '0.72rem' }}>Contratos Vencidos</div>
            <div className="upel-stat-value" style={{ color: '#b91c1c', fontSize: '1.45rem' }}>{expiredStaff}</div>
          </div>
          <div className="upel-stat-icon-wrapper" style={{ width: '38px', height: '38px', background: '#fee2e2', color: '#b91c1c' }}>
            <CalendarOff size={19} />
          </div>
        </div>

        {/* Inactivos (Sin Carga / No Contratados) */}
        <div className="upel-stat-card" style={{ padding: '0.55rem 0.95rem', borderLeft: '4px solid #64748b' }}>
          <div>
            <div className="upel-stat-label" style={{ fontSize: '0.72rem' }}>Inactivos (Sin Carga)</div>
            <div className="upel-stat-value" style={{ color: '#64748b', fontSize: '1.45rem' }}>{inactiveStaff}</div>
          </div>
          <div className="upel-stat-icon-wrapper" style={{ width: '38px', height: '38px', background: '#f1f5f9', color: '#64748b' }}>
            <Clock size={19} />
          </div>
        </div>
      </div>

      {/* Gráficos en Contenedores Institucionales Optimizados */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1rem' }}>
        
        {/* Gráfico de Barras - Departamentos */}
        <div className="upel-card upel-card-accent-blue" style={{ padding: '1rem 1.25rem' }}>
          <div className="upel-section-subtitle" style={{ fontSize: '0.72rem' }}>
            <span>📊</span> Carga Académica
          </div>
          <h3 className="upel-section-title" style={{ fontSize: '0.95rem' }}>Distribución por Departamento</h3>
          <div className="upel-section-divider" style={{ margin: '0.35rem 0 0.75rem' }} />
          
          {deptData.length > 0 ? (
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={deptData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,71,187,0.05)' }} 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,71,187,0.08)' }}
                  />
                  <Bar dataKey="Docentes" fill="#0047bb" radius={[5, 5, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              No hay datos para mostrar
            </div>
          )}
        </div>

        {/* Gráfico Circular - Estatus */}
        <div className="upel-card upel-card-accent-green" style={{ padding: '1rem 1.25rem' }}>
          <div className="upel-section-subtitle" style={{ fontSize: '0.72rem' }}>
            <CheckCircle size={12} /> Estatus de Contratación
          </div>
          <h3 className="upel-section-title" style={{ fontSize: '0.95rem' }}>Estado Contractual</h3>
          <div className="upel-section-divider" style={{ margin: '0.35rem 0 0.75rem' }} />

          {statusData.length > 0 ? (
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    labelLine={false}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,71,187,0.08)' }}
                    itemStyle={{ color: 'var(--text-main)', fontWeight: 600 }}
                  />
                  <Legend verticalAlign="bottom" height={32} iconType="circle" wrapperStyle={{ fontSize: '0.78rem' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              No hay datos para mostrar
            </div>
          )}
        </div>

        {/* Gráfico de Barras Doble - Sedes y Extensiones (Docentes vs Horas Semanales) */}
        <div className="upel-card upel-card-accent-tri" style={{ padding: '1rem 1.25rem', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.6rem' }}>
            <div>
              <div className="upel-section-subtitle" style={{ fontSize: '0.72rem' }}>
                <MapPin size={12} /> Cobertura Territorial IPRGR
              </div>
              <h3 className="upel-section-title" style={{ fontSize: '0.95rem' }}>
                Distribución por Sede y Extensión
              </h3>
              <p style={{ margin: '0.1rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Comparativa de cantidad de docentes y total de horas semanales asignadas por sede
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {sedeData.map((s) => (
                <div 
                  key={s.name}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#0047bb' }}>{s.name}:</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <strong style={{ color: '#0047bb' }}>{s.Docentes}</strong> doc. | <strong style={{ color: '#008744' }}>{s.Horas}</strong> hrs/sem
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="upel-section-divider" style={{ margin: '0 0 0.75rem 0' }} />

          {sedeData.some(s => s.Docentes > 0) ? (
            <div style={{ width: '100%', height: 230 }}>
              <ResponsiveContainer>
                <BarChart data={sedeData} margin={{ top: 10, right: 25, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                  <YAxis yAxisId="left" orientation="left" stroke="#0047bb" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#008744" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,71,187,0.04)' }} 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,71,187,0.08)' }}
                  />
                  <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: '0.78rem' }} />
                  <Bar yAxisId="left" dataKey="Docentes" name="Cantidad de Docentes" fill="#0047bb" radius={[5, 5, 0, 0]} barSize={32} />
                  <Bar yAxisId="right" dataKey="Horas" name="Total Horas Semanales" fill="#008744" radius={[5, 5, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              No hay docentes registrados en la sede seleccionada.
            </div>
          )}
        </div>
      </div>

      {/* Tabla de Alertas de Talento Humano: Contratos Vencidos y Próximos a Vencer */}
      {(() => {
        const alertList = staffWithContractStatus.filter(s => s.statusContrato === 'Por Vencer' || s.statusContrato === 'Vencido');
        return (
          <div className="upel-card upel-card-accent-amber" style={{ padding: '1rem 1.25rem' }}>
            <div className="upel-section-subtitle" style={{ color: '#d97706', fontSize: '0.72rem' }}>
              <AlertTriangle size={12} /> Alertas de Talento Humano y Contrataciones
            </div>
            <h3 className="upel-section-title" style={{ fontSize: '0.95rem' }}>Contratos Vencidos y Próximos a Vencer</h3>
            <div className="upel-section-divider" style={{ margin: '0.35rem 0 0.75rem' }} />
            
            {alertList.length > 0 ? (
              <div className="table-container" style={{ margin: 0, maxHeight: '250px', overflowY: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Docente</th>
                      <th>Departamento</th>
                      <th>Estado Contractual</th>
                      <th>Fecha Fin Contrato</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alertList
                      .slice(0, 10)
                      .map((staff, idx) => {
                        const badgeInfo = getStatusBadgeInfo(staff.statusContrato);
                        return (
                          <tr key={idx}>
                            <td>
                              <div className="user-cell">
                                <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}>
                                  {(staff.nombres || 'D').charAt(0)}{(staff.apellidos || 'U').charAt(0)}
                                </div>
                                <div className="user-cell-info">
                                  <span className="user-name">{staff.nombres} {staff.apellidos}</span>
                                  <span className="user-email" style={{ fontSize: '0.75rem' }}>CI: {staff.cedula}</span>
                                </div>
                              </div>
                            </td>
                            <td><span style={{ fontSize: '0.85rem' }}>{staff.department}</span></td>
                            <td>
                              <span style={{ 
                                background: badgeInfo.bg, 
                                color: badgeInfo.color, 
                                border: `1px solid ${badgeInfo.border}`,
                                padding: '0.25rem 0.75rem', 
                                borderRadius: '99px', 
                                fontSize: '0.8rem', 
                                fontWeight: 700 
                              }}>
                                {badgeInfo.label}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                                {staff.fechaFinContrato || 'Fin de Lapso'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
                {alertList.length > 10 && (
                  <div style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                    Mostrando los primeros 10 de {alertList.length} contratos con alertas. Puede ver el detalle completo en la pestaña <strong>Consultar</strong>.
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <CheckCircle size={32} style={{ color: '#008744', margin: '0 auto 0.5rem' }} />
                No hay contratos vencidos ni por vencer en el período seleccionado.
              </div>
            )}
          </div>
        );
      })()}

    </div>
  );
};

export default Dashboard;
