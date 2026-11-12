import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Calculator, GraduationCap, Globe, TreePine, BookOpen } from 'lucide-react';
import { 
  getStaffData, 
  getCurrentUser, 
  createStaff, 
  deleteStaff, 
  updateStaffCarga, 
  getCatalogoMaterias, 
  addMateriaCatalogo, 
  matchDepartment, 
  normalizeDepartmentName, 
  getInstitutionalHeaderSubtitle, 
  getAcademicPeriodsList, 
  isExpedienteCompleto, 
  getMissingExpedienteFields 
} from '../data';
import { matchesSearch } from '../utils/searchHelper';
import { resolveSyncedEspecialidad } from '../hooks/useStaffValidation';
import { getDocenteContractStatus, getStatusBadgeInfo } from '../utils/contractStatus';
import { formatFechaEspanol } from '../utils/staffExcelExportHelper';

// Subcomponentes modulares de Staff
import StaffHeader from './staff/StaffHeader';
import StaffToolbar from './staff/StaffToolbar';
import StaffTable from './staff/StaffTable';
import StaffOfertaTable from './staff/StaffOfertaTable';
import { LISTA_BANCOS, CATEGORIAS_DOCENTE, DEDICACIONES_DOCENTE } from './staff/StaffEditModal';
import StaffActionMenuPortal from './staff/StaffActionMenuPortal';

// Modales con carga bajo demanda (Code Splitting y Lazy Loading)
const StaffEditModal = lazy(() => import('./staff/StaffEditModal'));
const StaffDetailModal = lazy(() => import('./staff/StaffDetailModal'));
const StaffCreateModal = lazy(() => import('./staff/StaffCreateModal'));
const StaffValidateModal = lazy(() => import('./staff/StaffValidateModal'));
const PrintableFicha = lazy(() => import('./PrintableFicha'));
const ExcelPreviewModal = lazy(() => import('./ExcelPreviewModal'));
const NotificationModal = lazy(() => import('./NotificationModal'));
const SendFichaEmailModal = lazy(() => import('./SendFichaEmailModal'));
const ReplicatePeriodModal = lazy(() => import('./ReplicatePeriodModal'));
const TeacherHistoryModal = lazy(() => import('./TeacherHistoryModal'));
const PeriodManagementModal = lazy(() => import('./PeriodManagementModal'));

// Re-export constants for backward compatibility
export { LISTA_BANCOS, CATEGORIAS_DOCENTE, DEDICACIONES_DOCENTE };

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const getDeptTheme = (dept) => {
  const d = (dept || '').toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (d.includes('MATEMATICA')) return { color: '#3b82f6', bg: '#eff6ff', icon: <Calculator size={32} /> };
  if (d.includes('PEDAGOGIA')) return { color: '#10b981', bg: '#ecfdf5', icon: <GraduationCap size={32} /> };
  if (d.includes('SOCIALES')) return { color: '#f59e0b', bg: '#fffbeb', icon: <Globe size={32} /> };
  if (d.includes('AGRO')) return { color: '#84cc16', bg: '#f7fee7', icon: <TreePine size={32} /> };
  return { color: 'var(--primary)', bg: 'var(--primary-light)', icon: <BookOpen size={32} /> };
};

