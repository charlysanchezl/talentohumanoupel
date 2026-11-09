import React from 'react';
import { createPortal } from 'react-dom';
import { X, Cpu, Database, ShieldCheck, MapPin, Award, CheckCircle2, Globe, ExternalLink } from 'lucide-react';

const AboutModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="upel-modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 34, 68, 0.65)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '1rem'
    }} onClick={onClose}>
      
      <div 
        className="upel-card upel-card-accent-tri animate-scale-up"
        style={{
          width: '100%',
          maxWidth: '580px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '0',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div style={{
          padding: '1.75rem 2rem 1.25rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img 
              src="/logo.jpg" 
              alt="Logo UPEL" 
              style={{ width: '52px', height: '52px', objectFit: 'contain' }} 
            />
            <div>
              <div className="upel-section-subtitle">UNIVERSIDAD PEDAGÓGICA EXPERIMENTAL LIBERTADOR</div>
              <h2 style={{ margin: '0.15rem 0 0', color: '#003366', fontSize: '1.3rem', fontWeight: 800 }}>
                SIGOA v2.0 • I.P.R.G.R
              </h2>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                Sistema Integral de Gestión y Oferta Académica
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '0.25rem',
              borderRadius: '6px',
              display: 'flex'
            }}
            title="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div style={{ padding: '1.75rem 2rem' }}>
          
          {/* Tarjeta de Reconocimiento Principal a la Unidad de Informática */}
          <div style={{
            background: '#f0fdf4',
            border: '1.5px solid #86efac',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'center'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#008744',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 10px rgba(0, 135, 68, 0.25)'
            }}>
              <Award size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#008744', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                DESARROLLADO Y ADMINISTRADO POR
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#003366', marginTop: '0.1rem' }}>
                Unidad de Informática
              </div>
              <div style={{ fontSize: '0.82rem', color: '#166534', marginTop: '0.2rem', lineHeight: 1.4 }}>
                Instituto Pedagógico Rural «Gervasio Rubio» — Creación, arquitectura y despliegue tecnológico institucional.
              </div>
            </div>
          </div>

          {/* Ficha Técnica y Pilares */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#003366', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Especificaciones de Ingeniería y Arquitectura
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#003366', fontWeight: 700, fontSize: '0.82rem' }}>
                  <Database size={15} color="#008744" /> Base de Datos
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                  MySQL Central + Sincronización Local Offline
                </div>
              </div>

              <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#003366', fontWeight: 700, fontSize: '0.82rem' }}>
                  <Cpu size={15} color="#2563eb" /> Red de Resiliencia
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Malla P2P de Alta Disponibilidad
                </div>
              </div>

              <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#003366', fontWeight: 700, fontSize: '0.82rem' }}>
                  <ShieldCheck size={15} color="#d97706" /> Seguridad
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Bitácora de Auditoría y Bóveda SQL
                </div>
              </div>

              <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#003366', fontWeight: 700, fontSize: '0.82rem' }}>
                  <MapPin size={15} color="#dc2626" /> Sede
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Rubio, Táchira • La Ciudad Pontálida
                </div>
              </div>
            </div>
          </div>

          {/* Lema y Filosofía Institucional */}
          <div style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <p style={{
              fontFamily: '"Dancing Script", cursive',
              fontSize: '1.4rem',
              color: '#003366',
              margin: 0,
              fontWeight: 700
            }}>
              "La Universidad de los Maestros"
            </p>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.3rem 0 0' }}>
              Subdirección de Docencia • Unidad de Informática • © {new Date().getFullYear()}
            </p>
          </div>

        </div>

        {/* Pie del Modal */}
        <div style={{
          padding: '1rem 2rem',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <a 
            href="https://upel.edu.ve/instituto-pedagogico-rural-gervasio-rubio/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ fontSize: '0.8rem', color: '#006699', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}
          >
            <Globe size={14} /> Portal Web Oficial <ExternalLink size={12} />
          </a>

          <button 
            onClick={onClose}
            className="btn btn-primary"
            style={{ padding: '0.45rem 1.25rem', fontSize: '0.85rem' }}
          >
            Entendido
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default AboutModal;
