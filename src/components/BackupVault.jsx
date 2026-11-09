import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Database, HardDrive, Download, Upload, FileSpreadsheet, FileCode, 
  CheckCircle2, AlertTriangle, RefreshCw, ShieldCheck, Clock, Server, 
  FileCheck, Wrench, Activity, Sparkles, Check, AlertCircle, Layers, 
  Cpu, Radio, Shield, Trash2, Power, Terminal
} from 'lucide-react';
import { getCurrentUser, getStaffData, getCatalogoMaterias } from '../data';

const BackupVault = () => {
  const user = getCurrentUser();
  const [activeTab, setActiveTab] = useState('backups'); // 'backups' | 'optimization' | 'integrity' | 'serverHealth' | 'maintenanceMode'
  
  // Estados para Bóveda y Respaldos (Existentes)
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [downloadingSql, setDownloadingSql] = useState(false);
  const [downloadingJson, setDownloadingJson] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreFile, setRestoreFile] = useState(null);
  const [restoreStatus, setRestoreStatus] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Estados para Optimización y Mantenimiento
  const [maintStatus, setMaintStatus] = useState(null);
  const [loadingMaintStatus, setLoadingMaintStatus] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [diasRetencion, setDiasRetencion] = useState(180);
  const [optResult, setOptResult] = useState(null);

  // Estados para Integridad
  const [integrityData, setIntegrityData] = useState(null);
  const [loadingIntegrity, setLoadingIntegrity] = useState(false);
  const [repairing, setRepairing] = useState(false);
  const [repairResult, setRepairResult] = useState(null);

  // Estados para Modo Mantenimiento
  const [maintModeConfig, setMaintModeConfig] = useState(() => {
    try {
      const cached = localStorage.getItem('upel_maintenance_mode');
      if (cached) {
        const parsed = JSON.parse(cached);
        return {
          enabled: Boolean(parsed.enabled),
          strictLockout: parsed.strictLockout !== false,
          message: parsed.message || 'El sistema se encuentra en labores rutinarias de mantenimiento y actualización institucional.',
          estimatedEnd: parsed.estimatedEnd || ''
        };
      }
    } catch (e) {}
    return {
      enabled: false,
      strictLockout: true,
      message: 'El sistema se encuentra en labores rutinarias de mantenimiento y actualización institucional.',
      estimatedEnd: ''
    };
  });
  const [savingMaintMode, setSavingMaintMode] = useState(false);
  const [maintModeFeedback, setMaintModeFeedback] = useState(null);

  const API_BASE = typeof window !== 'undefined' && window.location.port === '5173'
    ? `http://${window.location.hostname}:3001/api`
    : '/api';

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('upel_auth_token') || '') : '';
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/backup/stats`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (e) {
      console.error('Error cargando estadísticas del servidor:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaintenanceStatus = async () => {
    try {
      setLoadingMaintStatus(true);
      const res = await fetch(`${API_BASE}/backup/maintenance/status`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setMaintStatus(data);
        if (data.maintenanceConfig) {
          setMaintModeConfig({
            enabled: Boolean(data.maintenanceConfig.enabled),
            strictLockout: data.maintenanceConfig.strictLockout !== false,
            message: data.maintenanceConfig.message || 'El sistema se encuentra en labores rutinarias de mantenimiento y actualización institucional.',
            estimatedEnd: data.maintenanceConfig.estimatedEnd || ''
          });
        }
      }
    } catch (e) {
      console.error('Error cargando estado de mantenimiento:', e);
    } finally {
      setLoadingMaintStatus(false);
    }
  };

  const fetchIntegrityCheck = async () => {
    try {
      setLoadingIntegrity(true);
      setRepairResult(null);
      const res = await fetch(`${API_BASE}/backup/integrity`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setIntegrityData(data);
      }
    } catch (e) {
      console.error('Error ejecutando chequeo de integridad:', e);
    } finally {
      setLoadingIntegrity(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchMaintenanceStatus();
  }, []);

  // 1. Descargas de Respaldo (Preservadas)
  const handleDownloadSql = () => {
    setDownloadingSql(true);
    const token = typeof window !== 'undefined' ? (localStorage.getItem('upel_auth_token') || '') : '';
    const downloadUrl = `${API_BASE}/backup/sql?token=${encodeURIComponent(token)}`;
    const a = document.createElement('a');
    a.href = downloadUrl;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => {
      setDownloadingSql(false);
      fetchStats();
      fetchMaintenanceStatus();
    }, 1500);
  };

  const handleDownloadJson = () => {
    setDownloadingJson(true);
    const token = typeof window !== 'undefined' ? (localStorage.getItem('upel_auth_token') || '') : '';
    const downloadUrl = `${API_BASE}/backup/json?token=${encodeURIComponent(token)}`;
    const a = document.createElement('a');
    a.href = downloadUrl;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => setDownloadingJson(false), 1500);
  };

  const handleExportExcel = async () => {
    try {
      setExportingExcel(true);
      const staffList = await getStaffData();
      const catalogo = await getCatalogoMaterias();
      const { exportInstitutionalExcel } = await import('../services/excelExporter');
      await exportInstitutionalExcel({ staffList, materiasCatalogo: catalogo, user });
    } catch (err) {
      alert('Error al generar el libro Excel: ' + err.message);
    } finally {
      setExportingExcel(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith('.json')) {
        alert('Por favor selecciona un archivo de respaldo válido con formato .json');
        return;
      }
      setRestoreFile(file);
      setRestoreStatus(null);
    }
  };

  const handleConfirmRestore = async () => {
    if (!restoreFile) return;
    if (user?.role !== 'ADMIN') {
      alert('Operación denegada: Solo el Administrador del Sistema cuenta con permisos para restaurar la base de datos.');
      return;
    }
    try {
      setRestoring(true);
      setShowConfirmModal(false);
      const text = await restoreFile.text();
      const parsed = JSON.parse(text);

      const res = await fetch(`${API_BASE}/backup/restore`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ payload: parsed })
      });

      const resData = await res.json();
      if (resData.success) {
        setRestoreStatus({
          type: 'success',
          message: `¡Restauración exitosa! Se restablecieron ${resData.restored.docentes} docentes y ${resData.restored.docentesMaterias} asignaturas.`
        });
        setRestoreFile(null);
        fetchStats();
        fetchMaintenanceStatus();
      } else {
        setRestoreStatus({
          type: 'error',
          message: resData.error || 'Ocurrió un error al procesar la restauración.'
        });
      }
    } catch (err) {
      setRestoreStatus({
        type: 'error',
        message: 'El archivo seleccionado no es válido o está corrupto: ' + err.message
      });
    } finally {
      setRestoring(false);
    }
  };

  // 2. Ejecución de Optimización de Base de Datos
  const handleRunOptimization = async () => {
    if (user?.role !== 'ADMIN') {
      alert('Solo el Administrador del Sistema puede ejecutar la optimización de base de datos.');
      return;
    }
    try {
      setOptimizing(true);
      setOptResult(null);
      const res = await fetch(`${API_BASE}/backup/maintenance`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ diasRetencion: parseInt(diasRetencion, 10) })
      });
      const data = await res.json();
      if (data.success) {
        setOptResult({
          type: 'success',
          data
        });
        fetchStats();
        fetchMaintenanceStatus();
      } else {
        setOptResult({
          type: 'error',
          message: data.error || 'No se pudo completar la optimización.'
        });
      }
    } catch (err) {
      setOptResult({
        type: 'error',
        message: 'Error de conexión: ' + err.message
      });
    } finally {
      setOptimizing(false);
    }
  };

  // 3. Saneamiento de Registros Huérfanos
  const handleRunRepair = async () => {
    if (!window.confirm('¿Desea eliminar de forma segura los registros huérfanos detectados? Esta acción es irreversible y queda registrada en auditoría.')) {
      return;
    }
    try {
      setRepairing(true);
      const res = await fetch(`${API_BASE}/backup/integrity/repair`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setRepairResult({
          type: 'success',
          message: `Saneamiento completado: Se limpiaron ${data.cleaned.total} registros inconsistentes.`
        });
        fetchIntegrityCheck();
        fetchStats();
      } else {
        setRepairResult({
          type: 'error',
          message: data.error || 'Ocurrió un error durante el saneamiento.'
        });
      }
    } catch (err) {
      setRepairResult({
        type: 'error',
        message: 'Error: ' + err.message
      });
    } finally {
      setRepairing(false);
    }
  };

  // 4. Guardar Configuración de Modo Mantenimiento
  const saveMaintenanceConfigToServer = async (configToSave) => {
    const config = configToSave || maintModeConfig;
    try {
      setSavingMaintMode(true);
      setMaintModeFeedback(null);
      
      // Respaldo local inmediato en localStorage para evitar que la UI quede desincronizada
      localStorage.setItem('upel_maintenance_mode', JSON.stringify(config));
      window.dispatchEvent(new CustomEvent('upel_maintenance_mode_changed', { detail: config }));

      const res = await fetch(`${API_BASE}/backup/maintenance-mode`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(config)
      });

      if (res.status === 404) {
        setMaintModeFeedback({
          type: 'success',
          message: `Modo Mantenimiento ${config.enabled ? 'activado' : 'desactivado'} localmente con éxito.`
        });
        return;
      }

      const data = await res.json();
      if (data.success) {
        setMaintModeFeedback({
          type: 'success',
          message: data.message || `Modo Mantenimiento ${config.enabled ? 'ACTIVADO' : 'DESACTIVADO'} correctamente.`
        });
        fetchMaintenanceStatus();
        window.dispatchEvent(new CustomEvent('upel_maintenance_mode_changed', { detail: data.config }));
      } else {
        setMaintModeFeedback({
          type: 'error',
          message: data.error || 'No se pudo guardar en el servidor central.'
        });
      }
    } catch (err) {
      setMaintModeFeedback({
        type: 'success',
        message: `Modo Mantenimiento ${config.enabled ? 'activado' : 'desactivado'} localmente.`
      });
    } finally {
      setSavingMaintMode(false);
    }
  };

  const handleSaveMaintenanceMode = async () => {
    await saveMaintenanceConfigToServer(maintModeConfig);
  };

  const handleToggleMaintenanceMode = async () => {
    const nextEnabled = !maintModeConfig.enabled;
    const updated = {
      ...maintModeConfig,
      enabled: nextEnabled,
      strictLockout: maintModeConfig.strictLockout !== false
    };
    setMaintModeConfig(updated);
    await saveMaintenanceConfigToServer(updated);
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="animate-fade-in" style={{ padding: '2rem' }}>
        <div className="upel-card upel-card-accent-rose" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: '600px', margin: '2rem auto' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
            <AlertTriangle size={32} />
          </div>
          <h2 style={{ color: '#991b1b', marginBottom: '0.75rem', fontSize: '1.35rem' }}>Acceso Restringido</h2>
          <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
            El módulo de <strong>Bóveda y Mantenimiento del Sistema</strong> está reservado de forma estricta y exclusiva para la Unidad de Informática (ADMIN). Los perfiles de Auditoría no tienen autorización para aplicar cambios estructurales en esta sección.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Banner de Aviso si el Modo Mantenimiento está Activo */}
      {maintModeConfig.enabled && (
        <div style={{
          background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
          border: '1px solid #f59e0b',
          borderRadius: '12px',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#f59e0b', color: 'white', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#92400e', fontSize: '0.95rem' }}>
                MODO MANTENIMIENTO ACTIVO EN EL SISTEMA
              </div>
              <div style={{ color: '#b45309', fontSize: '0.85rem' }}>
                {maintModeConfig.message} {maintModeConfig.estimatedEnd && `(Finalización estimada: ${maintModeConfig.estimatedEnd})`}
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('maintenanceMode')}
            className="btn btn-sm"
            style={{ background: '#92400e', color: 'white', border: 'none', padding: '0.45rem 0.9rem', fontSize: '0.8rem', borderRadius: '6px', cursor: 'pointer' }}
          >
            Gestionar Estado
          </button>
        </div>
      )}

      {/* Encabezado Institucional UPEL */}
      <div className="upel-card upel-card-accent-blue" style={{
        padding: '1.75rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #003366 0%, #004d73 100%)', 
            color: 'white', 
            width: '56px', 
            height: '56px', 
            borderRadius: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0, 51, 102, 0.2)'
          }}>
            <Database size={28} />
          </div>
          <div>
            <div className="upel-section-subtitle">
              <span>🔒</span> Subdirección de Docencia — Bóveda & Mantenimiento
            </div>
            <h1 style={{ margin: 0, color: '#003366', fontSize: '1.75rem', fontWeight: 800 }}>
              Centro de Mantenimiento & Salud del Sistema
            </h1>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
              Respaldos institucionales, optimización relacional, diagnóstico de integridad y control operativo
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => {
              fetchStats();
              fetchMaintenanceStatus();
              if (activeTab === 'integrity') fetchIntegrityCheck();
            }}
            disabled={loading || loadingMaintStatus}
            className="btn btn-outline"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.1rem',
              fontSize: '0.85rem',
              background: 'white'
            }}
          >
            <RefreshCw size={15} className={(loading || loadingMaintStatus) ? 'spin' : ''} /> Actualizar Estado
          </button>
        </div>
      </div>

      {/* Tarjetas de Estadísticas en Vivo */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '1.25rem'
      }}>
        <div className="upel-stat-card upel-card-accent-blue">
          <div>
            <div className="upel-stat-label">Docentes Registrados</div>
            <div className="upel-stat-value" style={{ color: '#003366' }}>{stats ? stats.docentes : '...'}</div>
          </div>
          <div className="upel-stat-icon-wrapper" style={{ background: '#e6f2f8', color: '#006699' }}>
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="upel-stat-card upel-card-accent-amber">
          <div>
            <div className="upel-stat-label">Asignaciones Activas</div>
            <div className="upel-stat-value" style={{ color: '#d97706' }}>{stats ? stats.materiasAsignadas : '...'}</div>
          </div>
          <div className="upel-stat-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}>
            <FileSpreadsheet size={24} />
          </div>
        </div>

        <div className="upel-stat-card upel-card-accent-green">
          <div>
            <div className="upel-stat-label">Tamaño Base de Datos</div>
            <div className="upel-stat-value" style={{ color: '#008744' }}>
              {maintStatus?.database?.totalSizeMB ? `${maintStatus.database.totalSizeMB} MB` : '...'}
            </div>
          </div>
          <div className="upel-stat-icon-wrapper" style={{ background: '#e6f6ee', color: '#008744' }}>
            <Database size={24} />
          </div>
        </div>

        <div className="upel-stat-card upel-card-accent-purple">
          <div>
            <div className="upel-stat-label">Logs de Auditoría</div>
            <div className="upel-stat-value" style={{ color: '#6366f1' }}>
              {stats ? (stats.auditLogs || 0) : '...'}
            </div>
          </div>
          <div className="upel-stat-icon-wrapper" style={{ background: '#eef2ff', color: '#6366f1' }}>
            <ShieldCheck size={24} />
          </div>
        </div>
      </div>

      {/* Pestañas de Navegación del Centro de Mantenimiento */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '2px solid #e2e8f0',
        paddingBottom: '0.25rem',
        overflowX: 'auto',
        scrollbarWidth: 'thin'
      }}>
        <button
          onClick={() => setActiveTab('backups')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: activeTab === 'backups' ? 700 : 500,
            background: activeTab === 'backups' ? '#003366' : 'transparent',
            color: activeTab === 'backups' ? 'white' : '#64748b',
            transition: 'all 0.2s'
          }}
        >
          <HardDrive size={16} /> Bóveda & Respaldos
        </button>

        <button
          onClick={() => setActiveTab('optimization')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: activeTab === 'optimization' ? 700 : 500,
            background: activeTab === 'optimization' ? '#003366' : 'transparent',
            color: activeTab === 'optimization' ? 'white' : '#64748b',
            transition: 'all 0.2s'
          }}
        >
          <Sparkles size={16} /> Optimización & Limpieza BD
        </button>

        <button
          onClick={() => {
            setActiveTab('integrity');
            if (!integrityData) fetchIntegrityCheck();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: activeTab === 'integrity' ? 700 : 500,
            background: activeTab === 'integrity' ? '#003366' : 'transparent',
            color: activeTab === 'integrity' ? 'white' : '#64748b',
            transition: 'all 0.2s'
          }}
        >
          <ShieldCheck size={16} /> Integridad Referencial
        </button>

        <button
          onClick={() => setActiveTab('serverHealth')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: activeTab === 'serverHealth' ? 700 : 500,
            background: activeTab === 'serverHealth' ? '#003366' : 'transparent',
            color: activeTab === 'serverHealth' ? 'white' : '#64748b',
            transition: 'all 0.2s'
          }}
        >
          <Server size={16} /> Diagnóstico & Almacenamiento
        </button>

        <button
          onClick={() => setActiveTab('maintenanceMode')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: activeTab === 'maintenanceMode' ? 700 : 500,
            background: activeTab === 'maintenanceMode' ? (maintModeConfig.enabled ? '#dc2626' : '#003366') : 'transparent',
            color: activeTab === 'maintenanceMode' ? 'white' : '#64748b',
            transition: 'all 0.2s'
          }}
        >
          <Power size={16} /> Modo Mantenimiento {maintModeConfig.enabled && '●'}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* PESTAÑA 1: BÓVEDA & RESPALDOS (FUNCIONALIDAD ORIGINAL INTACTA)             */}
      {/* ========================================================================= */}
      {activeTab === 'backups' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}>
            {/* Card 1: Respaldo SQL */}
            <div className="upel-card upel-card-accent-blue" style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#e6f2f8', color: '#006699', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileCode size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#003366', fontWeight: 700 }}>Respaldo SQL (.sql)</h3>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Para Servidores, XAMPP o Pendrive</div>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#475569', flex: 1, lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
                Genera un script SQL nativo con la creación de todas las tablas e inserciones de datos. Listo para importar en <strong>phpMyAdmin</strong>, <strong>MySQL Workbench</strong> o la consola del servidor central.
              </p>
              <button
                onClick={handleDownloadSql}
                disabled={downloadingSql}
                style={{
                  background: '#003366',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'background 0.2s'
                }}
              >
                <Download size={16} /> {downloadingSql ? 'Generando volcado SQL...' : 'Descargar Backup .SQL'}
              </button>
            </div>

            {/* Card 2: Exportador Excel Multipestaña */}
            <div className="upel-card upel-card-accent-green" style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#e6f6ee', color: '#008744', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileSpreadsheet size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#008744', fontWeight: 700 }}>Libro Excel Multipestaña</h3>
                  <div style={{ fontSize: '0.8rem', color: '#008744', fontWeight: 600 }}>Formato Oficial por Sedes (.xlsx)</div>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#475569', flex: 1, lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
                Libro de trabajo completo con <strong>7 pestañas especializadas</strong>: Resumen General, Tablas Dinámicas cruzadas, Sedes territoriales, Catálogo y Base Maestra.
              </p>
              <button
                onClick={handleExportExcel}
                disabled={exportingExcel}
                style={{
                  background: '#008744',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'background 0.2s'
                }}
              >
                <FileSpreadsheet size={16} /> {exportingExcel ? 'Construyendo libro Excel...' : 'Exportar Matriz Excel (.xlsx)'}
              </button>
            </div>

            {/* Card 3: Snapshot JSON Portátil */}
            <div className="upel-card upel-card-accent-amber" style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HardDrive size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#d97706', fontWeight: 700 }}>Snapshot JSON (.json)</h3>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Copia de Seguridad Estructurada</div>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#475569', flex: 1, lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
                Instantánea ligera y versátil con toda la nómina, asignaturas y registros de auditoría. Permite ser restaurada directamente desde el panel de control ante cualquier emergencia.
              </p>
              <button
                onClick={handleDownloadJson}
                disabled={downloadingJson}
                style={{
                  background: '#d97706',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'background 0.2s'
                }}
              >
                <Download size={16} /> {downloadingJson ? 'Descargando Snapshot...' : 'Descargar Snapshot .JSON'}
              </button>
            </div>
          </div>

          {/* Sección de Restauración de Base de Datos */}
          <div className="upel-card upel-card-accent-rose" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Upload size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>Restaurar Base de Datos desde Respaldo</h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Operación de Contingencia para Administradores</div>
              </div>
            </div>

            <div style={{
              background: '#fffbeb',
              border: '1px solid #fef3c7',
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start',
              marginBottom: '1.25rem'
            }}>
              <AlertTriangle size={18} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.82rem', color: '#92400e', lineHeight: 1.4 }}>
                <strong>Advertencia de Seguridad:</strong> La restauración reemplazará la lista de docentes, asignaciones y catálogo con el contenido del archivo de respaldo suministrado. Asegúrate de descargar una copia de respaldo antes de realizar esta operación.
              </div>
            </div>

            {restoreStatus && (
              <div style={{
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                background: restoreStatus.type === 'success' ? '#ecfdf5' : '#fef2f2',
                color: restoreStatus.type === 'success' ? '#065f46' : '#991b1b',
                border: `1px solid ${restoreStatus.type === 'success' ? '#a7f3d0' : '#fecaca'}`
              }}>
                {restoreStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                {restoreStatus.message}
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
              <label style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1rem',
                background: '#f1f5f9',
                border: '1px dashed #94a3b8',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                color: '#334155',
                fontWeight: 500
              }}>
                <Upload size={16} />
                {restoreFile ? restoreFile.name : 'Seleccionar archivo .json de respaldo'}
                <input type="file" accept=".json" onChange={handleFileSelect} style={{ display: 'none' }} />
              </label>

              {restoreFile && (
                <button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={restoring}
                  style={{
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    padding: '0.65rem 1.25rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {restoring ? 'Restaurando...' : 'Iniciar Restauración'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 2: OPTIMIZACIÓN & LIMPIEZA DE BASE DE DATOS                        */}
      {/* ========================================================================= */}
      {activeTab === 'optimization' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="upel-card upel-card-accent-blue" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#003366', fontWeight: 700 }}>
                  Optimización Relacional y Compactación de Tablas
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Desfragmenta índices InnoDB, recalcula estadísticas para el optimizador de consultas y libera espacio
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, margin: '0 0 1.25rem 0' }}>
              Con el uso continuo del sistema, las tablas de docentes, cargas y auditoría acumulan espacio libre fragmentado. 
              Al ejecutar esta operación, el motor ejecutará <code>OPTIMIZE TABLE</code> y <code>ANALYZE TABLE</code> sobre las 16 tablas del núcleo institucional y depurará los logs antiguos según el período seleccionado.
            </p>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '1.25rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.5rem',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Política de Depuración de Auditoría:
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <select
                    value={diasRetencion}
                    onChange={(e) => setDiasRetencion(Number(e.target.value))}
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      background: 'white',
                      fontWeight: 600
                    }}
                  >
                    <option value={30}>Conservar últimos 30 días (Depurar anteriores)</option>
                    <option value={60}>Conservar últimos 60 días (Depurar anteriores)</option>
                    <option value={90}>Conservar últimos 90 días (Depurar anteriores)</option>
                    <option value={180}>Conservar últimos 180 días / 6 meses (Recomendado)</option>
                    <option value={365}>Conservar 1 año completo</option>
                    <option value={0}>No depurar logs (Solo optimizar índices)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleRunOptimization}
                disabled={optimizing}
                style={{
                  background: 'linear-gradient(135deg, #003366 0%, #004d73 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  boxShadow: '0 4px 12px rgba(0, 51, 102, 0.25)',
                  transition: 'opacity 0.2s'
                }}
              >
                <Sparkles size={18} className={optimizing ? 'spin' : ''} />
                {optimizing ? 'Optimizando motor relacional...' : 'Ejecutar Optimización de Tablas'}
              </button>
            </div>

            {optResult && (
              <div style={{
                padding: '1rem 1.25rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                fontSize: '0.88rem',
                background: optResult.type === 'success' ? '#ecfdf5' : '#fef2f2',
                color: optResult.type === 'success' ? '#065f46' : '#991b1b',
                border: `1px solid ${optResult.type === 'success' ? '#a7f3d0' : '#fecaca'}`
              }}>
                {optResult.type === 'success' ? <CheckCircle2 size={20} style={{ flexShrink: 0, marginTop: '2px' }} /> : <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />}
                <div>
                  <div style={{ fontWeight: 700 }}>
                    {optResult.type === 'success' ? '¡Optimización Relacional Completada con Éxito!' : 'Error en la optimización'}
                  </div>
                  {optResult.type === 'success' && (
                    <div style={{ fontSize: '0.82rem', marginTop: '0.35rem', lineHeight: 1.5 }}>
                      Se optimizaron <strong>{optResult.data.tablasOptimizadas.length} tablas</strong> del núcleo institucional. Se depuraron <strong>{optResult.data.deletedAuditLogs} eventos</strong> de auditoría anteriores. Nuevo tamaño total: <strong>{optResult.data.nuevoTamanoMB} MB</strong>. Tiempo de ejecución: <strong>{optResult.data.duracionMs} ms</strong>.
                    </div>
                  )}
                  {optResult.type === 'error' && (
                    <div style={{ fontSize: '0.82rem', marginTop: '0.35rem' }}>{optResult.message}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tabla de Desglose de Tablas y Almacenamiento */}
          <div className="upel-card" style={{ padding: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#003366', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} color="#006699" /> Desglose Físico de Tablas en el Motor MySQL/MariaDB
            </h4>

            {maintStatus?.database?.tables ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                      <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>Nombre de Tabla</th>
                      <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600, textAlign: 'right' }}>Registros Estimados</th>
                      <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600, textAlign: 'right' }}>Espacio en Disco (Datos + Índices)</th>
                      <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600, textAlign: 'center' }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintStatus.database.tables.map((tbl, i) => (
                      <tr key={tbl.tableName} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                        <td style={{ padding: '0.6rem 0.75rem', fontFamily: 'monospace', fontWeight: 600, color: '#1e293b' }}>
                          {tbl.tableName}
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', color: '#475569' }}>
                          {tbl.tableRows?.toLocaleString('es-VE') || '0'}
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 600, color: '#003366' }}>
                          {tbl.sizeMB} MB
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: '#ecfdf5',
                            color: '#065f46'
                          }}>
                            <Check size={12} /> Óptimo
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                Cargando información del catálogo de tablas...
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 3: INTEGRIDAD REFERENCIAL DE DATOS                                 */}
      {/* ========================================================================= */}
      {activeTab === 'integrity' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="upel-card upel-card-accent-green" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#14532d', fontWeight: 700 }}>
                    Escáner de Integridad y Coherencia Referencial
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Inspección profunda de claves foráneas, asignaciones huérfanas y consistencia 3NF
                  </div>
                </div>
              </div>

              <button
                onClick={fetchIntegrityCheck}
                disabled={loadingIntegrity}
                style={{
                  background: '#15803d',
                  color: 'white',
                  border: 'none',
                  padding: '0.6rem 1.25rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <RefreshCw size={15} className={loadingIntegrity ? 'spin' : ''} />
                {loadingIntegrity ? 'Escaneando...' : 'Re-escanear Integridad'}
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, margin: '0 0 1.25rem 0' }}>
              Verifica que todas las cargas horarias pertenezcan a contratos activos, que los datos bancarios y títulos estén asociados a docentes existentes y que las asignaturas correspondan exactamente con el catálogo institucional.
            </p>

            {repairResult && (
              <div style={{
                padding: '0.85rem 1.25rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                background: repairResult.type === 'success' ? '#ecfdf5' : '#fef2f2',
                color: repairResult.type === 'success' ? '#065f46' : '#991b1b',
                border: `1px solid ${repairResult.type === 'success' ? '#a7f3d0' : '#fecaca'}`
              }}>
                {repairResult.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                {repairResult.message}
              </div>
            )}

            {/* Grid de Chequeos de Integridad */}
            {integrityData ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                {integrityData.checks.map(check => {
                  const isOk = check.status === 'OK';
                  return (
                    <div 
                      key={check.key} 
                      style={{
                        padding: '1rem 1.25rem',
                        borderRadius: '10px',
                        background: isOk ? '#f0fdf4' : '#fffbeb',
                        border: `1px solid ${isOk ? '#bbf7d0' : '#fef3c7'}`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '0.5rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, color: isOk ? '#166534' : '#92400e', fontSize: '0.9rem' }}>
                          {check.title}
                        </span>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: isOk ? '#dcfce7' : '#fef3c7',
                          color: isOk ? '#15803d' : '#b45309'
                        }}>
                          {isOk ? <Check size={13} /> : <AlertTriangle size={13} />}
                          {isOk ? 'ÓPTIMO' : `${check.count} HUÉRFANOS`}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                        {check.description}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                Ejecutando diagnóstico inicial de integridad...
              </div>
            )}

            {/* Botón de Saneamiento si hay inconsistencias */}
            {integrityData && integrityData.status === 'ATTENTION' && (
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleRunRepair}
                  disabled={repairing}
                  style={{
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)'
                  }}
                >
                  <Trash2 size={16} />
                  {repairing ? 'Saneando registros huérfanos...' : 'Sanear Registros Huérfanos Automáticamente'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 4: DIAGNÓSTICO & SERVIDOR                                          */}
      {/* ========================================================================= */}
      {activeTab === 'serverHealth' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            
            {/* Tarjeta de Servidor Node.js */}
            <div className="upel-card upel-card-accent-blue" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Cpu size={22} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#003366', fontWeight: 700 }}>Motor Backend UPEL</h4>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Estado del proceso Node.js Core</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                  <span style={{ color: '#64748b' }}>Versión Node.js:</span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{maintStatus?.serverHealth?.nodeVersion || '...'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                  <span style={{ color: '#64748b' }}>Sistema Operativo:</span>
                  <span style={{ fontWeight: 600, color: '#1e293b', textTransform: 'capitalize' }}>{maintStatus?.serverHealth?.platform || 'Windows'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                  <span style={{ color: '#64748b' }}>Memoria Heap en Uso:</span>
                  <span style={{ fontWeight: 600, color: '#008744' }}>{maintStatus?.serverHealth?.heapUsedMB} MB</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                  <span style={{ color: '#64748b' }}>Memoria RSS Reservada:</span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{maintStatus?.serverHealth?.memoryRSSMB} MB</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.4rem' }}>
                  <span style={{ color: '#64748b' }}>Tiempo Activo (Uptime):</span>
                  <span style={{ fontWeight: 600, color: '#003366' }}>
                    {maintStatus?.serverHealth?.uptimeSeconds 
                      ? `${Math.floor(maintStatus.serverHealth.uptimeSeconds / 3600)}h ${Math.floor((maintStatus.serverHealth.uptimeSeconds % 3600) / 60)}m` 
                      : '...'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tarjeta de Almacenamiento Local de Archivos */}
            <div className="upel-card upel-card-accent-amber" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HardDrive size={22} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#92400e', fontWeight: 700 }}>Almacenamiento en Disco</h4>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Archivos de respaldo y multimedia subida</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                  <span style={{ color: '#64748b' }}>Archivos de Backup (.sql / .json):</span>
                  <span style={{ fontWeight: 700, color: '#003366' }}>
                    {maintStatus?.storage?.backups?.count || 0} archivos ({maintStatus?.storage?.backups?.sizeMB || 0} MB)
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                  <span style={{ color: '#64748b' }}>Archivos Multimedia / Comprobantes:</span>
                  <span style={{ fontWeight: 700, color: '#003366' }}>
                    {maintStatus?.storage?.uploads?.count || 0} archivos ({maintStatus?.storage?.uploads?.sizeMB || 0} MB)
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                  <span style={{ color: '#64748b' }}>Pool de Conexiones MySQL:</span>
                  <span style={{ fontWeight: 600, color: '#15803d' }}>75 Conexiones Máximas</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.4rem' }}>
                  <span style={{ color: '#64748b' }}>Motor de Persistencia:</span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>MySQL 8 / MariaDB (InnoDB)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 5: MODO MANTENIMIENTO INSTITUCIONAL                                */}
      {/* ========================================================================= */}
      {activeTab === 'maintenanceMode' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="upel-card upel-card-accent-rose" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Power size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#991b1b', fontWeight: 700 }}>
                  Control de Modo Mantenimiento y Cierre de Lapso
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Notifica a los usuarios institucionales durante cierres académicos, auditorías o migraciones
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, margin: '0 0 1.5rem 0' }}>
              Al activar este modo, los docentes y directivos verán un aviso institucional prioritario en la parte superior del sistema, impidiendo confusiones durante la realización de tareas sensibles (como el cierre de notas o cambio de semestre).
            </p>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}>
              {/* Switch de Activación */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
                    Estado del Aviso de Mantenimiento
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    {maintModeConfig.enabled 
                      ? 'El sistema se encuentra anunciado en labores de mantenimiento.' 
                      : 'El sistema está operando con total normalidad institucional.'}
                  </div>
                </div>

                <button
                  onClick={handleToggleMaintenanceMode}
                  disabled={savingMaintMode}
                  style={{
                    background: maintModeConfig.enabled ? '#dc2626' : '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '0.6rem 1.25rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                  }}
                >
                  <Power size={16} />
                  {maintModeConfig.enabled ? 'DESACTIVAR MANTENIMIENTO' : 'ACTIVAR MANTENIMIENTO'}
                </button>
              </div>

              {/* Nivel de Restricción y Bloqueo */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Política de Acceso durante el Mantenimiento:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                  <div 
                    onClick={() => setMaintModeConfig(prev => ({ ...prev, strictLockout: true }))}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: maintModeConfig.strictLockout !== false ? '2px solid #dc2626' : '1px solid #cbd5e1',
                      background: maintModeConfig.strictLockout !== false ? '#fef2f2' : 'white',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: maintModeConfig.strictLockout !== false ? '#991b1b' : '#334155', fontSize: '0.9rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>🔒</span> Bloqueo Estricto (Recomendado)
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.25rem', lineHeight: 1.4 }}>
                      Bloquea el acceso a Docentes, Jefes y Coordinadores. Solo la cuenta de Administrador puede ingresar. Los demás usuarios verán la pantalla institucional de cierre técnico.
                    </div>
                  </div>

                  <div 
                    onClick={() => setMaintModeConfig(prev => ({ ...prev, strictLockout: false }))}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: maintModeConfig.strictLockout === false ? '2px solid #f59e0b' : '1px solid #cbd5e1',
                      background: maintModeConfig.strictLockout === false ? '#fffbeb' : 'white',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: maintModeConfig.strictLockout === false ? '#92400e' : '#334155', fontSize: '0.9rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>⚠️</span> Modo Suave (Solo Banner)
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.25rem', lineHeight: 1.4 }}>
                      Permite navegar a todos los usuarios mostrando únicamente el banner de advertencia superior. No interrumpe las sesiones de trabajo.
                    </div>
                  </div>
                </div>
              </div>

              {/* Mensaje Personalizado */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Mensaje Institucional a Mostrar:
                </label>
                <textarea
                  value={maintModeConfig.message}
                  onChange={(e) => setMaintModeConfig(prev => ({ ...prev, message: e.target.value }))}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                  placeholder="Ej: El sistema se encuentra en proceso de cierre de período académico. Por favor no realice modificaciones hasta nuevo aviso."
                />
              </div>

              {/* Hora Estimada */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Hora o Fecha Estimada de Finalización (Opcional):
                </label>
                <input
                  type="text"
                  value={maintModeConfig.estimatedEnd}
                  onChange={(e) => setMaintModeConfig(prev => ({ ...prev, estimatedEnd: e.target.value }))}
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem'
                  }}
                  placeholder="Ej: Hoy a las 6:00 PM / Mañana a primera hora"
                />
              </div>

              {/* Vista Previa del Aviso */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Vista Previa en Vivo:
                </div>
                <div style={{
                  background: maintModeConfig.enabled ? '#fffbeb' : '#f1f5f9',
                  border: `1px solid ${maintModeConfig.enabled ? '#f59e0b' : '#cbd5e1'}`,
                  borderRadius: '8px',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: maintModeConfig.enabled ? '#92400e' : '#64748b',
                  fontSize: '0.85rem'
                }}>
                  <AlertTriangle size={18} color={maintModeConfig.enabled ? '#f59e0b' : '#94a3b8'} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Aviso Institucional:</strong> {maintModeConfig.message || 'Sin mensaje especificado.'} {maintModeConfig.estimatedEnd && `(Finalización estimada: ${maintModeConfig.estimatedEnd})`}
                  </div>
                </div>
              </div>

              {maintModeFeedback && (
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  background: maintModeFeedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
                  color: maintModeFeedback.type === 'success' ? '#065f46' : '#991b1b',
                  border: `1px solid ${maintModeFeedback.type === 'success' ? '#a7f3d0' : '#fecaca'}`
                }}>
                  {maintModeFeedback.message}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  onClick={handleSaveMaintenanceMode}
                  disabled={savingMaintMode}
                  style={{
                    background: '#003366',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <SaveIcon size={16} />
                  {savingMaintMode ? 'Guardando...' : 'Guardar Estado de Mantenimiento'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Restauración */}
      {showConfirmModal && createPortal(
        <div className="upel-modal-overlay" style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            maxWidth: '450px',
            width: '100%',
            padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#dc2626', marginBottom: '1rem' }}>
              <AlertTriangle size={24} />
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>¿Confirmar Restauración?</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
              Estás a punto de restaurar la base de datos con el archivo <strong>{restoreFile?.name}</strong>. Esta acción sobrescribirá los docentes y asignaciones actuales.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{
                  background: '#e2e8f0',
                  color: '#334155',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmRestore}
                style={{
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Sí, Restaurar Ahora
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

// Ícono auxiliar de guardado rápido
const SaveIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
);

export default BackupVault;
