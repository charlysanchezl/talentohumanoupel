import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, Mail, Send, X, CheckCircle, AlertCircle, Loader2, Copy, ExternalLink, FileText } from 'lucide-react';
import { sendEmailWithResend, sendWhatsAppViaApi, generateWhatsAppUrl, getResendApiKey, sendFichaToDocenteEmail } from '../data';
import { getDocenteInstitutionalEmail, generateFichaEmailHtml, generateFichaEmailText } from '../utils/fichaEmailTemplate';
import { generateFichaPdf } from '../utils/generateFichaPdf';

const NotificationModal = ({ isOpen, onClose, staff, type = 'all', announcement = null }) => {
  const getDocenteEmail = (s) => {
    if (!s) return '';
    return (s.correoInstitucional || getDocenteInstitutionalEmail(s) || s.correo || s.email || '').trim();
  };

  const [activeTab, setActiveTab] = useState(type === 'whatsapp' ? 'whatsapp' : 'email');
  const [sendFullFicha, setSendFullFicha] = useState(true);
  const [recipientEmail, setRecipientEmail] = useState(getDocenteEmail(staff));
  const [recipientPhone, setRecipientPhone] = useState(staff?.telefonos || '');
  const [subject, setSubject] = useState(
    announcement 
      ? `[UPEL-DOCENCIA] ${announcement.title}`
      : `Asignación de Carga Académica - UPEL I.P.R.G.R (${staff?.periodoAcademico || 'Vigente'})`
  );
  
  // Plantilla de mensaje de WhatsApp
  const defaultWhatsAppText = announcement
    ? `🏛️ *UPEL - INSTITUTO PEDAGÓGICO RURAL GERVASIO RUBIO*\n*SUBDIRECCIÓN DE DOCENCIA*\n\n📢 *COMUNICADO OFICIAL:*\n*${announcement.title}*\n\n${announcement.content}\n\nEmitido por: ${announcement.author}\nFecha: ${announcement.date}`
    : `🏛️ *UPEL - I.P.R.G.R (Subdirección de Docencia)*\n\nEstimado(a) Profesor(a) *${staff?.nombres} ${staff?.apellidos}* (C.I: ${staff?.cedula}):\n\nLe notificamos que su carga académica correspondiente al período *${staff?.periodoAcademico || 'Actual'}* en el Departamento de *${staff?.department}* ha sido validada exitosamente en el sistema SIGOA.\n\n📚 *Materias Asignadas:*\n${(staff?.materias && staff.materias.length > 0) ? staff.materias.map(m => `• ${m.nombre} (${m.horasSemanal} hrs/sem - Para: ${m.especialidadDestino || 'N/A'})`).join('\n') : '• Sin materias registradas'}\n\n📅 *Período:* ${staff?.fechaDesde || 'N/A'} al ${staff?.fechaHasta || 'N/A'}\n\nFavor revisar su ficha en el portal institucional.`;

  const [whatsappMessage, setWhatsAppMessage] = useState(defaultWhatsAppText);

  // Sincronizar reactivamente cuando cambie el docente o aviso
  useEffect(() => {
    if (staff) {
      setRecipientEmail(getDocenteEmail(staff));
      setRecipientPhone(staff.telefonos || '');
      setSubject(
        announcement 
          ? `[UPEL-DOCENCIA] ${announcement.title}`
          : `Asignación de Carga Académica - UPEL I.P.R.G.R (${staff.periodoAcademico || 'Vigente'})`
      );
      setWhatsAppMessage(defaultWhatsAppText);
    }
  }, [staff, announcement]);

  // Plantilla de Correo HTML
  const generateEmailHtml = () => {
    if (announcement) {
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #003366; color: white; padding: 20px; text-align: center;">
            <h2 style="margin: 0; font-size: 18px;">UNIVERSIDAD PEDAGÓGICA EXPERIMENTAL LIBERTADOR</h2>
            <h3 style="margin: 5px 0 0; font-size: 14px; font-weight: normal;">Instituto Pedagógico Rural "Gervasio Rubio"</h3>
            <p style="margin: 5px 0 0; font-size: 12px; color: #cbd5e1;">Subdirección de Docencia - Talento Humano</p>
          </div>
          <div style="padding: 24px; color: #1e293b;">
            <span style="display: inline-block; background-color: #fee2e2; color: #b91c1c; padding: 4px 10px; border-radius: 99px; font-size: 12px; font-weight: bold; margin-bottom: 12px;">${announcement.priority}</span>
            <h3 style="margin: 0 0 16px; color: #003366; font-size: 20px;">${announcement.title}</h3>
            <div style="line-height: 1.6; color: #334155; font-size: 15px; white-space: pre-line;">${announcement.content}</div>
            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">
              <strong>Emitido por:</strong> ${announcement.author}<br/>
              <strong>Fecha:</strong> ${announcement.date}
            </div>
          </div>
          <div style="background-color: #f8fafc; padding: 12px; text-align: center; font-size: 12px; color: #94a3b8;">
            © ${new Date().getFullYear()} SIGOA - Sistema Integral de Gestión Docente UPEL
          </div>
        </div>
      `;
    }

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #003366; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 18px;">UNIVERSIDAD PEDAGÓGICA EXPERIMENTAL LIBERTADOR</h2>
          <h3 style="margin: 5px 0 0; font-size: 14px; font-weight: normal;">Instituto Pedagógico Rural "Gervasio Rubio"</h3>
          <p style="margin: 5px 0 0; font-size: 12px; color: #cbd5e1;">Subdirección de Docencia - Notificación de Carga Académica</p>
        </div>
        <div style="padding: 24px; color: #1e293b;">
          <p style="font-size: 16px; margin: 0 0 16px;">Estimado(a) Profesor(a) <strong>${staff?.nombres} ${staff?.apellidos}</strong> (C.I. ${staff?.cedula}):</p>
          <p style="line-height: 1.5; color: #475569;">Le notificamos que su asignación de carga académica en el <strong>Departamento de ${staff?.department}</strong> para el período <strong>${staff?.periodoAcademico || 'Actual'}</strong> ha sido registrada y validada en el sistema institucional SIGOA.</p>
          
          <div style="background-color: #f1f5f9; padding: 16px; border-radius: 6px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px; color: #003366;">Detalle de Unidades Curriculares Asignadas:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #334155;">
              ${(staff?.materias && staff.materias.length > 0) 
                ? staff.materias.map(m => `<li style="margin-bottom: 6px;"><strong>${m.nombre}</strong> — ${m.horasSemanal} horas semanales (${m.horasLapso} horas lapso) [Destino: ${m.especialidadDestino || 'N/A'}]</li>`).join('') 
                : '<li>No se registran asignaturas asignadas.</li>'}
            </ul>
          </div>

          <p style="font-size: 14px; color: #64748b;"><strong>Lapso Académico:</strong> ${staff?.fechaDesde || 'N/A'} al ${staff?.fechaHasta || 'N/A'}<br/>
          <strong>Categoría:</strong> ${staff?.categoriaDocente || 'Instructor'} (${staff?.dedicacion || 'Tiempo Convencional'})</p>

          <p style="margin-top: 24px; font-size: 14px; color: #334155;">Para cualquier duda o ajuste en su asignación, por favor comuníquese con la Jefatura de su Departamento o la Subdirección de Docencia.</p>
        </div>
        <div style="background-color: #f8fafc; padding: 12px; text-align: center; font-size: 12px; color: #94a3b8;">
          © ${new Date().getFullYear()} SIGOA - Sistema Integral de Gestión Docente UPEL
        </div>
      </div>
    `;
  };

  const [loading, setLoading] = useState(false);
  const [statusResult, setStatusResult] = useState(null);

  const handleOpenGmail = () => {
    if (!recipientEmail) {
      setStatusResult({ type: 'error', message: 'Por favor ingresa el correo destinatario.' });
      return;
    }

    const emailBody = (sendFullFicha && staff) 
      ? generateFichaEmailText(staff)
      : (announcement 
        ? `COMUNICADO OFICIAL UPEL - I.P.R.G.R\nSubdirección de Docencia\n\n${announcement.title}\n\n${announcement.content}\n\nEmitido por: ${announcement.author}\nFecha: ${announcement.date}`
        : `NOTIFICACIÓN DE CARGA ACADÉMICA - UPEL I.P.R.G.R\nSubdirección de Docencia\n\nEstimado(a) Profesor(a) ${staff?.nombres} ${staff?.apellidos} (C.I. ${staff?.cedula}):\n\nLe notificamos que su carga académica correspondiente al período ${staff?.periodoAcademico || 'Actual'} en el Departamento de ${staff?.department} ha sido validada exitosamente en el sistema SIGOA.\n\nPeríodo: ${staff?.fechaDesde || 'N/A'} al ${staff?.fechaHasta || 'N/A'}\n\nConsulte su ficha en el sistema institucional.`);

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(gmailUrl, '_blank');
    setStatusResult({ type: 'success', message: 'Se abrió Gmail con los datos de la Ficha listos para enviar.' });
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!recipientEmail) {
      setStatusResult({ type: 'error', message: 'Por favor ingresa el correo destinatario.' });
      return;
    }

    setLoading(true);
    setStatusResult(null);

    if (sendFullFicha && staff) {
      let pdfBase64 = null;
      try {
        const pdfRes = await generateFichaPdf(staff);
        pdfBase64 = pdfRes.pdfBase64;
      } catch (errPdf) {
        console.warn('PDF generation fallback:', errPdf);
      }

      const result = await sendFichaToDocenteEmail({
        to: recipientEmail,
        subject: subject,
        html: generateFichaEmailHtml(staff),
        text: generateFichaEmailText(staff),
        pdfBase64,
        staff
      });

      setLoading(false);
      if (result.success) {
        setStatusResult({ type: 'success', message: `¡Ficha de Oferta Académica enviada exitosamente a ${recipientEmail}!` });
      } else {
        setStatusResult({ type: 'error', message: result.error || 'Error al despachar la Ficha.' });
      }
      return;
    }

    const result = await sendEmailWithResend({
      to: recipientEmail,
      subject: subject,
      html: generateEmailHtml(),
      text: announcement ? announcement.content : `Asignación de carga para ${staff?.nombres} ${staff?.apellidos}`
    });

    setLoading(false);
    if (result.success) {
      setStatusResult({ type: 'success', message: `¡Correo enviado exitosamente a ${recipientEmail} vía Resend!` });
    } else {
      setStatusResult({ type: 'error', message: result.error });
    }
  };

  const handleSendWhatsApp = async () => {
    if (!recipientPhone) {
      setStatusResult({ type: 'error', message: 'Por favor ingresa el número telefónico del docente.' });
      return;
    }

    setLoading(true);
    setStatusResult(null);

    const result = await sendWhatsAppViaApi({
      phone: recipientPhone,
      message: whatsappMessage
    });

    setLoading(false);
    if (result.success) {
      setStatusResult({ type: 'success', message: '¡Mensaje de WhatsApp enviado exitosamente vía API!' });
    } else {
      // Abre el enlace directo de WhatsApp Web / App como alternativa instantánea
      const url = result.directUrl || generateWhatsAppUrl(recipientPhone, whatsappMessage);
      window.open(url, '_blank');
      setStatusResult({ type: 'success', message: 'Se abrió la ventana de WhatsApp con el mensaje listo para enviar.' });
    }
  };

  if (!isOpen) return null;

  const modalElement = (
    <div className="upel-modal-overlay" onClick={onClose}>
      <div className="surface animate-scale-up" style={{
        width: '100%', maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto',
        borderRadius: '18px', padding: '2rem', boxShadow: 'var(--shadow-lg)', background: 'white',
        margin: 'auto'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header del Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#003366', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {activeTab === 'email' ? <Mail size={22} color="#003366" /> : <MessageCircle size={22} color="#16a34a" />}
              Notificar al Docente
            </h3>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              {staff ? `${staff.nombres} ${staff.apellidos} (${staff.cedula}) - ${staff.department}` : announcement?.title}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <X size={20} />
          </button>
        </div>

        {/* Selector de Canal (Email / WhatsApp) */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
          <button 
            type="button"
            className={`btn ${activeTab === 'email' ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
            onClick={() => { setActiveTab('email'); setStatusResult(null); }}
          >
            <Mail size={16} /> Correo Electrónico (Resend)
          </button>
          <button 
            type="button"
            className={`btn ${activeTab === 'whatsapp' ? 'btn-primary' : 'btn-outline'}`}
            style={{ 
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem',
              background: activeTab === 'whatsapp' ? '#16a34a' : 'transparent',
              borderColor: activeTab === 'whatsapp' ? '#16a34a' : 'var(--border-light)',
              color: activeTab === 'whatsapp' ? 'white' : '#16a34a'
            }}
            onClick={() => { setActiveTab('whatsapp'); setStatusResult(null); }}
          >
            <MessageCircle size={16} /> WhatsApp Directo / API
          </button>
        </div>

        {/* Mensaje de Estado / Resultado */}
        {statusResult && (
          <div style={{ 
            padding: '0.8rem 1rem', borderRadius: '8px', marginBottom: '1.2rem', fontSize: '0.85rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: statusResult.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: statusResult.type === 'success' ? '#15803d' : '#b91c1c',
            border: `1px solid ${statusResult.type === 'success' ? '#86efac' : '#fca5a5'}`
          }}>
            {statusResult.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{statusResult.message}</span>
          </div>
        )}

        {/* Tab 1: Envío por Correo (Resend) */}
        {activeTab === 'email' && (
          <form onSubmit={handleSendEmail} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="form-label" style={{ fontWeight: 600 }}>Correo Destinatario</label>
              <input 
                type="email" 
                required
                className="filter-input w-full"
                placeholder="profesor@upel.edu.ve o correo personal"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 600 }}>Asunto del Correo</label>
              <input 
                type="text" 
                required
                className="filter-input w-full"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            {staff && (
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.85rem',
                cursor: 'pointer',
                background: '#eff6ff',
                padding: '0.6rem 0.8rem',
                borderRadius: '8px',
                border: '1px solid #bfdbfe'
              }}>
                <input 
                  type="checkbox"
                  checked={sendFullFicha}
                  onChange={(e) => setSendFullFicha(e.target.checked)}
                />
                <span style={{ color: '#1e40af', fontWeight: 500 }}>
                  📄 Enviar Ficha Oficial Completa con Formato UPEL y PDF Adjunto
                </span>
              </label>
            )}

            <div>
              <label className="form-label" style={{ fontWeight: 600 }}>Vista Previa de la Plantilla</label>
              <div style={{ 
                maxHeight: '180px', overflowY: 'auto', padding: '0.8rem', 
                border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', fontSize: '0.85rem' 
              }}>
                <p style={{ margin: '0 0 0.5rem' }}><strong>Asunto:</strong> {subject}</p>
                <p style={{ margin: '0 0 0.5rem' }}><strong>Para:</strong> {recipientEmail || '(correo del docente)'}</p>
                <p style={{ margin: 0, color: '#64748b' }}>
                  {sendFullFicha && staff 
                    ? 'Incluye membrete oficial UPEL I.P.R.G.R, datos del docente, tabla detallada de unidades curriculares, totales de horas, bloques de firmas y documento PDF adjunto.' 
                    : 'Incluye membrete oficial UPEL, notificación del período y resumen del comunicado.'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '0.8rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={onClose} className="btn btn-outline">Cancelar</button>
              
              {/* Botón de Envío Directo con Gmail Institucional (Sin requerir API Key) */}
              <button 
                type="button" 
                onClick={handleOpenGmail}
                className="btn btn-outline"
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.5rem', 
                  borderColor: '#ea4335', color: '#ea4335', background: '#fff' 
                }}
                title="Abrir y enviar directamente con tu cuenta de Gmail / Google UPEL"
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                </svg>
                Abrir en Gmail Institucional
              </button>

              {/* Botón de Envío Automático vía Resend API */}
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Enviar vía Resend API
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Envío por WhatsApp */}
        {activeTab === 'whatsapp' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="form-label" style={{ fontWeight: 600 }}>Número de Teléfono / WhatsApp</label>
              <input 
                type="text" 
                required
                className="filter-input w-full"
                placeholder="Ej. 0414-1234567 o +584141234567"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 600 }}>Mensaje Formateado</label>
              <textarea 
                className="filter-input w-full"
                rows={7}
                value={whatsappMessage}
                onChange={(e) => setWhatsAppMessage(e.target.value)}
                style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={onClose} className="btn btn-outline">Cancelar</button>
              <button 
                type="button" 
                onClick={handleSendWhatsApp}
                className="btn btn-primary"
                disabled={loading}
                style={{ background: '#16a34a', borderColor: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={16} />}
                Enviar por WhatsApp
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalElement, document.body) : null;
};

export default NotificationModal;
