const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { requireRole } = require('../middlewares/auth');
const { logAction } = require('../services/auditService');

let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  nodemailer = null;
}

function getStoredMailConfig() {
  const cfgPath = path.join(__dirname, '../mail_config.json');
  let fileConfig = {};
  if (fs.existsSync(cfgPath)) {
    try {
      fileConfig = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
    } catch (e) {
      console.warn('Error leyendo mail_config.json:', e);
    }
  }
  return {
    smtpHost: fileConfig.smtpHost || process.env.SMTP_HOST || '',
    smtpPort: fileConfig.smtpPort || process.env.SMTP_PORT || '587',
    smtpSecure: fileConfig.smtpSecure !== undefined ? fileConfig.smtpSecure : (process.env.SMTP_SECURE === 'true'),
    smtpUser: fileConfig.smtpUser || process.env.SMTP_USER || '',
    smtpPass: fileConfig.smtpPass || process.env.SMTP_PASS || '',
    smtpFrom: fileConfig.smtpFrom || process.env.SMTP_FROM || '',
    resendApiKey: fileConfig.resendApiKey || process.env.RESEND_API_KEY || ''
  };
}

// 1. Obtener configuración de correo (con contraseña enmascarada)
router.get('/mail-config', (req, res) => {
  const config = getStoredMailConfig();
  res.json({
    success: true,
    config: {
      ...config,
      smtpPass: config.smtpPass ? '********' : '',
      hasPass: !!config.smtpPass
    }
  });
});

