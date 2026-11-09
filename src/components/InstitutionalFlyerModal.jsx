import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Upload, RefreshCw, Sparkles, Image as ImageIcon, 
  Settings, Check, Eye, AlertCircle, RotateCcw, ShieldCheck,
  Power, EyeOff, Film, Video, Play
} from 'lucide-react';
import { getFlyerConfig, saveFlyerConfig, resetFlyerConfig, getCurrentUser } from '../data';

const isVideoMedia = (url, type) => {
  if (!url || typeof url !== 'string') return false;
  const clean = url.split('?')[0].toLowerCase();
  if (clean.endsWith('.jpg') || clean.endsWith('.jpeg') || clean.endsWith('.png') || clean.endsWith('.webp')) {
    return false;
  }
  if (clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.endsWith('.mov') || clean.endsWith('.ogg') || clean.endsWith('.m4v')) {
    return true;
  }
  return type === 'video';
};

const InstitutionalFlyerModal = ({ isOpen, onClose, onUpdated }) => {
  const user = getCurrentUser();
  const canManage = user?.role === 'ADMIN' || user?.role === 'AUDITOR' || user?.role === 'DOCENCIA';

  const [config, setConfig] = useState({
    imageUrl: '/dia_secretaria_upel.jpg',
    mediaType: 'image',
    title: 'Feliz Día de la Secretaria',
    subtitle: 'Instituto Pedagógico Rural "Gervasio Rubio" · UPEL',
    enabled: true,
    autoOpen: true,
    isDefault: true
  });

  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [mediaType, setMediaType] = useState('image');
  const [previewUrl, setPreviewUrl] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [autoOpen, setAutoOpen] = useState(true);
  const [enabled, setEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isToggling, setIsToggling] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      getFlyerConfig().then((cfg) => {
        if (cfg) {
          setConfig(cfg);
          setPreviewUrl(cfg.imageUrl || '/dia_secretaria_upel.jpg');
          setMediaType(cfg.mediaType || (isVideoMedia(cfg.imageUrl) ? 'video' : 'image'));
          setTitle(cfg.title || 'Feliz Día de la Secretaria');
          setSubtitle(cfg.subtitle || 'Instituto Pedagógico Rural "Gervasio Rubio" · UPEL');
          setAutoOpen(cfg.autoOpen !== undefined ? cfg.autoOpen : true);
          setEnabled(cfg.enabled !== undefined ? cfg.enabled : true);
        }
      });
      setSelectedFile(null);
      setFeedback(null);
      setIsEditing(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImg = file.type.startsWith('image/');
    const isVid = file.type.startsWith('video/') || /\.(mp4|webm|mov|ogg|m4v)$/i.test(file.name);

    if (!isImg && !isVid) {
      setFeedback({ 
        type: 'error', 
        message: 'Seleccione un archivo válido: Imagen (.jpg, .png, .webp) o Reel / Video (.mp4, .webm, .mov).' 
      });
      return;
    }

    const maxSize = isVid ? 100 * 1024 * 1024 : 20 * 1024 * 1024;
    if (file.size > maxSize) {
      setFeedback({ 
        type: 'error', 
        message: `El archivo excede el tamaño máximo permitido (${isVid ? '100 MB para Reels' : '20 MB para imágenes'}).` 
      });
      return;
    }

    setSelectedFile(file);
    const newType = isVid ? 'video' : 'image';
    setMediaType(newType);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setFeedback({ 
      type: 'info', 
      message: isVid 
        ? '🎬 Reel de video cargado. Haga clic en "Guardar y Publicar" para activarlo en el sistema.' 
        : '🖼️ Vista previa de imagen cargada. Haga clic en "Guardar y Publicar" para aplicar el cambio.' 
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setFeedback(null);

    try {
      let saved = null;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('mediaType', mediaType);
        formData.append('title', title);
        formData.append('subtitle', subtitle);
        formData.append('autoOpen', autoOpen);
        formData.append('enabled', enabled);
        saved = await saveFlyerConfig(formData);
      } else {
        saved = await saveFlyerConfig({
          mediaType,
          title,
          subtitle,
          autoOpen,
          enabled
        });
      }

      if (saved) {
        setConfig(saved);
        setFeedback({ type: 'success', message: 'Flyer institucional actualizado y publicado con éxito.' });
        setSelectedFile(null);
        if (onUpdated) onUpdated(saved);
        setTimeout(() => {
          setIsEditing(false);
        }, 1200);
      } else {
        setFeedback({ type: 'error', message: 'No se pudo guardar la configuración en el servidor.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Error al guardar: ' + err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleEnabled = async (e) => {
    if (e) e.stopPropagation();
    setIsToggling(true);
    try {
      const nextState = !config.enabled;
      const saved = await saveFlyerConfig({
        enabled: nextState
      });
      if (saved) {
        setConfig(saved);
        setEnabled(saved.enabled);
        if (onUpdated) onUpdated(saved);
      }
    } catch (err) {
      console.error('Error al alternar estado del flyer:', err);
    } finally {
      setIsToggling(false);
    }
  };

  const handleResetDefault = async () => {
    if (!window.confirm('¿Desea restaurar el flyer conmemorativo oficial del Día de la Secretaria UPEL?')) return;
    setIsResetting(true);
    setFeedback(null);
    try {
      const def = await resetFlyerConfig();
      if (def) {
        setConfig(def);
        setPreviewUrl(def.imageUrl);
        setTitle(def.title);
        setSubtitle(def.subtitle);
        setAutoOpen(def.autoOpen);
        setEnabled(def.enabled);
        setSelectedFile(null);
        setFeedback({ type: 'success', message: 'Flyer restaurado al diseño oficial del Día de la Secretaria UPEL.' });
        if (onUpdated) onUpdated(def);
      }
    } catch (e) {
      setFeedback({ type: 'error', message: 'Error restaurando flyer: ' + e.message });
    } finally {
      setIsResetting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="upel-modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(10, 25, 47, 0.78)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && typeof onClose === 'function') {
          onClose();
        }
      }}
    >
      <div 
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: isEditing ? '680px' : '920px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transition: 'all 0.3s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón flotante 'X' de cierre (estilo UPEL popup maker) */}
        <button
          type="button"
          onClick={(e) => {
            if (e) {
              e.preventDefault();
              e.stopPropagation();
            }
            if (typeof onClose === 'function') {
              onClose();
            }
          }}
          style={{
            position: 'absolute',
            top: '-16px',
            right: '-16px',
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0047bb 0%, #002e7a 100%)',
            color: '#ffffff',
            border: '2.5px solid #ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.35)',
            zIndex: 10,
            transition: 'transform 0.15s ease, background 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          title="Cerrar flyer"
        >
          <X size={22} strokeWidth={2.5} />
        </button>

        {/* MODO VISUALIZADOR DE FLYER: SOLO IMAGEN LIMPIA (IDÉNTICO A UPEL.EDU.VE) */}
        {!isEditing ? (
          <div 
            className="animate-scale-up" 
            style={{ 
              position: 'relative',
              width: '100%', 
              background: 'transparent', 
              borderRadius: '16px', 
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Imagen o Reel de Video del Flyer */}
            {isVideoMedia(config.imageUrl, config.mediaType) ? (
              <video 
                key={config.imageUrl}
                src={config.imageUrl} 
                controls 
                autoPlay 
                loop 
                playsInline
                style={{
                  width: '100%',
                  maxHeight: '84vh',
                  objectFit: 'contain',
                  display: 'block',
                  borderRadius: '16px',
                  background: '#000000'
                }}
              />
            ) : (
              <img 
                src={config.imageUrl || '/dia_secretaria_upel.jpg'} 
                alt={config.title || 'Flyer Institucional UPEL'} 
                style={{
                  width: '100%',
                  maxHeight: '84vh',
                  objectFit: 'contain',
                  display: 'block',
                  borderRadius: '16px'
                }}
                onError={(e) => {
                  e.target.src = '/dia_secretaria_upel.jpg';
                }}
              />
            )}

            {/* Indicador de Estado del Flyer / Reel */}
            <div style={{
              position: 'absolute',
              top: '14px',
              left: '14px',
              background: config.enabled ? 'rgba(22, 101, 52, 0.92)' : 'rgba(185, 28, 28, 0.92)',
              color: '#ffffff',
              padding: '5px 14px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 3px 10px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              letterSpacing: '0.4px',
              zIndex: 5
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: config.enabled ? '#4ade80' : '#f87171',
                boxShadow: config.enabled ? '0 0 8px #4ade80' : 'none'
              }} />
              <span>
                {config.enabled 
                  ? (isVideoMedia(config.imageUrl, config.mediaType) ? 'REEL PUBLICADO' : 'FLYER ACTIVADO') 
                  : 'FLYER DESACTIVADO'}
              </span>
            </div>

            {/* Botones de gestión rápida para Admin / Auditor / Docencia */}
            {canManage && (
              <div style={{
                position: 'absolute',
                bottom: '14px',
                right: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                zIndex: 5,
                flexWrap: 'wrap',
                justifyContent: 'flex-end'
              }}>
                {/* Botón Instantáneo Activar / Desactivar */}
                <button
                  type="button"
                  onClick={handleToggleEnabled}
                  disabled={isToggling}
                  style={{
                    background: config.enabled 
                      ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' 
                      : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                    color: '#ffffff',
                    border: '1.5px solid rgba(255, 255, 255, 0.8)',
                    borderRadius: '24px',
                    padding: '7px 16px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: isToggling ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.45)',
                    transition: 'all 0.2s ease',
                    opacity: isToggling ? 0.7 : 1
                  }}
                  title={config.enabled ? 'Haga clic para DESACTIVAR este flyer' : 'Haga clic para ACTIVAR este flyer'}
                >
                  <Power size={14} />
                  <span>{config.enabled ? 'Desactivar Flyer' : 'Activar Flyer'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  style={{
                    background: 'rgba(0, 32, 77, 0.88)',
                    color: '#ffffff',
                    border: '1.5px solid rgba(255, 255, 255, 0.6)',
                    borderRadius: '24px',
                    padding: '7px 16px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.45)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#0047bb';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 32, 77, 0.88)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  title="Subir una nueva imagen o configurar este flyer"
                >
                  <Upload size={14} />
                  <span>Cambiar Imagen</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* MODO EDITOR Y SUBIDA DE IMAGEN (ADMIN, AUDITOR, DOCENCIA) */
          <div 
            className="animate-scale-up" 
            style={{ 
              width: '100%', 
              background: '#ffffff', 
              borderRadius: '20px', 
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #cbd5e1'
            }}
          >
            {/* Cabecera del Editor */}
            <div style={{
              background: 'linear-gradient(135deg, #0047bb 0%, #002e7a 100%)',
              color: '#ffffff',
              padding: '1.25rem 1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
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
                  <ImageIcon size={20} color="#ffffff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                    Administrar Flyer Institucional
                  </h3>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', opacity: 0.9 }}>
                    Subir nueva imagen para el comunicado popup (Admin / Auditor / Docencia)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#ffffff',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Volver a la Vista
              </button>
            </div>

            {/* Cuerpo del Editor */}
            <div style={{ padding: '1.75rem', overflowY: 'auto', maxHeight: '70vh' }}>
              
              {feedback && (
                <div style={{
                  marginBottom: '1.25rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  background: feedback.type === 'error' ? '#fef2f2' : feedback.type === 'success' ? '#f0fdf4' : '#eff6ff',
                  border: `1px solid ${feedback.type === 'error' ? '#fecaca' : feedback.type === 'success' ? '#bbf7d0' : '#bfdbfe'}`,
                  color: feedback.type === 'error' ? '#b91c1c' : feedback.type === 'success' ? '#15803d' : '#1d4ed8'
                }}>
                  {feedback.type === 'error' ? <AlertCircle size={18} /> : feedback.type === 'success' ? <Check size={18} /> : <Eye size={18} />}
                  <span>{feedback.message}</span>
                </div>
              )}

              {/* Área de Selección y Carga de Imagen o Reel */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#003366', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  <Upload size={16} /> Subir Imagen o Reel de Video
                </label>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/png, image/jpeg, image/webp, video/mp4, video/webm, video/quicktime, video/ogg" 
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed #0047bb',
                    borderRadius: '14px',
                    padding: '1.5rem',
                    textAlign: 'center',
                    background: '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#eff6ff'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#f8fafc'}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                    <Upload size={32} color="#0047bb" style={{ opacity: 0.8 }} />
                    <Film size={32} color="#008744" style={{ opacity: 0.85 }} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0047bb' }}>
                    Haga clic aquí para seleccionar una Imagen o Reel de Video
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.35rem', lineHeight: '1.4' }}>
                    Formatos: <strong>Imágenes</strong> (JPG, PNG, WEBP) o <strong>Reels de Video</strong> (.MP4, .WEBM, .MOV hasta 100 MB).<br />
                    Compatible con reels verticales estilo Instagram/TikTok (9:16) y videos horizontales (16:9).
                  </div>
                </div>
              </div>

              {/* Vista previa de la imagen o reel actual */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Vista Previa del Flyer / Reel:</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                    Tipo: {isVideoMedia(previewUrl || config.imageUrl, mediaType) ? '🎬 Reel de Video' : '🖼️ Imagen'}
                  </span>
                </div>
                <div style={{ 
                  borderRadius: '12px', 
                  overflow: 'hidden', 
                  border: '1px solid #e2e8f0', 
                  background: '#0f172a',
                  textAlign: 'center',
                  maxHeight: '260px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {isVideoMedia(previewUrl || config.imageUrl, mediaType) ? (
                    <video 
                      key={previewUrl || config.imageUrl}
                      src={previewUrl || config.imageUrl} 
                      controls 
                      autoPlay 
                      muted 
                      loop 
                      playsInline
                      style={{ width: '100%', maxHeight: '260px', objectFit: 'contain', background: '#000000' }}
                    />
                  ) : (
                    <img 
                      src={previewUrl || config.imageUrl || '/dia_secretaria_upel.jpg'} 
                      alt="Vista previa flyer"
                      style={{ width: '100%', maxHeight: '220px', objectFit: 'contain' }}
                      onError={(e) => {
                        e.target.src = '/dia_secretaria_upel.jpg';
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Título y Subtítulo */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 600 }}>Título Conmemorativo</label>
                  <input 
                    type="text" 
                    className="filter-input w-full"
                    placeholder="Ej: Feliz Día de la Secretaria"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 600 }}>Subtítulo Institucional</label>
                  <input 
                    type="text" 
                    className="filter-input w-full"
                    placeholder="Ej: UPEL IPRGR Rubio"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                  />
                </div>
              </div>

              {/* Opciones de Publicación */}
              <div style={{ 
                background: '#f8fafc', 
                border: '1px solid #e2e8f0', 
                borderRadius: '12px', 
                padding: '1rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                marginBottom: '1.5rem'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={autoOpen} 
                    onChange={(e) => setAutoOpen(e.target.checked)} 
                    style={{ width: '18px', height: '18px', accentColor: '#0047bb' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>
                      Apertura automática al entrar al sistema
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Muestra el flyer emergente automáticamente al iniciar la sesión o abrir la página principal.
                    </div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={enabled} 
                    onChange={(e) => setEnabled(e.target.checked)} 
                    style={{ width: '18px', height: '18px', accentColor: '#0047bb' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>
                      Flyer Activado en el Sistema
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Si se desmarca, el flyer no se mostrará ni en el botón ni al inicio.
                    </div>
                  </div>
                </label>
              </div>

              {/* Botón Restaurar Oficial UPEL */}
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <button
                  type="button"
                  onClick={handleResetDefault}
                  disabled={isResetting}
                  className="btn btn-outline"
                  style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b' }}
                >
                  <RotateCcw size={14} />
                  <span>Restaurar Flyer Oficial (Día de la Secretaria)</span>
                </button>
              </div>

            </div>

            {/* Pie del Editor */}
            <div style={{
              padding: '1.1rem 1.75rem',
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn btn-outline"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 1.4rem',
                  background: '#0047bb',
                  fontWeight: 700
                }}
              >
                {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
                <span>{isSaving ? 'Guardando...' : 'Guardar y Publicar'}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
};

export default InstitutionalFlyerModal;
