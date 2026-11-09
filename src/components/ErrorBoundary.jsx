import React from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturó una excepción en la interfaz:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #003366 100%)',
          padding: '1.5rem',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: '#f8fafc'
        }}>
          <div style={{
            maxWidth: '620px',
            width: '100%',
            background: 'rgba(30, 41, 59, 0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '20px',
            padding: '2.5rem 2rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(217, 119, 6, 0.2)',
            textAlign: 'center'
          }}>
            {/* Icono de escudo de seguridad UPEL */}
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.2) 0%, rgba(239, 68, 68, 0.2) 100%)',
              border: '2px solid rgba(217, 119, 6, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              <ShieldAlert size={38} color="#f59e0b" />
            </div>

            <h1 style={{
              fontSize: '1.6rem',
              fontWeight: '700',
              margin: '0 0 0.75rem 0',
              color: '#ffffff',
              letterSpacing: '-0.02em'
            }}>
              Inconveniente Inesperado en la Interfaz
            </h1>

            <p style={{
              fontSize: '0.95rem',
              color: '#94a3b8',
              lineHeight: '1.6',
              margin: '0 0 1.75rem 0'
            }}>
              El sistema <strong style={{ color: '#cbd5e1' }}>UPEL SIGOA</strong> protegió su sesión.
              Sus datos guardados en la base de datos están completamente seguros y no han sufrido alteraciones.
            </p>

            {/* Acciones principales */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              justifyContent: 'center',
              marginBottom: '1.5rem'
            }}>
              <button
                onClick={this.handleReload}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.4rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#ffffff',
                  background: 'linear-gradient(135deg, #003366 0%, #00509e 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0, 51, 102, 0.4)',
                  transition: 'all 0.2s ease'
                }}
              >
                <RefreshCw size={17} />
                Recargar y Continuar
              </button>

              <button
                onClick={this.handleGoHome}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.4rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#f8fafc',
                  background: 'rgba(51, 65, 85, 0.8)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Home size={17} />
                Regresar al Inicio
              </button>
            </div>

            {/* Detalles técnicos desplegables */}
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.25rem' }}>
              <button
                onClick={this.toggleDetails}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '0.82rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  cursor: 'pointer',
                  padding: '0.25rem 0.5rem'
                }}
              >
                {this.state.showDetails ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                {this.state.showDetails ? 'Ocultar información técnica' : 'Ver información técnica del error'}
              </button>

              {this.state.showDetails && (
                <div style={{
                  marginTop: '0.75rem',
                  textAlign: 'left',
                  background: 'rgba(15, 23, 42, 0.95)',
                  borderRadius: '10px',
                  padding: '1rem',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  maxHeight: '220px',
                  overflowY: 'auto'
                }}>
                  <div style={{ color: '#ef4444', fontWeight: '600', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    {this.state.error?.toString()}
                  </div>
                  <pre style={{
                    color: '#94a3b8',
                    fontSize: '0.75rem',
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'monospace'
                  }}>
                    {this.state.errorInfo?.componentStack || 'No component stack disponible'}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;