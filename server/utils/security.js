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
 * Verifica si una cadena ya corresponde a un hash bcrypt válido ($2a$, $2b$, $2y$).
 */
function isBcryptHash(value) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  return /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(trimmed);
}

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
 * Devuelve el hash bcrypt existente o lo genera si recibe texto plano.
 */
async function ensureBcryptHash(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('La contraseña a proteger debe ser un texto válido');
  }
  const clean = password.trim();
  if (isBcryptHash(clean)) return clean;
  return await hashPassword(clean);
}

/**
 * Verifica una contraseña exclusivamente contra un hash bcrypt válido.
 * Las cuentas heredadas en texto plano se migran automáticamente a bcrypt al iniciar el servidor.
 */
async function verifyPassword(plainText, storedPassword) {
  if (!plainText || typeof plainText !== 'string' || !storedPassword || typeof storedPassword !== 'string') {
    return false;
  }
  const cleanInput = plainText.trim();
  const cleanStored = storedPassword.trim();

  if (!isBcryptHash(cleanStored)) {
    return false;
  }

  try {
    return await bcrypt.compare(cleanInput, cleanStored);
  } catch {
    return false;
  }
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
  isBcryptHash,
  hashPassword,
  ensureBcryptHash,
  verifyPassword,
  generateToken,
  verifyToken,
  JWT_SECRET
};