const StaffList = () => {
  const { deptName } = useParams();
  const currentDept = decodeURIComponent(deptName);
  
  const user = getCurrentUser();
  const [staffList, setStaffList] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [filterPeriodo, setFilterPeriodo] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterSede, setFilterSede] = useState('Todos');
  const [activeActionMenu, setActiveActionMenu] = useState(null);
  
  const [isAddDocenteModalOpen, setIsAddDocenteModalOpen] = useState(false);
  const [newDocente, setNewDocente] = useState({ cedula: '', nombres: '', apellidos: '', sedeCentro: '', periodoAcademico: '', department: currentDept });
  const [staffToView, setStaffToView] = useState(null); 
  const [staffToEdit, setStaffToEdit] = useState(null);
  const [staffToValidate, setStaffToValidate] = useState(null);
  const [staffToPrint, setStaffToPrint] = useState(null); 
  const [staffToNotify, setStaffToNotify] = useState(null); 
  const [staffToSendFicha, setStaffToSendFicha] = useState(null);
  const [isReplicateModalOpen, setIsReplicateModalOpen] = useState(false);
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [initialPeriodIdToEdit, setInitialPeriodIdToEdit] = useState(null);
  const [academicPeriodsList, setAcademicPeriodsList] = useState([]);
  const [staffHistoryToView, setStaffHistoryToView] = useState(null);
  const [activeTab, setActiveTab] = useState('docentes');
  
  // Paginación
  const [currentPageDocentes, setCurrentPageDocentes] = useState(1);
  const [currentPageOferta, setCurrentPageOferta] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const [materiasForm, setMateriasForm] = useState([{ nombre: '', especialidadDestino: '', horasSemanal: 0, horasLapso: 0 }]);
  const [validationForm, setValidationForm] = useState({
    periodoAcademico: `${new Date().getFullYear()}-I`,
    semanas: 15,
    fechaDesde: '',
    fechaHasta: ''
  });
  const [cursosList, setCursosList] = useState([]);

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

  const fetchData = async (period = filterPeriodo) => {
    const staff = await getStaffData(period);
    setStaffList(staff || []);
    const catalogo = await getCatalogoMaterias();
    setCursosList(catalogo || []);
    try {
      const pList = await getAcademicPeriodsList();
      setAcademicPeriodsList(pList || []);
    } catch (e) {}
  };

  useEffect(() => {
    fetchData(filterPeriodo);
  }, [currentDept, filterPeriodo]);

  useEffect(() => {
    setCurrentPageDocentes(1);
    setCurrentPageOferta(1);
  }, [debouncedSearchTerm, filterPeriodo, filterStatus, filterSede]);

  useEffect(() => {
    if (!activeActionMenu) return;
    const handleOutsideClick = (e) => {
      if (e.target.closest('.row-actions-portal-menu') || e.target.closest('.row-actions-trigger-btn')) {
        return;
      }
      setActiveActionMenu(null);
    };
    const handleScrollOrResize = () => {
      setActiveActionMenu(null);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [activeActionMenu]);

  const theme = getDeptTheme(currentDept);

  const handleAddDocenteSubmit = (e) => {
    e.preventDefault();
    if (!newDocente.cedula || !newDocente.nombres || !newDocente.apellidos) return;
    
    // Verificación de cédula duplicada
    const cleanNewCedula = newDocente.cedula.replace(/\D/g, '');
    if (cleanNewCedula) {
      const existingDocente = staffList.find(s => {
        const cleanExisting = s.cedula ? s.cedula.replace(/\D/g, '') : '';
        return cleanExisting === cleanNewCedula;
      });

      if (existingDocente) {
        if (matchDepartment(existingDocente.department, currentDept)) {
          alert(`El docente ${existingDocente.nombres} ${existingDocente.apellidos} (C.I: ${newDocente.cedula}) ya está registrado en este departamento (${currentDept}).`);
          return;
        }

        const wantsToInclude = window.confirm(
          `El docente ${existingDocente.nombres} ${existingDocente.apellidos} (C.I: ${newDocente.cedula}) ya se encuentra registrado en el departamento de "${existingDocente.department}".\n\n¿Desea asociarlo también al departamento de "${currentDept}" para que pertenezca a ambos departamentos simultáneamente?`
        );

        if (wantsToInclude) {
          const updatedDepts = normalizeDepartmentName(`${existingDocente.department}, ${currentDept}`);
          const updatedStaff = {
            ...existingDocente,
            department: updatedDepts
          };
          createStaff(updatedStaff)
            .then(() => {
              fetchData();
              alert(`¡Docente ${existingDocente.nombres} ${existingDocente.apellidos} ahora pertenece a: ${updatedDepts}!`);
            })
            .catch(err => {
              fetchData();
              alert(err?.message || 'Error al asociar el docente en el servidor.');
            });
          setNewDocente({ cedula: '', nombres: '', apellidos: '', sedeCentro: 'Rubio', periodoAcademico: '', department: currentDept });
          setIsAddDocenteModalOpen(false);
          return;
        } else {
          return;
        }
      }
    }
    
    const newStaff = {
      id: Date.now().toString(),
      cedula: newDocente.cedula,
      nombres: newDocente.nombres.toUpperCase(),
      apellidos: newDocente.apellidos.toUpperCase(),
      department: normalizeDepartmentName(newDocente.department || currentDept),
      sedeCentro: newDocente.sedeCentro || 'Rubio',
      fechaNac: newDocente.fechaNac || '', rif: newDocente.rif || '', direccion: newDocente.direccion || '', telefonos: newDocente.telefonos || '', cuentaBancaria: newDocente.cuentaBancaria || '',
      banco: newDocente.banco || '', tipoCuenta: newDocente.tipoCuenta || 'Ahorro', titulosPregrado: newDocente.titulosPregrado || '', titulosPostgrado: newDocente.titulosPostgrado || '',
      categoriaDocente: newDocente.categoriaDocente || 'Instructor', dedicacion: newDocente.dedicacion || 'Tiempo Convencional',
      periodoAcademico: newDocente.periodoAcademico || (academicPeriodsList.find(p => p.estado === 'ACTIVO')?.nombre || `${new Date().getFullYear()}-I`),
      semanas: 15, fechaDesde: '', fechaHasta: '',
      materias: []
    };

    const updatedList = [newStaff, ...staffList];
    setStaffList(updatedList);
    createStaff(newStaff)
      .then(() => fetchData())
      .catch(err => {
        fetchData();
        alert(err?.message || 'Error al registrar el docente en el servidor.');
      });
    
    setNewDocente({ cedula: '', nombres: '', apellidos: '', sedeCentro: 'Rubio', periodoAcademico: '', department: currentDept });
    setIsAddDocenteModalOpen(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === 'cuentaBancaria') {
      const clean = value.replace(/\D/g, '').slice(0, 20);
      setStaffToEdit({ ...staffToEdit, cuentaBancaria: clean });
      return;
    }
    setStaffToEdit({ ...staffToEdit, [name]: value });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!staffToEdit) return;
    try {
      await createStaff(staffToEdit);
      await fetchData();
      if (staffToView && staffToView.cedula === staffToEdit.cedula) {
        setStaffToView({ ...staffToView, ...staffToEdit });
      }
      setStaffToEdit(null);
    } catch (err) {
      alert(err?.message || 'Error al guardar los datos del docente en el servidor.');
    }
  };

  const handleDelete = async (staff) => {
    if (!staff || !staff.cedula) return;
    const nombre = staff.nombres ? `${staff.nombres} ${staff.apellidos}` : (staff.apellidos || staff.cedula);
    const confirmed = window.confirm(
      `¿Está seguro de que desea eliminar al docente ${nombre} (C.I: ${staff.cedula}) del departamento ${currentDept}?\n\nEsta acción eliminará su registro de la base de datos.`
    );
    if (!confirmed) return;

    try {
      const ok = await deleteStaff(staff.cedula);
      if (ok) {
        await fetchData();
        if (staffToView && staffToView.cedula === staff.cedula) setStaffToView(null);
        if (staffToEdit && staffToEdit.cedula === staff.cedula) setStaffToEdit(null);
        alert(`El docente ${nombre} ha sido eliminado exitosamente.`);
      } else {
        alert('No se pudo eliminar el docente. Verifique permisos o conexión.');
      }
    } catch (err) {
      console.error('Error al eliminar docente:', err);
      alert('Ocurrió un error al intentar eliminar al docente.');
    }
  };

  const handleOpenAuditorPreview = () => {
    try {
      const activeOrSelectedPeriod = academicPeriodsList.find(p => (filterPeriodo !== 'Todos' ? p.nombre === filterPeriodo : p.estado === 'ACTIVO')) || academicPeriodsList[0];
      const activePeriod = academicPeriodsList.find(p => p.estado === 'ACTIVO');
      const isPlanning = activeOrSelectedPeriod?.estado === 'PLANIFICACION';
      const periodLabel = activeOrSelectedPeriod?.nombre || (filterPeriodo !== 'Todos' ? filterPeriodo : '2026-I');

      const isLapsoActivo = activePeriod && (activeOrSelectedPeriod?.id === activePeriod.id || activeOrSelectedPeriod?.nombre === activePeriod.nombre || filterPeriodo === 'Todos');

      const staffToExport = filteredStaff.filter(staff => {
        const isDocenteLapsoActivo = activePeriod && (staff.periodoAcademico === activePeriod.nombre || !staff.periodoAcademico);
        if (isLapsoActivo && isDocenteLapsoActivo) {
          return (staff.status === 'Validado' || staff.status === 'Activo') && (staff.materias || []).length > 0;
        }
        return true;
      });

      if (staffToExport.length === 0) {
        alert(`No hay registros de docentes con carga verificada para el período "${periodLabel}"${currentDept !== 'Todos' ? ` en el departamento ${currentDept}` : ''}.\n\nSolo se exportan las fichas de aquellos docentes cuya carga ha sido validada.`);
        return;
      }

      const vigenciaTexto = isPlanning 
        ? 'Período en Planificación (Sin fechas lectivas)'
        : (activeOrSelectedPeriod && activeOrSelectedPeriod.fechaDesde && activeOrSelectedPeriod.fechaHasta)
          ? `Vigencia: ${formatFechaEspanol(activeOrSelectedPeriod.fechaDesde)} al ${formatFechaEspanol(activeOrSelectedPeriod.fechaHasta)} (${activeOrSelectedPeriod.semanas || 15} sem)`
          : `(${activeOrSelectedPeriod?.semanas || 15} sem)`;

      const headerRows = [
        ["UNIVERSIDAD PEDAGÓGICA EXPERIMENTAL LIBERTADOR"],
        ["INSTITUTO PEDAGÓGICO RURAL GERVASIO RUBIO - UNIDAD DE TALENTO HUMANO"],
        [`MATRIZ AUDITABLE DE TALENTO HUMANO - DEPARTAMENTO: ${currentDept}`],
        [`Período Académico: ${activeOrSelectedPeriod?.nombre || (filterPeriodo !== 'Todos' ? filterPeriodo : '2026-I')}${isPlanning ? ' (EN PLANIFICACIÓN)' : ''} | ${vigenciaTexto} | Departamento: ${currentDept} | Centro de Atención / Sede: ${filterSede} | Emisión: ${new Date().toLocaleDateString('es-VE')}`],
        [],
        [
          "N°", "CÉDULA", "DOCENTE (APELLIDOS Y NOMBRES)", "RIF", "BANCO", "TIPO CUENTA", "Nº CUENTA BANCARIA",
          "ESTATUS BANCO", "TELÉFONO", "CORREO PERSONAL", "CORREO INSTITUCIONAL", "DIRECCIÓN", "PREGRADO",
          "POSTGRADO", "DOCTORADO", "CATEGORÍA", "DEDICACIÓN", "DEPARTAMENTO", "SEDE/CENTRO", "ESPECIALIDAD",
          "PERÍODO", "ESTATUS", "CANT. MAT.", "H. SEM", "H. LAPSO", "ASIGNATURAS ASIGNADAS"
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
        const hasDocenteMats = matCount > 0 && totSem > 0;
        const statusDocente = (hasDocenteMats && (staff.status === 'Validado' || staff.status === 'Activo')) ? 'Validado' : 'Por Revisar';

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
          normalizeDepartmentName(staff.department || currentDept),
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

      const safePeriodFile = periodLabel.replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeDeptFile = (currentDept || 'Docentes').replace(/[^a-zA-Z0-9_-]/g, '_');

      setPreviewData({
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
        sheetName: `Fichas_${safePeriodFile}`,
        fileName: `Docentes_${safeDeptFile}_Lapso_${safePeriodFile}.xlsx`,
        title: `Vista Previa de Exportación - Fichas Completas (${currentDept} - Lapso ${periodLabel})`
      });
    } catch (err) {
      console.error(err);
      alert("Error al preparar vista previa: " + err.message);
    }
  };

  const handleOpenValidate = (staff) => {
    const activePeriodObj = academicPeriodsList.find(p => p.estado === 'ACTIVO');
    const staffPeriodObj = academicPeriodsList.find(p => p.nombre === staff.periodoAcademico);
    const selectedPeriodName = (filterPeriodo !== 'Todos' ? filterPeriodo : null) 
      || (staffPeriodObj && staffPeriodObj.estado === 'ACTIVO' ? staff.periodoAcademico : null)
      || activePeriodObj?.nombre 
      || staff.periodoAcademico 
      || '2026-II';
    const periodObj = academicPeriodsList.find(p => p.nombre === selectedPeriodName) || activePeriodObj;

    if (periodObj?.estado === 'PLANIFICACION') {
      alert(`Operación bloqueada: El período académico "${selectedPeriodName}" se encuentra en PLANIFICACIÓN.\n\nNo está permitido cargar ni asignar materias porque el período no está abierto.\nPara habilitar la carga académica, debe activarse oficialmente desde Gestión de Lapsos.`);
      return;
    }

    if (periodObj?.estado === 'CERRADO') {
      alert(`Operación bloqueada: El período académico "${selectedPeriodName}" se encuentra CERRADO.\n\nNo está permitido modificar la carga académica de un período concluido.`);
      return;
    }


    setStaffToValidate(staff);
    setValidationForm({
      periodoAcademico: selectedPeriodName,
      semanas: periodObj?.semanas || 15,
      fechaDesde: periodObj?.fechaDesde || staff.fechaDesde || '',
      fechaHasta: periodObj?.fechaHasta || staff.fechaHasta || ''
    });
    if (Array.isArray(staff.materias) && staff.materias.length > 0) {
      setMateriasForm(staff.materias.map(m => ({
        nombre: m.nombre || '',
        especialidadDestino: m.especialidadDestino || staff.especialidad || '',
        seccion: m.seccion !== undefined && m.seccion !== null ? String(m.seccion) : '',
        cupos: (m.cupos !== undefined && m.cupos !== null && m.cupos !== '') ? m.cupos : '',
        inscritos: (m.inscritos !== undefined && m.inscritos !== null && m.inscritos !== '') ? m.inscritos : '',
        cohorte: (m.cohorte !== undefined && m.cohorte !== null) ? String(m.cohorte).trim() : '',
        horasSemanal: parseInt(m.horasSemanal) || 0,
        horasLapso: (parseInt(m.horasSemanal) || 0) * 15
      })));
    } else {
      setMateriasForm([{ nombre: '', especialidadDestino: staff.especialidad || '', seccion: '', cupos: '', inscritos: '', cohorte: '', horasSemanal: 0, horasLapso: 0 }]);
    }
  };

  const handleValidationFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'periodoAcademico') {
      const periodObj = academicPeriodsList.find(p => p.nombre === value);
      setValidationForm({
        ...validationForm,
        periodoAcademico: value,
        semanas: periodObj?.semanas || 15,
        fechaDesde: periodObj?.fechaDesde || '',
        fechaHasta: periodObj?.fechaHasta || ''
      });
      return;
    }
    setValidationForm({ ...validationForm, [name]: value });
  };

  const handleMateriaChange = (index, field, value) => {
    const newMaterias = [...materiasForm];
    newMaterias[index] = { ...newMaterias[index], [field]: value };
    
    if (field === 'horasSemanal') {
      newMaterias[index].horasLapso = (parseInt(value) || 0) * 15;
    }
    
    setMateriasForm(newMaterias);
  };

  const addMateria = () => {
    setMateriasForm([...materiasForm, { nombre: '', especialidadDestino: staffToValidate?.especialidad || '', seccion: '', cupos: '', inscritos: '', cohorte: '', horasSemanal: 0, horasLapso: 0 }]);
  };

  const removeMateria = (index) => {
    const newMaterias = materiasForm.filter((_, i) => i !== index);
    setMateriasForm(newMaterias);
  };

  const handleCopyMateriasFromHistory = (materias, periodo) => {
    if (!materias || materias.length === 0) {
      alert('Este período no tiene materias registradas.');
      return;
    }
    setMateriasForm(materias.map(m => ({
      nombre: m.nombre || '',
      especialidadDestino: m.especialidadDestino || '',
      seccion: m.seccion !== undefined && m.seccion !== null ? String(m.seccion) : '',
      cupos: (m.cupos !== undefined && m.cupos !== null && m.cupos !== '') ? m.cupos : '',
      inscritos: (m.inscritos !== undefined && m.inscritos !== null && m.inscritos !== '') ? m.inscritos : '',
      cohorte: (() => {
        const raw = (m.cohorte !== undefined && m.cohorte !== null) ? String(m.cohorte).trim() : '';
        return (raw && raw !== periodo && raw !== '2026-I' && raw !== '2026-II') ? raw : '';
      })(),
      horasSemanal: parseInt(m.horasSemanal) || 0,
      horasLapso: (parseInt(m.horasSemanal) || 0) * 15
    })));
    alert(`¡Carga cargada! Se copiaron las ${materias.length} materias del período ${periodo} al formulario actual.`);
  };

  const handleSaveValidation = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!staffToValidate) return;

    const targetPeriodObj = academicPeriodsList.find(p => p.nombre === validationForm.periodoAcademico);
    if (targetPeriodObj && targetPeriodObj.estado === 'PLANIFICACION') {
      alert(`Operación bloqueada: El período académico "${validationForm.periodoAcademico}" se encuentra en PLANIFICACIÓN.\n\nNo está permitido cargar ni validar materias porque el período no está abierto.\nPara habilitar la carga académica, debe activarse oficialmente desde Gestión de Lapsos.`);
      return;
    }
    if (targetPeriodObj && targetPeriodObj.estado === 'CERRADO') {
      alert(`Operación bloqueada: El período académico "${validationForm.periodoAcademico}" se encuentra CERRADO.\n\nNo está permitido modificar la carga académica de un período concluido.`);
      return;
    }

    const cleanMaterias = materiasForm.filter(m => m.nombre && m.nombre.trim() !== '');
    const finalEspecialidad = resolveSyncedEspecialidad(staffToValidate, cleanMaterias);
    
    try {
      const res = await updateStaffCarga(staffToValidate.cedula, cleanMaterias, 'Activo', {
        ...validationForm,
        especialidad: finalEspecialidad
      });
      if (res) {
        const updatedList = staffList.map(staff => {
          if (staff.cedula === staffToValidate.cedula) {
            return { 
              ...staff, 
              ...validationForm,
              especialidad: finalEspecialidad,
              materias: cleanMaterias, 
              status: 'Activo' 
            };
          }
          return staff;
        });
        setStaffList(updatedList);
        await fetchData(filterPeriodo);
        if (staffToView && staffToView.cedula === staffToValidate.cedula) {
          setStaffToView({ ...staffToView, ...validationForm, especialidad: finalEspecialidad, materias: cleanMaterias, status: 'Activo' });
        }
        const savedDocente = { ...staffToValidate, ...validationForm, especialidad: finalEspecialidad, materias: cleanMaterias, status: 'Activo' };
        if (window.confirm("¡Carga Académica Validada con Éxito!\n\n¿Desea enviar la Ficha Oficial de Oferta Académica al correo institucional del docente ahora mismo?")) {
          setStaffToSendFicha(savedDocente);
        }
      } else {
        alert("Hubo un error al guardar en la base de datos. Verifica la conexión.");
      }
    } catch (error) {
      console.error("Error saving validation:", error);
      alert(error?.message || "Hubo un error al guardar en la base de datos. Verifica la conexión.");
    } finally {
      setStaffToValidate(null);
    }
  };

  const handleAddMateriaGlobal = async () => {
    if (user?.role !== 'ADMIN') {
      alert("Operación denegada: Solo el Administrador del Sistema puede agregar nuevas materias al catálogo.");
      return;
    }
    const newName = window.prompt("Ingrese el nombre exacto de la NUEVA MATERIA para agregar al catálogo general del sistema:");
    if (newName && newName.trim().length > 0) {
      const res = await addMateriaCatalogo(newName.trim());
      if (res && res.success) {
        const catalogo = await getCatalogoMaterias();
        setCursosList(catalogo);
        alert(`La materia "${res.nombre}" fue agregada exitosamente al catálogo global.`);
      } else {
        alert(res?.message || "Ocurrió un error o la materia ya existe.");
      }
    }
  };

  const filteredStaff = useMemo(() => {
    return staffList.filter(staff => {
      const matchesDept = currentDept === 'Todos' || matchDepartment(staff.department, currentDept);
      const matchesPeriod = filterPeriodo === 'Todos' || staff.periodoAcademico === filterPeriodo;
      const contractStatus = getDocenteContractStatus(staff, academicPeriodsList);
      const matchesStatus = filterStatus === 'Todos' || staff.status === filterStatus || contractStatus === filterStatus;
      const matchesSede = filterSede === 'Todos' || staff.sedeCentro === filterSede;
      if (!debouncedSearchTerm.trim()) return matchesDept && matchesPeriod && matchesStatus && matchesSede;

      const fullName = `${staff.nombres || ''} ${staff.apellidos || ''}`;
      const matchesMateria = staff.materias && staff.materias.some(m => 
        matchesSearch(m.nombre, debouncedSearchTerm) ||
        matchesSearch(m.especialidadDestino, debouncedSearchTerm) ||
        matchesSearch(m.seccion, debouncedSearchTerm)
      );
      
      const matchesDoc = matchesSearch(fullName, debouncedSearchTerm) || 
        matchesSearch(staff.cedula, debouncedSearchTerm) || 
        matchesSearch(staff.especialidad, debouncedSearchTerm) || 
        matchesSearch(staff.titulosPregrado, debouncedSearchTerm) || 
        matchesMateria;

      return matchesDept && matchesPeriod && matchesStatus && matchesSede && matchesDoc;
    }).sort((a, b) => {
      const numA = parseInt(a.cedula?.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.cedula?.replace(/\D/g, '')) || 0;
      return numA - numB;
    });
  }, [staffList, currentDept, debouncedSearchTerm, filterPeriodo, filterStatus, filterSede, academicPeriodsList]);

  const ofertaConsolidada = useMemo(() => {
    const oferta = [];
    const activePeriodName = academicPeriodsList.find(p => p.estado === 'ACTIVO')?.nombre || '2026-II';

    staffList.forEach(staff => {
      const matchesPeriod = filterPeriodo === 'Todos' || staff.periodoAcademico === filterPeriodo;
      const matchesStatus = filterStatus === 'Todos' || staff.status === filterStatus;
      const matchesSede = filterSede === 'Todos' || staff.sedeCentro === filterSede;
      if (!matchesPeriod || !matchesStatus || !matchesSede) return;

      // REGLA INSTITUCIONAL UPEL: En la oferta consolidada del lapso activo,
      // solo debe mostrarse la carga académica formalmente verificada y validada por la Jefatura (status 'Activo' o 'Validado').
      const targetPeriod = filterPeriodo !== 'Todos' ? filterPeriodo : staff.periodoAcademico;
      const isLapsoActivo = targetPeriod && activePeriodName && targetPeriod === activePeriodName;
      if (isLapsoActivo) {
        const isValidada = (staff.status === 'Validado' || staff.status === 'Activo') && (staff.materias || []).length > 0;
        if (!isValidada) return;
      }

      if (staff.materias && staff.materias.length > 0) {
        staff.materias.forEach(mat => {
          const matchesDept = currentDept === 'Todos' ||
            matchDepartment(staff.department, currentDept);
          if (!matchesDept) return;

          if (debouncedSearchTerm.trim()) {
            const fullName = `${staff.nombres || ''} ${staff.apellidos || ''}`;
            const matchesQuery = matchesSearch(fullName, debouncedSearchTerm) || 
              matchesSearch(staff.cedula, debouncedSearchTerm) || 
              matchesSearch(mat.nombre, debouncedSearchTerm) || 
              matchesSearch(mat.especialidadDestino, debouncedSearchTerm) || 
              matchesSearch(mat.seccion, debouncedSearchTerm) || 
              matchesSearch(staff.especialidad, debouncedSearchTerm);
            if (!matchesQuery) return;
          }

          oferta.push({ ...mat, staff });
        });
      }
    });

    return oferta.sort((a, b) => {
      const cmp = (a.nombre || '').localeCompare(b.nombre || '');
      if (cmp !== 0) return cmp;
      return (a.seccion || '').localeCompare(b.seccion || '');
    });
  }, [staffList, currentDept, debouncedSearchTerm, filterPeriodo, filterStatus, filterSede, academicPeriodsList]);

  const currentTotalDocentes = filteredStaff.length;
  const pageSizeDocentes = itemsPerPage === 'Todos' ? currentTotalDocentes : (parseInt(itemsPerPage) || 25);
  const totalPagesDocentes = itemsPerPage === 'Todos' ? 1 : Math.max(1, Math.ceil(currentTotalDocentes / pageSizeDocentes));

  const paginatedDocentes = useMemo(() => {
    if (itemsPerPage === 'Todos') return filteredStaff;
    const size = parseInt(itemsPerPage) || 25;
    const start = (currentPageDocentes - 1) * size;
    return filteredStaff.slice(start, start + size);
  }, [filteredStaff, currentPageDocentes, itemsPerPage]);

  const currentTotalOferta = ofertaConsolidada.length;
  const pageSizeOferta = itemsPerPage === 'Todos' ? currentTotalOferta : (parseInt(itemsPerPage) || 25);
  const totalPagesOferta = itemsPerPage === 'Todos' ? 1 : Math.max(1, Math.ceil(currentTotalOferta / pageSizeOferta));

  const paginatedOferta = useMemo(() => {
    if (itemsPerPage === 'Todos') return ofertaConsolidada;
    const size = parseInt(itemsPerPage) || 25;
    const start = (currentPageOferta - 1) * size;
    return ofertaConsolidada.slice(start, start + size);
  }, [ofertaConsolidada, currentPageOferta, itemsPerPage]);

  if (user && user.role === 'JEFE' && !matchDepartment(user.department, currentDept)) {
    return <Navigate to={`/departamento/${encodeURIComponent(user.department)}`} replace />;
  }

  if (staffToPrint) {
    return (
      <Suspense fallback={<div style={{ padding: '3rem', textAlign: 'center', color: '#0047bb', fontWeight: 700 }}>Cargando Ficha Institucional...</div>}>
        <PrintableFicha staff={staffToPrint} onBack={() => setStaffToPrint(null)} />
      </Suspense>
    );
  }

  return (
    <div className="animate-fade-in">
      <Suspense fallback={null}>
        <NotificationModal 
          isOpen={!!staffToNotify}
          staff={staffToNotify}
          onClose={() => setStaffToNotify(null)}
        />

        <SendFichaEmailModal 
          isOpen={!!staffToSendFicha}
          staff={staffToSendFicha}
          jefeName={user?.name || 'Jefe de Departamento'}
          onClose={() => setStaffToSendFicha(null)}
        />
      </Suspense>

      <StaffHeader 
        currentDept={currentDept}
        theme={theme}
        user={user}
        academicPeriodsList={academicPeriodsList}
        filterPeriodo={filterPeriodo}
        filterSede={filterSede}
        ofertaConsolidada={ofertaConsolidada}
        setPreviewData={setPreviewData}
        handleOpenAuditorPreview={handleOpenAuditorPreview}
        setIsReplicateModalOpen={setIsReplicateModalOpen}
        setIsPeriodModalOpen={setIsPeriodModalOpen}
        setIsAddDocenteModalOpen={setIsAddDocenteModalOpen}
        getInstitutionalHeaderSubtitle={getInstitutionalHeaderSubtitle}
        normalizeDepartmentName={normalizeDepartmentName}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        <div className="upel-card upel-card-accent-blue" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '0.75rem' }}>
            <div>
              <div className="upel-section-subtitle">
                <span>📚</span> Plantel Docente
              </div>
              <h3 className="upel-section-title">
                Fichas y Carga Académica
              </h3>
            </div>
          </div>
          <div className="upel-section-divider" style={{ marginTop: '0.2rem', marginBottom: '1.25rem' }} />

          <StaffToolbar 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterPeriodo={filterPeriodo}
            setFilterPeriodo={setFilterPeriodo}
            academicPeriodsList={academicPeriodsList}
            academicPeriods={academicPeriods}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterSede={filterSede}
            setFilterSede={setFilterSede}
            staffList={staffList}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            theme={theme}
          />

          {activeTab === 'docentes' ? (
            <StaffTable 
              paginatedDocentes={paginatedDocentes}
              filteredStaffCount={filteredStaff.length}
              currentPageDocentes={currentPageDocentes}
              totalPagesDocentes={totalPagesDocentes}
              setCurrentPageDocentes={setCurrentPageDocentes}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
              academicPeriodsList={academicPeriodsList}
              filterPeriodo={filterPeriodo}
              user={user}
              handleOpenValidate={handleOpenValidate}
              activeActionMenu={activeActionMenu}
              setActiveActionMenu={setActiveActionMenu}
              isExpedienteCompleto={isExpedienteCompleto}
              getDocenteContractStatus={getDocenteContractStatus}
              getStatusBadgeInfo={getStatusBadgeInfo}
            />
          ) : (
            <StaffOfertaTable 
              paginatedOferta={paginatedOferta}
              ofertaConsolidada={ofertaConsolidada}
              currentPageOferta={currentPageOferta}
              totalPagesOferta={totalPagesOferta}
              setCurrentPageOferta={setCurrentPageOferta}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
            />
          )}
        </div>
      </div>

      <Suspense fallback={null}>
        <StaffEditModal 
          staffToEdit={staffToEdit}
          setStaffToEdit={setStaffToEdit}
          handleEditChange={handleEditChange}
          handleSaveEdit={handleSaveEdit}
          currentDept={currentDept}
        />

        <StaffValidateModal 
          staffToValidate={staffToValidate}
          setStaffToValidate={setStaffToValidate}
          setStaffToEdit={setStaffToEdit}
          setStaffHistoryToView={setStaffHistoryToView}
          validationForm={validationForm}
          handleValidationFormChange={handleValidationFormChange}
          materiasForm={materiasForm}
          handleMateriaChange={handleMateriaChange}
          removeMateria={removeMateria}
          addMateria={addMateria}
          handleAddMateriaGlobal={handleAddMateriaGlobal}
          handleSaveValidation={handleSaveValidation}
          academicPeriodsList={academicPeriodsList}
          academicPeriods={academicPeriods}
          cursosList={cursosList}
          user={user}
        />

        <StaffDetailModal 
          staffToView={staffToView}
          setStaffToView={setStaffToView}
          setStaffToEdit={setStaffToEdit}
          handleDelete={handleDelete}
          setStaffToPrint={setStaffToPrint}
          user={user}
        />

        <StaffCreateModal 
          isOpen={isAddDocenteModalOpen}
          onClose={() => setIsAddDocenteModalOpen(false)}
          newDocente={newDocente}
          setNewDocente={setNewDocente}
          handleSubmit={handleAddDocenteSubmit}
          currentDept={currentDept}
          theme={theme}
          academicPeriodsList={academicPeriodsList}
          academicPeriods={academicPeriods}
        />

        <ReplicatePeriodModal 
          isOpen={isReplicateModalOpen}
          onClose={() => setIsReplicateModalOpen(false)}
          sourceStaffList={staffList}
          currentDept={currentDept}
          academicPeriodsList={academicPeriodsList}
          onGoToLapsos={() => {
            setIsReplicateModalOpen(false);
            setIsPeriodModalOpen(true);
          }}
          onReplicationSuccess={() => fetchData()}
        />

        <TeacherHistoryModal 
          isOpen={!!staffHistoryToView}
          onClose={() => setStaffHistoryToView(null)}
          staff={staffHistoryToView}
          onCopyMaterias={(materias, periodo) => {
            if (staffToValidate) {
              handleCopyMateriasFromHistory(materias, periodo);
            } else {
              handleOpenValidate(staffHistoryToView);
              setTimeout(() => {
                handleCopyMateriasFromHistory(materias, periodo);
              }, 100);
            }
          }}
        />

        <PeriodManagementModal 
          isOpen={isPeriodModalOpen}
          initialPeriodIdToEdit={initialPeriodIdToEdit}
          onClose={() => {
            setIsPeriodModalOpen(false);
            setInitialPeriodIdToEdit(null);
          }}
          onPeriodActivated={(newPeriod) => {
            const p = newPeriod || 'Todos';
            setFilterPeriodo(p);
            fetchData(p);
          }}
        />

        {previewData && (
          <ExcelPreviewModal 
            isOpen={true}
            onClose={() => setPreviewData(null)}
            headerRows={previewData.headerRows}
            dataRows={previewData.dataRows}
            colsWidth={previewData.colsWidth}
            fileName={previewData.fileName}
            sheetName={previewData.sheetName || 'Fichas_Docentes'}
            title={previewData.title || "Vista Previa de Exportación"}
          />
        )}

        <StaffActionMenuPortal 
          activeActionMenu={activeActionMenu}
          setActiveActionMenu={setActiveActionMenu}
          setStaffToView={setStaffToView}
          setStaffToPrint={setStaffToPrint}
          setStaffToEdit={setStaffToEdit}
          setStaffToSendFicha={setStaffToSendFicha}
          setStaffToNotify={setStaffToNotify}
          setStaffHistoryToView={setStaffHistoryToView}
          handleDelete={handleDelete}
          user={user}
          isExpedienteCompleto={isExpedienteCompleto}
          getMissingExpedienteFields={getMissingExpedienteFields}
        />
      </Suspense>

      <style>{`
        .w-full { width: 100%; }
        .form-label { display: block; margin-bottom: 0.3rem; font-size: 0.85rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.03em; }
      `}</style>
    </div>
  );
};

export default StaffList;
