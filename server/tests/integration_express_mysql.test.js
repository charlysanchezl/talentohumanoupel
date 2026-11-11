const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middlewares/auth');
const { maintenanceMiddleware } = require('../middlewares/maintenance');
const { hashPassword, isBcryptHash } = require('../utils/security');
const { flushQueue } = require('../services/auditService');

const authRoutes = require('../routes/auth.routes');
const periodosRoutes = require('../routes/periodos.routes');
const materiasRoutes = require('../routes/materias.routes');
const docentesRoutes = require('../routes/docentes.routes');
const backupRoutes = require('../routes/backup.routes');

function buildTestApp() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));
  app.use(authenticateToken);
  app.use('/api', maintenanceMiddleware);

  app.get('/api/health', async (req, res) => {
    const exec = typeof db.nativeQuery === 'function' ? db.nativeQuery.bind(db) : db.query.bind(db);
    try {
      await exec('SELECT 1');
      return res.json({ ok: true, db: 'ok', timestamp: Date.now(), server: 'UPEL SIGOA Core' });
    } catch {
      return res.status(503).json({ ok: false, db: 'error', timestamp: Date.now(), server: 'UPEL SIGOA Core' });
    }
  });

  app.use('/api', authRoutes);
  app.use('/api', periodosRoutes.router);
  app.use('/api', materiasRoutes);
  app.use('/api', docentesRoutes);
  app.use('/api', backupRoutes);
  return app;
}

describe('Suite de Integración Real: Express + MySQL (3NF, JWT, Bcrypt y Respaldos)', () => {
  let server;
  let baseUrl;
  const runId = Date.now();
  const testUsername = `it_admin_${runId}`;
  const testUserPass = `ItPass_${runId}!`;
  const testCedulaNum = String(90000000 + (runId % 9000000));
  const testCedulaV = `V-${testCedulaNum}`;
  const testPortalPass = `DocPass_${runId}!`;
  let adminToken = '';

  before(async () => {
    const app = buildTestApp();
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', resolve);
    });
    const addr = server.address();
    baseUrl = `http://127.0.0.1:${addr.port}`;

    const hashed = await hashPassword(testUserPass);
    await db.nativeQuery(
      'INSERT INTO usuarios (username, password, name, role, departamento_id, correo) VALUES (?, ?, ?, ?, NULL, ?)',
      [testUsername, hashed, 'Test Integracion ADMIN', 'ADMIN', `${testUsername}@test.local`]
    );
  });

  after(async () => {
    await flushQueue().catch(() => {});
    await db.nativeQuery('DELETE FROM docentes_v3 WHERE cedula = ?', [testCedulaNum]).catch(() => {});
    await db.nativeQuery('DELETE FROM usuarios WHERE username = ?', [testUsername]).catch(() => {});
    await db.nativeQuery(
      'DELETE FROM audit_logs WHERE user_name IN (?, ?) OR details LIKE ?',
      [testUsername, testCedulaV, `%${testCedulaNum}%`]
    ).catch(() => {});

    if (server) {
      if (typeof server.closeAllConnections === 'function') {
        server.closeAllConnections();
      }
      await new Promise((resolve) => server.close(resolve));
    }
    await db.end();
  });

  it('GET /api/health debe verificar conectividad real con MySQL y responder db: ok', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.ok, true);
    assert.strictEqual(body.db, 'ok');
  });

  it('POST /api/login debe validar bcrypt contra MySQL, rechazar clave errónea y emitir JWT válido', async () => {
    const badRes = await fetch(`${baseUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: testUsername, password: 'ClaveIncorrecta999' })
    });
    assert.strictEqual(badRes.status, 401);

    const okRes = await fetch(`${baseUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: testUsername, password: testUserPass })
    });
    assert.strictEqual(okRes.status, 200);
    const okData = await okRes.json();
    assert.strictEqual(okData.success, true);
    assert.ok(typeof okData.token === 'string' && okData.token.split('.').length === 3);
    assert.strictEqual(okData.user.role, 'ADMIN');
    adminToken = okData.token;
  });

  it('GET /api/docentes debe exigir JWT (401 sin token) y devolver docentes 3NF autenticado (200)', async () => {
    const unauth = await fetch(`${baseUrl}/api/docentes`);
    assert.strictEqual(unauth.status, 401);

    const authRes = await fetch(`${baseUrl}/api/docentes`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(authRes.status, 200);
    const list = await authRes.json();
    assert.ok(Array.isArray(list) && list.length > 0);
    assert.ok(String(list[0].cedula).startsWith('V-'));
  });

  it('POST/GET/DELETE /api/docentes y login docente deben persistir en 3NF con clave bcrypt y limpiar al borrar', async () => {
    const createRes = await fetch(`${baseUrl}/api/docentes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        cedula: testCedulaV,
        nombres: 'Prueba',
        apellidos: 'Integracion',
        department: 'Matemática',
        correo: `${testUsername}@upel.local`,
        clave: testPortalPass,
        periodoAcademico: '2026-II'
      })
    });
    assert.strictEqual(createRes.status, 200);
    const created = await createRes.json();
    assert.strictEqual(created.success, true);

    const [docRows] = await db.nativeQuery(
      'SELECT cedula, clave_portal_hash FROM docentes_v3 WHERE cedula = ? LIMIT 1',
      [testCedulaNum]
    );
    assert.strictEqual(docRows.length, 1);
    assert.strictEqual(isBcryptHash(docRows[0].clave_portal_hash), true, 'La clave del docente debe almacenarse en bcrypt');

    const docLoginRes = await fetch(`${baseUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: testCedulaV, password: testPortalPass })
    });
    assert.strictEqual(docLoginRes.status, 200);
    const docLoginBody = await docLoginRes.json();
    assert.strictEqual(docLoginBody.success, true);
    assert.strictEqual(docLoginBody.user.role, 'DOCENCIA');

    const delRes = await fetch(`${baseUrl}/api/docentes/${encodeURIComponent(testCedulaV)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({})
    });
    assert.strictEqual(delRes.status, 200);

    const [afterDel] = await db.nativeQuery(
      'SELECT id FROM docentes_v3 WHERE cedula = ?',
      [testCedulaNum]
    );
    assert.strictEqual(afterDel.length, 0);
  });

  it('GET /api/backup/stats y /api/backup/sql deben devolver conteos reales y dump 3NF válido', async () => {
    const statsRes = await fetch(`${baseUrl}/api/backup/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(statsRes.status, 200);
    const statsBody = await statsRes.json();
    assert.strictEqual(statsBody.success, true);
    assert.ok(Number.isInteger(statsBody.stats.docentes) && statsBody.stats.docentes >= 0);

    const sqlRes = await fetch(`${baseUrl}/api/backup/sql`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(sqlRes.status, 200);
    const sqlText = await sqlRes.text();
    assert.ok(sqlText.includes('BÓVEDA DE RESPALDO INSTITUCIONAL (3NF)'));
    assert.ok(sqlText.includes('docentes_v3'));
  });
});
