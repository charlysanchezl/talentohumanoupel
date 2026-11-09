import React, { useState, useEffect } from 'react';
import { getAuditLogs, purgeAuditLogs, getCurrentUser } from '../data';
import { ShieldAlert, Search, RefreshCw, Trash2 } from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purging, setPurging] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const user = getCurrentUser();

  const fetchLogs = async () => {
    setLoading(true);
    const data = await getAuditLogs();
    setLogs(data);
    setLoading(false);
  };

  const handlePurgeOldLogs = async () => {
    if (!window.confirm('⚠️ MANTENIMIENTO PREVENTIVO DE AUDITORÍA\n\n¿Desea depurar los registros de eventos con más de 1 año (365 días) de antigüedad?\n\nEsta operación optimiza la base de datos y conserva intactos todos los registros recientes.')) {
      return;
    }
    setPurging(true);
    try {
      const res = await purgeAuditLogs(365);
      alert(`Mantenimiento completado: se depuraron ${res.affectedRows} registros antiguos.`);
      await fetchLogs();
    } catch (err) {
      alert('Error al depurar registros: ' + err.message);
    } finally {
      setPurging(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const term = searchTerm.toLowerCase();
    return (
      (log.user_name && log.user_name.toLowerCase().includes(term)) ||
      (log.action && log.action.toLowerCase().includes(term)) ||
      (log.details && log.details.toLowerCase().includes(term))
    );
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-VE', { 
      year: 'numeric', month: 'short', day: '2-digit', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div className="animate-fade-in">
      {/* Cabecera Institucional con Contenedor UPEL */}
      <div className="upel-card upel-card-accent-rose" style={{
        padding: '1.75rem 2rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', 
            color: 'white', 
            width: '56px', 
            height: '56px', 
            borderRadius: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)'
          }}>
            <ShieldAlert size={28} />
          </div>
          <div>
            <div className="upel-section-subtitle" style={{ color: '#dc2626' }}>
              <span>🛡️</span> Subdirección de Docencia — Seguridad del Sistema
            </div>
            <h1 style={{ margin: 0, color: '#003366', fontSize: '1.75rem', fontWeight: 800 }}>
              Bitácora de Auditoría
            </h1>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
              Registro inmutable de trazabilidad y eventos de seguridad
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {user?.role === 'ADMIN' && (
            <button 
              onClick={handlePurgeOldLogs} 
              disabled={purging}
              className="btn btn-outline" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'white', color: '#dc2626', borderColor: '#fca5a5' }}
              title="Depurar registros de auditoría mayores a 1 año"
            >
              <Trash2 size={16} /> {purging ? 'Depurando...' : 'Depurar > 1 Año'}
            </button>
          )}
          <button onClick={fetchLogs} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'white' }}>
            <RefreshCw size={16} /> Actualizar Bitácora
          </button>
        </div>
      </div>

      {/* Contenedor Principal de la Bitácora */}
      <div className="upel-card upel-card-accent-blue" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '0.75rem' }}>
          <div>
            <div className="upel-section-subtitle">
              <span>📜</span> Registro de Eventos
            </div>
            <h3 className="upel-section-title">
              Historial Cronológico de Operaciones
            </h3>
          </div>
        </div>
        <div className="upel-section-divider" style={{ marginTop: '0.2rem', marginBottom: '1.25rem' }} />

        <div className="filters-bar" style={{ justifyContent: 'flex-start', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
            <Search size={18} className="text-muted" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              className="filter-input" 
              placeholder="Buscar por usuario, acción o detalles..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '35px', width: '100%' }}
            />
          </div>
        </div>

        <div className="table-container table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Dirección IP</th>
                <th>Acción</th>
                <th>Detalles</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Cargando bitácora...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No hay registros de auditoría.</td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(log.timestamp)}</td>
                    <td style={{ fontWeight: 600 }}>{log.user_name}</td>
                    <td><span className="badge">{log.user_role}</span></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#0369a1' }}>
                      {log.ip_address ? (
                        <span style={{ background: '#f0f9ff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #bae6fd' }}>
                          {log.ip_address}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>127.0.0.1</span>
                      )}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{log.action}</td>
                    <td style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
