/**
 * Módulo Institucional de Validación y Sanitización de Datos
 * UPEL SIGOA - Unidad de Informática
 */

/**
 * Sanitiza texto removiendo caracteres o etiquetas HTML peligrosas (Prevención de XSS)
 * @param {any} val
 * @returns {string}
 */
function sanitizeString(val) {
  if (val === null || val === undefined) return '';
  return String(val)
    .replace(/[<>]/g, '') // Elimina caracteres de etiquetas HTML
    .trim();
}

/**
 * Valida y normaliza el formato de una Cédula de Identidad venezolana
 * @param {string} cedula
 * @returns {{ valid: boolean, normalized: string, error?: string }}
 */
function validateCedula(cedula) {
  if (!cedula || typeof cedula !== 'string') {
    return { valid: false, normalized: '', error: 'La cédula es obligatoria.' };
  }
  const clean = cedula.trim().toUpperCase();
  const digits = clean.replace(/\D/g, '');

  if (digits.length < 5 || digits.length > 9) {
    return { valid: false, normalized: clean, error: 'La cédula debe contener entre 5 y 9 dígitos numéricos.' };
  }

  const prefix = clean.startsWith('E') ? 'E-' : 'V-';
  return { valid: true, normalized: `${prefix}${digits}` };
}

/**
 * Valida formato de correo electrónico
 * @param {string} email
 * @returns {boolean}
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') return true; // Opcional si está vacío
  const clean = email.trim();
  if (clean === '') return true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(clean);
}

/**
 * Valida formato de cuenta bancaria venezolana (20 dígitos)
 * @param {string} cuenta
 * @returns {{ valid: boolean, clean: string }}
 */
function validateCuentaBancaria(cuenta) {
  if (!cuenta) return { valid: true, clean: '' };
  const digits = String(cuenta).replace(/\D/g, '');
  if (digits.length === 0) return { valid: true, clean: '' };
  if (digits.length !== 20) {
    return { valid: false, clean: digits, error: 'El número de cuenta bancaria debe contener exactamente 20 dígitos numéricos.' };
  }
  return { valid: true, clean: digits };
}

module.exports = {
  sanitizeString,
  validateCedula,
  validateEmail,
  validateCuentaBancaria
};
