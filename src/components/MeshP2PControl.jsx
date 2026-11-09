import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Share2, 
  QrCode, 
  ShieldCheck, 
  Cpu, 
  Server, 
  Smartphone, 
  Laptop, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  Download, 
  Copy, 
  Check, 
  Layers, 
  Zap,
  Clock,
  Activity,
  MapPin
} from 'lucide-react';
import meshEngine from '../services/meshP2PEngine';
import QRCode from 'qrcode';

const MeshP2PControl = () => {
  const [meshState, setMeshState] = useState(meshEngine.getSnapshot());
  const [activeTab, setActiveTab] = useState('radar'); // 'radar' | 'qr' | 'contingencia' | 'log'
  const [qrPayload, setQrPayload] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [inputQrCode, setInputQrCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isUplinking, setIsUplinking] = useState(false);

  useEffect(() => {
    // Iniciar el motor mesh
    meshEngine.start();

    // Suscribirse a actualizaciones
    const unsubscribe = meshEngine.subscribe((snapshot, customEvent) => {
      setMeshState(snapshot);
      if (customEvent) {
        if (customEvent.event === 'MUTATIONS_MERGED') {
          showToast(`¡Se fusionaron ${customEvent.count} cambios P2P desde ${customEvent.sender}!`, 'success');
        } else if (customEvent.event === 'UPLINK_SUCCESS') {
          showToast(`¡Uplink exitoso! ${customEvent.count} transacciones subidas a la base central.`, 'success');
        }
      }
    });

    // Actualizar paquete QR inicial
    const payload = meshEngine.exportQueueForQR();
    setQrPayload(payload);

    return () => {
      unsubscribe();
    };
  }, []);

  // Generar Código QR Real cuando cambia el payload
  useEffect(() => {
    const generateRealQr = async () => {
      try {
        const textToEncode = qrPayload || 'UPEL_SIGOA_READY';
        const url = await QRCode.toDataURL(textToEncode, {
          width: 260,
          margin: 2,
          color: {
            dark: '#1a367c', // Azul Oficial UPEL
            light: '#ffffff'
          },
          errorCorrectionLevel: 'M'
        });
        setQrDataUrl(url);
      } catch (err) {
        console.error('Error generando QR:', err);
      }
    };
    generateRealQr();
  }, [qrPayload]);

  const showToast = (msg, type = 'info') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleCopyPayload = () => {
    const code = meshEngine.exportQueueForQR();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Paquete de datos P2P copiado al portapapeles', 'info');
  };

  const handleImportQr = () => {
    if (!inputQrCode.trim()) {
      showToast('Por favor introduce o pega el código del paquete de tu colega', 'error');
      return;
    }
    const res = meshEngine.importQueueFromQR(inputQrCode);
    if (res.success) {
      showToast(`¡Sincronizado con éxito con ${res.origin}! ${res.merged} mutaciones nuevas integradas.`, 'success');
      setInputQrCode('');
      setQrPayload(meshEngine.exportQueueForQR());
    } else {
      showToast(res.error, 'error');
    }
  };

  const handleSimulateBlackoutMutation = () => {
    const item = meshEngine.injectSimulatedMutation('UPDATE_CARGA');
    setQrPayload(meshEngine.exportQueueForQR());
    showToast(`Transacción #${item.id.slice(-6)} registrada en modo Apagón y transmitida por la Malla P2P.`, 'success');
  };

  const handleForceUplink = async () => {
    setIsUplinking(true);
    try {
      const res = await meshEngine.performCloudUplink();
      if (res.success) {
        showToast(`¡Transmisión finalizada! ${res.processed || 0} registros enviados al servidor MySQL.`, 'success');
        setQrPayload(meshEngine.exportQueueForQR());
      } else {
        showToast(res.error || 'No se pudo contactar con la nube central', 'error');
      }
    } catch (e) {
      showToast('Error en enlace: ' + e.message, 'error');
    } finally {
      setIsUplinking(false);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
          background: toastMessage.type === 'success' ? '#065f46' : (toastMessage.type === 'error' ? '#991b1b' : '#003366'),
          color: '#ffffff', padding: '12px 20px', borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600, fontSize: '14px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          {toastMessage.type === 'success' && <CheckCircle2 size={18} color="#34d399" />}
          {toastMessage.type === 'error' && <AlertTriangle size={18} color="#f87171" />}
          {toastMessage.type === 'info' && <Radio size={18} color="#38bdf8" />}
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #002244 0%, #003366 50%, #004d73 100%)',
        borderRadius: '16px', padding: '2rem', color: '#ffffff',
        boxShadow: '0 12px 30px rgba(0, 34, 68, 0.25)', border: '1px solid rgba(255,255,255,0.15)',
        marginBottom: '1.75rem', position: 'relative', overflow: 'hidden'
      }}>
        {/* Glow de fondo */}
        <div style={{
          position: 'absolute', top: '-40px', right: '-40px', width: '220px', height: '220px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none'
        }}></div>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{
                background: 'rgba(16, 185, 129, 0.2)', padding: '6px 12px', borderRadius: '99px',
                border: '1px solid #10b981', display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <span style={{
                  width: '8px', height: '8px', borderRadius: '50%', background: '#10b981',
                  boxShadow: '0 0 8px #10b981', display: 'inline-block'
                }}></span>
                <span style={{ color: '#a7f3d0', fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px' }}>
                  RED MESH P2P ACTIVA 2026
                </span>
              </div>
              <span style={{
                background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '6px',
                fontSize: '12px', color: '#93c5fd'
              }}>
                {meshState.identity.sede}
              </span>
            </div>

            <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
              Red MESH P2P "Anti-Apagones"
            </h1>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.85)', fontSize: '14px', maxWidth: '680px' }}>
              Protocolo de resiliencia territorial que permite a los docentes de la sede <strong>Rubio</strong> y las extensiones <strong>Sabana de Mendoza</strong> y <strong>Encontrados</strong> seguir cargando y sincronizando datos de teléfono a teléfono, incluso sin internet ni electricidad.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleForceUplink}
              disabled={isUplinking || meshState.localQueue.length === 0}
              style={{
                background: meshState.localQueue.length > 0 ? '#10b981' : 'rgba(255,255,255,0.15)',
                color: meshState.localQueue.length > 0 ? '#022c22' : '#ffffff',
                border: 'none', padding: '12px 18px', borderRadius: '10px',
                fontWeight: 700, fontSize: '14px', cursor: meshState.localQueue.length > 0 ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
                boxShadow: meshState.localQueue.length > 0 ? '0 4px 14px rgba(16, 185, 129, 0.4)' : 'none'
              }}
            >
              <ArrowUpRight size={18} />
              {isUplinking ? 'Transmitiendo...' : `Subir a la Nube Central (${meshState.localQueue.length})`}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem', marginBottom: '1.75rem'
      }}>
        {/* Nodos Descubiertos */}
        <div style={{
          background: '#ffffff', borderRadius: '12px', padding: '1.25rem',
          border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)',
          display: 'flex', alignItems: 'center', gap: '14px'
        }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '10px',
            background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#0284c7'
          }}>
            <Radio size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Nodos UPEL en Rango</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
              {meshState.peers.length + 1}
            </div>
          </div>
        </div>

        {/* Transacciones Retenidas en este Dispositivo */}
        <div style={{
          background: '#ffffff', borderRadius: '12px', padding: '1.25rem',
          border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)',
          display: 'flex', alignItems: 'center', gap: '14px'
        }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '10px',
            background: meshState.localQueue.length > 0 ? '#fef3c7' : '#e6f6ee',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: meshState.localQueue.length > 0 ? '#d97706' : '#008744'
          }}>
            <Layers size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>En Cola Local (Offline)</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
              {meshState.localQueue.length} <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>mutaciones</span>
            </div>
          </div>
        </div>

        {/* Fusión P2P Acumulada */}
        <div style={{
          background: '#ffffff', borderRadius: '12px', padding: '1.25rem',
          border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)',
          display: 'flex', alignItems: 'center', gap: '14px'
        }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '10px',
            background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#059669'
          }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Fusionadas por Malla</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
              {meshState.totalP2PMerged} <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>recibidas</span>
            </div>
          </div>
        </div>

        {/* Estatus del Enlace a Servidor */}
        <div style={{
          background: '#ffffff', borderRadius: '12px', padding: '1.25rem',
          border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)',
          display: 'flex', alignItems: 'center', gap: '14px'
        }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '10px',
            background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#475569'
          }}>
            <Server size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Gateway de Respaldo</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#008744', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#008744', display: 'inline-block' }}></span>
              Listo para Re-enlace
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{
        display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0',
        marginBottom: '1.5rem'
      }}>
        <button
          onClick={() => setActiveTab('radar')}
          style={{
            padding: '10px 18px', background: 'none', border: 'none',
            borderBottom: activeTab === 'radar' ? '3px solid #003366' : '3px solid transparent',
            color: activeTab === 'radar' ? '#003366' : '#64748b',
            fontWeight: activeTab === 'radar' ? 700 : 500,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px'
          }}
        >
          <Radio size={18} />
          <span>Radar de Nodos MESH</span>
        </button>

        <button
          onClick={() => { setActiveTab('qr'); setQrPayload(meshEngine.exportQueueForQR()); }}
          style={{
            padding: '10px 18px', background: 'none', border: 'none',
            borderBottom: activeTab === 'qr' ? '3px solid #003366' : '3px solid transparent',
            color: activeTab === 'qr' ? '#003366' : '#64748b',
            fontWeight: activeTab === 'qr' ? 700 : 500,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px'
          }}
        >
          <QrCode size={18} />
          <span>Sincronización QR Air-Gapped (Sin Red)</span>
        </button>

        <button
          onClick={() => setActiveTab('contingencia')}
          style={{
            padding: '10px 18px', background: 'none', border: 'none',
            borderBottom: activeTab === 'contingencia' ? '3px solid #003366' : '3px solid transparent',
            color: activeTab === 'contingencia' ? '#003366' : '#64748b',
            fontWeight: activeTab === 'contingencia' ? 700 : 500,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px'
          }}
        >
          <Zap size={18} />
          <span>Simulador de Apagón</span>
        </button>

        <button
          onClick={() => setActiveTab('log')}
          style={{
            padding: '10px 18px', background: 'none', border: 'none',
            borderBottom: activeTab === 'log' ? '3px solid #003366' : '3px solid transparent',
            color: activeTab === 'log' ? '#003366' : '#64748b',
            fontWeight: activeTab === 'log' ? 700 : 500,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px'
          }}
        >
          <Layers size={18} />
          <span>Cola de Mutaciones ({meshState.localQueue.length})</span>
        </button>
      </div>

      {/* TAB 1: RADAR DE NODOS MESH */}
      {activeTab === 'radar' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 1.4fr', gap: '1.5rem' }}>
          
          {/* Sonar Radar Visual */}
          <div style={{
            background: 'linear-gradient(180deg, #091a28 0%, #030d17 100%)',
            borderRadius: '16px', padding: '1.75rem', color: '#ffffff',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden', minHeight: '380px',
            border: '1px solid #1e3a5f', boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
          }}>
            {/* Anillos concéntricos del sonar */}
            <div style={{
              position: 'relative', width: '280px', height: '280px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{ position: 'absolute', width: '260px', height: '260px', borderRadius: '50%', border: '1px dashed rgba(56, 189, 248, 0.25)' }}></div>
              <div style={{ position: 'absolute', width: '190px', height: '190px', borderRadius: '50%', border: '1px solid rgba(56, 189, 248, 0.2)' }}></div>
              <div style={{ position: 'absolute', width: '120px', height: '120px', borderRadius: '50%', border: '1px solid rgba(56, 189, 248, 0.3)' }}></div>
              
              {/* Ejes cartesianos */}
              <div style={{ position: 'absolute', width: '280px', height: '1px', background: 'rgba(56, 189, 248, 0.15)' }}></div>
              <div style={{ position: 'absolute', height: '280px', width: '1px', background: 'rgba(56, 189, 248, 0.15)' }}></div>

              {/* Centro: Tu Dispositivo */}
              <div style={{
                position: 'relative', zIndex: 10,
                width: '42px', height: '42px', borderRadius: '50%',
                background: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 20px #0284c7', border: '2px solid #ffffff'
              }} title="Tu Nodo Activo">
                <Smartphone size={20} color="#ffffff" />
              </div>

              {/* Nodo Sede Rubio */}
              <div style={{
                position: 'absolute', top: '35px', right: '55px', zIndex: 5,
                width: '32px', height: '32px', borderRadius: '50%',
                background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 12px #10b981', border: '1px solid #ffffff'
              }} title="Sede Rubio Central">
                <Server size={16} color="#ffffff" />
              </div>

              {/* Nodo Sabana de Mendoza */}
              <div style={{
                position: 'absolute', bottom: '45px', left: '40px', zIndex: 5,
                width: '30px', height: '30px', borderRadius: '50%',
                background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 10px #f59e0b'
              }} title="Extensión Sabana de Mendoza">
                <Radio size={14} color="#ffffff" />
              </div>

              {/* Nodo Encontrados */}
              <div style={{
                position: 'absolute', bottom: '60px', right: '35px', zIndex: 5,
                width: '30px', height: '30px', borderRadius: '50%',
                background: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 10px #8b5cf6'
              }} title="Extensión Encontrados">
                <Radio size={14} color="#ffffff" />
              </div>
            </div>

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#38bdf8' }}>
                Escaneando Malla Territorial UPEL...
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                Frecuencia de Chisme Local: 5.0s | Alcance: Red Local + Dispositivos Conectados
              </div>
            </div>
          </div>

          {/* Lista de Nodos Descubiertos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                Nodos y Dispositivos en la Malla
              </h3>
              <button
                onClick={() => { meshEngine.broadcastPresence(); showToast('Latido de presencia emitido a los pares', 'info'); }}
                style={{
                  background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px',
                  borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <RefreshCw size={14} /> Emitir Presencia
              </button>
            </div>

            {/* Tu propio nodo */}
            <div style={{
              background: '#f0f9ff', borderRadius: '10px', padding: '12px 16px',
              border: '1.5px solid #38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '8px', background: '#0284c7',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff'
                }}>
                  <Smartphone size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0369a1' }}>
                    {meshState.identity.deviceName} (Tu Dispositivo)
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Sede: {meshState.identity.sede} • Rol: {meshState.identity.role}
                  </div>
                </div>
              </div>
              <span style={{
                background: '#0284c7', color: '#ffffff', fontSize: '11px', fontWeight: 700,
                padding: '3px 8px', borderRadius: '6px'
              }}>
                NODO LOCAL
              </span>
            </div>

            {/* Nodos remotos */}
            {meshState.peers.map((peer) => (
              <div key={peer.nodeId} style={{
                background: '#ffffff', borderRadius: '10px', padding: '12px 16px',
                border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    background: peer.role === 'GATEWAY_CENTRAL' ? '#ecfdf5' : '#f8fafc',
                    color: peer.role === 'GATEWAY_CENTRAL' ? '#059669' : '#475569',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {peer.role === 'GATEWAY_CENTRAL' ? <Server size={18} /> : <Laptop size={18} />}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                      {peer.deviceName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={12} /> {peer.sede} • Señal: {peer.signal}%
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px',
                    background: peer.status === 'online' ? '#dcfce7' : (peer.status === 'mesh' ? '#e0f2fe' : '#fee2e2'),
                    color: peer.status === 'online' ? '#166534' : (peer.status === 'mesh' ? '#075985' : '#991b1b')
                  }}>
                    {peer.status === 'online' ? 'CONECTADO' : (peer.status === 'mesh' ? 'EN MALLA' : 'DESCONECTADO')}
                  </span>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>
                    {peer.pendingSync > 0 ? `${peer.pendingSync} cargas ptes` : 'Al día'}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 2: SINCRONIZACIÓN QR AIR-GAPPED */}
      {activeTab === 'qr' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          
          {/* Columna Izquierda: Generar y Mostrar mi Código */}
          <div style={{
            background: '#ffffff', borderRadius: '16px', padding: '1.75rem',
            border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700, color: '#003366', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <QrCode size={20} /> 1. Mi Código QR de Transferencia
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>
              Muestra este código a otro docente o coordinador para que lo escanee con su teléfono y absorba tus cargas offline sin necesidad de red.
            </p>

            {/* Representación Visual del Paquete QR Real */}
            <div style={{
              background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '12px',
              padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '12px', marginBottom: '16px'
            }}>
              <div style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(26, 54, 124, 0.12)',
                border: '1px solid #e2e8f0'
              }}>
                {qrDataUrl ? (
                  <img 
                    src={qrDataUrl} 
                    alt="Código QR Real UPEL SIGOA" 
                    style={{ width: '200px', height: '200px', display: 'block', borderRadius: '8px' }}
                  />
                ) : (
                  <div style={{ width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                    Generando código QR...
                  </div>
                )}
                <div style={{ 
                  marginTop: '8px', 
                  fontSize: '11px', 
                  color: '#1a367c', 
                  fontWeight: 700, 
                  letterSpacing: '0.04em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <QrCode size={14} color="#008744" />
                  <span>CÓDIGO QR ESCANEABLE UPEL</span>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: '#475569', textAlign: 'center' }}>
                Contiene: <strong>{meshState.localQueue.length} mutaciones</strong> retenidas en este dispositivo.
              </div>
            </div>

            <button
              onClick={handleCopyPayload}
              style={{
                width: '100%', padding: '10px 16px', background: '#003366',
                color: '#ffffff', border: 'none', borderRadius: '8px',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? '¡Copiado!' : 'Copiar Token Criptográfico para Compartir'}</span>
            </button>
          </div>

          {/* Columna Derecha: Absorber Código de Otro Colega */}
          <div style={{
            background: '#ffffff', borderRadius: '16px', padding: '1.75rem',
            border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)',
            display: 'flex', flexDirection: 'column'
          }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700, color: '#008744', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download size={20} /> 2. Absorber Cambios de un Colega
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>
              Pega aquí el paquete recibido de otro profesor o escaneado desde su pantalla para fusionar su trabajo con tu dispositivo.
            </p>

            <textarea
              rows={6}
              placeholder="Pega aquí el código del paquete UPEL Mesh..."
              value={inputQrCode}
              onChange={(e) => setInputQrCode(e.target.value)}
              style={{
                width: '100%', padding: '12px', borderRadius: '8px',
                border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace',
                marginBottom: '16px', resize: 'vertical'
              }}
            />

            <button
              onClick={handleImportQr}
              style={{
                marginTop: 'auto', width: '100%', padding: '12px 16px',
                background: '#008744', color: '#ffffff', border: 'none',
                borderRadius: '8px', fontSize: '14px', fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              <Share2 size={16} />
              <span>Fusionar Cambios en mi Dispositivo</span>
            </button>
          </div>

        </div>
      )}

      {/* TAB 3: SIMULADOR DE APAGÓN */}
      {activeTab === 'contingencia' && (
        <div style={{
          background: '#ffffff', borderRadius: '16px', padding: '2rem',
          border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={22} color="#f59e0b" /> Banco de Pruebas: Simulación de Contingencia Eléctrica
          </h3>
          <p style={{ margin: '0 0 24px 0', color: '#64748b', fontSize: '14px' }}>
            Prueba cómo reacciona el sistema cuando se interrumpe la electricidad o la conexión en Rubio o en las extensiones foráneas.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            
            {/* Prueba 1: Generar Carga en Apagón */}
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Paso 1: Cargar Materia sin Internet
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                Simula que un docente en Sabana de Mendoza actualiza su horario mientras no hay luz ni datos.
              </p>
              <button
                onClick={handleSimulateBlackoutMutation}
                style={{
                  background: '#f59e0b', color: '#ffffff', border: 'none', padding: '10px 14px',
                  borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}
              >
                <Zap size={16} /> Crear Transacción Offline
              </button>
            </div>

            {/* Prueba 2: Replicar por la Malla */}
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Paso 2: Difundir a la Malla Local
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                Transmite las transacciones retenidas por el canal de chisme P2P a todas las computadoras y celulares cercanos.
              </p>
              <button
                onClick={() => { meshEngine.broadcastQueue(); showToast('Transacciones difundidas a los pares de la malla', 'info'); }}
                style={{
                  background: '#0284c7', color: '#ffffff', border: 'none', padding: '10px 14px',
                  borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}
              >
                <Share2 size={16} /> Difundir a Dispositivos Cercanos
              </button>
            </div>

            {/* Prueba 3: Restablecimiento y Uplink */}
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Paso 3: Llegó la Señal (Uplink)
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                Apenas un solo teléfono recupera conexión, sube toda la bolsa de transacciones a la base de datos central de Rubio.
              </p>
              <button
                onClick={handleForceUplink}
                disabled={isUplinking}
                style={{
                  background: '#008744', color: '#ffffff', border: 'none', padding: '10px 14px',
                  borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}
              >
                <ArrowUpRight size={16} /> Ejecutar Enlace a la Nube
              </button>
            </div>

          </div>
        </div>
      )}

      {/* TAB 4: COLA DE MUTACIONES */}
      {activeTab === 'log' && (
        <div style={{
          background: '#ffffff', borderRadius: '16px', padding: '1.75rem',
          border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                Bolsa de Transacciones Retenidas en Este Dispositivo
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                Estas mutaciones están seguras en el almacenamiento local y se replicarán en la base central en cuanto haya conexión.
              </p>
            </div>

            <span style={{
              background: '#e0f2fe', color: '#0369a1', padding: '4px 12px',
              borderRadius: '99px', fontSize: '13px', fontWeight: 700
            }}>
              {meshState.localQueue.length} pendientes
            </span>
          </div>

          {meshState.localQueue.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
              <CheckCircle2 size={42} color="#10b981" style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>No hay transacciones pendientes</div>
              <div style={{ fontSize: '13px' }}>Todos los datos de tu dispositivo están 100% sincronizados con la base central de la UPEL.</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '10px 14px', color: '#475569' }}>ID Transacción</th>
                    <th style={{ padding: '10px 14px', color: '#475569' }}>Operación</th>
                    <th style={{ padding: '10px 14px', color: '#475569' }}>Docente / Cédula</th>
                    <th style={{ padding: '10px 14px', color: '#475569' }}>Origen</th>
                    <th style={{ padding: '10px 14px', color: '#475569' }}>Fecha/Hora</th>
                    <th style={{ padding: '10px 14px', color: '#475569' }}>Canal</th>
                  </tr>
                </thead>
                <tbody>
                  {meshState.localQueue.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 600, color: '#0284c7' }}>
                        #{item.id.slice(-8)}
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 600 }}>
                        <span style={{
                          background: item.type === 'CREATE_STAFF' ? '#dcfce7' : '#e0e7ff',
                          color: item.type === 'CREATE_STAFF' ? '#15803d' : '#4338ca',
                          padding: '2px 8px', borderRadius: '4px', fontSize: '11px'
                        }}>
                          {item.type}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', color: '#1e293b' }}>
                        {item.payload?.nombre || item.payload?.cedula || 'Registro General'}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#64748b' }}>
                        {item.auditor || 'Docente Móvil'}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#64748b' }}>
                        {new Date(item.timestamp).toLocaleTimeString('es-ES')}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          fontSize: '11px', fontWeight: 600,
                          color: item.viaMesh ? '#059669' : '#0369a1'
                        }}>
                          {item.viaMesh ? '📡 Vía Malla P2P' : '📱 Local'}
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

    </div>
  );
};

export default MeshP2PControl;
