const mysql = require('mysql2');
const os = require('os');
const cluster = require('cluster');
require('dotenv').config();

// Módulos del Adaptador 3NF e Interceptor
const { isTargetQuery, handleInterceptedQuery } = require('./utils/sql3NFInterceptor');
const adapter = require('./utils/docente3NFAdapter');

// Cálculo dinámico de conexiones para evitar saturar MySQL en entornos multi-núcleo (Cluster)
const isWorker = cluster.isWorker || process.env.IS_CLUSTER_WORKER === 'true';
const numCpus = os.cpus().length || 4;
// Si corre en cluster, divide un tope seguro de ~200 conexiones entre los workers (mínimo 15 por worker)
const defaultPoolSize = isWorker ? Math.max(15, Math.floor(200 / numCpus)) : 75;
const connectionLimit = parseInt(process.env.DB_CONNECTION_LIMIT || String(defaultPoolSize), 10);

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'upel_talento_humano',
  waitForConnections: true,
  connectionLimit,
  queueLimit: 150,
  connectTimeout: 20000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});

const promisePool = pool.promise();

// Garantiza que GROUP_CONCAT no se trunque al reconstruir cargas históricas en MySQL (default 1024 B)
pool.on('connection', (rawConn) => {
  rawConn.query('SET SESSION group_concat_max_len = 4194304', (err) => {
    if (err) {
      console.warn('Aviso ajustando group_concat_max_len:', err.message);
    }
  });
});

// Auto-inicializar la tabla atómica de cargas históricas (1FN)
adapter.initCargasHistoricas1NF(promisePool).catch(err => {
  // Aviso silencioso si MySQL aún no está listo al requerir el módulo
});

function shouldRethrowInterceptionError(sql) {
  if (typeof sql !== 'string') return false;
  const upper = sql.trim().toUpperCase();
  const isWrite = upper.startsWith('INSERT') || upper.startsWith('UPDATE') || upper.startsWith('DELETE') || upper.startsWith('TRUNCATE');
  const isVirtualTable = /\b(?:DOCENTES|DOCENTES_MATERIAS|MATERIAS_CATALOGO|PERIODOS_ACADEMICOS)\b(?!_)/i.test(sql);
  return isWrite || isVirtualTable;
}

async function executeWithInterception(executor, origFn, sql, values, contextLabel) {
  if (isTargetQuery(sql)) {
    try {
      const intercepted = await handleInterceptedQuery(executor, sql, values);
      if (intercepted !== null) return intercepted;
    } catch (err) {
      console.error(`Aviso en intercepción 3NF (${contextLabel}):`, err.message);
      if (shouldRethrowInterceptionError(sql)) {
        throw err;
      }
    }
  }
  return origFn(sql, values);
}

// Envolver una conexión obtenida del pool para interceptar mutaciones hacia 3NF
function wrapConnection(conn) {
  const origQuery = conn.query.bind(conn);
  const origExecute = conn.execute ? conn.execute.bind(conn) : origQuery;

  conn.nativeQuery = origQuery;
  conn.query = (sql, values) => executeWithInterception(conn, origQuery, sql, values, 'conn.query');

  if (conn.execute) {
    conn.execute = (sql, values) => executeWithInterception(conn, origExecute, sql, values, 'conn.execute');
  }

  return conn;
}

// Envolver llamadas directas en promisePool
const origPoolQuery = promisePool.query.bind(promisePool);
const origPoolExecute = promisePool.execute ? promisePool.execute.bind(promisePool) : origPoolQuery;
const origGetConnection = promisePool.getConnection.bind(promisePool);

promisePool.nativeQuery = origPoolQuery;
promisePool.query = (sql, values) => executeWithInterception(promisePool, origPoolQuery, sql, values, 'pool.query');

if (promisePool.execute) {
  promisePool.execute = (sql, values) => executeWithInterception(promisePool, origPoolExecute, sql, values, 'pool.execute');
}

promisePool.getConnection = async function() {
  const conn = await origGetConnection();
  return wrapConnection(conn);
};

// Probar conexión inicial y auto-optimizar parámetros de servidor si es posible
promisePool.getConnection()
  .then(async connection => {
    console.log(`✅ Conexión a la base de datos MySQL establecida (Pool: ${connectionLimit} conexiones${isWorker ? ` / Worker PID: ${process.pid}` : ''}).`);
    console.log('⚡ Capa de persistencia normalizada (1FN, 2FN, 3FN) activa con Write-Through hacia motor relacional.');
    try {
      await connection.query('SET GLOBAL max_connections = 350');
    } catch (e) {
      // Si el usuario no tiene permisos SUPER/ADMIN, continúa con la configuración por defecto
    }
    connection.release();
  })
  .catch(err => {
    console.error('❌ Error conectando a la base de datos MySQL:', err.message);
    console.error('Asegúrate de que XAMPP/MySQL esté encendido y la base de datos exista.');
  });

// Keep-alive periódico cada 10 minutos para prevenir desconexiones por inactividad
setInterval(async () => {
  try {
    await origPoolQuery('SELECT 1');
  } catch (err) {
    console.warn('⚠️ Alerta Keep-alive en MySQL:', err.message);
  }
}, 10 * 60 * 1000).unref();

module.exports = promisePool;
