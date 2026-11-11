import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'Error inesperado al cargar el módulo.'
    };
  }

  componentDidCatch(error, info) {
    console.error('[SIGOA_UI_ERROR]', error, info);
  }

  handleReload = () => {
    try {
      window.sessionStorage.removeItem('sigoa_chunk_reload_at');
    } catch (_) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
          padding: '1.5rem'
        }}>
          <div style={{
            maxWidth: '520px',
            width: '100%',
            background: '#ffffff',
            borderRadius: '14px',
            padding: '2rem',
            boxShadow: '0 10px 25px rgba(15, 23, 42, 0.08)',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <h2 style={{ marginTop: 0, color: '#002f6c', fontSize: '1.35rem' }}>
              Actualización disponible en SIGOA
            </h2>
            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.5 }}>
              Una vista del sistema no pudo cargarse (frecuente tras una actualización reciente en el servidor). Haz clic en recargar para obtener la última versión.
            </p>
            <div style={{
              background: '#f1f5f9',
              color: '#334155',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              marginBottom: '1.25rem',
              wordBreak: 'break-word'
            }}>
              {this.state.errorMessage}
            </div>
            <button
              type="button"
              onClick={this.handleReload}
              className="btn btn-primary"
              style={{
                background: '#002f6c',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.7rem 1.4rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Recargar Sistema
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
