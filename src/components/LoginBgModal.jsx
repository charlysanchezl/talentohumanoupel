import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Image as ImageIcon, Upload, RefreshCw, Check, 
  AlertCircle, Eye, Sliders, Sparkles, Building2, Globe, Shield 
} from 'lucide-react';
import { getLoginBgConfig, saveLoginBgConfig, resetLoginBgConfig } from '../data';

const LoginBgModal = ({ isOpen, onClose, onUpdated }) => {
  const [currentConfig, setCurrentConfig] = useState({ bgUrl: '/universidad.jpeg', opacity: 0.55, isDefault: true });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [opacity, setOpacity] = useState(0.55);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      getLoginBgConfig().then(cfg => {
        if (cfg) {
          setCurrentConfig(cfg);
          setPreviewUrl(cfg.bgUrl || '/universidad.jpeg');
          setOpacity(cfg.opacity !== undefined ? cfg.opacity : 0.55);
        }
      });
      setSelectedFile(null);
      setFeedback(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', message: 'Por favor seleccione un archivo de imagen válido (.jpg, .png, .webp).' });
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      setFeedback({ type: 'error', message: 'El archivo excede el tamaño máximo permitido (12 MB).' });
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target.result);
      setFeedback({ type: 'info', message: 'Vista previa cargada. Haga clic en "Guardar y Publicar" para aplicar el cambio a todos los usuarios.' });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setFeedback(null);

    try {
      let config = null;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('opacity', opacity);
        config = await saveLoginBgConfig(formData);
      } else {
        // Solo cambio de opacidad sobre la imagen existente
        config = await saveLoginBgConfig({ opacity });
      }

      if (config) {
        setCurrentConfig(config);
        setFeedback({ type: 'success', message: '¡Fondo del Login actualizado y publicado con éxito!' });
        if (onUpdated) onUpdated(config);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setFeedback({ type: 'error', message: 'No se pudo guardar la imagen en el servidor. Verifique la conexión.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Error procesando la solicitud: ' + err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('¿Desea restaurar la fotografía predeterminada del campus universitario en el Login?')) {
      return;
    }
    setIsResetting(true);
    setFeedback(null);
    try {
      const config = await resetLoginBgConfig();
      if (config) {
        setCurrentConfig(config);
        setPreviewUrl(config.bgUrl);
        setOpacity(config.opacity);
        setSelectedFile(null);
        setFeedback({ type: 'success', message: 'Fondo del Login restaurado a la fotografía oficial de la UPEL.' });
        if (onUpdated) onUpdated(config);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Error restaurando imagen: ' + err.message });
    } finally {
      setIsResetting(false);
    }
  };

  return createPortal(
    <div className="upel-modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(10, 25, 47, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '1.25rem'
    }}>
      <div className="surface animate-scale-up" style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '680px',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Cabecera del Modal con Colores UPEL */}
        <div style={{
          background: 'linear-gradient(135deg, #0047bb 0%, #002e7a 100%)',
          color: '#ffffff',
          padding: '1.25rem 1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTopLeftRadius: '15px',
          borderTopRightRadius: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ImageIcon size={22} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, letterSpacing: '0.3px', color: '#ffffff' }}>
                Fondo de Pantalla del Login
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#bfdbfe' }}>
                Personalización de la imagen principal de acceso al SIGOA
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {feedback && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              background: feedback.type === 'success' ? '#ecfdf5' : (feedback.type === 'error' ? '#fef2f2' : '#eff6ff'),
              border: `1px solid ${feedback.type === 'success' ? '#a7f3d0' : (feedback.type === 'error' ? '#fecaca' : '#bfdbfe')}`,
              color: feedback.type === 'success' ? '#065f46' : (feedback.type === 'error' ? '#991b1b' : '#1e40af')
            }}>
              {feedback.type === 'success' ? <Check size={18} color="#059669" /> : (feedback.type === 'error' ? <AlertCircle size={18} color="#dc2626" /> : <Eye size={18} color="#2563eb" />)}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* 1. Zona de Carga de Archivo */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
              1. Seleccionar Nueva Fotografía
            </label>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp,image/jpg"
              style={{ display: 'none' }}
            />
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed #93c5fd',
                borderRadius: '12px',
                padding: '1.25rem',
                textAlign: 'center',
                background: '#f8fafc',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = '#0047bb'; e.currentTarget.style.background = '#eff6ff'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = '#93c5fd'; e.currentTarget.style.background = '#f8fafc'; }}
            >
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#e0f2fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0047bb'
              }}>
                <Upload size={20} />
              </div>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>
                  {selectedFile ? selectedFile.name : 'Haz clic para seleccionar o arrastra una imagen'}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                  Formatos recomendados: JPG, PNG o WEBP (Paisaje / Horizontal, máx. 12 MB)
                </div>
              </div>
            </div>
          </div>

          {/* 2. Control de Visibilidad / Opacidad de la Capa */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sliders size={15} color="#0047bb" />
                <span>2. Visibilidad de la Imagen (Contraste)</span>
              </label>
              <span style={{
                background: '#e0f2fe',
                color: '#0369a1',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '11.5px',
                fontWeight: 700
              }}>
                {Math.round((1 - opacity) * 100)}% de nitidez ({Math.round(opacity * 100)}% sombra)
              </span>
            </div>
            <input 
              type="range"
              min="0.15"
              max="0.85"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              style={{
                width: '100%',
                accentColor: '#0047bb',
                cursor: 'pointer'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>
              <span>Más visible / Clara (15%)</span>
              <span>Recomendado UPEL (50% - 60%)</span>
              <span>Más oscura (85%)</span>
            </div>
          </div>

          {/* 3. Previsualización en Tiempo Real (Miniatura Maqueta) */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
              3. Vista Previa en Vivo (Simulación de Pantalla de Login)
            </label>
            
            <div style={{
              width: '100%',
              height: '190px',
              borderRadius: '12px',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              border: '1px solid #cbd5e1',
              background: `linear-gradient(135deg, rgba(0, 32, 77, ${opacity}) 0%, rgba(10, 25, 47, ${Math.min(Number(opacity) + 0.15, 0.95)}) 100%), url("${previewUrl || '/universidad.jpeg'}") center/cover no-repeat`
            }}>
              {/* Mini Cintillo */}
              <div style={{
                height: '14px',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 8px',
                fontSize: '6.5px',
                fontWeight: 700,
                color: '#334155',
                borderBottom: '1px solid #cbd5e1'
              }}>
                <span>REPÚBLICA BOLIVARIANA DE VENEZUELA · MPPEU</span>
                <span>upel.edu.ve</span>
              </div>

              {/* Mini Barra Azul */}
              <div style={{
                height: '20px',
                background: '#0047bb',
                display: 'flex',
                alignItems: 'center',
                padding: '0 8px',
                gap: '4px',
                color: 'white',
                fontSize: '7px',
                fontWeight: 700
              }}>
                <img src="/logo.jpg" alt="" style={{ height: '14px', width: 'auto', background: 'white', borderRadius: '2px' }} />
                <span>UNIVERSIDAD PEDAGÓGICA EXPERIMENTAL LIBERTADOR</span>
              </div>

              {/* Mini Botones Flotantes Izquierda */}
              <div style={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ width: '12px', height: '10px', background: '#009a44', borderRadius: '0 3px 3px 0' }} />
                ))}
              </div>

              {/* Mini Tarjeta Login Central */}
              <div style={{
                position: 'absolute',
                top: '55%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '120px',
                background: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                overflow: 'hidden'
              }}>
                <div style={{ background: '#0047bb', padding: '6px', textAlign: 'center', color: '#ffffff' }}>
                  <img src="/logo.jpg" alt="" style={{ width: '18px', height: '18px', margin: '0 auto', borderRadius: '50%', display: 'block', background: 'white', padding: '1px' }} />
                  <div style={{ fontSize: '7.5px', fontWeight: 800, marginTop: '2px' }}>SIGOA - UPEL</div>
                </div>
                <div style={{ padding: '6px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '2px' }} />
                  <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '2px' }} />
                  <div style={{ height: '9px', background: '#0047bb', borderRadius: '3px', marginTop: '2px' }} />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Pie de Acciones */}
        <div style={{
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          padding: '1rem 1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          borderBottomLeftRadius: '15px',
          borderBottomRightRadius: '15px'
        }}>
          <button
            type="button"
            onClick={handleReset}
            disabled={isResetting || isSaving}
            style={{
              background: 'transparent',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#475569',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.background = '#f1f5f9'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = 'transparent'; }}
            title="Restaurar a la foto oficial del campus universitario"
          >
            <RefreshCw size={14} className={isResetting ? 'animate-spin' : ''} />
            <span>Fondo Predeterminado UPEL</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              style={{
                background: '#0047bb',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 20px',
                fontSize: '13px',
                fontWeight: 700,
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(0, 71, 187, 0.25)',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#00368b'}
              onMouseOut={(e) => e.currentTarget.style.background = '#0047bb'}
            >
              {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
              <span>{isSaving ? 'Guardando...' : 'Guardar y Publicar'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default LoginBgModal;
