const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production'
  ? (() => {
      console.warn('⚠️ AVISO DE SEGURIDAD: JWT_SECRET no definido en .env. Generando clave efímera de alta entropía.');
      return crypto.randomBytes(32).toString('hex');
    })()
  : 'UPEL_SIGOA_TALENTO_HUMANO_DEV_SECRET_FALLBACK');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Hashea una contraseña con bcrypt
 */
async function hashPassword(plainText) {
  if (!plainText || typeof plainText !== 'string') {
    throw new Error('La contraseña a hashear debe ser un texto válido');
  }
  return await bcrypt.hash(plainText.trim(), SALT_ROUNDS);
}

/**
 * Verifica una contraseña.
 * Soporta tanto hashes bcrypt ($2a$, $2b$, $2y$) como comparación exacta en texto plano
 * para compatibilidad y transición suave sin romper usuarios existentes.
 */
async function verifyPassword(plainText, storedPassword) {
  if (!plainText || !storedPassword) return false;
  const cleanInput = plainText.trim();
  const cleanStored = storedPassword.trim();

  // Si está almacenada como hash bcrypt
  if (cleanStored.startsWith('$2a$') || cleanStored.startsWith('$2b$') || cleanStored.startsWith('$2y$')) {
    return await bcrypt.compare(cleanInput, cleanStored);
  }

  // Comparación en texto plano para cuentas heredadas
  return cleanInput === cleanStored;
}

/**
 * Genera un token JWT firmado
 */
function generateToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    department: user.department
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verifica y decodifica un token JWT
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  JWT_SECRET
};
