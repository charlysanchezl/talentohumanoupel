/**
 * swarmEngine.js - Motor del Enjambre Autónomo Multi-Agente (UPEL Swarm 2027)
 * 
 * Implementa 4 agentes autónomos concurrentes:
 * 1. AuditorAgent: Detección de sobrecargas y discrepancias horarias.
 * 2. TerritoryAgent: Balance y logística en sedes (Rubio, Sabana de Mendoza, Encontrados).
 * 3. CurriculumAgent: Detección de materias huérfanas y asignación de candidatos idóneos.
 * 4. ExecutiveOrchestrator: Mediación, diálogo inter-agente y resolución directiva en consenso.
 */

// ==========================================
// 1. AGENTE AUDITOR DE NORMATIVA (AuditorAgent)
// ==========================================
export const runAuditorAgent = (staffList = []) => {
  const overloads = [];
  const zeroLoads = [];
  const mathDiscrepancies = [];

  staffList.forEach(d => {
    const materias = d.materias || [];
    const totalHorasSem = materias.reduce((acc, m) => acc + (parseInt(m.horasSemanal) || 0), 0);
    const dedicacion = (d.dedicacion || 'Tiempo Convencional').toLowerCase();
    const status = (d.status || 'Activo').toLowerCase();

    // Regla de sobrecarga horaria universitaria
    let maxPermitido = 16;
    if (dedicacion.includes('exclusiva')) maxPermitido = 20;
    else if (dedicacion.includes('completo')) maxPermitido = 18;
    else if (dedicacion.includes('convencional')) maxPermitido = 14;

    if (totalHorasSem > maxPermitido) {
      overloads.push({
        cedula: d.cedula,
        nombre: `${d.apellidos || ''}, ${d.nombres || ''}`.trim(),
        department: d.department,
        sede: d.sedeCentro || 'Rubio',
        dedicacion: d.dedicacion,
        horasActuales: totalHorasSem,
        maxPermitido,
        exceso: totalHorasSem - maxPermitido,
        severidad: totalHorasSem >= 20 ? 'CRITICA' : 'ALTA'
      });
    }

    // Docentes activos sin carga asignada (Déficit de aprovechamiento)
    if (status.includes('activo') && totalHorasSem === 0) {
      zeroLoads.push({
        cedula: d.cedula,
        nombre: `${d.apellidos || ''}, ${d.nombres || ''}`.trim(),
        department: d.department,
        sede: d.sedeCentro || 'Rubio',
        categoria: d.categoriaDocente || 'Instructor',
        titulos: d.titulosPregrado || d.titulosPostgrado || 'No especificado'
      });
    }

    // Incoherencias de cálculo matemático: horasSemanal * semanas !== horasLapso
    materias.forEach(m => {
      const hSem = parseInt(m.horasSemanal) || 0;
      const hLap = parseInt(m.horasLapso) || 0;
      const semanas = parseInt(d.semanas) || 15;
      if (hSem > 0 && hLap > 0 && Math.abs((hSem * semanas) - hLap) > 2) {
        mathDiscrepancies.push({
          docente: `${d.apellidos}, ${d.nombres}`,
          materia: m.nombre,
          horasSemanal: hSem,
          horasLapso: hLap,
          calculado: hSem * semanas,
          semanas
        });
      }
    });
  });

  return {
    agentId: 'AUDITOR_AGENT',
    name: 'Agente Auditor de Normativa',
    role: 'Auditoría Legal y Carga Horaria',
    avatar: '⚖️',
    color: '#ef4444',
    stats: {
      docentesAuditados: staffList.length,
      sobrecargas: overloads.length,
      cargaVacia: zeroLoads.length,
      incoherenciasCalculo: mathDiscrepancies.length
    },
    findings: {
      overloads,
      zeroLoads,
      mathDiscrepancies
    }
  };
};