// 2. Guardar configuración de correo
router.post('/mail-config', requireRole('ADMIN'), async (req, res) => {
  try {
    const current = getStoredMailConfig();
    const { smtpHost, smtpPort, smtpSecure, smtpUser, smtpPass, smtpFrom, resendApiKey, auditor } = req.body;
    
    const updated = {
      smtpHost: (smtpHost !== undefined ? smtpHost : current.smtpHost).trim(),
      smtpPort: (smtpPort !== undefined ? smtpPort : current.smtpPort).toString().trim(),
      smtpSecure: smtpSecure !== undefined ? Boolean(smtpSecure) : current.smtpSecure,
      smtpUser: (smtpUser !== undefined ? smtpUser : current.smtpUser).trim(),
      smtpPass: (smtpPass && smtpPass !== '********') ? smtpPass.trim() : current.smtpPass,
      smtpFrom: (smtpFrom !== undefined ? smtpFrom : current.smtpFrom).trim(),
      resendApiKey: (resendApiKey !== undefined ? resendApiKey : current.resendApiKey).trim()
    };

    const cfgPath = path.join(__dirname, '../mail_config.json');
    fs.writeFileSync(cfgPath, JSON.stringify(updated, null, 2), 'utf8');

    if (auditor && auditor.username) {
      await logAction(auditor.username, auditor.role || 'ADMIN', 'Configuración de Correo', 'Actualizó parámetros de correo SMTP / Resend');
    }

    res.json({ success: true, message: 'Configuración de correo guardada con éxito.' });
  } catch (err) {
    console.error('Error guardando mail config:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Probar conexión de correo (Test de verificación)
router.post('/test-mail', requireRole('ADMIN'), async (req, res) => {
  try {
    const { to } = req.body;
    if (!to) {
      return res.status(400).json({ success: false, error: 'Debe ingresar un correo destinatario para la prueba.' });
    }

    const config = getStoredMailConfig();
    if (!config.smtpHost && !config.resendApiKey) {
      return res.status(400).json({
        success: false,
        error: 'No hay servidor SMTP ni API Key de Resend configurados en el sistema.'
      });
    }

    if (config.smtpHost && nodemailer) {
      const transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: parseInt(config.smtpPort) || 587,
        secure: Boolean(config.smtpSecure),
        auth: {
          user: config.smtpUser,
          pass: config.smtpPass
        },
        tls: { rejectUnauthorized: false }
      });

      await transporter.verify();
      await transporter.sendMail({
        from: config.smtpFrom || config.smtpUser || '"UPEL SIGOA" <no-reply@iprgr.upel.edu.ve>',
        to: to.trim(),
        subject: 'Prueba de Conectividad - UPEL SIGOA Talento Humano',
        text: '¡Conexión SMTP institucional verificada con éxito desde UPEL IPRGR!'
      });

      return res.json({ success: true, method: 'SMTP', message: `Correo de prueba enviado vía SMTP a ${to}` });
    }

    if (config.resendApiKey) {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.resendApiKey}`
        },
        body: JSON.stringify({
          from: config.smtpFrom || 'UPEL SIGOA <onboarding@resend.dev>',
          to: [to.trim()],
          subject: 'Prueba de Conectividad (Resend API) - UPEL SIGOA',
          text: '¡Conexión vía Resend API verificada con éxito desde UPEL IPRGR!'
        })
      });

      const resendData = await resendRes.json();
      if (!resendRes.ok) {
        return res.status(400).json({ success: false, error: resendData.message || 'Error en Resend API' });
      }

      return res.json({ success: true, method: 'Resend', message: `Correo de prueba enviado vía Resend a ${to}`, data: resendData });
    }

    return res.status(400).json({ success: false, error: 'Configuración de correo incompleta.' });
  } catch (err) {
    console.error('Error en test-mail:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Enviar Ficha Oficial Completa al Correo Institucional
router.post('/send-ficha-email', requireRole(['ADMIN', 'DOCENCIA', 'JEFE']), async (req, res) => {
  try {
    const { 
      to, 
      subject, 
      html, 
      text, 
      pdfBase64, 
      filename, 
      docenteNombre, 
      docenteCedula, 
      department, 
      auditor 
    } = req.body;

    if (!to || (!Array.isArray(to) && !to.trim())) {
      return res.status(400).json({ success: false, error: 'Debe indicar un correo institucional destinatario válido.' });
    }

    const config = getStoredMailConfig();
    const cleanTo = Array.isArray(to) ? to : [to.trim()];
    const emailSubject = subject || `Ficha de Oferta Académica - ${docenteNombre || 'Docente'} (${docenteCedula || ''}) - UPEL IPRGR`;

    // Intentar primero vía SMTP con Nodemailer si está configurado
    if (config.smtpHost && config.smtpUser && nodemailer) {
      try {
        const transporter = nodemailer.createTransport({
          host: config.smtpHost,
          port: parseInt(config.smtpPort) || 587,
          secure: Boolean(config.smtpSecure),
          auth: {
            user: config.smtpUser,
            pass: config.smtpPass
          },
          tls: { rejectUnauthorized: false }
        });

        const attachments = [];
        if (pdfBase64) {
          const rawBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
          attachments.push({
            filename: filename || `Ficha_Docente_${docenteCedula ? docenteCedula.replace(/\D/g, '') : 'UPEL'}.pdf`,
            content: Buffer.from(rawBase64, 'base64'),
            contentType: 'application/pdf'
          });
        }

        const info = await transporter.sendMail({
          from: config.smtpFrom || config.smtpUser || '"UPEL Subdirección de Docencia" <docencia@iprgr.upel.edu.ve>',
          to: cleanTo.join(', '),
          subject: emailSubject,
          html: html,
          text: text || 'Se adjunta la Ficha de Oferta Académica de Pregrado oficial emitida por la UPEL IPRGR.',
          attachments
        });

        if (auditor && auditor.username) {
          await logAction(
            auditor.username, 
            auditor.role || 'DOCENCIA', 
            'Envío de Ficha por Correo (SMTP)', 
            `Ficha enviada a: ${cleanTo.join(', ')} para ${docenteNombre || 'Docente'} (C.I: ${docenteCedula || 'N/A'})`
          );
        }

        return res.json({
          success: true,
          method: 'SMTP',
          message: `Ficha enviada exitosamente al correo institucional ${cleanTo.join(', ')}`,
          info
        });
      } catch (smtpErr) {
        console.warn('Fallo envío SMTP, intentando fallback con Resend si está disponible:', smtpErr.message);
        if (!config.resendApiKey) {
          return res.status(500).json({ 
            success: false, 
            error: `Error al enviar correo por SMTP (${config.smtpHost}): ${smtpErr.message}` 
          });
        }
      }
    }

    // Intentar con Resend API
    const resendKey = config.resendApiKey || (req.body.resendApiKey || '').trim();
    if (resendKey) {
      const resendAttachments = [];
      if (pdfBase64) {
        const rawBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
        resendAttachments.push({
          filename: filename || `Ficha_Docente_${docenteCedula ? docenteCedula.replace(/\D/g, '') : 'UPEL'}.pdf`,
          content: rawBase64
        });
      }

      const resendPayload = {
        from: config.smtpFrom || 'UPEL Docencia <docencia@resend.dev>',
        to: cleanTo,
        subject: emailSubject,
        html: html,
        text: text || 'Se adjunta la Ficha de Oferta Académica de Pregrado oficial emitida por la UPEL IPRGR.',
        ...(resendAttachments.length > 0 ? { attachments: resendAttachments } : {})
      };

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendKey}`
        },
        body: JSON.stringify(resendPayload)
      });

      const resendData = await resendRes.json();
      if (resendRes.ok) {
        if (auditor && auditor.username) {
          await logAction(
            auditor.username, 
            auditor.role || 'DOCENCIA', 
            'Envío de Ficha por Correo (Resend)', 
            `Ficha enviada a: ${cleanTo.join(', ')} para ${docenteNombre || 'Docente'} (C.I: ${docenteCedula || 'N/A'})`
          );
        }

        return res.json({
          success: true,
          method: 'Resend',
          message: `Ficha enviada exitosamente al correo institucional ${cleanTo.join(', ')} vía Resend API`,
          data: resendData
        });
      } else {
        return res.status(400).json({
          success: false,
          error: resendData.message || 'Error al despachar el correo con Resend API'
        });
      }
    }

    return res.status(400).json({
      success: false,
      requiresSetup: true,
      error: 'No se han configurado credenciales de correo (SMTP institucional ni Resend API). Puedes configurarlas en el Panel de Administración o abrir Gmail directamente.'
    });

  } catch (err) {
    console.error('Error general en /api/send-ficha-email:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
