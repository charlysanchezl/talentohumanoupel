import { useState, useEffect, useCallback, useMemo } from 'react';
import { getStaffData, invalidateStaffCache } from '../data';

/**
 * Custom Hook de Nivel Senior: useDocentes
 * Abstrae la obtención, caché, estados de carga y cómputo de métricas docentes.
 * Desacopla la lógica de negocio de los componentes visuales (StaffList, ConsultarDocentes, etc.)
 * 
 * @param {string} [periodo='Todos'] - Lapso académico a consultar
 * @param {string} [initialDepartment='Todos'] - Departamento inicial de filtrado
 * @returns {object} Estado, utilidades y métricas consolidadas
 */
export function useDocentes(periodo = 'Todos', initialDepartment = 'Todos') {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(initialDepartment);
  const [searchTerm, setSearchTerm] = useState('');

  // Carga reactiva de nómina
  const loadDocentes = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      if (forceRefresh) {
        invalidateStaffCache();
      }
      const data = await getStaffData(periodo);
      setDocentes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[useDocentes] Error al cargar nómina docente:', err);
      setError(err.message || 'Error al conectar con la base de datos');
    } finally {
      setLoading(false);
    }
  }, [periodo]);

  // Carga silenciosa en segundo plano para sincronización en tiempo real (Zero-Flicker)
  const silentReload = useCallback(async () => {
    try {
      invalidateStaffCache();
      const data = await getStaffData(periodo);
      if (Array.isArray(data)) {
        setDocentes(data);
      }
    } catch (err) {
      console.warn('[useDocentes] Sincronización en segundo plano advertencia:', err.message);
    }
  }, [periodo]);

  useEffect(() => {
    loadDocentes();
  }, [loadDocentes]);

  // Sincronización en tiempo real sin WebSockets pesados (SSE + Smart Polling Fallback)
  useEffect(() => {
    let eventSource = null;
    let fallbackInterval = null;
    let lastKnownVersion = null;

    function startSmartPolling() {
      if (fallbackInterval) return;
      fallbackInterval = setInterval(async () => {
        try {
          const res = await fetch('/api/sync/version');
          if (res.ok) {
            const data = await res.json();
            if (data && data.version) {
              if (lastKnownVersion && data.version > lastKnownVersion) {
                lastKnownVersion = data.version;
                silentReload();
              } else if (!lastKnownVersion) {
                lastKnownVersion = data.version;
              }
            }
          }
        } catch (pollErr) {}
      }, 25000);
    }

    if (typeof window !== 'undefined' && 'EventSource' in window) {
      try {
        eventSource = new EventSource('/api/sync/events');

        eventSource.onmessage = (e) => {
          try {
            const payload = JSON.parse(e.data);
            if (payload && (payload.type === 'change' || payload.type === 'connected')) {
              if (payload.timestamp && payload.timestamp !== lastKnownVersion) {
                const isFirst = lastKnownVersion === null;
                lastKnownVersion = payload.timestamp;
                if (!isFirst && (payload.entity === 'docentes' || payload.entity === 'general')) {
                  silentReload();
                }
              }
            }
          } catch (parseErr) {}
        };

        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          startSmartPolling();
        };
      } catch (e) {
        startSmartPolling();
      }
    } else {
      startSmartPolling();
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
      }
    };
  }, [silentReload]);

  // Refrescar datos invalidando caché
  const refresh = useCallback(() => {
    return loadDocentes(true);
  }, [loadDocentes]);

  // Lista filtrada reactiva (memoizada)
  const filteredDocentes = useMemo(() => {
    return docentes.filter((doc) => {
      // Filtro por departamento
      if (selectedDepartment && selectedDepartment !== 'Todos') {
        const docDept = (doc.department || '').toLowerCase();
        const targetDept = selectedDepartment.toLowerCase();
        if (!docDept.includes(targetDept) && !targetDept.includes(docDept)) {
          return false;
        }
      }

      // Filtro por término de búsqueda (Cédula, Nombres, Apellidos, Especialidad)
      if (searchTerm && searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase().trim();
        const cedula = (doc.cedula || '').toLowerCase();
        const nombre = `${doc.nombres || ''} ${doc.apellidos || ''}`.toLowerCase();
        const especialidad = (doc.especialidad || '').toLowerCase();
        const materias = (doc.materias || []).map(m => (m.nombre || '').toLowerCase()).join(' ');

        return (
          cedula.includes(query) ||
          nombre.includes(query) ||
          especialidad.includes(query) ||
          materias.includes(query)
        );
      }

      return true;
    });
  }, [docentes, selectedDepartment, searchTerm]);

  // Métricas agregadas y estadísticas institucionales (Zero-Recompute)
  const stats = useMemo(() => {
    let totalHoras = 0;
    let totalMaterias = 0;
    const byDepartment = {};
    const byStatus = {};
    const bySede = {};

    docentes.forEach((doc) => {
      const dept = doc.department || 'Sin Asignar';
      const status = doc.status || 'Por Revisar';
      const sede = doc.sedeCentro || 'Rubio';

      const docHoras = (doc.materias || []).reduce(
        (sum, m) => sum + (parseInt(m.horasSemanal, 10) || 0),
        0
      );
      const docMateriasCount = (doc.materias || []).length;

      totalHoras += docHoras;
      totalMaterias += docMateriasCount;

      // Desglose por departamento
      if (!byDepartment[dept]) {
        byDepartment[dept] = { docentes: 0, horas: 0, materias: 0 };
      }
      byDepartment[dept].docentes += 1;
      byDepartment[dept].horas += docHoras;
      byDepartment[dept].materias += docMateriasCount;

      // Desglose por estado
      byStatus[status] = (byStatus[status] || 0) + 1;

      // Desglose por sede
      bySede[sede] = (bySede[sede] || 0) + 1;
    });

    return {
      totalDocentes: docentes.length,
      totalHoras,
      totalMaterias,
      promedioHorasPorDocente: docentes.length > 0 ? (totalHoras / docentes.length).toFixed(1) : 0,
      byDepartment,
      byStatus,
      bySede
    };
  }, [docentes]);

  return {
    docentes,
    filteredDocentes,
    loading,
    error,
    refresh,
    selectedDepartment,
    setSelectedDepartment,
    searchTerm,
    setSearchTerm,
    stats
  };
}

export default useDocentes;
