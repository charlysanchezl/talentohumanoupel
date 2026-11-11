import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { Lock, AlertCircle, RotateCcw } from 'lucide-react';
import { 
  getStaffData, 
  getCurrentUser, 
  createStaff, 
  deleteStaff, 
  getCatalogoMaterias, 
  matchDepartment, 
  getAcademicPeriodsList, 
  isExpedienteCompleto, 
  getMissingExpedienteFields,
  invalidateStaffCache
} from '../data';
import { matchesSearch } from '../utils/searchHelper';
import { getDocenteContractStatus, getStatusBadgeInfo } from '../utils/contractStatus';
import { buildAuditorExportData, buildOfertaExportData } from '../utils/staffExcelExportHelper';
import { useStaffValidation } from '../hooks/useStaffValidation';
import { lazyWithRetry } from '../utils/lazyWithRetry';

// Subcomponentes modulares reutilizables de Staff
import ConsultarDocentesFilterBar from './staff/ConsultarDocentesFilterBar';
import ConsultarDocentesTable from './staff/ConsultarDocentesTable';
import StaffOfertaTable from './staff/StaffOfertaTable';
import StaffActionMenuPortal from './staff/StaffActionMenuPortal';

// Modales con carga bajo demanda (Code Splitting y Lazy Loading con auto-recarga)
const StaffDetailModal = lazyWithRetry(() => import('./staff/StaffDetailModal'));
const StaffEditModal = lazyWithRetry(() => import('./staff/StaffEditModal'));
const StaffValidateModal = lazyWithRetry(() => import('./staff/StaffValidateModal'));
const PrintableFicha = lazyWithRetry(() => import('./PrintableFicha'));
const ExcelPreviewModal = lazyWithRetry(() => import('./ExcelPreviewModal'));
const NotificationModal = lazyWithRetry(() => import('./NotificationModal'));
const SendFichaEmailModal = lazyWithRetry(() => import('./SendFichaEmailModal'));
const ReplicatePeriodModal = lazyWithRetry(() => import('./ReplicatePeriodModal'));
const TeacherHistoryModal = lazyWithRetry(() => import('./TeacherHistoryModal'));
const PeriodManagementModal = lazyWithRetry(() => import('./PeriodManagementModal'));
const BankTxtModal = lazyWithRetry(() => import('./BankTxtModal'));

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const ConsultarDocentes = () => {
  const user = getCurrentUser();

  // Estados de datos principales y filtros
  const [staffList, setStaffList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriodo, setFilterPeriodo] = useState('Todos');
  const [filterDepartment, setFilterDepartment] = useState('Todos');
  const [filterSede, setFilterSede] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [sedesList, setSedesList] = useState([]);
  const [academicPeriodsList, setAcademicPeriodsList] = useState([]);
  const [cursosList, setCursosList] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Estados para modales de interacción
  const [staffToView, setStaffToView] = useState(null);
  const [staffToEdit, setStaffToEdit] = useState(null);
  const [staffToPrint, setStaffToPrint] = useState(null);
  const [staffToNotify, setStaffToNotify] = useState(null);
  const [staffToSendFicha, setStaffToSendFicha] = useState(null);
  const [isReplicateModalOpen, setIsReplicateModalOpen] = useState(false);
  const [targetPeriodForReplication, setTargetPeriodForReplication] = useState(null);
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [isBankTxtModalOpen, setIsBankTxtModalOpen] = useState(false);
  const [initialPeriodIdToEdit, setInitialPeriodIdToEdit] = useState(null);
  const [staffHistoryToView, setStaffHistoryToView] = useState(null);
  const [activeActionMenu, setActiveActionMenu] = useState(null);

  // Pestañas y paginación
  const [activeTab, setActiveTab] = useState('docentes');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageOferta, setCurrentPageOferta] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Carga reactiva de docentes y catálogo
  const fetchStaff = async (period = filterPeriodo) => {
    const data = await getStaffData(period);
    setStaffList(data || []);
    const catalogo = await getCatalogoMaterias();
    setCursosList(catalogo || []);
    try {
      const pList = await getAcademicPeriodsList();
      setAcademicPeriodsList(pList || []);
    } catch {
      // Ignorar error al conectar con períodos
    }
    const sedes = new Set(['Rubio', 'Sabana de Mendoza']);
    (data || []).forEach(s => {
      if (s.sedeCentro) sedes.add(s.sedeCentro);
    });
    setSedesList(['Todos', ...Array.from(sedes).sort()]);
  };

  useEffect(() => {
    fetchStaff(filterPeriodo);
  }, [filterPeriodo]);

  useEffect(() => {
    setCurrentPage(1);
    setCurrentPageOferta(1);
  }, [debouncedSearchTerm, filterPeriodo, filterDepartment, filterSede, filterStatus, activeTab, itemsPerPage]);

  // Cerrar menú de acciones contextuales al hacer clic fuera o al hacer scroll
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

  // Lista de períodos académicos para selección
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

  // Hook desacoplado de validación y carga horaria
  const {
    staffToValidate,
    setStaffToValidate,
    validationForm,
    handleValidationFormChange,
    materiasForm,
    handleMateriaChange,
    addMateria,
    removeMateria,
    handleCopyMateriasFromHistory,
    handleSaveValidation,
    handleAddMateriaGlobal,
    handleOpenValidate
  } = useStaffValidation({
    academicPeriodsList,
    filterPeriodo,
    staffList,
    setStaffList,
    fetchStaff,
    staffToView,
    setStaffToView,
    setCursosList
  });

  // Filtrado y ordenación de docentes
  const filteredAndSortedStaff = useMemo(() => {
    return staffList
      .filter(staff => {
        if (user && user.role === 'JEFE' && user.department) {
          const isMyDept = matchDepartment(staff.department, user.department);
          const hasMatInMyDept = (staff.materias || []).some(m => 
            matchDepartment(m.especialidadDestino, user.department)
          );
          if (!isMyDept && !hasMatInMyDept) return false;
        }

        if (filterPeriodo !== 'Todos') {
          const matchPeriod = staff.periodoAcademico === filterPeriodo;
          const hasMatPeriod = (staff.materias || []).some(m => m.cohorte === filterPeriodo);
          if (!matchPeriod && !hasMatPeriod) return false;
        }

        if (filterDepartment !== 'Todos') {
          const matchDept = matchDepartment(staff.department, filterDepartment);
          const hasMatInDept = (staff.materias || []).some(m => 
            matchDepartment(m.especialidadDestino, filterDepartment)
          );
          if (!matchDept && !hasMatInDept) return false;
        }

        if (filterSede !== 'Todos' && staff.sedeCentro !== filterSede) return false;

        if (filterStatus !== 'Todos') {
          const contractStatus = getDocenteContractStatus(staff, academicPeriodsList);
          if (staff.status !== filterStatus && contractStatus !== filterStatus) return false;
        }

        if (!debouncedSearchTerm.trim()) return true;

        const name = `${staff.nombres || ''} ${staff.apellidos || ''}`;
        const matchesMateria = (staff.materias || []).some(m => 
          matchesSearch(m.nombre, debouncedSearchTerm) ||
          matchesSearch(m.especialidadDestino, debouncedSearchTerm) ||
          matchesSearch(m.seccion, debouncedSearchTerm)
        );

        return matchesSearch(name, debouncedSearchTerm) || 
          matchesSearch(staff.cedula, debouncedSearchTerm) || 
          matchesSearch(staff.especialidad, debouncedSearchTerm) || 
          matchesSearch(staff.titulosPregrado, debouncedSearchTerm) || 
          matchesMateria;
      })
      .sort((a, b) => {
        const numA = parseInt(a.cedula?.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.cedula?.replace(/\D/g, '')) || 0;
        if (numA !== numB) return numA - numB;
        const nameA = `${a.apellidos || ''} ${a.nombres || ''}`.trim();
        const nameB = `${b.apellidos || ''} ${b.nombres || ''}`.trim();
        return nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
      });
  }, [staffList, debouncedSearchTerm, user, filterPeriodo, filterDepartment, filterSede, filterStatus, academicPeriodsList]);

  // Consolidación de oferta académica para vista curricular
  const ofertaConsolidada = useMemo(() => {
    const list = [];
    const activePeriodObj = academicPeriodsList.find(p => p.estado === 'ACTIVO');
    const activePeriodName = activePeriodObj?.nombre || '2026-II';

    staffList.forEach(staff => {
      if (user && user.role === 'JEFE' && user.department) {
        const isMyDept = matchDepartment(staff.department, user.department);
        const hasMatInMyDept = (staff.materias || []).some(m => 
          matchDepartment(m.especialidadDestino, user.department)
        );
        if (!isMyDept && !hasMatInMyDept) return;
      }

      if (filterSede !== 'Todos' && staff.sedeCentro !== filterSede) return;

      if (filterStatus !== 'Todos') {
        const contractStatus = getDocenteContractStatus(staff, academicPeriodsList);
        if (staff.status !== filterStatus && contractStatus !== filterStatus) return;
      }

      // REGLA INSTITUCIONAL UPEL: En la oferta consolidada del lapso activo,
      // solo debe mostrarse la carga académica formalmente verificada y validada por la Jefatura (status 'Activo' o 'Validado').
      const targetPeriod = filterPeriodo !== 'Todos' ? filterPeriodo : staff.periodoAcademico;
      const isLapsoActivo = targetPeriod && activePeriodName && targetPeriod === activePeriodName;
      if (isLapsoActivo) {
        const isValidada = staff.status === 'Validado' || staff.status === 'Activo';
        if (!isValidada) return;
      }

      (staff.materias || []).forEach(mat => {
        if (filterPeriodo !== 'Todos') {
          const matchPeriod = staff.periodoAcademico === filterPeriodo || mat.cohorte === filterPeriodo;
          if (!matchPeriod) return;
        }

        if (filterDepartment !== 'Todos') {
          const matchesTeacherDept = matchDepartment(staff.department, filterDepartment);
          const matchesMateriaDept = matchDepartment(mat.especialidadDestino, filterDepartment);
          if (!matchesTeacherDept && !matchesMateriaDept) return;
        }

        if (debouncedSearchTerm.trim()) {
          const name = `${staff.nombres || ''} ${staff.apellidos || ''}`;
          const matches = matchesSearch(name, debouncedSearchTerm) ||
            matchesSearch(staff.cedula, debouncedSearchTerm) ||
            matchesSearch(mat.nombre, debouncedSearchTerm) ||
            matchesSearch(mat.especialidadDestino, debouncedSearchTerm) ||
            matchesSearch(mat.seccion, debouncedSearchTerm);
          if (!matches) return;
        }

        list.push({ ...mat, staff });
      });
    });

    return list.sort((a, b) => {
      const cmp = (a.nombre || '').localeCompare(b.nombre || '');
      if (cmp !== 0) return cmp;
      return (a.seccion || '').localeCompare(b.seccion || '');
    });
  }, [staffList, filterPeriodo, filterDepartment, filterSede, filterStatus, debouncedSearchTerm, user, academicPeriodsList]);

  // Paginación calculada
  const pageSize = itemsPerPage === 'Todos' ? 999999 : (parseInt(itemsPerPage) || 25);
  
  const paginatedStaff = useMemo(() => {
    if (itemsPerPage === 'Todos') return filteredAndSortedStaff;
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedStaff.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedStaff, currentPage, pageSize, itemsPerPage]);

  const totalPagesDocentes = itemsPerPage === 'Todos' ? 1 : Math.max(1, Math.ceil(filteredAndSortedStaff.length / pageSize));

  const paginatedOferta = useMemo(() => {
    if (itemsPerPage === 'Todos') return ofertaConsolidada;
    const startIndex = (currentPageOferta - 1) * pageSize;
    return ofertaConsolidada.slice(startIndex, startIndex + pageSize);
  }, [ofertaConsolidada, currentPageOferta, pageSize, itemsPerPage]);

  const totalPagesOferta = itemsPerPage === 'Todos' ? 1 : Math.max(1, Math.ceil(ofertaConsolidada.length / pageSize));

  // Manejadores de edición rápida y eliminación
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === 'cuentaBancaria') {
      const clean = value.replace(/\D/g, '').slice(0, 20);
      setStaffToEdit(prev => ({ ...prev, [name]: clean }));
      return;
    }
    setStaffToEdit(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!staffToEdit) return;
    try {
      await createStaff(staffToEdit);
      invalidateStaffCache();
      await fetchStaff(filterPeriodo);
      alert('Datos del docente actualizados correctamente.');
      setStaffToEdit(null);
    } catch (err) {
      alert('Error al guardar cambios: ' + (err.message || err));
    }
  };

  const handleDelete = async (staff) => {
    if (!staff || !staff.cedula) return;
    const confirmed = window.confirm(
      `¿Está seguro de que desea eliminar permanentemente al docente ${staff.nombres || ''} ${staff.apellidos || ''} (C.I: ${staff.cedula})?\n\nEsta acción no se puede deshacer.`
    );
    if (!confirmed) return;
    try {
      const ok = await deleteStaff(staff.cedula);
      if (ok) {
        setStaffList(prev => prev.filter(s => s.cedula !== staff.cedula));
        if (staffToView?.cedula === staff.cedula) setStaffToView(null);
        if (staffToEdit?.cedula === staff.cedula) setStaffToEdit(null);
        if (staffToValidate?.cedula === staff.cedula) setStaffToValidate(null);
        alert('Docente eliminado exitosamente.');
      }
    } catch (err) {
      alert('Error al eliminar docente: ' + (err.message || err));
    }
  };

  // Manejadores de exportación modal
  const handleOpenAuditorPreview = () => {
    const data = buildAuditorExportData({
      filteredAndSortedStaff,
      academicPeriodsList,
      filterPeriodo,
      filterDepartment,
      filterSede
    });
    if (data) setPreviewData(data);
  };

  const handleExportOfertaPreview = () => {
    const data = buildOfertaExportData({
      ofertaConsolidada,
      academicPeriodsList,
      filterPeriodo,
      filterSede
    });
    if (data) setPreviewData(data);
  };

  // Si se está imprimiendo la ficha, renderizar la vista de impresión completa
  if (staffToPrint) {
    return (
      <Suspense fallback={null}>
        <PrintableFicha staff={staffToPrint} onBack={() => setStaffToPrint(null)} />
      </Suspense>
    );
  }

  return (
    <div className="animate-fade-in">
      <Suspense fallback={null}>
        {/* Notificaciones y mensajería */}
        {staffToNotify && (
          <NotificationModal 
            isOpen={true}
            staff={staffToNotify}
            onClose={() => setStaffToNotify(null)}
          />
        )}

        {staffToSendFicha && (
          <SendFichaEmailModal 
            isOpen={true}
            staff={staffToSendFicha}
            jefeName={user?.name || 'Jefe de Departamento'}
            onClose={() => setStaffToSendFicha(null)}
          />
        )}

        {/* Modal de Previsualización Excel */}
        {previewData && (
          <ExcelPreviewModal 
            isOpen={true}
            onClose={() => setPreviewData(null)}
            headerRows={previewData.headerRows}
            dataRows={previewData.dataRows}
            colsWidth={previewData.colsWidth}
            fileName={previewData.fileName}
            sheetName={previewData.sheetName || 'Fichas_Docentes'}
            title={previewData.title}
          />
        )}

        {/* Modal de Exportación Bancaria TXT BDV */}
        {isBankTxtModalOpen && (
          <BankTxtModal 
            isOpen={isBankTxtModalOpen}
            onClose={() => setIsBankTxtModalOpen(false)}
            staffList={filteredAndSortedStaff}
            currentPeriod={filterPeriodo}
          />
        )}

        {/* Modal de Gestión de Lapsos y Fechas */}
        {isPeriodModalOpen && (
          <PeriodManagementModal 
            isOpen={isPeriodModalOpen}
            initialPeriodIdToEdit={initialPeriodIdToEdit}
            onClose={() => {
              setIsPeriodModalOpen(false);
              setInitialPeriodIdToEdit(null);
              invalidateStaffCache();
              fetchStaff(filterPeriodo);
            }}
          />
        )}

        {/* Modal de Promoción y Replicación de Lapsos */}
        {isReplicateModalOpen && (
          <ReplicatePeriodModal 
            isOpen={isReplicateModalOpen}
            onClose={() => {
              setIsReplicateModalOpen(false);
              invalidateStaffCache();
              fetchStaff(filterPeriodo);
            }}
            sourceStaffList={staffList}
            currentDept={filterDepartment !== 'Todos' ? filterDepartment : (user?.department || 'Todos')}
            academicPeriodsList={academicPeriodsList}
            targetPeriodName={targetPeriodForReplication}
          />
        )}

        {/* Modal de Historial Docente */}
        {staffHistoryToView && (
          <TeacherHistoryModal 
            isOpen={!!staffHistoryToView}
            onClose={() => setStaffHistoryToView(null)}
            staff={staffHistoryToView}
            onCopyMaterias={handleCopyMateriasFromHistory}
          />
        )}
      </Suspense>

      {/* Barra de Mando, Filtros y Pestañas Modularizada */}
      <ConsultarDocentesFilterBar 
        user={user}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterPeriodo={filterPeriodo}
        setFilterPeriodo={setFilterPeriodo}
        filterDepartment={filterDepartment}
        setFilterDepartment={setFilterDepartment}
        filterSede={filterSede}
        setFilterSede={setFilterSede}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        sedesList={sedesList}
        academicPeriodsList={academicPeriodsList}
        academicPeriods={academicPeriods}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        filteredDocentesCount={filteredAndSortedStaff.length}
        ofertaCount={ofertaConsolidada.length}
        handleExportOfertaPreview={handleExportOfertaPreview}
        handleOpenAuditorPreview={handleOpenAuditorPreview}
        setIsBankTxtModalOpen={setIsBankTxtModalOpen}
        setIsPeriodModalOpen={setIsPeriodModalOpen}
        setIsReplicateModalOpen={setIsReplicateModalOpen}
        setInitialPeriodIdToEdit={setInitialPeriodIdToEdit}
        setTargetPeriodForReplication={setTargetPeriodForReplication}
      />

      {(() => {
        const activePeriodObj = academicPeriodsList.find(p => p.estado === 'ACTIVO');
        const selectedPeriodObj = filterPeriodo === 'Todos'
          ? activePeriodObj
          : academicPeriodsList.find(p => p.nombre === filterPeriodo);

        if (selectedPeriodObj?.estado === 'CERRADO') {
          return (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              borderRadius: '10px',
              background: '#fffbeb',
              border: '1px solid #fde68a',
              color: '#92400e',
              fontSize: '0.86rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <Lock size={16} style={{ flexShrink: 0 }} />
                <span>
                  <strong>Consulta Histórica ({selectedPeriodObj.nombre} — Cerrado):</strong> Estás viendo el respaldo congelado de este lapso.
                  {activePeriodObj ? ` El período activo (${activePeriodObj.nombre}) sigue intacto.` : ''}
                </span>
              </div>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setFilterPeriodo('Todos')}
                style={{
                  fontSize: '0.78rem',
                  padding: '0.3rem 0.7rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: '#ffffff',
                  borderColor: '#f59e0b',
                  color: '#92400e'
                }}
              >
                <RotateCcw size={13} />
                Volver al período activo
              </button>
            </div>
          );
        }

        if (
          selectedPeriodObj?.estado === 'ACTIVO' &&
          typeof selectedPeriodObj.observaciones === 'string' &&
          selectedPeriodObj.observaciones.toLowerCase().includes('reactivado')
        ) {
          return (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              borderRadius: '10px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1e40af',
              fontSize: '0.86rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>
                <strong>Período Reabierto Temporalmente ({selectedPeriodObj.nombre}):</strong> Recuerda reactivar el período en curso desde <strong>Gestión de Lapsos</strong> al terminar tu revisión.
              </span>
            </div>
          );
        }

        return null;
      })()}

      {/* Contenido según pestaña activa */}
      {activeTab === 'docentes' ? (
        <ConsultarDocentesTable 
          paginatedStaff={paginatedStaff}
          filteredStaffCount={filteredAndSortedStaff.length}
          currentPage={currentPage}
          totalPages={totalPagesDocentes}
          setCurrentPage={setCurrentPage}
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

      {/* Modales y Portales modulares */}
      <Suspense fallback={null}>
        {staffToView && (
          <StaffDetailModal
            staffToView={staffToView}
            setStaffToView={setStaffToView}
            setStaffToEdit={setStaffToEdit}
            handleDelete={handleDelete}
            setStaffToPrint={setStaffToPrint}
            user={user}
          />
        )}

        {staffToEdit && (
          <StaffEditModal
            staffToEdit={staffToEdit}
            setStaffToEdit={setStaffToEdit}
            handleEditChange={handleEditChange}
            handleSaveEdit={handleSaveEdit}
            handleDelete={handleDelete}
            user={user}
          />
        )}

        {staffToValidate && (
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
        )}
      </Suspense>

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
    </div>
  );
};

export default ConsultarDocentes;
