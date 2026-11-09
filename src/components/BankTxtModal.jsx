import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, CreditCard, Download, Copy, Check, AlertTriangle, 
  CheckCircle2, Building, ShieldCheck, Filter, FileText, Info, AlertCircle,
  Upload, MessageCircle, Mail, RefreshCw, FileCheck, ArrowUpRight, Search,
  ArrowUpDown, ListOrdered, CheckSquare, Square
} from 'lucide-react';
import { 
  auditBankAccounts, 
  generateBdvPositionalTxt, 
  generateBdvDelimitedTxt, 
  generateMultibancoTxt, 
  downloadBankTxtFile,
  parseBankResponseTxt,
  generateRechazoWhatsAppUrl,
  formatTeacherTxtLine,
  cleanAccountNumber,
  padAccount20,
  parseCedula,
  getBankNameFromAccount,
  BANCOS_PREFIJOS
} from '../services/bankTxtExporter';
import { getCurrentUser } from '../data';
import BankLogo from './BankLogo';

const BankTxtModal = ({ isOpen, onClose, staffList = [], currentPeriod = 'Todos' }) => {
  const user = getCurrentUser();
  const [activeTab, setActiveTab] = useState('bdv-pos'); // 'bdv-pos' | 'bdv-del' | 'multibanco' | 'auditoria' | 'respuesta'
  const [viewMode, setViewMode] = useState('lines'); // 'lines' (tabla ordenada) | 'raw' (archivo plano)
  const [soloActivosConCarga, setSoloActivosConCarga] = useState(false);
  const [bancoFiltro, setBancoFiltro] = useState('Todos');
  const [searchDocente, setSearchDocente] = useState('');
  const [sortOrder, setSortOrder] = useState('alfabetico'); // 'alfabetico' | 'cedula' | 'banco' | 'horas'
  const [selectedStaffIds, setSelectedStaffIds] = useState(null); // Set de IDs o null para todos
  const [copied, setCopied] = useState(false);
  const [bankPage, setBankPage] = useState(1);
  const BANK_PER_PAGE = 50;

  // Resetear página al filtrar
  React.useEffect(() => {
    setBankPage(1);
  }, [activeTab, soloActivosConCarga, bancoFiltro, searchDocente, sortOrder]);

  // Estados para importación de archivo de respuesta bancaria (Opción 2)
  const [responseFileName, setResponseFileName] = useState('');
  const [responseAnalysis, setResponseAnalysis] = useState(null);
  const [responseViewFilter, setResponseViewFilter] = useState('rechazados'); // 'rechazados' | 'exitosos' | 'todos'
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // Auditoría automática sobre la lista de docentes proporcionada
  const audit = useMemo(() => {
    try {
      return auditBankAccounts(staffList || []);
    } catch (e) {
      console.error('Error al auditar cuentas bancarias:', e);
      return {
        totalDocentes: (staffList || []).length,
        cuentasValidas: 0,
        cuentasBdv: 0,
        otrosBancos: 0,
        sinCuenta: 0,
        cuentasIncompletas: 0,
        inconsistenciasPrefijo: 0,
        totalConProblemas: 0,
        docentesConError: [],
        distribucionBancos: {}
      };
    }
  }, [staffList]);

  // Filtrar y ordenar la lista de docentes para generar el TXT
  const preparedDocentesList = useMemo(() => {
    let list = [...(staffList || [])];

    // 1. Filtro según el tipo de formato bancario seleccionado
    if (activeTab === 'bdv-pos' || activeTab === 'bdv-del') {
      list = list.filter(s => {
        const c = cleanAccountNumber(s.cuentaBancaria);
        return c.length >= 16 && c.startsWith('0102');
      });
    } else if (activeTab === 'multibanco') {
      list = list.filter(s => {
        const c = cleanAccountNumber(s.cuentaBancaria);
        if (c.length < 16) return false;
        if (bancoFiltro !== 'Todos') {
          const bankName = getBankNameFromAccount(c);
          const bDecl = String(s.banco || '').toLowerCase();
          const bFiltro = bancoFiltro.toLowerCase();

          const isBdtMatch = 
            (bFiltro.includes('digital') || bFiltro.includes('bicentenario') || bFiltro.includes('bdt') || bFiltro.includes('trabajador')) &&
            (c.startsWith('0175') || bDecl.includes('digital') || bDecl.includes('bicentenario') || bDecl.includes('trabajador'));

          return isBdtMatch || 
                 bankName.toLowerCase().includes(bFiltro) || 
                 bDecl.includes(bFiltro);
        }
        return true;
      });
    }

    // 2. Filtro de carga académica asignada
    if (soloActivosConCarga) {
      list = list.filter(s => {
        const horas = (s.materias || []).reduce((acc, m) => acc + (parseInt(m.horasSemanal) || 0), 0);
        return horas > 0;
      });
    }

    // 3. Búsqueda local dentro del modal
    if (searchDocente.trim()) {
      const term = searchDocente.trim().toLowerCase();
      list = list.filter(s => {
        const fullName = `${s.apellidos || ''} ${s.nombres || ''}`.toLowerCase();
        const ci = String(s.cedula || '').toLowerCase();
        const cta = cleanAccountNumber(s.cuentaBancaria);
        return fullName.includes(term) || ci.includes(term) || cta.includes(term);
      });
    }

    // 4. Ordenamiento por línea
    list.sort((a, b) => {
      if (sortOrder === 'alfabetico') {
        const nameA = `${a.apellidos || ''} ${a.nombres || ''}`.trim();
        const nameB = `${b.apellidos || ''} ${b.nombres || ''}`.trim();
        const cmp = nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
        if (cmp !== 0) return cmp;
        const numA = parseInt(String(a.cedula || '').replace(/\D/g, '') || 0);
        const numB = parseInt(String(b.cedula || '').replace(/\D/g, '') || 0);
        return numA - numB;
      }
      if (sortOrder === 'cedula') {
        const numA = parseInt(String(a.cedula || '').replace(/\D/g, '') || 0);
        const numB = parseInt(String(b.cedula || '').replace(/\D/g, '') || 0);
        if (numA !== numB) return numA - numB;
        const nameA = `${a.apellidos || ''} ${a.nombres || ''}`.trim();
        const nameB = `${b.apellidos || ''} ${b.nombres || ''}`.trim();
        return nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
      }
      if (sortOrder === 'banco') {
        const bankA = a.banco || getBankNameFromAccount(a.cuentaBancaria);
        const bankB = b.banco || getBankNameFromAccount(b.cuentaBancaria);
        return bankA.localeCompare(bankB);
      }
      if (sortOrder === 'horas') {
        const horasA = (a.materias || []).reduce((acc, m) => acc + (parseInt(m.horasSemanal) || 0), 0);
        const horasB = (b.materias || []).reduce((acc, m) => acc + (parseInt(m.horasSemanal) || 0), 0);
        return horasB - horasA;
      }
      return 0;
    });

    return list;
  }, [staffList, activeTab, soloActivosConCarga, bancoFiltro, searchDocente, sortOrder]);

  // Docentes seleccionados para la exportación final
  const effectiveSelectedList = useMemo(() => {
    if (selectedStaffIds === null) {
      return preparedDocentesList;
    }
    return preparedDocentesList.filter(d => selectedStaffIds.has(d.cedula || d.id));
  }, [preparedDocentesList, selectedStaffIds]);

  // Paginación para la vista de tabla (evita congelamiento del DOM con 2000+ registros)
  const totalBankPages = Math.ceil(preparedDocentesList.length / BANK_PER_PAGE) || 1;
  const currentBankPage = Math.min(bankPage, totalBankPages);
  const pagedDocentesList = useMemo(() => {
    const start = (currentBankPage - 1) * BANK_PER_PAGE;
    return preparedDocentesList.slice(start, start + BANK_PER_PAGE);
  }, [preparedDocentesList, currentBankPage]);

  // Alternar selección de un docente individual
  const toggleSelectDocente = (id) => {
    setSelectedStaffIds(prev => {
      const next = new Set(prev !== null ? prev : preparedDocentesList.map(d => d.cedula || d.id));
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Alternar selección de todos los docentes
  const toggleSelectAll = () => {
    if (selectedStaffIds === null || selectedStaffIds.size === preparedDocentesList.length) {
      setSelectedStaffIds(new Set()); // Deseleccionar todos
    } else {
      setSelectedStaffIds(new Set(preparedDocentesList.map(d => d.cedula || d.id))); // Seleccionar todos
    }
  };

  // Generar archivo TXT final a partir de los docentes seleccionados y ordenados
  const generatedResult = useMemo(() => {
    try {
      const opts = {
        soloActivosConCarga: false, // Ya filtrado previamente
        periodo: currentPeriod || 'ACTUAL',
        bancoFiltro,
        sortBy: sortOrder
      };

      if (activeTab === 'bdv-pos') {
        return generateBdvPositionalTxt(effectiveSelectedList, { ...opts, soloBdv: true });
      } else if (activeTab === 'bdv-del') {
        return generateBdvDelimitedTxt(effectiveSelectedList, { ...opts, delimiter: '\t', soloBdv: true });
      } else if (activeTab === 'multibanco') {
        return generateMultibancoTxt(effectiveSelectedList, opts);
      }
    } catch (err) {
      console.error('Error generando archivo TXT:', err);
    }
    return { content: '', totalRecords: 0, filename: '' };
  }, [effectiveSelectedList, activeTab, currentPeriod, bancoFiltro]);

  if (!isOpen) return null;

  // Verificación estricta de seguridad: Exclusivo para Perfil de Talento Humano
  const isTalentoHumano = user && (user.role === 'ADMIN' || user.role === 'DOCENCIA' || user.role === 'AUDITOR');

  const handleCopy = () => {
    if (!generatedResult.content) return;
    try {
      navigator.clipboard.writeText(generatedResult.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn('Error al copiar al portapapeles:', e);
    }
  };

  const handleDownload = () => {
    if (!generatedResult.content) return;
    try {
      downloadBankTxtFile(generatedResult.filename, generatedResult.content);
    } catch (e) {
      alert('Error al descargar archivo TXT: ' + e.message);
    }
  };

  // Manejador de subida del archivo de respuesta bancaria (Opción 2)
  const handleBankResponseUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setIsProcessingFile(true);
    setResponseFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        const analysis = parseBankResponseTxt(text, staffList);
        setResponseAnalysis(analysis);
        if (analysis.rechazados.length > 0) {
          setResponseViewFilter('rechazados');
        } else {
          setResponseViewFilter('exitosos');
        }
      } catch (err) {
        console.error('Error leyendo TXT de respuesta bancaria:', err);
        alert('Error al analizar archivo del banco: ' + err.message);
      } finally {
        setIsProcessingFile(false);
      }
    };
    reader.onerror = () => {
      alert('No se pudo leer el archivo seleccionado.');
      setIsProcessingFile(false);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const isAllSelected = selectedStaffIds === null || (selectedStaffIds.size === preparedDocentesList.length && preparedDocentesList.length > 0);

  const modalElement = (
    <div className="upel-modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999999,
      padding: '1rem'
    }}>
      {!isTalentoHumano ? (
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '480px',
          padding: '2rem',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid #cbd5e1'
        }}>
          <AlertTriangle size={48} color="#dc2626" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#991b1b', marginBottom: '0.5rem' }}>Acceso Restringido</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            La generación e importación de archivos TXT bancarios y nómina es de potestad exclusiva de la 
            <strong> Unidad de Talento Humano</strong> y <strong>Subdirección de Docencia</strong>.
          </p>
          <button className="btn btn-primary" onClick={onClose} style={{ marginTop: '1.5rem', width: '100%' }}>
            Cerrar
          </button>
        </div>
      ) : (
        <div style={{ 
          background: '#ffffff',
          borderRadius: '18px',
          width: '100%',
          maxWidth: '1080px', 
          maxHeight: '94vh', 
          display: 'flex', 
          flexDirection: 'column', 
          padding: '1.5rem 1.75rem',
          boxShadow: '0 25px 50px -12px rgba(0, 51, 102, 0.35)',
          border: '1px solid #cbd5e1',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {/* Cabecera del Modal */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            justifyContent: 'space-between', 
            borderBottom: '1.5px solid #e2e8f0', 
            paddingBottom: '0.85rem', 
            marginBottom: '1rem' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ 
                width: '46px', 
                height: '46px', 
                borderRadius: '12px', 
                background: 'linear-gradient(135deg, #003366 0%, #0284c7 100%)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 4px 12px rgba(0, 51, 102, 0.25)'
              }}>
                <CreditCard size={24} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#003366', fontWeight: 800 }}>
                    Nómina Bancaria y Exportador TXT
                  </h2>
                  <span style={{ 
                    background: '#e0f2fe', 
                    color: '#0369a1', 
                    fontSize: '0.7rem', 
                    fontWeight: 700, 
                    padding: '2px 8px', 
                    borderRadius: '99px',
                    border: '1px solid #bae6fd'
                  }}>
                    Talento Humano
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Organización de datos bancarios línea por línea por docente y exportación a texto plano (.txt)
                </div>
              </div>
            </div>

            <button 
              type="button"
              onClick={onClose}
              className="btn btn-outline" 
              style={{ padding: '0.4rem', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
              title="Cerrar ventana"
            >
              <X size={20} />
            </button>
          </div>

          {/* Pestañas de Formato y Funcionalidad */}
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            borderBottom: '2px solid #e2e8f0', 
            paddingBottom: '0.5rem',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => { setActiveTab('bdv-pos'); setViewMode('lines'); }}
                className={`btn ${activeTab === 'bdv-pos' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <BankLogo accountOrName="0102" size={16} showName={false} />
                <span>BDV Posicional (76 car)</span>
              </button>
              
              <button
                type="button"
                onClick={() => { setActiveTab('bdv-del'); setViewMode('lines'); }}
                className={`btn ${activeTab === 'bdv-del' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <BankLogo accountOrName="0102" size={16} showName={false} />
                <span>BDV Delimitado (Tab)</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('multibanco'); setViewMode('lines'); }}
                className={`btn ${activeTab === 'multibanco' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem', cursor: 'pointer' }}
              >
                🌐 Multibanco
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('respuesta'); }}
                className={`btn ${activeTab === 'respuesta' ? 'btn-primary' : 'btn-outline'}`}
                style={{ 
                  fontSize: '0.82rem', 
                  padding: '0.4rem 0.8rem', 
                  cursor: 'pointer',
                  background: activeTab === 'respuesta' ? 'linear-gradient(135deg, #0284c7, #0369a1)' : '#f0f9ff',
                  borderColor: '#0284c7',
                  color: activeTab === 'respuesta' ? '#ffffff' : '#0369a1',
                  fontWeight: 700
                }}
              >
                📥 Conciliar Respuesta Bancaria
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('auditoria'); }}
                className={`btn ${activeTab === 'auditoria' ? 'btn-primary' : 'btn-outline'}`}
                style={{ 
                  fontSize: '0.82rem', 
                  padding: '0.4rem 0.8rem', 
                  cursor: 'pointer',
                  color: audit.totalConProblemas > 0 ? '#dc2626' : undefined,
                  borderColor: audit.totalConProblemas > 0 ? '#fca5a5' : undefined
                }}
              >
                ⚠️ Incompletas ({audit.totalConProblemas})
              </button>
            </div>

            {/* Alternador de Vista: Tabla Ordenada vs TXT Crudo */}
            {activeTab !== 'auditoria' && activeTab !== 'respuesta' && (
              <div style={{ display: 'flex', gap: '0.35rem', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
                <button
                  type="button"
                  onClick={() => setViewMode('lines')}
                  style={{
                    border: 'none',
                    background: viewMode === 'lines' ? '#ffffff' : 'transparent',
                    color: viewMode === 'lines' ? '#003366' : '#64748b',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    padding: '0.3rem 0.65rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    boxShadow: viewMode === 'lines' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <ListOrdered size={14} /> Líneas por Docente ({effectiveSelectedList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('raw')}
                  style={{
                    border: 'none',
                    background: viewMode === 'raw' ? '#ffffff' : 'transparent',
                    color: viewMode === 'raw' ? '#003366' : '#64748b',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    padding: '0.3rem 0.65rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    boxShadow: viewMode === 'raw' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <FileText size={14} /> Archivo TXT Plano
                </button>
              </div>
            )}
          </div>

          {/* Barra de Filtros, Ordenamiento y Búsqueda (Ordenada para el Funcionario) */}
          {activeTab !== 'auditoria' && activeTab !== 'respuesta' && (
            <div style={{ 
              display: 'flex', 
              gap: '0.75rem', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              background: '#f8fafc', 
              padding: '0.65rem 1rem', 
              borderRadius: '10px', 
              marginTop: '0.75rem',
              flexWrap: 'wrap',
              border: '1px solid #e2e8f0'
            }}>
              {/* Buscador de Docente */}
              <div style={{ position: 'relative', minWidth: '220px', flex: '1 1 240px' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text"
                  placeholder="Buscar docente o cédula en la lista..."
                  value={searchDocente}
                  onChange={(e) => setSearchDocente(e.target.value)}
                  className="filter-input"
                  style={{ width: '100%', paddingLeft: '2.1rem', fontSize: '0.82rem', padding: '0.35rem 0.6rem 0.35rem 2.1rem' }}
                />
              </div>

              {/* Selector de Ordenamiento por Línea */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Ordenar por:</span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="filter-select"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  <option value="alfabetico">🔤 Apellidos (A - Z)</option>
                  <option value="cedula">🔢 Cédula de Identidad</option>
                  <option value="banco">🏦 Entidad Bancaria</option>
                  <option value="horas">⏱️ Horas Semanales</option>
                </select>
              </div>

              {/* Filtro Banco si es Multibanco */}
              {activeTab === 'multibanco' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Banco:</span>
                  <select 
                    value={bancoFiltro} 
                    onChange={(e) => setBancoFiltro(e.target.value)}
                    className="filter-select"
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    <option value="Todos">Todos los Bancos</option>
                    {Object.values(BANCOS_PREFIJOS).map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Casilla de Horas */}
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600, color: '#334155' }}>
                <input 
                  type="checkbox" 
                  checked={soloActivosConCarga} 
                  onChange={(e) => setSoloActivosConCarga(e.target.checked)} 
                />
                <span>Solo con carga asignada (&gt; 0 horas)</span>
              </label>

              {/* Resumen de Seleccionados */}
              <div style={{ fontSize: '0.82rem', color: '#0369a1', fontWeight: 800 }}>
                {effectiveSelectedList.length} de {preparedDocentesList.length} docentes listos
              </div>
            </div>
          )}

          {/* Cuerpo Principal del Modal */}
          <div style={{ flex: '1 1 auto', overflowY: 'auto', margin: '0.85rem 0', minHeight: '260px' }}>
            
            {/* 1. VISTA DE LÍNEAS POR DOCENTE (ORDENADA Y ESTRUCTURADA) */}
            {activeTab !== 'auditoria' && activeTab !== 'respuesta' && viewMode === 'lines' && (
              <div>
                {preparedDocentesList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                    <Info size={40} color="#94a3b8" style={{ margin: '0 auto 0.5rem' }} />
                    <h3 style={{ color: '#475569', margin: '0 0 0.25rem' }}>No se encontraron docentes con este criterio</h3>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
                      {activeTab === 'bdv-pos' || activeTab === 'bdv-del' 
                        ? 'Verifique que los docentes tengan cuenta de Banco de Venezuela registrada con 20 dígitos (código 0102).'
                        : 'Intente cambiando los términos de búsqueda o los filtros aplicados.'}
                    </p>
                  </div>
                ) : (
                  <>
                  <div className="table-container" style={{ border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                    <table className="data-table" style={{ fontSize: '0.82rem' }}>
                      <thead>
                        <tr>
                          <th style={{ width: '40px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={toggleSelectAll}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                              title={isAllSelected ? "Deseleccionar todos" : "Seleccionar todos"}
                            >
                              {isAllSelected ? <CheckSquare size={16} color="#008744" /> : <Square size={16} color="#94a3b8" />}
                            </button>
                          </th>
                          <th style={{ width: '45px', textAlign: 'center' }}>Línea</th>
                          <th>Cédula</th>
                          <th>Docente (Apellidos y Nombres)</th>
                          <th>Entidad Bancaria</th>
                          <th>Cuenta (20 Dígitos)</th>
                          <th style={{ textAlign: 'center' }}>Tipo de Cuenta</th>
                          <th>Línea Oficial para Archivo TXT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedDocentesList.map((docente, pIdx) => {
                          const idx = (currentBankPage - 1) * BANK_PER_PAGE + pIdx;
                          const docId = docente.cedula || docente.id;
                          const isSelected = selectedStaffIds === null || selectedStaffIds.has(docId);
                          const ciFormat = docente.cedula ? String(docente.cedula).trim() : parseCedula(docente.cedula).formateada;
                          const cta = padAccount20(docente.cuentaBancaria);
                          const formattedCta = cta.length === 20 ? `${cta.slice(0,4)} ${cta.slice(4,8)} ${cta.slice(8,10)} ${cta.slice(10,20)}` : cta;
                          const tipoCta = (docente.tipoCuenta || '').toLowerCase().includes('corriente') ? 'CORRIENTE' : 'AHORRO';
                          const txtLine = formatTeacherTxtLine(docente, activeTab);

                          return (
                            <tr 
                              key={docId || idx}
                              style={{ 
                                background: isSelected ? '#ffffff' : '#f8fafc',
                                opacity: isSelected ? 1 : 0.6
                              }}
                            >
                              {/* Checkbox de Selección */}
                              <td style={{ textAlign: 'center' }}>
                                <input 
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectDocente(docId)}
                                  style={{ cursor: 'pointer' }}
                                />
                              </td>

                              {/* Número de Línea en el TXT */}
                              <td style={{ textAlign: 'center', fontWeight: 800, color: '#0369a1', fontFamily: 'monospace' }}>
                                #{idx + 1}
                              </td>

                              {/* Cédula */}
                              <td style={{ fontWeight: 700, whiteSpace: 'nowrap', color: '#0f172a' }}>
                                {ciFormat}
                              </td>

                              {/* Docente */}
                              <td>
                                <div style={{ fontWeight: 600, color: '#003366' }}>
                                  {docente.apellidos}, {docente.nombres}
                                </div>
                              </td>

                              {/* Banco con Logotipo Oficial */}
                              <td>
                                <BankLogo accountOrName={cta || docente.banco} size={20} showBadge={true} />
                              </td>

                              {/* Cuenta Bancaria */}
                              <td style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.5px', color: '#1e293b', whiteSpace: 'nowrap' }}>
                                {formattedCta}
                              </td>

                              {/* Tipo de Cuenta */}
                              <td style={{ textAlign: 'center' }}>
                                <span style={{ 
                                  padding: '2px 8px', 
                                  borderRadius: '4px', 
                                  fontSize: '0.72rem', 
                                  fontWeight: 700,
                                  background: tipoCta === 'CORRIENTE' ? '#e0f2fe' : '#f0fdf4',
                                  color: tipoCta === 'CORRIENTE' ? '#0369a1' : '#15803d'
                                }}>
                                  {tipoCta}
                                </span>
                              </td>

                              {/* Preview de la línea TXT exacta */}
                              <td style={{ maxWidth: '300px' }}>
                                <div style={{ 
                                  fontFamily: 'Courier New, Courier, monospace', 
                                  fontSize: '0.73rem', 
                                  background: '#0f172a', 
                                  color: '#38bdf8', 
                                  padding: '4px 8px', 
                                  borderRadius: '6px', 
                                  whiteSpace: 'nowrap', 
                                  overflowX: 'auto',
                                  border: '1px solid #1e293b'
                                }}>
                                  {txtLine}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Controles de paginación para fluidez de 60fps con 2000 docentes */}
                  {totalBankPages > 1 && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '0.75rem',
                      padding: '0.5rem 0.75rem',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.82rem'
                    }}>
                      <div style={{ color: '#64748b' }}>
                        Mostrando <strong>{(currentBankPage - 1) * BANK_PER_PAGE + 1}</strong> a <strong>{Math.min(currentBankPage * BANK_PER_PAGE, preparedDocentesList.length)}</strong> de <strong>{preparedDocentesList.length}</strong> docentes
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          type="button"
                          disabled={currentBankPage <= 1}
                          onClick={() => setBankPage(p => Math.max(1, p - 1))}
                          className="btn btn-outline"
                          style={{
                            padding: '0.25rem 0.65rem',
                            fontSize: '0.78rem',
                            opacity: currentBankPage <= 1 ? 0.5 : 1,
                            cursor: currentBankPage <= 1 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          ◀ Anterior
                        </button>
                        <span style={{ fontWeight: 700, color: '#003366', padding: '0 0.4rem' }}>
                          Página {currentBankPage} de {totalBankPages}
                        </span>
                        <button
                          type="button"
                          disabled={currentBankPage >= totalBankPages}
                          onClick={() => setBankPage(p => Math.min(totalBankPages, p + 1))}
                          className="btn btn-outline"
                          style={{
                            padding: '0.25rem 0.65rem',
                            fontSize: '0.78rem',
                            opacity: currentBankPage >= totalBankPages ? 0.5 : 1,
                            cursor: currentBankPage >= totalBankPages ? 'not-allowed' : 'pointer'
                          }}
                        >
                          Siguiente ▶
                        </button>
                      </div>
                    </div>
                  )}
                  </>
                )}
              </div>
            )}

            {/* 2. VISTA DE TEXTO PLANO (.TXT FINAL) */}
            {activeTab !== 'auditoria' && activeTab !== 'respuesta' && viewMode === 'raw' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                    ARCHIVO DE TEXTO PLANO GENERADO ({effectiveSelectedList.length} registros ordenados):
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#0369a1', fontFamily: 'monospace', fontWeight: 700 }}>
                    {generatedResult.filename}
                  </span>
                </div>

                <div style={{ 
                  background: '#0f172a', 
                  color: '#38bdf8', 
                  padding: '1.25rem', 
                  borderRadius: '10px', 
                  fontFamily: 'Courier New, Courier, monospace', 
                  fontSize: '0.82rem', 
                  lineHeight: '1.45', 
                  overflowX: 'auto',
                  maxHeight: '340px',
                  border: '1px solid #1e293b',
                  whiteSpace: 'pre'
                }}>
                  {generatedResult.content || '// No hay registros seleccionados para exportar'}
                </div>

                <div style={{ marginTop: '0.6rem', fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Info size={14} />
                  <span>Cada línea representa exactamente un docente con la codificación y longitud exigida por la entidad bancaria.</span>
                </div>
              </div>
            )}

            {/* 3. VISTA DE AUDITORÍA Y CUENTAS INCOMPLETAS */}
            {activeTab === 'auditoria' && (
              <div>
                {audit.totalConProblemas === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                    <CheckCircle2 size={48} color="#16a34a" style={{ margin: '0 auto 0.5rem' }} />
                    <h3 style={{ color: '#15803d', margin: '0 0 0.25rem' }}>¡Todas las cuentas bancarias están conformadas!</h3>
                    <p style={{ color: '#166534', fontSize: '0.9rem', margin: 0 }}>
                      Los {audit.cuentasValidas} docentes registrados cuentan con 20 dígitos numéricos válidos.
                    </p>
                  </div>
                ) : (
                  <div className="table-container" style={{ border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                    <table className="data-table" style={{ fontSize: '0.85rem' }}>
                      <thead>
                        <tr>
                          <th>Cédula</th>
                          <th>Docente</th>
                          <th>Banco Registrado</th>
                          <th>Cuenta Actual</th>
                          <th>Diagnóstico / Motivo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {audit.docentesConError.map((err, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{err.cedula}</td>
                            <td style={{ fontWeight: 600 }}>{err.nombre}</td>
                            <td>
                              <BankLogo accountOrName={err.cuenta || err.banco} size={18} showBadge={true} />
                            </td>
                            <td style={{ 
                              fontFamily: 'monospace', 
                              color: err.tipo === 'CRITICO' ? '#dc2626' : '#b45309',
                              fontWeight: 700
                            }}>
                              {err.cuenta}
                            </td>
                            <td>
                              <span style={{ 
                                padding: '2px 8px', 
                                borderRadius: '4px', 
                                fontSize: '0.75rem', 
                                fontWeight: 700,
                                background: err.tipo === 'CRITICO' ? '#fee2e2' : err.tipo === 'ERROR' ? '#fef3c7' : '#e0f2fe',
                                color: err.tipo === 'CRITICO' ? '#991b1b' : err.tipo === 'ERROR' ? '#92400e' : '#0369a1'
                              }}>
                                {err.motivo}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 4. VISTA DE CONCILIACIÓN DE RESPUESTA BANCARIA (OPCIÓN 2) */}
            {activeTab === 'respuesta' && (
              <div>
                {!responseAnalysis ? (
                  <div style={{ 
                    border: '2px dashed #93c5fd', 
                    borderRadius: '14px', 
                    padding: '2.5rem 1.5rem', 
                    textAlign: 'center',
                    background: '#f8fafc'
                  }}>
                    <input 
                      type="file" 
                      id="bankResponseInput" 
                      accept=".txt, .csv, .dat"
                      style={{ display: 'none' }}
                      onChange={handleBankResponseUpload}
                    />
                    <div style={{ 
                      width: '60px', 
                      height: '60px', 
                      borderRadius: '50%', 
                      background: '#e0f2fe', 
                      color: '#0284c7', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      margin: '0 auto 1rem'
                    }}>
                      <Upload size={28} />
                    </div>
                    <h3 style={{ color: '#003366', margin: '0 0 0.5rem', fontWeight: 700 }}>
                      Subir Archivo de Respuesta del Banco (TXT / CSV)
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '540px', margin: '0 auto 1.5rem' }}>
                      Cargue el archivo devuelto por el <strong>Banco de Venezuela</strong> (o cualquier entidad bancaria) tras el procesamiento de la nómina. El sistema conciliará automáticamente cada cédula y detectará qué cuentas rebotaron y por qué motivo.
                    </p>
                    <button
                      type="button"
                      onClick={() => document.getElementById('bankResponseInput').click()}
                      className="btn btn-primary"
                      style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', borderColor: '#0284c7', cursor: 'pointer' }}
                    >
                      <Upload size={18} />
                      <span>Seleccionar Archivo del Banco (.txt)</span>
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* Resumen del archivo analizado */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      background: '#f1f5f9', 
                      padding: '0.85rem 1.25rem', 
                      borderRadius: '10px',
                      marginBottom: '1rem',
                      flexWrap: 'wrap',
                      gap: '0.75rem'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>ARCHIVO PROCESADO</div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#003366' }}>{responseFileName}</div>
                      </div>

                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{ 
                          background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', 
                          padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700 
                        }}>
                          🟢 {responseAnalysis.exitosos.length} Abonos Exitosos
                        </span>

                        <span style={{ 
                          background: responseAnalysis.rechazados.length > 0 ? '#fef2f2' : '#f0fdf4', 
                          color: responseAnalysis.rechazados.length > 0 ? '#b91c1c' : '#15803d', 
                          border: `1px solid ${responseAnalysis.rechazados.length > 0 ? '#fca5a5' : '#86efac'}`, 
                          padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700 
                        }}>
                          {responseAnalysis.rechazados.length > 0 ? '🔴' : '✅'} {responseAnalysis.rechazados.length} Rechazos Bancarios
                        </span>

                        <button 
                          type="button" 
                          onClick={() => { setResponseAnalysis(null); setResponseFileName(''); }}
                          className="btn btn-outline"
                          style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem', cursor: 'pointer' }}
                          title="Cargar otro archivo"
                        >
                          <RefreshCw size={14} /> Subir Otro
                        </button>
                      </div>
                    </div>

                    {/* Filtro entre Rechazados / Exitosos */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <button
                        type="button"
                        onClick={() => setResponseViewFilter('rechazados')}
                        className={`btn ${responseViewFilter === 'rechazados' ? 'btn-primary' : 'btn-outline'}`}
                        style={{ 
                          fontSize: '0.82rem', padding: '0.35rem 0.75rem',
                          background: responseViewFilter === 'rechazados' ? '#dc2626' : undefined,
                          borderColor: responseViewFilter === 'rechazados' ? '#dc2626' : undefined
                        }}
                      >
                        ⚠️ Cuentas Rechazadas ({responseAnalysis.rechazados.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setResponseViewFilter('exitosos')}
                        className={`btn ${responseViewFilter === 'exitosos' ? 'btn-primary' : 'btn-outline'}`}
                        style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}
                      >
                        ✅ Abonos Exitosos ({responseAnalysis.exitosos.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setResponseViewFilter('todos')}
                        className={`btn ${responseViewFilter === 'todos' ? 'btn-primary' : 'btn-outline'}`}
                        style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}
                      >
                        📋 Todos ({responseAnalysis.totalProcesados})
                      </button>
                    </div>

                    {/* Tabla de Resultados de la Conciliación */}
                    <div className="table-container" style={{ maxHeight: '300px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                      <table className="data-table" style={{ fontSize: '0.85rem' }}>
                        <thead>
                          <tr>
                            <th>Docente</th>
                            <th>Cédula</th>
                            <th>Departamento</th>
                            <th>Cuenta</th>
                            <th>Diagnóstico del Banco</th>
                            <th>Acción Directa</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(responseViewFilter === 'rechazados' 
                            ? responseAnalysis.rechazados 
                            : responseViewFilter === 'exitosos' 
                              ? responseAnalysis.exitosos 
                              : [...responseAnalysis.rechazados, ...responseAnalysis.exitosos]
                          ).map((item, idx) => {
                            const isRechazo = item.estado === 'RECHAZADO';
                            const waUrl = isRechazo ? generateRechazoWhatsAppUrl(item) : null;

                            return (
                              <tr key={idx} style={{ background: isRechazo ? '#fff5f5' : '#ffffff' }}>
                                <td style={{ fontWeight: 600 }}>{item.nombre}</td>
                                <td style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{item.cedula}</td>
                                <td>{item.departamento}</td>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <BankLogo accountOrName={item.cuenta} size={18} showBadge={true} />
                                    <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', fontWeight: 600 }}>{item.cuenta}</span>
                                  </div>
                                </td>
                                <td>
                                  <span style={{ 
                                    padding: '3px 8px', 
                                    borderRadius: '4px', 
                                    fontSize: '0.75rem', 
                                    fontWeight: 700,
                                    background: isRechazo ? '#fee2e2' : '#dcfce7',
                                    color: isRechazo ? '#991b1b' : '#15803d'
                                  }}>
                                    {item.motivo}
                                  </span>
                                </td>
                                <td>
                                  {isRechazo && waUrl ? (
                                    <a 
                                      href={waUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="btn btn-outline"
                                      style={{ 
                                        padding: '0.25rem 0.55rem', 
                                        fontSize: '0.75rem', 
                                        background: '#25d366', 
                                        color: '#ffffff',
                                        borderColor: '#25d366',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.3rem',
                                        textDecoration: 'none',
                                        fontWeight: 700,
                                        borderRadius: '6px'
                                      }}
                                      title="Notificar de inmediato al docente por WhatsApp sobre el rechazo bancario"
                                    >
                                      <MessageCircle size={14} /> Avisar
                                    </a>
                                  ) : isRechazo ? (
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Sin teléfono</span>
                                  ) : (
                                    <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>Conforme</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}

                          {(responseViewFilter === 'rechazados' && responseAnalysis.rechazados.length === 0) && (
                            <tr>
                              <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#166534', background: '#f0fdf4' }}>
                                🎉 ¡Excelente noticia! No hubo ningún rechazo en este archivo bancario. Todos los abonos fueron procesados con éxito.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Barra de Acciones del Modal */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            borderTop: '1.5px solid #e2e8f0', 
            paddingTop: '0.85rem', 
            marginTop: 'auto',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ fontSize: '0.82rem', color: '#475569' }}>
              <strong>{effectiveSelectedList.length}</strong> registros listos para el archivo de texto plano
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {activeTab !== 'auditoria' && activeTab !== 'respuesta' && (
                <>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="btn btn-outline"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', cursor: 'pointer' }}
                    disabled={effectiveSelectedList.length === 0}
                  >
                    {copied ? <Check size={16} color="#16a34a" /> : <Copy size={16} />}
                    <span>{copied ? '¡Copiado!' : 'Copiar Texto'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="btn btn-primary"
                    style={{ 
                      background: 'linear-gradient(135deg, #008744 0%, #15803d 100%)', 
                      borderColor: '#15803d', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.45rem',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0, 135, 68, 0.25)'
                    }}
                    disabled={effectiveSelectedList.length === 0}
                  >
                    <Download size={18} />
                    <span>Exportar a Archivo TXT ({effectiveSelectedList.length})</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline"
                style={{ fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalElement, document.body) : null;
};

export default BankTxtModal;
