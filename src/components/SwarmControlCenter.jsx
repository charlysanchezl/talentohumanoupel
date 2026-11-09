import React, { useState, useEffect } from 'react';
import { 
  Cpu, ShieldAlert, MapPin, BookOpen, BrainCircuit, RefreshCw, 
  CheckCircle2, AlertTriangle, MessageSquare, ArrowRight, 
  Sparkles, Terminal, FileText, Check, ChevronDown, ChevronUp, Users, Copy
} from 'lucide-react';
import { getStaffData, getCatalogoMaterias, getCurrentUser } from '../data';
import { executeSwarm } from '../services/swarmEngine';

const SwarmControlCenter = () => {
  const user = getCurrentUser();
  const [loading, setLoading] = useState(true);
  const [swarmData, setSwarmData] = useState(null);
  const [selectedAgentDetail, setSelectedAgentDetail] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('dialogue'); // 'dialogue' | 'resolutions' | 'details'

  const runAnalysis = async () => {
    try {
      setLoading(true);
      const [staff, catalogo] = await Promise.all([
        getStaffData(),
        getCatalogoMaterias()
      ]);
      const results = await executeSwarm({ staffList: staff, catalogoMaterias: catalogo });
      setSwarmData(results);
    } catch (err) {
      console.error('Error al ejecutar el Enjambre Multi-Agente:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, []);

  const handleCopyVerdict = () => {
    if (!swarmData) return;
    const text = `DICTAMEN OFICIAL DEL ENJAMBRE AUTÓNOMO (UPEL SWARM v2027)\nFecha: ${swarmData.verdict.fecha}\nNivel de Riesgo: ${swarmData.verdict.nivelRiesgoAcademico}\n\nResumen:\n${swarmData.verdict.resumenEjecutivo}\n\nResoluciones Aprobadas:\n${swarmData.resolutions.map(r => `• [${r.id}] ${r.titulo}: ${r.accionInmediata}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem' }}>
      {/* Banner Principal Futurista */}
      <div style={{
        background: 'linear-gradient(135deg, #0a0f1d 0%, #001f3f 50%, #003366 100%)',
        color: 'white',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 20px 25px -5px rgba(0, 51, 102, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow decorativo de fondo */}
        <div style={{
          position: 'absolute',
          top: '-60px',
          right: '-60px',
          width: '240px',
          height: '240px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(0,0,0,0) 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }}></div>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <span style={{
                background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                color: '#022c22',
                padding: '0.25rem 0.65rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <Sparkles size={12} /> UPEL SWARM v2027
              </span>
              <span style={{
                background: 'rgba(255,255,255,0.1)',
                color: '#94a3b8',
                padding: '0.25rem 0.6rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 600
              }}>
                Arquitectura Multi-Agente Autónoma
              </span>
            </div>

            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Centro de Control del Enjambre Académico
            </h1>
            <p style={{ margin: 0, fontSize: '0.92rem', color: '#cbd5e1', maxWidth: '700px', lineHeight: 1.5 }}>
              Cuatro agentes de software autónomos analizan permanentemente la nómina, dialogan entre sí para mitigar sobrecargas, resuelven materias desatendidas y equilibran las sedes foráneas de la UPEL.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleCopyVerdict}
              disabled={!swarmData}
              style={{
                background: copied ? '#059669' : 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: 'white',
                padding: '0.65rem 1.1rem',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 600,
                fontSize: '0.85rem',
                transition: 'all 0.2s'
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? '¡Dictamen Copiado!' : 'Copiar Dictamen'}
            </button>

            <button
              onClick={runAnalysis}
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                color: 'white',
                padding: '0.65rem 1.25rem',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 700,
                fontSize: '0.88rem',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
              }}
            >
              <RefreshCw size={16} className={loading ? 'spin' : ''} />
              {loading ? 'Sincronizando Enjambre...' : 'Ejecutar Negociación de Enjambre'}
            </button>
          </div>
        </div>
      </div>

      {/* Grid de los 4 Agentes Autónomos */}
      {swarmData && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}>
          {/* Card 1: Agente Auditor */}
          <div 
            onClick={() => setSelectedAgentDetail(selectedAgentDetail === 'auditor' ? null : 'auditor')}
            style={{
              background: 'white',
              borderRadius: '14px',
              border: selectedAgentDetail === 'auditor' ? '2px solid #ef4444' : '1px solid #e2e8f0',
              padding: '1.4rem',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: '#fee2e2', color: '#ef4444',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.3rem'
                }}>
                  ⚖️
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: 700 }}>Agente Auditor</h3>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Normativa & Horas</div>
                </div>
              </div>
              <span style={{
                background: swarmData.agents.auditor.stats.sobrecargas > 0 ? '#fef2f2' : '#ecfdf5',
                color: swarmData.agents.auditor.stats.sobrecargas > 0 ? '#dc2626' : '#059669',
                fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '999px'
              }}>
                {swarmData.agents.auditor.stats.sobrecargas > 0 ? 'ALERTAS' : 'ÓPTIMO'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Sobrecargas:</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ef4444' }}>
                  {swarmData.agents.auditor.stats.sobrecargas}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Sin Carga:</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b' }}>
                  {swarmData.agents.auditor.stats.cargaVacia}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{swarmData.agents.auditor.stats.docentesAuditados} evaluados</span>
              <span style={{ color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                Ver detalles {selectedAgentDetail === 'auditor' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </span>
            </div>
          </div>

          {/* Card 2: Agente Territorial */}
          <div 
            onClick={() => setSelectedAgentDetail(selectedAgentDetail === 'territory' ? null : 'territory')}
            style={{
              background: 'white',
              borderRadius: '14px',
              border: selectedAgentDetail === 'territory' ? '2px solid #0284c7' : '1px solid #e2e8f0',
              padding: '1.4rem',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: '#e0f2fe', color: '#0284c7',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.3rem'
                }}>
                  🗺️
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: 700 }}>Agente Territorial</h3>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Balance de Sedes</div>
                </div>
              </div>
              <span style={{
                background: '#e0f2fe', color: '#0369a1',
                fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '999px'
              }}>
                3 SEDES
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Sede Rubio:</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#003366' }}>
                  {swarmData.agents.territory.stats.docentesEnSedePrincipal}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Extensiones:</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284c7' }}>
                  {swarmData.agents.territory.stats.docentesSabanaMendoza + swarmData.agents.territory.stats.docentesEncontrados}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Monitoreo foráneo</span>
              <span style={{ color: '#0284c7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                Ver balance {selectedAgentDetail === 'territory' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </span>
            </div>
          </div>

          {/* Card 3: Agente Curricular */}
          <div 
            onClick={() => setSelectedAgentDetail(selectedAgentDetail === 'curriculum' ? null : 'curriculum')}
            style={{
              background: 'white',
              borderRadius: '14px',
              border: selectedAgentDetail === 'curriculum' ? '2px solid #8b5cf6' : '1px solid #e2e8f0',
              padding: '1.4rem',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: '#ede9fe', color: '#8b5cf6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.3rem'
                }}>
                  📚
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: 700 }}>Agente Curricular</h3>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Oferta & Demanda</div>
                </div>
              </div>
              <span style={{
                background: '#fef3c7', color: '#b45309',
                fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '999px'
              }}>
                DEMANDA
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Asignadas:</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
                  {swarmData.agents.curriculum.stats.materiasImpartidas}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Huérfanas:</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706' }}>
                  {swarmData.agents.curriculum.stats.materiasHuerfanas}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{swarmData.agents.curriculum.stats.totalCatalogo} en catálogo</span>
              <span style={{ color: '#8b5cf6', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                Ver vacantes {selectedAgentDetail === 'curriculum' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </span>
            </div>
          </div>

          {/* Card 4: Orquestador Ejecutivo */}
          <div 
            onClick={() => setSelectedAgentDetail(selectedAgentDetail === 'orchestrator' ? null : 'orchestrator')}
            style={{
              background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
              borderRadius: '14px',
              border: '1px solid #10b981',
              padding: '1.4rem',
              color: 'white',
              boxShadow: '0 4px 12px rgba(6, 95, 70, 0.25)',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.3rem'
                }}>
                  🧠
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: 'white', fontWeight: 700 }}>Orquestador</h3>
                  <div style={{ fontSize: '0.75rem', color: '#a7f3d0' }}>Consenso Directivo</div>
                </div>
              </div>
              <span style={{
                background: '#10b981', color: 'white',
                fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '999px'
              }}>
                CONSENSO
              </span>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#a7f3d0' }}>Estado del Enjambre:</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white' }}>
                {swarmData.verdict.status.replace('_', ' ')}
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Riesgo: {swarmData.verdict.nivelRiesgoAcademico}</span>
              <span style={{ color: '#6ee7b7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                Ver resolución {selectedAgentDetail === 'orchestrator' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Desglose de Detalle según el Agente Seleccionado */}
      {selectedAgentDetail === 'auditor' && swarmData && (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #fecaca', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} /> Hallazgos Detallados del Agente Auditor
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#fef2f2', borderBottom: '2px solid #fecaca', textAlign: 'left' }}>
                  <th style={{ padding: '0.6rem' }}>Docente</th>
                  <th style={{ padding: '0.6rem' }}>Sede</th>
                  <th style={{ padding: '0.6rem' }}>Dedicación</th>
                  <th style={{ padding: '0.6rem', textAlign: 'center' }}>Hrs Asignadas</th>
                  <th style={{ padding: '0.6rem', textAlign: 'center' }}>Tope Máximo</th>
                  <th style={{ padding: '0.6rem', textAlign: 'center' }}>Exceso</th>
                  <th style={{ padding: '0.6rem', textAlign: 'center' }}>Severidad</th>
                </tr>
              </thead>
              <tbody>
                {swarmData.agents.auditor.findings.overloads.map(o => (
                  <tr key={o.cedula} style={{ borderBottom: '1px solid #fee2e2' }}>
                    <td style={{ padding: '0.6rem', fontWeight: 600 }}>{o.nombre} ({o.cedula})</td>
                    <td style={{ padding: '0.6rem' }}>{o.sede}</td>
                    <td style={{ padding: '0.6rem' }}>{o.dedicacion}</td>
                    <td style={{ padding: '0.6rem', textAlign: 'center', fontWeight: 700, color: '#ef4444' }}>{o.horasActuales}h</td>
                    <td style={{ padding: '0.6rem', textAlign: 'center' }}>{o.maxPermitido}h</td>
                    <td style={{ padding: '0.6rem', textAlign: 'center', color: '#dc2626', fontWeight: 700 }}>+{o.exceso}h</td>
                    <td style={{ padding: '0.6rem', textAlign: 'center' }}>
                      <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {o.severidad}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedAgentDetail === 'curriculum' && swarmData && (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #ddd6fe', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={18} /> Materias Huérfanas y Propuestas de Asignación del Enjambre
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {swarmData.agents.curriculum.findings.orphanSubjects.map((mat, idx) => (
              <div key={idx} style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ fontWeight: 700, color: '#581c87', fontSize: '0.95rem' }}>{mat.nombre}</div>
                <div style={{ fontSize: '0.8rem', color: '#7e22ce', margin: '0.4rem 0' }}>
                  Prioridad: <strong>Alta Demanda</strong>
                </div>
                {mat.candidatoSugerido ? (
                  <div style={{ background: 'white', border: '1px dashed #c084fc', padding: '0.6rem', borderRadius: '6px', fontSize: '0.8rem', color: '#3b0764' }}>
                    <div><strong>Candidato Idóneo:</strong> {mat.candidatoSugerido.nombre}</div>
                    <div style={{ color: '#6b21a8' }}>{mat.candidatoSugerido.department} • {mat.candidatoSugerido.sede}</div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.78rem', color: '#9333ea', fontStyle: 'italic' }}>
                    Requiere convocatoria o contratación externa
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pestañas de Vista: Terminal de Diálogo vs Resoluciones */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('dialogue')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'dialogue' ? '3px solid #003366' : '3px solid transparent',
            color: activeTab === 'dialogue' ? '#003366' : '#64748b',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.95rem'
          }}
        >
          <Terminal size={18} /> Terminal de Diálogo Inter-Agente en Vivo
        </button>

        <button
          onClick={() => setActiveTab('resolutions')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'resolutions' ? '3px solid #003366' : '3px solid transparent',
            color: activeTab === 'resolutions' ? '#003366' : '#64748b',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.95rem'
          }}
        >
          <FileText size={18} /> Resoluciones Directivas Oficiales ({swarmData?.resolutions?.length || 0})
        </button>
      </div>

      {/* Contenido Pestaña 1: Terminal de Diálogo en Vivo */}
      {activeTab === 'dialogue' && swarmData && (
        <div style={{
          background: '#0a0f1d',
          borderRadius: '14px',
          border: '1px solid #1e293b',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          marginBottom: '2.5rem'
        }}>
          {/* Header Terminal */}
          <div style={{
            background: '#0f172a',
            padding: '0.75rem 1.25rem',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></div>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></div>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></div>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontFamily: 'monospace', fontWeight: 600 }}>
                UPEL_SWARM_INTER_AGENT_BUS_v2027 • CANAL DE TRANSMISIÓN CRIPTOGRÁFICO
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'monospace' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
              ENJAMBRE SINCRONIZADO
            </div>
          </div>

          {/* Ventana de Mensajes */}
          <div style={{ padding: '1.25rem', maxHeight: '450px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {swarmData.dialogue.map(msg => {
              let badgeBg = '#1e293b';
              let badgeColor = '#94a3b8';

              if (msg.from === 'AuditorAgent') { badgeBg = '#450a0a'; badgeColor = '#f87171'; }
              else if (msg.from === 'TerritoryAgent') { badgeBg = '#082f49'; badgeColor = '#38bdf8'; }
              else if (msg.from === 'CurriculumAgent') { badgeBg = '#2e1065'; badgeColor = '#c084fc'; }
              else if (msg.from === 'Orchestrator') { badgeBg = '#064e3b'; badgeColor = '#34d399'; }

              return (
                <div key={msg.id} style={{
                  display: 'flex',
                  gap: '0.85rem',
                  alignItems: 'flex-start',
                  fontSize: '0.86rem',
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  background: 'rgba(255, 255, 255, 0.02)',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  borderLeft: `3px solid ${badgeColor}`
                }}>
                  <span style={{ fontSize: '1.1rem' }}>{msg.avatar}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                      <span style={{ background: badgeBg, color: badgeColor, padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                        {msg.from}
                      </span>
                      <span style={{ color: '#475569', fontSize: '0.72rem' }}>{msg.timestamp}</span>
                    </div>
                    <div style={{ color: '#e2e8f0', lineHeight: 1.45 }}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Contenido Pestaña 2: Resoluciones Directivas Oficiales */}
      {activeTab === 'resolutions' && swarmData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {swarmData.resolutions.map(res => (
            <div key={res.id} style={{
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '1.5rem',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ background: '#003366', color: 'white', fontWeight: 800, padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem' }}>
                    {res.id}
                  </span>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>{res.titulo}</h3>
                </div>
                <span style={{ background: '#ecfdf5', color: '#065f46', fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '999px', border: '1px solid #a7f3d0' }}>
                  {res.impacto}
                </span>
              </div>

              <p style={{ margin: 0, color: '#475569', fontSize: '0.88rem', lineHeight: 1.5 }}>
                {res.descripcion}
              </p>

              <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', borderLeft: '4px solid #10b981', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#1e293b' }}>
                <CheckCircle2 size={16} color="#10b981" />
                <span><strong>Acción Directiva Recomendada:</strong> {res.accionInmediata}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SwarmControlCenter;
