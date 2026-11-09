import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Mail, Send, X, CheckCircle, AlertCircle, Loader2, FileText, Download, Settings, ChevronDown, ChevronUp, Key, Save } from 'lucide-react';
import { sendFichaToDocenteEmail, getMailConfig, saveMailConfig } from '../data';
import { getDocenteInstitutionalEmail, generateFichaEmailHtml, generateFichaEmailText } from '../utils/fichaEmailTemplate';
import { generateFichaPdf } from '../utils/generateFichaPdf';

const SendFichaEmailModal = ({ isOpen, onClose, staff, jefeName = 'Jefe de Departamento', onSuccess }) => {
  const initialEmail = staff ? (staff.correoInstitucional || getDocenteInstitutionalEmail(staff) || staff.correo || '') : '';

  const [recipientEmail, setRecipientEmail] = useState(initialEmail);
  const [subject, setSubject] = useState(
    staff ? `Ficha de Oferta Académica - ${staff.nombres} ${staff.apellidos} (${staff.cedula}) - UPEL IPRGR` : ''
  );
  const [notaAdicional, setNotaAdicional] = useState('');
  const [attachPdf, setAttachPdf] = useState(true);
  const [sending, setSending] = useState(false);
  const [statusResult, setStatusResult] = useState(null);

  // Configuración SMTP rápida
  const [mailConfig, setMailConfig] = useState(null);
  const [showSmtpConfig, setShowSmtpConfig] = useState(false);
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [smtpSavedMsg, setSmtpSavedMsg] = useState(false);
  const [smtpForm, setSmtpForm] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpSecure: false,
    smtpUser: '',
    smtpPass: '',
    smtpFrom: '"UPEL Subdirección de Docencia" <docencia@iprgr.upel.edu.ve>'
  });

  // Cargar estado de configuración de correo
  useEffect(() => {
    if (isOpen) {
      getMailConfig().then(cfg => {
        if (cfg) {
          setMailConfig(cfg);
          setSmtpForm({
            smtpHost: cfg.smtpHost || 'smtp.gmail.com',
            smtpPort: cfg.smtpPort || '587',
            smtpSecure: Boolean(cfg.smtpSecure),
            smtpUser: cfg.smtpUser || '',
            smtpPass: '',
            smtpFrom: cfg.smtpFrom || '"UPEL Subdirección de Docencia" <docencia@iprgr.upel.edu.ve>'
          });
        }
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (staff) {
      setRecipientEmail(staff.correoInstitucional || getDocenteInstitutionalEmail(staff) || staff.correo || '');
      setSubject(`Ficha de Oferta Académica - ${staff.nombres} ${staff.apellidos} (${staff.cedula}) - UPEL IPRGR`);
      setStatusResult(null);
    }
  }, [staff]);

  const hasConfiguredMail = Boolean(
    (mailConfig && mailConfig.smtpHost && mailConfig.smtpUser) || 
    (mailConfig && mailConfig.resendApiKey)
  );

  const handleSaveSmtpQuick = async (e) => {
    e.preventDefault();
    if (!smtpForm.smtpHost || !smtpForm.smtpUser) {
      alert('Por favor ingrese el Servidor SMTP y el Usuario/Correo remitente.');
      return;
    }
    setSavingSmtp(true);
    setSmtpSavedMsg(false);
    try {
      const res = await saveMailConfig(smtpForm);
      setSavingSmtp(false);
      if (res && res.success) {
        setSmtpSavedMsg(true);
        const updated = await getMailConfig();
        setMailConfig(updated);
        setStatusResult(null);
        setTimeout(() => {
          setSmtpSavedMsg(false);
          setShowSmtpConfig(false);
        }, 2000);
      } else {
        alert('Error al guardar: ' + (res?.error || 'No se pudo guardar la configuración'));
      }
    } catch (err) {
      setSavingSmtp(false);
      alert('Error de red al guardar: ' + err.message);
    }
  };

  const handleSendDirect = async (e) => {
    if (e) e.preventDefault();
    if (!recipientEmail || !recipientEmail.trim()) {
      setStatusResult({ type: 'error', message: 'Debe ingresar un correo electrónico institucional válido.' });
      return;
    }

    setSending(true);
    setStatusResult(null);

    try {
      // 1. Generar HTML oficial
      const html = generateFichaEmailHtml(staff, { jefeName, notaAdicional });
      const text = generateFichaEmailText(staff, { jefeName });

      // 2. Generar PDF si está marcado
      let pdfBase64 = null;
      if (attachPdf) {
        try {
          const pdfResult = await generateFichaPdf(staff, { jefeName });
          pdfBase64 = pdfResult.pdfBase64;
        } catch (pdfErr) {
          console.warn('No se pudo generar el adjunto PDF, se enviará solo HTML:', pdfErr);
        }
      }

      // 3. Despachar correo mediante el backend / Resend
      const result = await sendFichaToDocenteEmail({
        to: recipientEmail.trim(),
        subject,
        html,
        text,
        pdfBase64,
        filename: `Ficha_Docente_${String(staff.cedula || 'UPEL').replace(/\D/g, '')}.pdf`,
        staff
      });

      setSending(false);
      if (result.success) {
        setStatusResult({
          type: 'success',
          message: `¡Ficha de Oferta Académica enviada con éxito a ${recipientEmail}!`,
          method: result.method || 'Sistema'
        });
        if (onSuccess) onSuccess(result);
      } else {
        setStatusResult({
          type: 'error',
          message: result.error || 'No se pudo enviar el correo.',
          requiresSetup: result.requiresSetup
        });
        if (result.requiresSetup) {
          setShowSmtpConfig(true);
        }
      }
    } catch (err) {
      setSending(false);
      setStatusResult({
        type: 'error',
        message: 'Error al enviar: ' + err.message
      });
    }
  };

  const handleOpenGmail = () => {
    if (!recipientEmail) {
      setStatusResult({ type: 'error', message: 'Debe ingresar el correo destinatario.' });
      return;
    }

    const emailBody = generateFichaEmailText(staff, { jefeName });
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(gmailUrl, '_blank');
    setStatusResult({
      type: 'success',
      message: 'Se abrió Gmail con la plantilla oficial de la Ficha precargada y lista para enviar.'
    });
  };

  const handleDownloadPdf = async () => {
    try {
      const { doc } = await generateFichaPdf(staff, { jefeName });
      doc.save(`Ficha_Docente_${String(staff.cedula || 'UPEL').replace(/\D/g, '')}.pdf`);
    } catch (e) {
      alert('Error descargando PDF: ' + e.message);
    }
  };

  if (!isOpen || !staff) return null;

  const materiasCount = staff.materias ? staff.materias.length : 0;

  const modalElement = (
    <div className="upel-modal-overlay" onClick={onClose}>
      <div className="surface animate-scale-up" style={{
        width: '100%', maxWidth: '680px', maxHeight: '92vh', overflowY: 'auto',
        borderRadius: '16px', padding: '1.75rem', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        background: '#ffffff', border: '1px solid #e2e8f0', margin: 'auto'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Encabezado del Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#003366', fontWeight: 700, fontSize: '1.25rem' }}>
              <div style={{ background: '#e0f2fe', padding: '0.4rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#003366' }}>
                <Mail size={22} />
              </div>
              <span>Enviar Ficha al Correo Institucional</span>
            </div>
            <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.88rem', color: '#64748b' }}>
              {staff.nombres} {staff.apellidos} &bull; C.I: {staff.cedula} &bull; Dpto: {staff.department}
            </p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px', borderRadius: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Notificación si el servidor de correo aún no está configurado */}
        {!hasConfiguredMail && (
          <div style={{
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            background: '#fffbeb',
            border: '1px solid #fef3c7',
            marginBottom: '1rem',
            fontSize: '0.85rem',
            color: '#92400e'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <strong>⚠️ Servidor de correo saliente aún no conectado:</strong>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#78350f', lineHeight: 1.4 }}>
                  Para enviar de inmediato sin configurar ningún servidor, pulsa el botón <strong>"Gmail Institucional"</strong> abajo. O si prefieres envío 100% automático por el sistema, configura el servidor SMTP aquí.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSmtpConfig(!showSmtpConfig)}
                className="btn btn-outline"
                style={{ 
                  padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderColor: '#d97706', color: '#b45309', 
                  background: 'white', display: 'flex', alignItems: 'center', gap: '0.3rem' 
                }}
              >
                <Settings size={14} />
                {showSmtpConfig ? 'Cerrar Ajustes SMTP' : '⚙️ Configurar SMTP'}
                {showSmtpConfig ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          </div>
        )}

        {/* Panel Desplegable de Configuración Rápida de SMTP */}
        {showSmtpConfig && (
          <div style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            padding: '1.25rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#003366', fontSize: '0.95rem' }}>
                <Settings size={18} color="#003366" />
                <span>Configuración de Servidor de Correo Saliente (SMTP)</span>
              </div>
              <button 
                type="button" 
                onClick={() => setShowSmtpConfig(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={16} />
              </button>
            </div>

            <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem', color: '#475569' }}>
              Ingresa los datos del servidor de correo para despachar las fichas directamente desde el sistema. Para cuentas Gmail institucional de la UPEL, usa <strong>smtp.gmail.com</strong>, puerto <strong>587</strong> y una <em>Contraseña de Aplicación de Google</em>.
            </p>

            <form onSubmit={handleSaveSmtpQuick} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Servidor SMTP (Host)</label>
                <input 
                  type="text" 
                  required
                  placeholder="smtp.gmail.com o mail.upel.edu.ve"
                  className="filter-input w-full"
                  value={smtpForm.smtpHost}
                  onChange={(e) => setSmtpForm({ ...smtpForm, smtpHost: e.target.value })}
                  style={{ fontSize: '0.85rem', padding: '0.45rem 0.6rem' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Puerto SMTP</label>
                <input 
                  type="text" 
                  required
                  placeholder="587 o 465"
                  className="filter-input w-full"
                  value={smtpForm.smtpPort}
                  onChange={(e) => setSmtpForm({ ...smtpForm, smtpPort: e.target.value })}
                  style={{ fontSize: '0.85rem', padding: '0.45rem 0.6rem' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Usuario / Correo Institucional</label>
                <input 
                  type="email" 
                  required
                  placeholder="docencia@upel.edu.ve"
                  className="filter-input w-full"
                  value={smtpForm.smtpUser}
                  onChange={(e) => setSmtpForm({ ...smtpForm, smtpUser: e.target.value })}
                  style={{ fontSize: '0.85rem', padding: '0.45rem 0.6rem' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Contraseña (o Contraseña de App)</label>
                <input 
                  type="password" 
                  placeholder={mailConfig?.hasPass ? '••••••••' : 'Contraseña o App Password'}
                  className="filter-input w-full"
                  value={smtpForm.smtpPass}
                  onChange={(e) => setSmtpForm({ ...smtpForm, smtpPass: e.target.value })}
                  style={{ fontSize: '0.85rem', padding: '0.45rem 0.6rem' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox"
                    checked={smtpForm.smtpSecure}
                    onChange={(e) => setSmtpForm({ ...smtpForm, smtpSecure: e.target.checked })}
                  />
                  <span>Usar SSL/TLS Seguro (Puerto 465)</span>
                </label>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={savingSmtp}
                  style={{ fontSize: '0.82rem', padding: '0.45rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#003366' }}
                >
                  {savingSmtp ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>{savingSmtp ? 'Guardando...' : 'Guardar Servidor SMTP'}</span>
                </button>
              </div>

              {smtpSavedMsg && (
                <div style={{ gridColumn: '1 / -1', color: '#15803d', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <CheckCircle size={15} /> ¡Servidor de correo guardado exitosamente! Ahora puedes pulsar "Enviar al Correo del Docente".
                </div>
              )}
            </form>
          </div>
        )}

        {/* Notificación de Estado de Envío */}
        {statusResult && (
          <div style={{ 
            padding: '0.9rem 1.1rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.88rem',
            display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
            background: statusResult.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: statusResult.type === 'success' ? '#065f46' : '#991b1b',
            border: `1px solid ${statusResult.type === 'success' ? '#a7f3d0' : '#fecaca'}`
          }}>
            {statusResult.type === 'success' ? (
              <CheckCircle size={20} style={{ flexShrink: 0, marginTop: '2px', color: '#10b981' }} />
            ) : (
              <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px', color: '#ef4444' }} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{statusResult.message}</div>
              {statusResult.requiresSetup && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: '#475569' }}>
                  💡 <em>Solución rápida:</em> Puedes hacer clic en <strong>"Gmail Institucional"</strong> (botón rojo abajo) para redactar y enviar la ficha al instante desde tu cuenta sin necesidad de configurar el servidor, o completar los campos del panel SMTP arriba.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resumen de la Ficha */}
        <div style={{ 
          background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', 
          padding: '0.85rem 1rem', marginBottom: '1.1rem', fontSize: '0.85rem' 
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>Período Académico:</span>
              <strong style={{ color: '#003366' }}>{staff.periodoAcademico || 'Actual'}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>Carga Académica:</span>
              <strong style={{ color: '#003366' }}>{materiasCount} {materiasCount === 1 ? 'materia asignada' : 'materias asignadas'}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>Estatus de Ficha:</span>
              <span style={{ 
                display: 'inline-block', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                background: staff.status === 'Activo' ? '#dcfce7' : '#fef3c7',
                color: staff.status === 'Activo' ? '#15803d' : '#b45309'
              }}>
                {staff.status === 'Activo' ? 'Validada Oficialmente' : staff.status || 'Por Revisar'}
              </span>
            </div>
          </div>
        </div>

        {/* Formulario de Envío */}
        <form onSubmit={handleSendDirect} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          
          <div>
            <label className="form-label" style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.3rem', display: 'block', fontSize: '0.88rem' }}>
              Correo Institucional Destinatario
            </label>
            <input 
              type="email" 
              required
              className="filter-input w-full"
              placeholder="docente@upel.edu.ve o correo personal"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              style={{ padding: '0.6rem 0.85rem', fontSize: '0.92rem' }}
            />
            <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem', display: 'block' }}>
              Sugerencia institucional UPEL para esta cédula: <code>v{staff.cedula ? String(staff.cedula).replace(/\D/g, '') : ''}@upel.edu.ve</code>
            </span>
          </div>

          <div>
            <label className="form-label" style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.3rem', display: 'block', fontSize: '0.88rem' }}>
              Asunto
            </label>
            <input 
              type="text" 
              required
              className="filter-input w-full"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{ padding: '0.6rem 0.85rem', fontSize: '0.92rem' }}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.3rem', display: 'block', fontSize: '0.88rem' }}>
              Nota adicional o indicaciones del Jefe de Departamento (Opcional)
            </label>
            <textarea 
              className="filter-input w-full"
              rows={2}
              placeholder="Ej. Favor verificar los horarios y remitir confirmación firmada..."
              value={notaAdicional}
              onChange={(e) => setNotaAdicional(e.target.value)}
              style={{ resize: 'vertical', fontSize: '0.85rem' }}
            />
          </div>

          {/* Opciones de Documento */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.9rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', color: '#1e293b', fontWeight: 500 }}>
              <input 
                type="checkbox" 
                checked={attachPdf} 
                onChange={(e) => setAttachPdf(e.target.checked)} 
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <FileText size={17} color="#003366" />
              Adjuntar Ficha Oficial en PDF (Formato Carta UPEL)
            </label>
            <button 
              type="button" 
              onClick={handleDownloadPdf}
              className="btn btn-outline" 
              style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              title="Descargar copia del PDF al ordenador"
            >
              <Download size={13} /> Descargar PDF
            </button>
          </div>

          {/* Botonera de Envío */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
            <button 
              type="button" 
              onClick={() => setShowSmtpConfig(!showSmtpConfig)}
              className="btn btn-outline"
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569' }}
            >
              <Settings size={15} />
              <span>{showSmtpConfig ? 'Ocultar SMTP' : 'Ajustes de Servidor'}</span>
            </button>

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button type="button" onClick={onClose} className="btn btn-outline" disabled={sending}>
                Cerrar
              </button>

              {/* Abrir en Gmail Institucional */}
              <button 
                type="button" 
                onClick={handleOpenGmail}
                className="btn btn-outline"
                disabled={sending}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.5rem', 
                  borderColor: '#ea4335', color: '#ea4335', background: '#fff',
                  fontWeight: 600
                }}
                title="Abrir de inmediato y enviar con tu cuenta de Google / Gmail sin necesidad de configurar servidor"
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                </svg>
                Gmail Institucional
              </button>

              {/* Envío Directo Automatizado */}
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={sending}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#003366', borderColor: '#003366' }}
              >
                {sending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Enviando Ficha...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Enviar al Correo del Docente</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalElement, document.body) : null;
};

export default SendFichaEmailModal;
