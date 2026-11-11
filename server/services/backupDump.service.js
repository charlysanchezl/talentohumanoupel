const fs = require('fs');
const { once } = require('events');
const db = require('../db');

const SQL_INSERT_BATCH_SIZE = 50;
const SQL_SELECT_PAGE_SIZE = 500;
const RESTORE_BATCH_SIZE = 100;

const PREFERRED_3NF_RESTORE_ORDER = [
  'bancos_v3',
  'departamentos_v3',
  'especialidades_v3',
  'sedes_v3',
  'periodos_academicos_v3',
  'materias_catalogo_v3',
  'usuarios',
  'autorizaciones',
  'docentes_v3',
  'docentes_formacion_academica_v3',
  'docentes_datos_bancarios_v3',
  'docentes_contrataciones_v3',
  'cargas_academicas_v3',
  'cargas_historicas',
  'cargas_historicas_materias_v3',
  'audit_logs'
];

function runNativeQuery(executor, sql, params = []) {
  if (typeof executor.nativeQuery === 'function') {
    return executor.nativeQuery(sql, params);
  }
  return executor.query(sql, params);
}

function createStreamWriter(writable) {
  return async (chunk) => {
    if (!chunk) return;
    if (!writable.write(chunk)) {
      await once(writable, 'drain');
    }
  };
}

function formatSqlLiteral(val) {
  if (val === null || val === undefined) return 'NULL';
  if (val instanceof Date) {
    return db.escape(val.toISOString().slice(0, 19).replace('T', ' '));
  }
  return db.escape(val);
}

/**
 * Transmite el volcado SQL completo de todas las tablas base y vistas
 * directamente al consumidor (`write`) sin acumular todo el archivo en RAM.
 */
async function streamSqlDump({ write, dbExecutor = db, userLabel = null }) {
  const [tableListRes] = await runNativeQuery(dbExecutor, 'SHOW FULL TABLES');
  const baseTables = tableListRes
    .filter((row) => Object.values(row)[1] === 'BASE TABLE')
    .map((row) => Object.values(row)[0]);
  const views = tableListRes
    .filter((row) => Object.values(row)[1] === 'VIEW')
    .map((row) => Object.values(row)[0]);

  const now = new Date();
  const generatedBy = userLabel ? ` por ${userLabel}` : '';

  await write(
    `-- ========================================================\n` +
    `-- UPEL SIGOA - BÓVEDA DE RESPALDO INSTITUCIONAL (3NF)\n` +
    `-- Generado: ${now.toLocaleString('es-VE')}${generatedBy}\n` +
    `-- Servidor: UPEL IPRGR Core MySQL/MariaDB\n` +
    `-- Base de Datos: upel_talento_humano (${baseTables.length} tablas base + ${views.length} vistas)\n` +
    `-- ========================================================\n\n` +
    `SET FOREIGN_KEY_CHECKS = 0;\n` +
    `SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";\n` +
    `SET NAMES utf8mb4;\n\n`
  );

  for (const table of baseTables) {
    const [createRes] = await runNativeQuery(dbExecutor, `SHOW CREATE TABLE \`${table}\``);
    if (!createRes || !createRes[0]) continue;

    const createTableSql = createRes[0]['Create Table'] || Object.values(createRes[0])[1];
    await write(
      `-- --------------------------------------------------------\n` +
      `-- Estructura de tabla para la tabla \`${table}\`\n` +
      `-- --------------------------------------------------------\n` +
      `DROP TABLE IF EXISTS \`${table}\`;\n` +
      `${createTableSql};\n\n`
    );

    let offset = 0;
    let columnsSql = null;
    let headerWritten = false;

    while (true) {
      const [rows] = await runNativeQuery(
        dbExecutor,
        `SELECT * FROM \`${table}\` LIMIT ? OFFSET ?`,
        [SQL_SELECT_PAGE_SIZE, offset]
      );
      if (!rows || rows.length === 0) break;

      if (!columnsSql) {
        columnsSql = Object.keys(rows[0]).map((c) => `\`${c}\``).join(', ');
      }
      if (!headerWritten) {
        await write(`-- Volcado de datos para la tabla \`${table}\`\n`);
        headerWritten = true;
      }

      for (let i = 0; i < rows.length; i += SQL_INSERT_BATCH_SIZE) {
        const batch = rows.slice(i, i + SQL_INSERT_BATCH_SIZE);
        const valuesList = batch
          .map((row) => `(${Object.values(row).map(formatSqlLiteral).join(', ')})`)
          .join(',\n');
        await write(`INSERT INTO \`${table}\` (${columnsSql}) VALUES\n${valuesList};\n`);
      }

      offset += rows.length;
      if (rows.length < SQL_SELECT_PAGE_SIZE) break;
    }

    if (headerWritten) {
      await write('\n');
    }
  }

  for (const viewName of views) {
    const [createRes] = await runNativeQuery(dbExecutor, `SHOW CREATE VIEW \`${viewName}\``);
    if (!createRes || !createRes[0]) continue;

    const createViewSql = createRes[0]['Create View'] || Object.values(createRes[0])[1];
    await write(
      `-- --------------------------------------------------------\n` +
      `-- Estructura para la vista \`${viewName}\`\n` +
      `-- --------------------------------------------------------\n` +
      `DROP TABLE IF EXISTS \`${viewName}\`;\n` +
      `DROP VIEW IF EXISTS \`${viewName}\`;\n` +
      `${createViewSql};\n\n`
    );
  }

  await write(`SET FOREIGN_KEY_CHECKS = 1;\n-- FIN DEL RESPALDO UPEL SIGOA\n`);
  return { baseTablesCount: baseTables.length, viewsCount: views.length };
}