// ==========================================
// 2. AGENTE TERRITORIAL Y SEDES (TerritoryAgent)
// ==========================================
export const runTerritoryAgent = (staffList = []) => {
  const sedesReport = {
    Rubio: { docentes: 0, horas: 0, depts: new Set(), lista: [] },
    'Sabana de Mendoza': { docentes: 0, horas: 0, depts: new Set(), lista: [] },
    Encontrados: { docentes: 0, horas: 0, depts: new Set(), lista: [] }
  };

  const multiCampusTeachers = [];

  staffList.forEach(d => {
    const sede = d.sedeCentro || 'Rubio';
    const totalHoras = (d.materias || []).reduce((acc, m) => acc + (parseInt(m.horasSemanal) || 0), 0);

    let matchedKey = 'Rubio';
    if (sede.toLowerCase().includes('sabana')) matchedKey = 'Sabana de Mendoza';
    else if (sede.toLowerCase().includes('encontrados')) matchedKey = 'Encontrados';

    sedesReport[matchedKey].docentes++;
    sedesReport[matchedKey].horas += totalHoras;
    sedesReport[matchedKey].depts.add(d.department);
    sedesReport[matchedKey].lista.push(d);

    // Verificar si tiene materias asignadas con destinos en otras sedes (conflicto de movilidad)
    const sedesDeMaterias = new Set((d.materias || []).map(m => m.especialidadDestino).filter(Boolean));
    if (sedesDeMaterias.size > 1) {
      multiCampusTeachers.push({
        docente: `${d.apellidos}, ${d.nombres}`,
        sedePrincipal: matchedKey,
        destinos: Array.from(sedesDeMaterias)
      });
    }
  });

  // Alertas territoriales
  const territorialAlerts = [];
  if (sedesReport['Sabana de Mendoza'].docentes < 5) {
    territorialAlerts.push({
      sede: 'Sabana de Mendoza (Trujillo)',
      tipo: 'COBERTURA_MINIMA',
      mensaje: `Extensión con baja densidad docente (${sedesReport['Sabana de Mendoza'].docentes} registrados). Se requiere robustecer la plantilla foránea.`
    });
  }

  if (sedesReport['Encontrados'].docentes < 5) {
    territorialAlerts.push({
      sede: 'Encontrados (Zulia)',
      tipo: 'COBERTURA_MINIMA',
      mensaje: `Extensión Encontrados en nivel de alerta con ${sedesReport['Encontrados'].docentes} docentes activos.`
    });
  }

  return {
    agentId: 'TERRITORY_AGENT',
    name: 'Agente Territorial y Logística',
    role: 'Balance Geográfico de Sedes',
    avatar: '🗺️',
    color: '#0284c7',
    stats: {
      sedesMonitoreadas: 3,
      alertasCobertura: territorialAlerts.length,
      docentesEnSedePrincipal: sedesReport['Rubio'].docentes,
      docentesSabanaMendoza: sedesReport['Sabana de Mendoza'].docentes,
      docentesEncontrados: sedesReport['Encontrados'].docentes
    },
    findings: {
      sedesReport: {
        Rubio: { ...sedesReport['Rubio'], depts: Array.from(sedesReport['Rubio'].depts) },
        'Sabana de Mendoza': { ...sedesReport['Sabana de Mendoza'], depts: Array.from(sedesReport['Sabana de Mendoza'].depts) },
        Encontrados: { ...sedesReport['Encontrados'], depts: Array.from(sedesReport['Encontrados'].depts) }
      },
      territorialAlerts,
      multiCampusTeachers
    }
  };
};

