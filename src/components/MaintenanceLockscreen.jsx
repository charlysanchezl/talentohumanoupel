import React, { useState } from 'react';
import { ShieldAlert, RefreshCw, LogOut, Clock, AlertTriangle, ShieldCheck, ArrowLeft } from 'lucide-react';
import { logoutUser, getCurrentUser } from '../data';

const MaintenanceLockscreen = ({ config, onRefresh }) => {
  const [checking, setChecking] = useState(false);

  const handleCheck = async () => {
    setChecking(true);
    if (onRefresh) {
      await onRefresh();
    } else {
      window.location.reload();
    }
    setTimeout(() => setChecking(false), 1200);
  };

  const currentUser = getCurrentUser();

  const handleLogout = () => {
    if (currentUser) {
      logoutUser();
    }
    window.location.href = '/login';
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #0f172a 0%, #003366 50%, #1e293b 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        maxWidth: '580px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        animation: 'fadeIn 0.3s ease-out'
      }}>
        {/* Cabecera Institucional */}
        <div style={{
          background: 'linear-gradient(135deg, #003366 0%, #002244 100%)',
          padding: '2rem 2rem 1.75rem',
          textAlign: 'center',
          color: 'white',
          position: 'relative'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            <ShieldAlert size={36} color="#fbbf24" />
          </div>

          <div style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            color: '#93c5fd',
            fontWeight: 700,
            marginBottom: '0.35rem'
          }}>
            UNIVERSIDAD PEDAGÓGICA EXPERIMENTAL LIBERTADOR
          </div>
          <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, color: 'white' }}>
            Sistema en Mantenimiento Institucional
          </h1>
          <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '0.35rem' }}>
            Subdirección de Docencia · Instituto Pedagógico Rural «Gervasio Rubio»
          </div>
        </div>

        {/* Cuerpo del Mensaje */}
        <div style={{ padding: '2rem' }}>
          {/* Badge de Estado */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            borderRadius: '20px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            fontSize: '0.78rem',
            fontWeight: 700,
            marginBottom: '1.25rem'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626', display: 'inline-block' }} />
            ACCESO EN PAUSA TÉCNICA EXCLUSIVA
          </div>

          {/* Mensaje del Administrador */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #003366',
            borderRadius: '8px',
            padding: '1.2rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              Motivo de la Suspensión Temporal:
            </div>
            <div style={{ fontSize: '0.95rem', color: '#1e293b', lineHeight: 1.5, fontWeight: 500 }}>
              {config?.message || 'El sistema se encuentra en labores de cierre de lapso y optimización de base de datos.'}
            </div>
            {config?.estimatedEnd && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.75rem', fontSize: '0.84rem', color: '#0369a1', fontWeight: 600 }}>
                <Clock size={16} /> Finalización Estimada: {config.estimatedEnd}
              </div>
            )}
          </div>

          <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.55, margin: '0 0 1.75rem 0' }}>
            Para garantizar la integridad y coherencia de los expedientes docentes y cargas horarias, 
            el acceso para Docentes, Coordinadores y Jefes de Departamento permanece suspendido mientras la Unidad de Informática concluye los procedimientos.
          </p>

          {/* Botones de Acción */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <button
              onClick={handleCheck}
              disabled={checking}
              style={{
                background: '#003366',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 10px rgba(0, 51, 102, 0.2)'
              }}
            >
              <RefreshCw size={16} className={checking ? 'spin' : ''} />
              {checking ? 'Comprobando...' : 'Comprobar si ya finalizó'}
            </button>

            <button
              onClick={handleLogout}
              style={{
                background: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {currentUser ? <LogOut size={16} /> : <ArrowLeft size={16} />}
              {currentUser ? 'Cerrar Sesión' : 'Ir al Inicio de Sesión'}
            </button>
          </div>
        </div>

        {/* Footer Card */}
        <div style={{
          background: '#f8fafc',
          borderTop: '1px solid #f1f5f9',
          padding: '0.85rem 2rem',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: '#94a3b8'
        }}>
          UPEL SIGOA Core · Subdirección de Docencia
        </div>
      </div>
    </div>
  );
};

export default MaintenanceLockscreen;
