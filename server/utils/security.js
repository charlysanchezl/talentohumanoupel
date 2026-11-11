const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SALT_ROUNDS = 10;

const PLACEHOLDER_SECRETS = new Set([
  '',
  'coloque_aqui_su_clave_secreta_de_produccion_aleatoria',
  'UPEL_SIGOA_TALENTO_HUMANO_DEV_SECRET_FALLBACK'
]);

function resolveJwtSecret() {
  const envSecret = (process.env.JWT_SECRET || '').trim();
  if (envSecret && !PLACEHOLDER_SECRETS.has(envSecret)) {
    return envSecret;
  }

  const secretFilePath = path.join(__dirname, '../.jwt_secret');
  try {
    if (fs.existsSync(secretFilePath)) {
      const persisted = fs.readFileSync(secretFilePath, 'utf8').trim();
      if (persisted && persisted.length >= 32) {
        return persisted;
      }
    }
    const generated = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(secretFilePath, generated, { encoding: 'utf8', mode: 0o600 });
    console.warn('⚠️ AVISO DE SEGURIDAD: JWT_SECRET no definido en .env. Se generó clave persistente de alta entropía en server/.jwt_secret.');
    return generated;
  } catch (err) {
    console.warn('⚠️ AVISO DE SEGURIDAD: No se pudo persistir .jwt_secret, usando clave efímera en memoria.');
    return crypto.randomBytes(32).toString('hex');
  }
}

const JWT_SECRET = resolveJwtSecret();
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
    department: user.department,
    ...(user.cedula ? { cedula: user.cedula } : {})
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
