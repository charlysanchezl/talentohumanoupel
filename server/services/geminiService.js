/**
 * Servicio Inteligente de Visión y Procesamiento de Documentos con Google Gemini
 * UPEL SIGOA - Módulo de Inteligencia Artificial 4.0
 */

const logger = require('../utils/logger');

/**
 * Prompt del Sistema especializado en Documentación Oficial Universitaria Venezolana
 */
const SYSTEM_INSTRUCTION = `Eres el motor de Visión e IA de UPEL SIGOA (Universidad Pedagógica Experimental Libertador).
Tu función es analizar documentos de identidad oficiales (Cédulas venezolanas, pasaportes, RIF) y documentos académicos (Títulos universitarios, fondos negros, diplomas de pregrado y posgrado, constancias de trabajo y notas certificadas).

Debes extraer con la máxima exactitud los datos del documento y devolver EXCLUSIVAMENTE un objeto JSON válido con los campos que logres identificar.
Si un dato no está presente en la imagen, déjalo como cadena vacía ("").

Formato JSON esperado:
{
  "tipoDocumento": "cedula" | "titulo" | "rif" | "constancia" | "otro",
  "cedula": "V-12345678",
  "cedulaNumero": "12345678",
  "nombres": "NOMBRES COMPLETOS",
  "apellidos": "APELLIDOS COMPLETOS",
  "nombreCompleto": "NOMBRES Y APELLIDOS",
  "fechaNacimiento": "YYYY-MM-DD",
  "nacionalidad": "VENEZOLANA" | "EXTRANJERA",
  "rif": "V-12345678-9",
  "tituloObtenido": "NOMBRE EXACTO DEL TITULO (ej: PROFESOR EN EDUCACION FISICA)",
  "universidad": "UNIVERSIDAD EMISORA (ej: UNIVERSIDAD PEDAGOGICA EXPERIMENTAL LIBERTADOR)",
  "mencion": "MENCION O ESPECIALIDAD",
  "nivelAcademico": "Pregrado" | "Especialización" | "Maestría" | "Doctorado",
  "anioEgreso": "2018",
  "folio": "NUMERO DE FOLIO O REGISTRO",
  "libro": "NUMERO DE LIBRO",
  "observaciones": "Breve nota sobre la legibilidad o autenticidad aparente"
}`;

/**
 * Analiza un documento mediante Google Gemini API (Multimodal)
 * @param {string} imageBase64 - Contenido del archivo en Base64
 * @param {string} mimeType - Tipo MIME (image/jpeg, image/png, image/webp, application/pdf)
 * @param {string} documentHint - Sugerencia ('cedula', 'titulo', 'auto')
 */
async function extractDocumentData(imageBase64, mimeType = 'image/jpeg', documentHint = 'auto', customApiKey = '') {
  const apiKey = (customApiKey && customApiKey.trim() !== '') ? customApiKey.trim() : process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'coloque_aqui_su_gemini_api_key' || apiKey.trim() === '') {
    logger.warn('[GEMINI] Variable GEMINI_API_KEY no configurada en .env');
    return {
      success: false,
      error: 'GEMINI_API_KEY no configurada en el archivo .env del servidor.',
      needsApiKey: true
    };
  }

  // Modelos compatibles en orden de preferencia
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];

  // Limpiar base64 si incluye el prefijo data:image/...;base64,
  let cleanBase64 = imageBase64;
  if (cleanBase64.includes(',')) {
    cleanBase64 = cleanBase64.split(',')[1];
  }

  const promptText = `Analiza este documento universitario/identificación venezolana.
Tipo esperado sugerido: ${documentHint}.
Extrae todos los campos posibles en JSON estricto según tus instrucciones.`;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const requestBody = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: `${SYSTEM_INSTRUCTION}\n\n${promptText}` },
              {
                inlineData: {
                  mimeType: mimeType || 'image/jpeg',
                  data: cleanBase64
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.warn(`[GEMINI] Falló modelo ${model} (HTTP ${response.status}): ${errorText.substring(0, 200)}`);
        continue; // intentar siguiente modelo
      }

      const result = await response.json();
      const rawOutput = result?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawOutput) {
        throw new Error('Respuesta vacía de Gemini');
      }

      let parsedData;
      try {
        parsedData = JSON.parse(rawOutput);
      } catch (parseErr) {
        // En caso de que venga con bloques markdown ```json ... ```
        const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No se pudo parsear el JSON retornado por Gemini');
        }
      }

      // Normalizar cédula si no tiene prefijo V- o E-
      if (parsedData.cedula && !parsedData.cedula.startsWith('V-') && !parsedData.cedula.startsWith('E-')) {
        const num = parsedData.cedula.replace(/\D/g, '');
        if (num) parsedData.cedula = `V-${num}`;
      }
      if (parsedData.cedula && !parsedData.cedulaNumero) {
        parsedData.cedulaNumero = parsedData.cedula.replace(/\D/g, '');
      }

      return {
        success: true,
        modelUsed: model,
        data: parsedData
      };
    } catch (err) {
      logger.error(`[GEMINI] Error invocando modelo ${model}:`, err.message);
    }
  }

  return {
    success: false,
    error: 'No se pudo procesar la imagen con los modelos de Gemini disponibles. Verifique su conexión y cuota de API.'
  };
}

module.exports = {
  extractDocumentData
};
