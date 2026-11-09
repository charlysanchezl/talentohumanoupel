/**
 * Servicio Frontend de Escaneo de Documentos con Google Gemini + Motor OCR Real-Time Local
 * UPEL SIGOA - Unidad de Informática
 */

const getStoredToken = () => {
  return typeof window !== 'undefined' ? localStorage.getItem('upel_auth_token') : null;
};

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location) {
    const isViteDev = window.location.port === '5173';
    return isViteDev ? 'http://localhost:3001/api' : '/api';
  }
  return '/api';
};

/**
 * Convierte un File o Blob a cadena Base64
 * @param {File|Blob} file 
 * @returns {Promise<string>}
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Guarda la GEMINI_API_KEY en server/.env desde la interfaz
 */
export const configureGeminiApiKey = async (apiKey) => {
  try {
    const API_URL = getApiBaseUrl();
    const token = getStoredToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}/ai/configure-key`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ apiKey })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message || 'Error al guardar GEMINI_API_KEY' };
  }
};

/**
 * Carga Tesseract.js dinámicamente en el navegador para OCR real cuando no hay GEMINI_API_KEY
 */
const loadTesseractFromCDN = () => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.Tesseract) {
      return resolve(window.Tesseract);
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
    script.async = true;
    script.onload = () => {
      if (window.Tesseract) resolve(window.Tesseract);
      else reject(new Error('No se pudo inicializar el motor OCR local'));
    };
    script.onerror = () => reject(new Error('No se pudo cargar el motor OCR local'));
    document.head.appendChild(script);
  });
};

/**
 * Analiza texto OCR extraído de una Cédula Venezolana, RIF o Título Universitario
 */
const parseVenezuelanDocumentText = (rawText, documentHint = 'auto') => {
  const cleanText = String(rawText || '').replace(/\r/g, '\n');
  const lines = cleanText
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);
  const upperFull = cleanText.toUpperCase();

  let tipoDocumento = documentHint !== 'auto' ? documentHint : 'cedula';
  if (
    upperFull.includes('TITULO DE') ||
    upperFull.includes('TÍTULO DE') ||
    upperFull.includes('RECTOR') ||
    upperFull.includes('UNIVERSIDAD') ||
    upperFull.includes('PEDAGOGICA') ||
    upperFull.includes('PEDAGÓGICA') ||
    upperFull.includes('PROFESOR EN') ||
    upperFull.includes('LICENCIADO') ||
    upperFull.includes('MAGISTER') ||
    upperFull.includes('DOCTOR')
  ) {
    if (documentHint === 'auto') tipoDocumento = 'titulo';
  }

  // 1. Extraer Cédula (ej: V 12.345.678, V-12345678, C.I. 12.345.678)
  let cedula = '';
  let cedulaNumero = '';
  const cedMatch =
    upperFull.match(/\b([VE])[-\s.]*(\d{1,2}[.\s]?\d{3}[.\s]?\d{3})\b/) ||
    upperFull.match(/\b(?:CEDULA|CÉDULA|C\.I\.|CI|NRO|No\.?)[-\s.:]*([VE])?[-\s.]*(\d{1,2}[.\s]?\d{3}[.\s]?\d{3})\b/) ||
    upperFull.match(/\b(\d{1,2}\.\d{3}\.\d{3})\b/);
  if (cedMatch) {
    const nacPrefix = (cedMatch[1] === 'E' ? 'E' : 'V');
    const rawDigits = (cedMatch[2] || cedMatch[1] || '').replace(/\D/g, '');
    if (rawDigits.length >= 6 && rawDigits.length <= 9) {
      cedulaNumero = rawDigits;
      cedula = `${nacPrefix}-${rawDigits}`;
    }
  }

  // 2. Extraer RIF
  let rif = '';
  const rifMatch = upperFull.match(/\b([VEJG])[-\s.]?(\d{7,8})[-\s.]?(\d)\b/);
  if (rifMatch) {
    rif = `${rifMatch[1]}-${rifMatch[2]}-${rifMatch[3]}`;
  }

  // 3. Extraer Fecha de Nacimiento
  let fechaNacimiento = '';
  const dateMatch =
    upperFull.match(/NACIMIENTO[\s:A-Z]*?(\d{2})[/\-.](\d{2})[/\-.](\d{4})/) ||
    upperFull.match(/\b(\d{2})[/\-.](\d{2})[/\-.](19\d{2}|20\d{2})\b/);
  if (dateMatch) {
    const [, dd, mm, yyyy] = dateMatch;
    fechaNacimiento = `${yyyy}-${mm}-${dd}`;
  }

  // 4. Extraer Nombres y Apellidos en Cédula Venezolana
  let apellidos = '';
  let nombres = '';
  for (let i = 0; i < lines.length; i++) {
    const lineUpper = lines[i].toUpperCase();
    if (!apellidos && lineUpper.includes('APELLIDO')) {
      const afterLabel = lineUpper.replace(/.*APELLIDOS?[\s:.;-]*/, '').trim();
      if (afterLabel.length >= 3) {
        apellidos = afterLabel.replace(/[^A-ZÁÉÍÓÚÑ\s]/g, '').trim();
      } else if (lines[i + 1]) {
        apellidos = lines[i + 1].toUpperCase().replace(/[^A-ZÁÉÍÓÚÑ\s]/g, '').trim();
      }
    }
    if (!nombres && lineUpper.includes('NOMBRE')) {
      const afterLabel = lineUpper.replace(/.*NOMBRES?[\s:.;-]*/, '').trim();
      if (afterLabel.length >= 3) {
        nombres = afterLabel.replace(/[^A-ZÁÉÍÓÚÑ\s]/g, '').trim();
      } else if (lines[i + 1]) {
        nombres = lines[i + 1].toUpperCase().replace(/[^A-ZÁÉÍÓÚÑ\s]/g, '').trim();
      }
    }
  }

  // 5. Extraer Título y Universidad si es un diploma/título
  let tituloObtenido = '';
  let universidad = '';
  let nivelAcademico = 'Pregrado';

  if (upperFull.includes('UNIVERSIDAD PEDAGOGICA') || upperFull.includes('UNIVERSIDAD PEDAGÓGICA') || upperFull.includes('UPEL')) {
    universidad = 'UNIVERSIDAD PEDAGÓGICA EXPERIMENTAL LIBERTADOR';
  } else {
    const uniMatch = upperFull.match(/(UNIVERSIDAD\s+[A-ZÁÉÍÓÚÑ\s]{5,55})/);
    if (uniMatch) universidad = uniMatch[1].split('\n')[0].trim();
  }

  const titMatch = upperFull.match(/(?:TITULO DE|TÍTULO DE|GRADO DE)\s*[:\n]?\s*([A-ZÁÉÍÓÚÑ\s,]{5,75})/);
  if (titMatch) {
    tituloObtenido = titMatch[1].split('\n')[0].trim();
  } else {
    const profMatch = upperFull.match(/((?:PROFESOR|LICENCIADO|INGENIERO|MAGISTER|MAGÍSTER|DOCTOR|ESPECIALISTA)\s+EN\s+[A-ZÁÉÍÓÚÑ\s]{4,60})/);
    if (profMatch) tituloObtenido = profMatch[1].split('\n')[0].trim();
  }

  if (/DOCTOR/i.test(tituloObtenido)) nivelAcademico = 'Doctorado';
  else if (/MAGISTER|MAGÍSTER|MAESTRIA|MAESTRÍA/i.test(tituloObtenido)) nivelAcademico = 'Maestría';
  else if (/ESPECIALISTA|ESPECIALIZACION/i.test(tituloObtenido)) nivelAcademico = 'Especialización';

  return {
    tipoDocumento,
    cedula,
    cedulaNumero,
    nombres,
    apellidos,
    nombreCompleto: [nombres, apellidos].filter(Boolean).join(' '),
    fechaNacimiento,
    nacionalidad: cedula.startsWith('E-') ? 'EXTRANJERA' : 'VENEZOLANA',
    rif,
    tituloObtenido,
    universidad,
    nivelAcademico,
    observaciones: 'Extraído mediante OCR Local en tiempo real. Verifique o complete los campos antes de aplicar.'
  };
};

/**
 * Ejecuta OCR real en el navegador sobre la imagen seleccionada
 */
export const scanDocumentWithLocalOCR = async (fileOrBase64, documentHint = 'auto') => {
  const Tesseract = await loadTesseractFromCDN();
  const { data } = await Tesseract.recognize(fileOrBase64, 'spa', {});
  const parsed = parseVenezuelanDocumentText(data?.text || '', documentHint);
  return {
    success: true,
    isLocalOcr: true,
    data: parsed
  };
};

/**
 * Envía una imagen o PDF al backend para extracción multimodal con Gemini,
 * y si no hay GEMINI_API_KEY configurada, utiliza el motor OCR en tiempo real sobre el documento real.
 * @param {File|Blob|string} fileOrBase64 - Archivo o DataURL Base64
 * @param {string} documentHint - 'cedula' | 'titulo' | 'auto'
 * @param {string} customApiKey - Clave opcional proporcionada en la interfaz
 */
export const scanDocumentWithGemini = async (fileOrBase64, documentHint = 'auto', customApiKey = '') => {
  try {
    let base64String = '';
    let mimeType = 'image/jpeg';

    if (typeof fileOrBase64 === 'string') {
      base64String = fileOrBase64;
      if (fileOrBase64.startsWith('data:')) {
        const match = fileOrBase64.match(/^data:([^;]+);base64,/);
        if (match) mimeType = match[1];
      }
    } else if (fileOrBase64 instanceof Blob || fileOrBase64 instanceof File) {
      mimeType = fileOrBase64.type || 'image/jpeg';
      base64String = await fileToBase64(fileOrBase64);
    } else {
      throw new Error('Tipo de archivo no soportado');
    }

    const API_URL = getApiBaseUrl();
    const token = getStoredToken();
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}/ai/scan-document`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        imageBase64: base64String,
        mimeType,
        documentHint,
        apiKey: customApiKey || undefined
      })
    });

    const result = await res.json();

    // Si el servidor indica que GEMINI_API_KEY no está configurada, usar OCR Real en vivo en lugar de datos demo ficticios
    if (result && result.needsApiKey) {
      try {
        const ocrResult = await scanDocumentWithLocalOCR(base64String, documentHint);
        return {
          ...ocrResult,
          needsApiKey: true
        };
      } catch (ocrErr) {
        return {
          success: false,
          needsApiKey: true,
          error: 'Configure su clave GEMINI_API_KEY para activar la visión multimodal con IA.'
        };
      }
    }

    return result;
  } catch (error) {
    console.error('[GEMINI_SCAN_ERROR]', error);
    return {
      success: false,
      error: error.message || 'Error de conexión al procesar el documento con IA'
    };
  }
};
