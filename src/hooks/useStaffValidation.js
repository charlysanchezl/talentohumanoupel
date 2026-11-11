import { useState } from 'react';
import { updateStaffCarga, addMateriaCatalogo, getCatalogoMaterias } from '../data';

/**
 * Sincroniza la especialidad principal del docente con la especialidad destino de su carga
 * cuando carece de especialidad previa, cambia frente a las materias previas o toda su carga
 * oficial apunta de forma unívoca a una especialidad distinta.
 */
export function resolveSyncedEspecialidad(staffToValidate, cleanMaterias = []) {
  const currentEsp = String(staffToValidate?.especialidad || '').trim();
  const firstMatEsp = String(
    cleanMaterias.find(m => m?.especialidadDestino && String(m.especialidadDestino).trim() !== '')?.especialidadDestino || ''
  ).trim();
  if (!firstMatEsp) return currentEsp;

  const prevFirstMatEsp = String(
    (staffToValidate?.materias || []).find(m => m?.especialidadDestino && String(m.especialidadDestino).trim() !== '')?.especialidadDestino || ''
  ).trim();
  const uniqueMatEsps = Array.from(
    new Set(cleanMaterias.map(m => String(m?.especialidadDestino || '').trim()).filter(Boolean))
  );

  if (!currentEsp || firstMatEsp !== prevFirstMatEsp || (uniqueMatEsps.length === 1 && uniqueMatEsps[0] !== currentEsp)) {
    return firstMatEsp;
  }
  return currentEsp;
}

export function useStaffValidation({
  academicPeriodsList = [],
  filterPeriodo = 'Todos',
  staffList = [],
  setStaffList,
  fetchStaff,
  staffToView,
  setStaffToView,
  setCursosList
}) {
  const [staffToValidate, setStaffToValidate] = useState(null);
  const [validationForm, setValidationForm] = useState({
    periodoAcademico: '',
    semanas: 15,
    fechaDesde: '',
    fechaHasta: ''
  });
  const [materiasForm, setMateriasForm] = useState([]);

  const handleOpenValidate = (staff) => {
    const activePeriodObj = academicPeriodsList.find(p => p.estado === 'ACTIVO');
    const staffPeriodObj = academicPeriodsList.find(p => p.nombre === staff.periodoAcademico);
    const selectedPeriodName = (filterPeriodo !== 'Todos' ? filterPeriodo : null) 
      || (staffPeriodObj && staffPeriodObj.estado === 'ACTIVO' ? staff.periodoAcademico : null)
      || activePeriodObj?.nombre 
      || staff.periodoAcademico 
      || '2026-II';
    const periodObj = academicPeriodsList.find(p => p.nombre === selectedPeriodName) || activePeriodObj;

    // REGLA ESTRICTA INSTITUCIONAL:
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
      setMateriasForm([{
        nombre: '',
        especialidadDestino: staff.especialidad || '',
        seccion: '',
        cupos: '',
        inscritos: '',
        cohorte: '',
        horasSemanal: 0,
        horasLapso: 0
      }]);
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
    setMateriasForm([
      ...materiasForm,
      {
        nombre: '',
        especialidadDestino: staffToValidate?.especialidad || '',
        seccion: '',
        cupos: '',
        inscritos: '',
        cohorte: '',
        horasSemanal: 0,
        horasLapso: 0
      }
    ]);
  };

  const removeMateria = (index) => {
    setMateriasForm(materiasForm.filter((_, i) => i !== index));
  };

  const handleCopyMateriasFromHistory = (materias, periodo) => {
    if (!materias || materias.length === 0) {
      alert('Este período no tiene materias registradas.');
      return;
    }
    setMateriasForm(materias.map(m => ({
      nombre: m.nombre || '',
      especialidadDestino: m.especialidadDestino || '',
      seccion: m.seccion || '',
      cupos: m.cupos || '',
      inscritos: m.inscritos || '',
      cohorte: (() => {
        const raw = (m.cohorte !== undefined && m.cohorte !== null) ? String(m.cohorte).trim() : '';
        return (raw && raw !== periodo && raw !== '2026-I' && raw !== '2026-II') ? raw : '';
      })(),
      horasSemanal: m.horasSemanal || 0,
      horasLapso: m.horasLapso || 0
    })));
    alert(`¡Carga copiada! Se copiaron las ${materias.length} materias del período ${periodo} al formulario actual.`);
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
        if (setStaffList) setStaffList(updatedList);
        if (fetchStaff) await fetchStaff(filterPeriodo);
        if (staffToView && staffToView.cedula === staffToValidate.cedula && setStaffToView) {
          setStaffToView({
            ...staffToView,
            ...validationForm,
            especialidad: finalEspecialidad,
            materias: cleanMaterias,
            status: 'Activo'
          });
        }
        alert('¡Carga académica y validación guardadas con éxito en la base de datos MySQL!');
      } else {
        alert('Hubo un error al guardar en la base de datos.');
      }
    } catch (error) {
      console.error("Error saving validation:", error);
      alert(error?.message || 'Hubo un error al guardar en la base de datos.');
    } finally {
      setStaffToValidate(null);
    }
  };

  const handleAddMateriaGlobal = async () => {
    const newName = window.prompt("Ingrese el nombre de la nueva materia o unidad curricular:");
    if (!newName || !newName.trim()) return;
    try {
      const res = await addMateriaCatalogo(newName.trim());
      if (res) {
        const catalogo = await getCatalogoMaterias();
        if (setCursosList) setCursosList(catalogo || []);
        alert(`Materia "${newName.trim()}" añadida exitosamente al catálogo institucional.`);
      }
    } catch (err) {
      alert("Error al guardar en catálogo: " + err.message);
    }
  };

  return {
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
  };
}
