import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { TOAST_EVENT } from '../utils/toast';

const ICONS = {
  success: <CheckCircle2 size={18} style={{ color: '#16a34a', flexShrink: 0 }} />,
  error: <AlertCircle size={18} style={{ color: '#dc2626', flexShrink: 0 }} />,
  warning: <AlertTriangle size={18} style={{ color: '#d97706', flexShrink: 0 }} />,
  info: <Info size={18} style={{ color: '#0284c7', flexShrink: 0 }} />
};

const BORDER_COLORS = {
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#38bdf8'
};

const BG_COLORS = {
  success: '#f0fdf4',
  error: '#fef2f2',
  warning: '#fffbeb',
  info: '#f0f9ff'
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (e) => {
      const toast = e.detail;
      setToasts(prev => [...prev, toast]);

      if (toast.duration > 0) {
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toast.id));
        }, toast.duration);
      }
    };

    window.addEventListener(TOAST_EVENT, handleToast);
    return () => window.removeEventListener(TOAST_EVENT, handleToast);
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '1.25rem',
      right: '1.25rem',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.65rem',
      maxWidth: '420px',
      width: 'calc(100vw - 2.5rem)',
      pointerEvents: 'none'
    }}>
      {toasts.map(toast => {
        const type = toast.type || 'info';
        return (
          <div
            key={toast.id}
            style={{
              pointerEvents: 'auto',
              background: BG_COLORS[type] || '#ffffff',
              borderLeft: `4px solid ${BORDER_COLORS[type] || '#0284c7'}`,
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              color: '#1e293b',
              fontSize: '0.875rem',
              lineHeight: 1.45,
              animation: 'toastSlideIn 0.25s ease-out',
              backdropFilter: 'blur(8px)'
            }}
          >
            <div style={{ marginTop: '2px' }}>
              {ICONS[type]}
            </div>
            <div style={{ flex: 1, fontWeight: 500 }}>
              {toast.message}
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                transition: 'color 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#334155'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
              title="Cerrar notificación"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}

      <style>{`
        @keyframes toastSlideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ToastContainer;