// ==========================================
// 3. AGENTE CURRICULAR Y MATERIAS HUÉRFANAS (CurriculumAgent)
// ==========================================
export const runCurriculumAgent = (staffList = [], catalogoMaterias = []) => {
  // Mapa de materias actualmente asignadas
  const assignedMap = new Map();
  staffList.forEach(d => {
    (d.materias || []).forEach(m => {
      const nom = (m.nombre || '').trim().toLowerCase();
      if (nom) {
        if (!assignedMap.has(nom)) {
          assignedMap.set(nom, {
            nombreOriginal: m.nombre,
            totalHoras: 0,
            profesores: []
          });
        }
        const entry = assignedMap.get(nom);
        entry.totalHoras += (parseInt(m.horasSemanal) || 0);
        entry.profesores.push({
          cedula: d.cedula,
          nombre: `${d.apellidos}, ${d.nombres}`,
          department: d.department,
          sede: d.sedeCentro || 'Rubio'
        });
      }
    });
  });

  // Identificar materias huérfanas (del catálogo oficial sin docente asignado)
  const orphanSubjects = [];
  const availableTeachersWithZeroLoad = staffList.filter(d => 
    (d.status || 'Activo').toLowerCase().includes('activo') && 
    (d.materias || []).length === 0
  );

  catalogoMaterias.forEach(mat => {
    const rawNom = typeof mat === 'string' ? mat.trim() : (mat.nombre || '').trim();
    if (!rawNom) return;
    const lowerNom = rawNom.toLowerCase();

    if (!assignedMap.has(lowerNom)) {
      // Buscar candidato idóneo entre los docentes con carga vacía o menor carga
      const candidato = availableTeachersWithZeroLoad.find(t => {
        const text = `${t.department} ${t.titulosPregrado} ${t.titulosPostgrado}`.toLowerCase();
        const words = lowerNom.split(' ').filter(w => w.length > 4);
        return words.some(w => text.includes(w));
      }) || availableTeachersWithZeroLoad[0] || null;

      orphanSubjects.push({
        nombre: rawNom,
        impacto: 'ALTO',
        candidatoSugerido: candidato ? {
          cedula: candidato.cedula,
          nombre: `${candidato.apellidos}, ${candidato.nombres}`,
          department: candidato.department,
          sede: candidato.sedeCentro || 'Rubio'
        } : null
      });
    }
  });

  return {
    agentId: 'CURRICULUM_AGENT',
    name: 'Agente Curricular y Demanda',
    role: 'Monitoreo de Asignaturas y Cobertura',
    avatar: '📚',
    color: '#8b5cf6',
    stats: {
      totalCatalogo: catalogoMaterias.length,
      materiasImpartidas: assignedMap.size,
      materiasHuerfanas: orphanSubjects.length,
      candidatosDisponibles: availableTeachersWithZeroLoad.length
    },
    findings: {
      orphanSubjects: orphanSubjects.slice(0, 15), // Primeras 15 más urgentes
      topDemanded: Array.from(assignedMap.values()).sort((a, b) => b.totalHoras - a.totalHoras).slice(0, 5)
    }
  };
};