/**
 * Escribe el volcado SQL directamente a disco por streaming con bajo consumo de RAM.
 */
async function writeSqlDumpToFile(filePath, options = {}) {
  const ws = fs.createWriteStream(filePath, { encoding: 'utf8' });
  const write = createStreamWriter(ws);
  try {
    const summary = await streamSqlDump({ ...options, write });
    ws.end();
    await once(ws, 'finish');
    return summary;
  } catch (err) {
    ws.destroy();
    throw err;
  }
}

/**
 * Genera el volcado SQL completo como cadena usando el mismo motor unificado.
 */
async function generateSqlDumpString(options = {}) {
  const chunks = [];
  await streamSqlDump({
    ...options,
    write: async (chunk) => {
      chunks.push(chunk);
    }
  });
  return chunks.join('');
}

function coerceSnapshotValue(val, colMeta) {
  if (val === null || val === undefined) return null;

  if (typeof val === 'object') {
    if (val.type === 'Buffer' && Array.isArray(val.data)) {
      return Buffer.from(val.data);
    }
    if (val instanceof Date) return val;
    return JSON.stringify(val);
  }

  const colType = colMeta ? colMeta.type : '';
  const isDateLikeCol = colType === 'date' || colType === 'datetime' || colType === 'timestamp';

  if (typeof val === 'string') {
    if (val.trim() === '' && colMeta && colMeta.nullable && isDateLikeCol) {
      return null;
    }
    if (isDateLikeCol && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/i.test(val)) {
      const parsedDate = new Date(val);
      if (!Number.isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
      return colType === 'date' ? val.slice(0, 10) : val.slice(0, 19).replace('T', ' ');
    }
  }

  return val;
}

async function restore3NFTable(connection, table, rows) {
  const [colRows] = await runNativeQuery(connection, `SHOW COLUMNS FROM \`${table}\``);
  const colMetaMap = new Map();
  for (const col of colRows) {
    colMetaMap.set(col.Field, {
      type: String(col.Type || '').toLowerCase().split('(')[0],
      nullable: col.Null === 'YES'
    });
  }

  await runNativeQuery(connection, `DELETE FROM \`${table}\``);
  if (!Array.isArray(rows) || rows.length === 0) return 0;

  // Usa solo columnas presentes realmente en el esquema de la tabla
  const validCols = Object.keys(rows[0]).filter((col) => colMetaMap.has(col));
  if (validCols.length === 0) return 0;

  const colsSql = validCols.map((c) => `\`${c}\``).join(', ');
  const rowPlaceholder = `(${validCols.map(() => '?').join(', ')})`;

  for (let i = 0; i < rows.length; i += RESTORE_BATCH_SIZE) {
    const batch = rows.slice(i, i + RESTORE_BATCH_SIZE);
    const params = [];
    const placeholders = [];

    for (const row of batch) {
      placeholders.push(rowPlaceholder);
      for (const col of validCols) {
        params.push(coerceSnapshotValue(row[col], colMetaMap.get(col)));
      }
    }

    const sql = `INSERT INTO \`${table}\` (${colsSql}) VALUES ${placeholders.join(', ')}`;
    await runNativeQuery(connection, sql, params);
  }

  return rows.length;
}

function getOrdered3NFTables(data, dbBaseTables) {
  const dbSet = new Set(dbBaseTables);
  const ordered = [];
  const seen = new Set();

  for (const table of PREFERRED_3NF_RESTORE_ORDER) {
    if (dbSet.has(table) && Array.isArray(data[table])) {
      ordered.push(table);
      seen.add(table);
    }
  }

  for (const table of dbBaseTables) {
    if (!seen.has(table) && Array.isArray(data[table])) {
      ordered.push(table);
      seen.add(table);
    }
  }

  return ordered;
}

async function restoreLegacyLogicalSnapshot(connection, data) {
  const insertLegacyRows = async (table, rows) => {
    await connection.query(`DELETE FROM ${table}`);
    for (const row of rows) {
      const keys = Object.keys(row).map((k) => `\`${k}\``).join(', ');
      const vals = Object.values(row).map((v) => db.escape(v)).join(', ');
      await connection.query(`INSERT INTO ${table} (${keys}) VALUES (${vals})`);
    }
  };

  if (Array.isArray(data.docentes)) {
    await insertLegacyRows('docentes', data.docentes);
  }
  if (Array.isArray(data.docentes_materias)) {
    await insertLegacyRows('docentes_materias', data.docentes_materias);
  }
  if (Array.isArray(data.materias_catalogo)) {
    await insertLegacyRows('materias_catalogo', data.materias_catalogo);
  }

  return {
    mode: 'legacy',
    docentes: data.docentes?.length || 0,
    docentesMaterias: data.docentes_materias?.length || 0,
    materiasCatalogo: data.materias_catalogo?.length || 0,
    tablasRestauradas: [data.docentes, data.docentes_materias, data.materias_catalogo].filter(Array.isArray).length
  };
}

/**
 * Restaura de forma atómica (ACID) un snapshot JSON tanto en formato físico 3NF
 * (generado por GET /api/backup/json) como en formato lógico legado.
 */
async function restoreDatabaseSnapshot(connection, payload) {
  const data = payload?.data;
  const has3NF = Boolean(data && Array.isArray(data.docentes_v3));
  const hasLegacy = Boolean(data && Array.isArray(data.docentes));

  if (!has3NF && !hasLegacy) {
    const err = new Error('El archivo de respaldo no tiene una estructura válida de UPEL SIGOA.');
    err.statusCode = 400;
    throw err;
  }

  await connection.beginTransaction();
  await runNativeQuery(connection, 'SET FOREIGN_KEY_CHECKS = 0');

  try {
    let restoredSummary;

    if (has3NF) {
      const [tableListRes] = await runNativeQuery(connection, 'SHOW FULL TABLES');
      const dbBaseTables = tableListRes
        .filter((row) => Object.values(row)[1] === 'BASE TABLE')
        .map((row) => Object.values(row)[0]);

      const tablesToRestore = getOrdered3NFTables(data, dbBaseTables);
      for (const table of tablesToRestore) {
        await restore3NFTable(connection, table, data[table]);
      }

      restoredSummary = {
        mode: '3nf',
        docentes: data.docentes_v3.length,
        docentesMaterias: Array.isArray(data.cargas_academicas_v3) ? data.cargas_academicas_v3.length : 0,
        materiasCatalogo: Array.isArray(data.materias_catalogo_v3) ? data.materias_catalogo_v3.length : 0,
        tablasRestauradas: tablesToRestore.length
      };
    } else {
      restoredSummary = await restoreLegacyLogicalSnapshot(connection, data);
    }

    await runNativeQuery(connection, 'SET FOREIGN_KEY_CHECKS = 1');
    await connection.commit();
    return restoredSummary;
  } catch (err) {
    await runNativeQuery(connection, 'SET FOREIGN_KEY_CHECKS = 1').catch(() => {});
    await connection.rollback().catch(() => {});
    throw err;
  }
}

module.exports = {
  createStreamWriter,
  streamSqlDump,
  writeSqlDumpToFile,
  generateSqlDumpString,
  restoreDatabaseSnapshot
};
