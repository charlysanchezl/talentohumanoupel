/**
 * Rutas de Inteligencia Artificial Multimodal (Gemini 4.0)
 * UPEL SIGOA - Extracción y Visión Documental
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const logger = require('../utils/logger');
const { extractDocumentData } = require('../services/geminiService');
const { logAction } = require('../services/auditService');

/**
 * POST /api/ai/configure-key
 * Guarda la clave GEMINI_API_KEY en server/.env y la activa en memoria inmediatamente.
 */
router.post('/ai/configure-key', async (req, res) => {
  try {
    const { apiKey } = req.body || {};
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Por favor ingrese una clave GEMINI_API_KEY válida.'
      });
    }

    const cleanKey = apiKey.trim();
    process.env.GEMINI_API_KEY = cleanKey;

    const envPath = path.join(__dirname, '..', '.env');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      if (/^GEMINI_API_KEY=.*$/m.test(envContent)) {
        envContent = envContent.replace(/^GEMINI_API_KEY=.*$/m, `GEMINI_API_KEY=${cleanKey}`);
      } else {
        envContent += `\nGEMINI_API_KEY=${cleanKey}\n`;
      }
    } else {
      envContent = `GEMINI_API_KEY=${cleanKey}\n`;
    }
    fs.writeFileSync(envPath, envContent, 'utf8');

    const userName = req.user ? (req.user.username || req.user.name || 'Sistema') : 'Sistema';
    const userRole = req.user ? (req.user.role || 'ADMIN') : 'ADMIN';
    await logAction(userName, userRole, 'IA_CONFIG_API_KEY', 'Configuró GEMINI_API_KEY para escaneo documental en tiempo real', req);

    return res.json({
      success: true,
      message: 'GEMINI_API_KEY configurada y activada en tiempo real.'
    });
  } catch (err) {
    logger.error('[AI_ROUTES] Error en /ai/configure-key:', err);
    return res.status(500).json({
      success: false,
      error: 'No se pudo guardar la clave GEMINI_API_KEY en el servidor.'
    });
  }
});

/**
 * POST /api/ai/scan-document
 * Recibe imagen en base64 de un documento (Cédula, Título, Constancia)
 * y devuelve los datos extraídos en JSON estructurado.
 */
router.post('/ai/scan-document', async (req, res) => {
  try {
    const { imageBase64, mimeType, documentHint, apiKey } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        error: 'Debe proporcionar la imagen en formato Base64 (imageBase64)'
      });
    }

    // Tamaño de base64 razonable (máx ~15MB)
    if (imageBase64.length > 20 * 1024 * 1024) {
      return res.status(413).json({
        success: false,
        error: 'La imagen excede el límite máximo permitido (15MB)'
      });
    }

    const result = await extractDocumentData(
      imageBase64,
      mimeType || 'image/jpeg',
      documentHint || 'auto',
      apiKey || ''
    );

    // Auditoría si el usuario está autenticado
    if (req.user) {
      const userName = req.user.username || req.user.name || 'Sistema';
      const userRole = req.user.role || 'ADMIN';
      await logAction(
        userName,
        userRole,
        'IA_SCAN_DOCUMENT',
        `Escaneo documental con IA. Tipo detectado: ${result.data?.tipoDocumento || documentHint || 'auto'}`,
        req
      );
    }

    return res.json(result);
  } catch (err) {
    logger.error('[AI_ROUTES] Error en /ai/scan-document:', err);
    return res.status(500).json({
      success: false,
      error: 'Error interno al procesar el documento con IA'
    });
  }
});

module.exports = router;