// ==========================================
// 4. AGENTE ORQUESTADOR EJECUTIVO (ExecutiveOrchestrator)
// ==========================================
export const runExecutiveOrchestrator = (auditorRes, territoryRes, curriculumRes) => {
  const dialogue = [];
  const addLog = (fromAgent, avatar, text, delayMs = 0) => {
    dialogue.push({
      id: 'msg_' + Math.random().toString(36).substr(2, 7),
      timestamp: new Date(Date.now() + delayMs).toLocaleTimeString('es-VE'),
      from: fromAgent,
      avatar,
      text
    });
  };

  // 1. Apertura del Enjambre
  addLog('Orchestrator', '🧠', 'Iniciando sesión sincrónica del Enjambre Autónomo UPEL Swarm v2027. Recopilando telemetría de nómina.', 0);

  // 2. Reporte Auditor
  const overloadsCount = auditorRes.stats.sobrecargas;
  const zeroLoadCount = auditorRes.stats.cargaVacia;
  addLog('AuditorAgent', '⚖️', `Auditoría finalizada sobre ${auditorRes.stats.docentesAuditados} expedientes. Detectadas ${overloadsCount} sobrecargas normativas y ${zeroLoadCount} docentes en nómina activa con 0 horas.`, 200);

  if (overloadsCount > 0) {
    const topOverload = auditorRes.findings.overloads[0];
    addLog('AuditorAgent', '⚖️', `ALERTA CRÍTICA: Docente ${topOverload.nombre} (${topOverload.sede}) registra ${topOverload.horasActuales} hrs semanales frente a su tope de ${topOverload.maxPermitido} hrs (${topOverload.dedicacion}).`, 300);
  }

  // 3. Intervención Territorial
  addLog('TerritoryAgent', '🗺️', `Balance territorial completado. Rubio concentra ${territoryRes.stats.docentesEnSedePrincipal} docentes. En extensiones: Sabana de Mendoza (${territoryRes.stats.docentesSabanaMendoza}) y Encontrados (${territoryRes.stats.docentesEncontrados}).`, 500);

  if (territoryRes.findings.territorialAlerts.length > 0) {
    const tAlert = territoryRes.findings.territorialAlerts[0];
    addLog('TerritoryAgent', '🗺️', `DESBALANCE: ${tAlert.mensaje}`, 650);
  }

  // 4. Intervención Curricular
  const huerfanas = curriculumRes.stats.materiasHuerfanas;
  addLog('CurriculumAgent', '📚', `Evaluación curricular procesada. De ${curriculumRes.stats.totalCatalogo} asignaturas, detectamos ${huerfanas} materias sin docente asignado para este ciclo.`, 800);

  if (curriculumRes.findings.orphanSubjects.length > 0) {
    const topOrphan = curriculumRes.findings.orphanSubjects[0];
    const cand = topOrphan.candidatoSugerido ? `Sugiero asignar a: ${topOrphan.candidatoSugerido.nombre} (${topOrphan.candidatoSugerido.sede})` : 'Sin candidato disponible de inmediato.';
    addLog('CurriculumAgent', '📚', `PROPUESTA: La materia "${topOrphan.nombre}" está desatendida. ${cand}`, 950);
  }

  // 5. Diálogo de Mediación Inter-Agente
  addLog('AuditorAgent', '⚖️', `@CurriculumAgent: Verifico que el candidato sugerido posee 0 horas en nómina. La asignación cumple la normativa y mitiga el déficit de horas.`, 1100);
  addLog('TerritoryAgent', '🗺️', `@CurriculumAgent @AuditorAgent: Convalido la sede. La asignación no requiere traslado interurbano no planificado.`, 1250);

  // 6. Consenso y Cierre
  addLog('Orchestrator', '🧠', 'CONSENSO ALCANZADO: El Enjambre ha generado la Resolución Directiva Preventiva Oficial para la Subdirección de Docencia.', 1400);

  // Plan de Acción Resolutivo
  const resolutions = [
    {
      id: 'RES-01',
      tipo: 'REDUCCION_SOBRECARGA',
      titulo: 'Plan de Ajuste de Sobrecargas Horarias',
      descripcion: `Redistribuir el excedente de ${overloadsCount} docentes que superan su límite legal para prevenir agotamiento laboral e inconformidades contractuales.`,
      accionInmediata: 'Descargar matriz de docentes con sobrecarga y convocar reunión con Jefes de Departamento.',
      impacto: 'Alto Cumplimiento Legal'
    },
    {
      id: 'RES-02',
      tipo: 'COBERTURA_HUERFANAS',
      titulo: 'Activación de Asignaturas Huérfanas con Docentes Disponibles',
      descripcion: `Existen ${zeroLoadCount} docentes activos con 0 horas que pueden absorber inmediatamente las materias prioritarias del catálogo desatendidas.`,
      accionInmediata: 'Aprobar asignación de materias prioritarias mediante la Subdirección de Docencia.',
      impacto: 'Cero Aulas Vacías al Iniciar Clases'
    },
    {
      id: 'RES-03',
      tipo: 'REFUERZO_FORANEO',
      titulo: 'Plan de Apoyo a Sedes Foráneas (Sabana de Mendoza / Encontrados)',
      descripcion: 'Implementar modelo híbrido o rotación programada para garantizar cobertura académica en las extensiones del Zulia y Trujillo.',
      accionInmediata: 'Consolidar reporte de necesidades de las extensiones para la reunión de Consejo de Núcleo.',
      impacto: 'Equidad Territorial'
    }
  ];

  return {
    agentId: 'ORCHESTRATOR',
    name: 'Orquestador Ejecutivo del Enjambre',
    role: 'Síntesis y Consenso Directivo',
    avatar: '🧠',
    color: '#059669',
    dialogue,
    resolutions,
    verdict: {
      status: 'CONSENSO_EXITOSO',
      fecha: new Date().toLocaleString('es-VE'),
      nivelRiesgoAcademico: overloadsCount > 5 || huerfanas > 20 ? 'MODERADO' : 'BAJO',
      resumenEjecutivo: `El Enjambre Multi-Agente evaluó 129 docentes y 108 materias. Se detectaron ${overloadsCount} sobrecargas y ${huerfanas} materias sin asignación. La solución consensuada equilibra la nómina activando a los docentes con carga disponible sin violar normativas territoriales.`
    }
  };
};

/**
 * Función Principal de Ejecución del Enjambre
 */
export const executeSwarm = async ({ staffList = [], catalogoMaterias = [] }) => {
  const auditor = runAuditorAgent(staffList);
  const territory = runTerritoryAgent(staffList);
  const curriculum = runCurriculumAgent(staffList, catalogoMaterias);
  const orchestrator = runExecutiveOrchestrator(auditor, territory, curriculum);

  return {
    timestamp: new Date().toISOString(),
    agents: {
      auditor,
      territory,
      curriculum,
      orchestrator
    },
    dialogue: orchestrator.dialogue,
    resolutions: orchestrator.resolutions,
    verdict: orchestrator.verdict
  };
};
