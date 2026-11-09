import React, { useState, useRef } from 'react';
import { Camera, Sparkles, Upload, CheckCircle2, AlertCircle, RefreshCw, X, UserCheck, Key } from 'lucide-react';
import { scanDocumentWithGemini, configureGeminiApiKey } from '../../services/api/geminiScannerService';

export const GeminiDocumentScanner = ({
  onApply,
  documentHint = 'auto',
  buttonLabel = 'Escanear con Cámara / IA (Gemini)',
  buttonStyle = {},
  variant = 'primary'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [hint, setHint] = useState(documentHint);
  const [applied, setApplied] = useState(false);
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [savingKey, setSavingKey] = useState(false);

  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const resetState = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setLoading(false);
    setExtractedData(null);
    setErrorMsg('');
    setInfoMsg('');
    setApplied(false);
    setShowKeyConfig(false);
  };

  const handleOpen = () => {
    resetState();
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    resetState();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setErrorMsg('');
    setInfoMsg('');
    setExtractedData(null);

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim()) {
      setErrorMsg('Ingrese una clave GEMINI_API_KEY válida.');
      return;
    }
    setSavingKey(true);
    setErrorMsg('');
    try {
      const res = await configureGeminiApiKey(apiKeyInput.trim());
      if (res.success) {
        setInfoMsg('¡Clave GEMINI_API_KEY guardada en server/.env y activada en tiempo real!');
        setShowKeyConfig(false);
        if (selectedFile) {
          await handleProcessDocument(apiKeyInput.trim());
        }
      } else {
        setErrorMsg(res.error || 'No se pudo guardar la clave en el servidor.');
      }
    } catch (e) {
      setErrorMsg(e.message || 'Error guardando clave.');
    } finally {
      setSavingKey(false);
    }
  };

  const handleProcessDocument = async (customKey = '') => {
    if (!selectedFile) {
      setErrorMsg('Por favor tome una foto o seleccione una imagen primero.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setInfoMsg('');

    try {
      const result = await scanDocumentWithGemini(selectedFile, hint, customKey || apiKeyInput.trim());

      if (result.success && result.data) {
        setExtractedData(result.data);
        if (result.isLocalOcr) {
          setInfoMsg('Lectura OCR en tiempo real completada sobre su documento. Puede verificar o editar cualquier campo antes de aplicarlo, o configurar su GEMINI_API_KEY.');
        }
      } else if (result.needsApiKey) {
        setShowKeyConfig(true);
        setErrorMsg(result.error || 'Configure su clave GEMINI_API_KEY para escaneo con IA.');
      } else {
        setErrorMsg(result.error || 'No se pudieron extraer datos del documento.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error de procesamiento');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldEdit = (field, value) => {
    setExtractedData(prev => {
      if (!prev) return prev;
      const updated = { ...prev, [field]: value };
      if (field === 'cedula') {
        updated.cedulaNumero = String(value).replace(/\D/g, '');
      }
      if (field === 'nombres' || field === 'apellidos') {
        updated.nombreCompleto = [updated.nombres, updated.apellidos].filter(Boolean).join(' ');
      }
      return updated;
    });
  };

  const handleApplyData = () => {
    if (!extractedData) return;
    if (onApply) {
      onApply(extractedData);
    }
    setApplied(true);
    setTimeout(() => {
      handleClose();
    }, 900);
  };

  const inputFieldStyle = {
    width: '100%',
    padding: '0.35rem 0.5rem',
    borderRadius: '5px',
    border: '1px solid #cbd5e1',
    fontSize: '0.84rem',
    fontWeight: 700,
    color: '#0f172a',
    background: '#ffffff'
  };

  return (
    <>
      {/* Botón Disparador */}
      <button
        type="button"
        onClick={handleOpen}
        className="animate-fade-in upel-btn-glow"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '0.55rem 0.95rem',
          borderRadius: '9px',
          fontWeight: 700,
          fontSize: '0.86rem',
          cursor: 'pointer',
          border: '1px solid #1d4ed8',
          background: 'linear-gradient(135deg, #0047bb 0%, #002e7a 100%)',
          color: '#ffffff',
          boxShadow: '0 3px 10px rgba(0, 71, 187, 0.28)',
          transition: 'all 0.2s ease',
          ...buttonStyle
        }}
        title="Extraer automáticamente datos usando la cámara del dispositivo o archivo"
      >
        <Sparkles size={16} color="#fbbf24" />
        <Camera size={16} color="#ffffff" />
        <span>{buttonLabel}</span>
      </button>

      {/* Modal de Escaneo con IA */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999999,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={handleClose}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '640px',
              background: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera */}
            <div
              style={{
                padding: '1.1rem 1.4rem',
                background: 'linear-gradient(135deg, #002266 0%, #0047bb 100%)',
                color: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    background: 'linear-gradient(135deg, #0047bb 0%, #008744 100%)',
                    padding: '0.45rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.25)'
                  }}
                >
                  <Sparkles size={19} color="#fbbf24" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                    Extracción con Gemini Vision 4.0
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#bfdbfe' }}>
                    Apunta la cámara a la Cédula o Título para autocompletar el formulario
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowKeyConfig(v => !v)}
                  title="Configurar clave GEMINI_API_KEY"
                  style={{
                    background: 'rgba(255,255,255,0.14)',
                    border: '1px solid rgba(255,255,255,0.28)',
                    borderRadius: '6px',
                    color: '#ffffff',
                    cursor: 'pointer',
                    padding: '0.3rem 0.55rem',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <Key size={14} color="#fbbf24" />
                  <span>API Key</span>
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#e0e7ff',
                    cursor: 'pointer',
                    padding: '0.2rem'
                  }}
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Contenido */}
            <div
              style={{
                padding: '1.25rem 1.4rem',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
              {/* Panel rápido para configurar GEMINI_API_KEY sin tocar archivos manualmente */}
              {showKeyConfig && (
                <div
                  style={{
                    padding: '0.85rem 1rem',
                    background: '#eff6ff',
                    border: '1px solid #93c5fd',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Key size={15} color="#0047bb" />
                    <span>Configurar GEMINI_API_KEY en el servidor (server/.env):</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="password"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="Pegue aquí su clave AIzaSy... de Google AI Studio"
                      style={{
                        flex: 1,
                        padding: '0.45rem 0.7rem',
                        borderRadius: '6px',
                        border: '1px solid #93c5fd',
                        fontSize: '0.82rem'
                      }}
                    />
                    <button
                      type="button"
                      disabled={savingKey}
                      onClick={handleSaveApiKey}
                      style={{
                        padding: '0.45rem 0.9rem',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#0047bb',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      {savingKey ? 'Guardando...' : 'Guardar y Activar'}
                    </button>
                  </div>
                </div>
              )}

              {/* Opciones de Entrada de Documento */}
              {!extractedData && (
                <>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      gap: '0.85rem'
                    }}
                  >
                    {/* Botón 1: Cámara del Teléfono / Dispositivo */}
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      style={{
                        padding: '1.1rem',
                        borderRadius: '12px',
                        border: '2px dashed #60a5fa',
                        background: '#eff6ff',
                        color: '#0047bb',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: 'center'
                      }}
                    >
                      <Camera size={28} color="#0047bb" />
                      <strong style={{ fontSize: '0.92rem' }}>Tomar Foto con Cámara</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Abre la cámara de tu teléfono o laptop
                      </span>
                    </button>

                    {/* Botón 2: Subir Archivo o PDF */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        padding: '1.1rem',
                        borderRadius: '12px',
                        border: '2px dashed #94a3b8',
                        background: '#f8fafc',
                        color: '#334155',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: 'center'
                      }}
                    >
                      <Upload size={28} color="#64748b" />
                      <strong style={{ fontSize: '0.92rem' }}>Subir Imagen / PDF</strong>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        Seleccionar foto o escaneo guardado
                      </span>
                    </button>
                  </div>

                  {/* Inputs ocultos */}
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />

                  {/* Selector de Tipo de Documento */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                      Tipo de Documento:
                    </label>
                    <select
                      value={hint}
                      onChange={(e) => setHint(e.target.value)}
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.82rem',
                        background: '#ffffff'
                      }}
                    >
                      <option value="auto">Detección Automática</option>
                      <option value="cedula">Cédula de Identidad</option>
                      <option value="titulo">Título Universitario</option>
                      <option value="constancia">Constancia / RIF</option>
                    </select>
                  </div>
                </>
              )}

              {/* Vista Previa de la Imagen */}
              {previewUrl && (
                <div
                  style={{
                    position: 'relative',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0',
                    background: '#0f172a',
                    textAlign: 'center',
                    maxHeight: '220px'
                  }}
                >
                  <img
                    src={previewUrl}
                    alt="Previsualización"
                    style={{
                      maxHeight: '220px',
                      maxWidth: '100%',
                      objectFit: 'contain'
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '8px',
                      background: 'rgba(0,0,0,0.65)',
                      color: '#ffffff',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem'
                    }}
                  >
                    {selectedFile?.name || 'Foto capturada'}
                  </span>
                </div>
              )}

              {/* Mensajes Informativos */}
              {infoMsg && (
                <div
                  style={{
                    padding: '0.7rem 0.95rem',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    color: '#1e40af',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem'
                  }}
                >
                  <span>{infoMsg}</span>
                </div>
              )}

              {/* Mensajes de Alerta / Error */}
              {errorMsg && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: '8px',
                    color: '#b45309',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <AlertCircle size={18} color="#d97706" style={{ flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Datos Extraídos (Editables antes de aplicar) */}
              {extractedData && (
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1.5px solid #86efac',
                    borderRadius: '12px',
                    padding: '1.1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid #bbf7d0',
                      paddingBottom: '0.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#166534', fontWeight: 800 }}>
                      <CheckCircle2 size={18} color="#16a34a" />
                      <span>Datos Detectados del Documento (Editables):</span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        background: '#dcfce7',
                        color: '#15803d',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontWeight: 700,
                        textTransform: 'uppercase'
                      }}
                    >
                      {extractedData.tipoDocumento || 'Documento'}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '0.65rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    {(hint !== 'titulo' || extractedData.cedula) && (
                      <div style={{ background: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                        <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', marginBottom: '2px' }}>Cédula:</span>
                        <input
                          type="text"
                          value={extractedData.cedula || ''}
                          onChange={(e) => handleFieldEdit('cedula', e.target.value)}
                          placeholder="Ej: V-12345678"
                          style={inputFieldStyle}
                        />
                      </div>
                    )}
                    {(hint !== 'titulo' || extractedData.nombres) && (
                      <div style={{ background: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                        <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', marginBottom: '2px' }}>Nombres:</span>
                        <input
                          type="text"
                          value={extractedData.nombres || ''}
                          onChange={(e) => handleFieldEdit('nombres', e.target.value)}
                          placeholder="Nombres"
                          style={inputFieldStyle}
                        />
                      </div>
                    )}
                    {(hint !== 'titulo' || extractedData.apellidos) && (
                      <div style={{ background: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                        <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', marginBottom: '2px' }}>Apellidos:</span>
                        <input
                          type="text"
                          value={extractedData.apellidos || ''}
                          onChange={(e) => handleFieldEdit('apellidos', e.target.value)}
                          placeholder="Apellidos"
                          style={inputFieldStyle}
                        />
                      </div>
                    )}
                    {(hint !== 'titulo' || extractedData.fechaNacimiento) && (
                      <div style={{ background: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                        <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', marginBottom: '2px' }}>Fecha Nacimiento:</span>
                        <input
                          type="date"
                          value={extractedData.fechaNacimiento || ''}
                          onChange={(e) => handleFieldEdit('fechaNacimiento', e.target.value)}
                          style={inputFieldStyle}
                        />
                      </div>
                    )}
                    {(hint === 'titulo' || hint === 'auto' || extractedData.tituloObtenido) && (
                      <div style={{ gridColumn: '1 / -1', background: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                        <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', marginBottom: '2px' }}>Título Obtenido:</span>
                        <input
                          type="text"
                          value={extractedData.tituloObtenido || ''}
                          onChange={(e) => handleFieldEdit('tituloObtenido', e.target.value)}
                          placeholder="Ej: PROFESOR EN EDUCACIÓN INTEGRAL"
                          style={{ ...inputFieldStyle, color: '#0047bb' }}
                        />
                      </div>
                    )}
                    {(hint === 'titulo' || hint === 'auto' || extractedData.universidad) && (
                      <div style={{ gridColumn: '1 / -1', background: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                        <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', marginBottom: '2px' }}>Universidad:</span>
                        <input
                          type="text"
                          value={extractedData.universidad || ''}
                          onChange={(e) => handleFieldEdit('universidad', e.target.value)}
                          placeholder="Ej: UNIVERSIDAD PEDAGÓGICA EXPERIMENTAL LIBERTADOR"
                          style={inputFieldStyle}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Pie de Acciones */}
            <div
              style={{
                padding: '0.9rem 1.4rem',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <button
                type="button"
                onClick={handleClose}
                style={{
                  padding: '0.55rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>

              {!extractedData && (
                <button
                  type="button"
                  disabled={!selectedFile || loading}
                  onClick={() => handleProcessDocument()}
                  style={{
                    padding: '0.55rem 1.25rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: selectedFile && !loading ? 'linear-gradient(135deg, #0047bb 0%, #002e7a 100%)' : '#cbd5e1',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: selectedFile && !loading ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    boxShadow: selectedFile && !loading ? '0 4px 12px rgba(0, 71, 187, 0.3)' : 'none'
                  }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Analizando Documento...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} color="#fbbf24" />
                      <span>Analizar Documento</span>
                    </>
                  )}
                </button>
              )}

              {extractedData && (
                <button
                  type="button"
                  onClick={handleApplyData}
                  style={{
                    padding: '0.6rem 1.4rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: applied ? '#006633' : 'linear-gradient(135deg, #008744 0%, #006633 100%)',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 14px rgba(0, 135, 68, 0.35)'
                  }}
                >
                  <UserCheck size={18} />
                  <span>{applied ? '¡Aplicado al Formulario!' : 'Rellenar Formulario con estos Datos'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GeminiDocumentScanner;
