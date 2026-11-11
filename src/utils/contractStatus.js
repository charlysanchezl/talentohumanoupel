/**
 * Utilidad de Evaluación de Estatus Contractual - UPEL SIGOA
 * Determina dinámicamente el estado contractual de un docente según:
 * 1. Inactivos: porque no tienen carga académica (0 asignaturas o 0 horas)
 * 2. Contratos Vencidos: porque ya se cerró el lapso activo o la fecha culminó
 * 3. Por Revisar: que aún el jefe de dpto no le ha verificado/validado la carga
 * 4. Por Vencer: docentes validados con carga que vencen 30 días antes de la fecha
 * 5. Activos Vigentes: todos los docentes que ya están validados con carga académica vigente
 */

export const getDocenteContractStatus = (docente, periodsList = []) => {
  if (!docente) return 'Inactivo';

  // 1. Inactivos: porque no tienen carga académica asignada
  const materias = Array.isArray(docente.materias) ? docente.materias : [];
  const totalHoras = materias.reduce((acc, m) => acc + (parseInt(m.horasSemanal) || 0), 0) 
    || parseInt(docente.totalHorasSemanal) 
    || 0;

  if (materias.length === 0 || totalHoras === 0 || docente.status === 'Inactivo' || docente.status === 'Sin Carga') {
    return 'Inactivo';
  }

  // 2. Período académico asociado
  const periodCode = docente.periodoAcademico;
  const periodObj = periodsList.find(p => p.nombre === periodCode);
  const estadoPeriodo = periodObj?.estado;

  // Contratos Vencidos: porque ya se cerró el lapso académico
  if (estadoPeriodo === 'CERRADO') {
    return 'Vencido';
  }

  // Si el lapso oficial está en Planificación
  if (estadoPeriodo === 'PLANIFICACION') {
    return 'Planificación';
  }

  // 3. Por Revisar: que aún el jefe de dpto no le ha verificado/validado la carga
  const isValidada = docente.status === 'Activo' || docente.status === 'Validado';
  if (!isValidada) {
    return 'Por Revisar';
  }

  // 4. Por Vencer: 30 días antes de la fecha límite para docentes validados
  const fechaFinStr = docente.fechaHasta || docente.fechaFinContrato || periodObj?.fechaHasta;
  if (fechaFinStr && typeof fechaFinStr === 'string' && fechaFinStr.includes('-')) {
    const parts = fechaFinStr.split('-').map(Number);
    if (parts.length === 3) {
      const [year, month, day] = parts;
      const fechaFin = new Date(year, month - 1, day, 23, 59, 59);
      const hoy = new Date();

      // Si la fecha ya venció
      if (fechaFin.getTime() < hoy.getTime()) {
        return 'Vencido';
      }

      // Si faltan 30 días o menos
      const diffMs = fechaFin.getTime() - hoy.getTime();
      const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (diffDias <= 30) {
        return 'Por Vencer';
      }
    }
  }

  // 5. Activos Vigentes: todos los docentes que ya están validados con oferta académica
  return 'Activo';
};

/**
 * Devuelve información de visualización (etiqueta, color de badge y clase) para el estatus contractual
 */
export const getStatusBadgeInfo = (status) => {
  switch (status) {
    case 'Activo':
      return { label: 'Activo Vigente', color: '#008744', bg: '#e6f6ee', border: '#bbf7d0' };
    case 'Por Revisar':
      return { label: 'Por Revisar', color: '#92400e', bg: '#fef3c7', border: '#fde68a' };
    case 'Por Vencer':
      return { label: 'Por Vencer (≤30d)', color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
    case 'Vencido':
      return { label: 'Contrato Vencido', color: '#b91c1c', bg: '#fee2e2', border: '#fecaca' };
    case 'Inactivo':
      return { label: 'Inactivo (Sin Carga)', color: '#475569', bg: '#f1f5f9', border: '#cbd5e1' };
    case 'Planificación':
      return { label: 'En Planificación', color: '#0047bb', bg: '#eff6ff', border: '#bfdbfe' };
    default:
      return { label: status || 'Por Revisar', color: '#92400e', bg: '#fef3c7', border: '#fde68a' };
  }
};

/**
 * Resuelve la especialidad real a mostrar en Directorio y Detalle:
 * Si las asignaturas asignadas en el período consultado apuntan a especialidades concretas
 * y la especialidad base no coincide con ninguna de ellas (residuo de período anterior),
 * muestra la especialidad real atendida en el período actual.
 */
export const getDisplayEspecialidad = (staff, fallback = '-') => {
  if (!staff) return fallback;
  const baseEsp = String(staff.especialidad || '').trim();
  const mats = Array.isArray(staff.materias) ? staff.materias : [];
  const matEsps = Array.from(
    new Set(mats.map(m => String(m?.especialidadDestino || '').trim()).filter(Boolean))
  );
  if (matEsps.length > 0 && (!baseEsp || !matEsps.includes(baseEsp))) {
    return matEsps[0];
  }
  return baseEsp || matEsps[0] || String(staff.titulosPregrado || '').trim() || fallback;
};
