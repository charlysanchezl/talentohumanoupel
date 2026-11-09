const fs = require('fs');
const path = require('path');

const LOGS_DIR = path.join(__dirname, '../logs');
if (!fs.existsSync(LOGS_DIR)) {
  try {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  } catch (e) {}
}

const LOG_FILE = path.join(LOGS_DIR, 'audit-system.log');

function formatMessage(level, message, meta = null) {
  const timestamp = new Date().toISOString();
  let metaStr = '';
  if (meta) {
    if (meta instanceof Error) {
      metaStr = ` | Stack: ${meta.stack}`;
    } else if (typeof meta === 'object') {
      try {
        metaStr = ` | Meta: ${JSON.stringify(meta)}`;
      } catch (e) {
        metaStr = ` | Meta: [Circular/Invalid JSON]`;
      }
    } else {
      metaStr = ` | ${meta}`;
    }
  }
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}\n`;
}

function writeToFile(line) {
  try {
    fs.appendFile(LOG_FILE, line, 'utf8', () => {});
  } catch (err) {}
}

const logger = {
  info: (msg, meta) => {
    const line = formatMessage('INFO', msg, meta);
    console.log(`ℹ️ [INFO] ${msg}`);
    writeToFile(line);
  },
  warn: (msg, meta) => {
    const line = formatMessage('WARN', msg, meta);
    console.warn(`⚠️ [WARN] ${msg}`);
    writeToFile(line);
  },
  error: (msg, meta) => {
    const line = formatMessage('ERROR', msg, meta);
    console.error(`❌ [ERROR] ${msg}`, meta || '');
    writeToFile(line);
  },
  action: (auditor, action, details) => {
    const userStr = auditor ? `${auditor.username || auditor.name || 'User'} (${auditor.role || 'ROLE'})` : 'SYSTEM';
    const line = formatMessage('AUDIT', `${userStr} -> ${action}: ${details}`);
    writeToFile(line);
  }
};

module.exports = logger;
