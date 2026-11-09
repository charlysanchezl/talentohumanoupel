import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Play, Pause, SkipForward, SkipBack, X, Volume2, VolumeX, 
  ExternalLink, Sparkles, CheckCircle2, ShieldAlert, Users, 
  BookOpen, MessageCircle, Mail, FileSpreadsheet, Megaphone, 
  Settings, Key, Compass, Award, Monitor
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TOUR_SLIDES = [
  {
    id: 1,
    title: '1. Inicio de Sesión y Google OAuth 2.0 SSO',
    subtitle: 'Autenticación moderna con diseño Windows 11 e identidad @upel.edu.ve',
    route: '/login',
    icon: <Key size={32} color="#4285F4" />,
    badge: 'Seguridad & Acceso',
    duration: 10,
    narrative: 'Bienvenido al Sistema Integral de Gestión y Oferta Académica SIGOA de la UPEL Rubio. El sistema cuenta con inicio de sesión seguro tradicional y acceso único institucional con Google OAuth 2.0, permitiendo ingresar con correos oficiales arroba upel punto edu punto ve.',
    highlights: [
      'Identidad Institucional con Google OAuth 2.0 y correo @upel.edu.ve',
      'Diseño Fluent Acrylic inspirado en Windows 11 con fondo institucional dinámico',
      'Perfiles rápidos para Administradores, Jefaturas y Subdirección de Docencia',
      'Año fiscal dinámico y pie de página oficial de la Unidad de Informática'
    ],
    previewBg: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    badgeColor: '#3b82f6'
  },
  {
    id: 2,
    title: '2. Dashboard Ejecutivo y Métricas en Tiempo Real',
    subtitle: 'Consolidación de estadísticas, distribución docente y alertas prioritarias',
    route: '/',
    icon: <Monitor size={32} color="#003366" />,
    badge: 'Métricas & KPIs',
    duration: 10,
    narrative: 'El panel principal consolida en tiempo real los indicadores clave del instituto: total de docentes activos, materias asignadas, carga horaria global y gráficos de distribución por categoría y dedicación académica.',
    highlights: [
      'KPIs en vivo: Total Docentes, Departamentos, Horas Ofertadas y Materias Validadas',
      'Banner reactivo de Comunicados y Memos Urgentes de la Subdirección',
      'Gráficos de torta y barras con la distribución por dedicación y escalafón docente',
      'Acceso rápido a todas las funciones departamentales y de auditoría'
    ],
    previewBg: 'linear-gradient(135deg, #003366 0%, #001f3f 100%)',
    badgeColor: '#0ea5e9'
  },
  {
    id: 3,
    title: '3. Directorio General (Consultar Docentes)',
    subtitle: 'Búsqueda instantánea con filtros multicriterio y fichas individuales',
    route: '/consultar',
    icon: <Users size={32} color="#16a34a" />,
    badge: 'Talento Humano',
    duration: 10,
    narrative: 'En el módulo Consultar Docentes, la institución cuenta con un motor de búsqueda instantáneo con debounce, filtros por sedes, departamentos y estados de validación académica.',
    highlights: [
      'Búsqueda ultra-rápida por Cédula, Nombres y Apellidos en tiempo real',
      'Filtros cruzados por Sede (Rubio, San Cristóbal, La Grita) y Departamento',
      'Estados visuales: Validado con Materias, Requiere Carga o Inactivo',
      'Acceso inmediato a la edición básica, carga académica y eliminación segura'
    ],
    previewBg: 'linear-gradient(135deg, #065f46 0%, #022c22 100%)',
    badgeColor: '#10b981'
  },
  {
    id: 4,
    title: '4. Carga de Materias y Ficha Docente Imprimible',
    subtitle: 'Cálculo automatizado de horas semanales, lapso y generación de formatos UPEL',
    route: '/departamento/Pedagogia',
    icon: <BookOpen size={32} color="#854d0e" />,
    badge: 'Planificación Académica',
    duration: 12,
    narrative: 'Los Jefes de Departamento pueden asignar unidades curriculares, secciones y cupos. El sistema calcula automáticamente las horas semanales y del lapso, permitiendo generar e imprimir la Ficha Docente Oficial con firmas y código institucional.',
    highlights: [
      'Asignación dinámica de asignaturas con catálogo institucional de materias',
      'Cálculo automático de Horas Semanales y Horas Lapso según las semanas del período',
      'Asignación de Especialidad Destino (Inicial, Primaria, Informática, Matemática, etc.)',
      'Generador de Ficha Oficial de Carga Académica lista para imprimir con membrete'
    ],
    previewBg: 'linear-gradient(135deg, #713f12 0%, #451a03 100%)',
    badgeColor: '#f59e0b'
  },
  {
    id: 5,
    title: '5. Notificaciones Multicanal (WhatsApp & Gmail)',
    subtitle: 'Comunicación instantánea de cargas horarias por mensajería y correo',
    route: '/consultar',
    icon: <MessageCircle size={32} color="#16a34a" />,
    badge: 'Comunicaciones',
    duration: 10,
    narrative: 'Cada profesor puede ser notificado en un solo clic. El sistema genera mensajes formateados para WhatsApp con el detalle de sus materias y enlaces directos para redactar correos oficiales en Gmail Institucional.',
    highlights: [
      'Envío a WhatsApp Web/App con mensaje estructurado de materias y horas',
      'Botón directo "Abrir en Gmail Institucional" con plantilla oficial precargada',
      'Compatibilidad con Resend API para envíos masivos automatizados en segundo plano',
      'Conexión disponible para Webhook de WhatsApp API / n8n / Evolution API'
    ],
    previewBg: 'linear-gradient(135deg, #14532d 0%, #052e16 100%)',
    badgeColor: '#22c55e'
  },
  {
    id: 6,
    title: '6. Oferta Académica Consolidada y Visor de Excel',
    subtitle: 'Consolidación de especialidades y previsualizador de hojas de cálculo con estilos',
    route: '/docencia',
    icon: <FileSpreadsheet size={32} color="#047857" />,
    badge: 'Reportes & Exportación',
    duration: 11,
    narrative: 'La Oferta Académica Consolidada agrupa todas las asignaturas por especialidad y sección. Incluye un previsualizador de Excel con colores institucionales para revisar antes de descargar el archivo en formato XLSX.',
    highlights: [
      'Consolidación global de todas las cátedras dictadas en el período',
      'Matriz detallada por Especialidad, Sección, Semestre, Horas y Docente Responsable',
      'Visor interactivo previo a la exportación de hojas de cálculo',
      'Descarga de archivo Excel (.xlsx) con estilos y membrete profesional'
    ],
    previewBg: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
    badgeColor: '#10b981'
  },
  {
    id: 7,
    title: '7. Tablero de Avisos, Circulares y Memorándums',
    subtitle: 'Trazabilidad de comunicaciones con seguimiento y acuses de recibo en vivo',
    route: '/avisos',
    icon: <Megaphone size={32} color="#dc2626" />,
    badge: 'Gestión Institucional',
    duration: 11,
    narrative: 'El módulo de Avisos permite a la Subdirección emitir comunicados y Memorándums oficiales. Los directores pueden acusar recibo, responder conforme o con observaciones, y la administración hace seguimiento al porcentaje de respuesta.',
    highlights: [
      'Publicación de avisos con prioridades Urgente, Importante e Informativo',
      'Generador de Memorándum Oficial imprimible con membrete y firmas de correspondencia',
      'Trazabilidad en tiempo real de Acuses de Recibo por departamento',
      'Botón de Difusión Rápida a directores por WhatsApp y Correo'
    ],
    previewBg: 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)',
    badgeColor: '#ef4444'
  },
  {
    id: 8,
    title: '8. Panel de Seguridad, Bloqueo de Módulos y APIs',
    subtitle: 'Control de accesos por roles, interruptores en tiempo real y credenciales',
    route: '/usuarios',
    icon: <ShieldAlert size={32} color="#6d28d9" />,
    badge: 'Administración & APIs',
    duration: 11,
    narrative: 'Como Administrador, puedes gestionar usuarios por departamento, alternar el interruptor de bloqueo del módulo de Oferta Académica en tiempo real y configurar las claves de Google OAuth, Resend y WhatsApp.',
    highlights: [
      'Gestión de usuarios y asignación de correo institucional para inicio SSO',
      'Interruptor de Bloqueo de Oferta Académica sincronizado al instante',
      'Control de apertura y cierre del Registro Público de Aspirantes',
      'Panel de configuración de credenciales OAuth 2.0, Resend y Webhooks'
    ],
    previewBg: 'linear-gradient(135deg, #4c1d95 0%, #2e1065 100%)',
    badgeColor: '#8b5cf6'
  }
];

const SystemTourModal = ({ isOpen, onClose }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [speed, setSpeed] = useState(1);
  const navigate = useNavigate();

  const currentSlide = TOUR_SLIDES[currentSlideIndex];
  const progressTimerRef = useRef(null);

  // Síntesis de voz para narración
  const speakNarrative = (text) => {
    if (!isVoiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = speed;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (isVoiceEnabled) {
      speakNarrative(currentSlide.narrative);
    } else {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }
  }, [currentSlideIndex, isVoiceEnabled]);

  // Manejo del temporizador de reproducción automática
  useEffect(() => {
    if (!isPlaying) {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      return;
    }

    setProgress(0);
    const stepInterval = 100; // ms
    const totalSteps = (currentSlide.duration * 1000) / (stepInterval * speed);

    progressTimerRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNextSlide();
          return 0;
        }
        return prev + (100 / totalSteps);
      });
    }, stepInterval);

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [currentSlideIndex, isPlaying, speed]);

  const handleNextSlide = () => {
    if (currentSlideIndex < TOUR_SLIDES.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
      setProgress(0);
    } else {
      setIsPlaying(false);
      setProgress(100);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  const handleJumpToSlide = (index) => {
    setCurrentSlideIndex(index);
    setProgress(0);
  };

  const handleGoToRoute = (route) => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    onClose();
    navigate(route);
  };

  const handleCloseModal = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="upel-modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 99999, padding: '1rem'
    }}>
      <div className="surface animate-scale-up" style={{
        width: '100%', maxWidth: '850px', maxHeight: '95vh', overflow: 'hidden',
        borderRadius: '24px', background: '#ffffff', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        display: 'flex', flexDirection: 'column'
      }}>
        
        {/* Header del Video Tour */}
        <div style={{ 
          padding: '1.2rem 1.8rem', background: '#003366', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.15)', borderRadius: '10px' }}>
              <Compass size={24} className="animate-spin-slow" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'white', fontWeight: 700 }}>
                Recorrido Interactivo del Sistema SIGOA - UPEL
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)' }}>
                Demostración guiada oficial • Módulo {currentSlideIndex + 1} de {TOUR_SLIDES.length}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            {/* Toggle de Voz Narrada */}
            <button 
              type="button"
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              className="btn btn-outline"
              style={{ 
                padding: '0.4rem 0.8rem', fontSize: '0.8rem', 
                color: isVoiceEnabled ? '#86efac' : 'rgba(255,255,255,0.8)',
                borderColor: isVoiceEnabled ? '#86efac' : 'rgba(255,255,255,0.3)',
                display: 'flex', alignItems: 'center', gap: '0.4rem'
              }}
              title={isVoiceEnabled ? "Silenciar narración" : "Activar narración por voz"}
            >
              {isVoiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              {isVoiceEnabled ? 'Voz Activa' : 'Activar Audio'}
            </button>

            <button 
              onClick={handleCloseModal}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'white', padding: '0.3rem' }}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Barra de Progreso del Video */}
        <div style={{ width: '100%', height: '5px', background: '#e2e8f0', position: 'relative' }}>
          <div style={{ 
            height: '100%', width: `${progress}%`, background: '#2563eb',
            transition: 'width 0.1s linear'
          }}></div>
        </div>

        {/* Contenido Principal del Slide */}
        <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
          
          {/* Banner Superior del Slide */}
          <div style={{ 
            background: currentSlide.previewBg, color: 'white', borderRadius: '16px',
            padding: '1.8rem', marginBottom: '1.5rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
              <div style={{ 
                padding: '1rem', borderRadius: '16px', background: 'rgba(255,255,255,0.1)', 
                backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' 
              }}>
                {currentSlide.icon}
              </div>
              <div>
                <span style={{ 
                  display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '99px',
                  fontSize: '0.75rem', fontWeight: 700, background: currentSlide.badgeColor, color: 'white',
                  marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px'
                }}>
                  {currentSlide.badge}
                </span>
                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>
                  {currentSlide.title}
                </h3>
                <p style={{ margin: '0.3rem 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)' }}>
                  {currentSlide.subtitle}
                </p>
              </div>
            </div>

            <button 
              onClick={() => handleGoToRoute(currentSlide.route)}
              className="btn btn-primary"
              style={{ 
                background: 'white', color: '#003366', borderColor: 'white', 
                fontWeight: 700, padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}
            >
              <ExternalLink size={16} /> Ir a esta pantalla en vivo
            </button>
          </div>

          {/* Puntos Clave y Capacidades */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="#2563eb" />
              Capacidades Principales Demostradas:
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.8rem' }}>
              {currentSlide.highlights.map((h, i) => (
                <div key={i} style={{ 
                  display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.8rem 1rem',
                  background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#334155'
                }}>
                  <CheckCircle2 size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cuadro de Narración Explicativa */}
          <div style={{ 
            padding: '1rem 1.2rem', borderRadius: '12px', background: '#eff6ff', 
            border: '1px solid #bfdbfe', fontSize: '0.9rem', color: '#1e40af', lineHeight: '1.6' 
          }}>
            <strong>🎙️ Explicación Oficial:</strong> {currentSlide.narrative}
          </div>

        </div>

        {/* Barra de Control de Reproducción (Video Player Bar) */}
        <div style={{ 
          padding: '1rem 1.8rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem'
        }}>
          
          {/* Miniaturas de Navegación por Puntos */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {TOUR_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => handleJumpToSlide(idx)}
                style={{
                  width: idx === currentSlideIndex ? '28px' : '10px',
                  height: '10px',
                  borderRadius: '99px',
                  background: idx === currentSlideIndex ? '#2563eb' : '#cbd5e1',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title={slide.title}
              />
            ))}
          </div>

          {/* Botones de Control Play/Pause/Prev/Next */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <button 
              onClick={handlePrevSlide} 
              disabled={currentSlideIndex === 0}
              className="btn btn-outline"
              style={{ padding: '0.5rem 0.8rem', opacity: currentSlideIndex === 0 ? 0.5 : 1 }}
              title="Anterior"
            >
              <SkipBack size={18} />
            </button>

            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="btn btn-primary"
              style={{ padding: '0.6rem 1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              {isPlaying ? 'Pausar' : 'Reproducir'}
            </button>

            <button 
              onClick={handleNextSlide} 
              disabled={currentSlideIndex === TOUR_SLIDES.length - 1}
              className="btn btn-outline"
              style={{ padding: '0.5rem 0.8rem', opacity: currentSlideIndex === TOUR_SLIDES.length - 1 ? 0.5 : 1 }}
              title="Siguiente"
            >
              <SkipForward size={18} />
            </button>
          </div>

          {/* Velocidad de Reproducción */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Velocidad:</span>
            {[1, 1.5, 2].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                style={{
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1',
                  background: speed === s ? '#003366' : '#ffffff',
                  color: speed === s ? '#ffffff' : '#64748b',
                  cursor: 'pointer'
                }}
              >
                {s}x
              </button>
            ))}
          </div>

        </div>

      </div>
    </div>,
    document.body
  );
};

export default SystemTourModal;
