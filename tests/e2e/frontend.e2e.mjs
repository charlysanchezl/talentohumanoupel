import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { findBrowserExecutable, launchHeadlessBrowser } from './cdpBrowser.mjs';

const require = createRequire(import.meta.url);
const express = require('../../server/node_modules/express');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '../..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

const MOCK_DOCENTES = [
  {
    id: 1,
    cedula: 'V-19540281',
    nombres: 'MARIA',
    apellidos: 'PEREZ',
    department: 'Matemática',
    status: 'Validado',
    periodoAcademico: '2026-I',
    semanas: 15,
    fechaDesde: '2026-04-13',
    fechaHasta: '2026-10-02',
    sedeCentro: 'Rubio',
    especialidad: 'Educación Matemática',
    categoriaDocente: 'Asistente',
    dedicacion: 'Tiempo Convencional',
    correo: 'maria.perez@upel.edu.ve',
    materias: [
      {
        id: 10,
        nombre: 'Cálculo I',
        horasSemanal: 4,
        horasLapso: 60,
        especialidadDestino: 'Educación Matemática',
        seccion: 'A',
        cupos: 30,
        inscritos: 25,
        cohorte: '2026-I',
        periodoAcademico: '2026-I'
      }
    ]
  }
];

const MOCK_PERIODOS = [
  {
    id: 1,
    nombre: '2026-I',
    estado: 'ACTIVO',
    semanas: 15,
    fechaDesde: '2026-04-13',
    fechaHasta: '2026-10-02'
  }
];

function createE2EServer() {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, timestamp: Date.now(), server: 'UPEL SIGOA E2E Mock' });
  });

  app.get('/api/backup/maintenance-mode', (_req, res) => {
    res.json({ success: true, config: { enabled: false, strictLockout: false } });
  });

  app.get('/api/backup/stats', (_req, res) => {
    res.json({
      success: true,
      stats: {
        docentes: MOCK_DOCENTES.length,
        materiasAsignadas: 1,
        catalogo: 1,
        usuarios: 1,
        auditLogs: 1,
        historico: 0,
        serverTime: new Date().toISOString()
      }
    });
  });

  app.post('/api/login', (req, res) => {
    const { username, password } = req.body || {};
    if (username === 'admin' && password === 'AdminTest123!') {
      return res.json({
        success: true,
        token: 'e2e-mock-jwt-token',
        user: {
          id: 1,
          username: 'admin',
          name: 'Administrador E2E',
          role: 'ADMIN',
          department: 'Todos'
        }
      });
    }
    return res.status(401).json({ success: false, message: 'Credenciales incorrectas.' });
  });

  app.get('/api/docentes', (_req, res) => res.json(MOCK_DOCENTES));
  app.get('/api/periodos', (_req, res) => res.json(MOCK_PERIODOS));
  app.get('/api/periodos/:nombre/huerfanas', (_req, res) => res.json({ total: 0, materias: [] }));
  app.get('/api/periodos/:nombre/necesidades', (_req, res) => res.json({ total: 0, necesidades: [] }));
  app.get('/api/materias-catalogo', (_req, res) => res.json([{ id: 1, nombre: 'Cálculo I', departamento: 'Matemática' }]));
  app.get('/api/users', (_req, res) => res.json([]));
  app.get('/api/audit-logs', (_req, res) => res.json([]));
  app.get('/api/config/oferta-publica', (_req, res) => res.json({ enabled: true }));
  app.get('/api/config/login-bg', (_req, res) => res.json({ bgUrl: '', opacity: 0.15 }));
  app.get('/api/config/flyer', (_req, res) => res.json({ enabled: false }));
  app.get('/api/ai/status', (_req, res) => res.json({ available: false }));
  app.use('/api', (_req, res) => res.status(200).json({ success: true }));

  app.use(express.static(DIST_DIR, { maxAge: 0 }));
  app.get(/^(?!\/api).+/, (req, res) => {
    if (
      req.path.startsWith('/assets/') ||
      /\.(js|mjs|css|map|json|png|jpe?g|svg|gif|ico|woff2?|ttf|pdf|mp4)$/i.test(req.path)
    ) {
      return res.status(404).end();
    }
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });

  return http.createServer(app);
}

const setReactInputValue = (selector, value) => `
  (() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) throw new Error('Input no encontrado: ' + ${JSON.stringify(selector)});
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(el, ${JSON.stringify(value)});
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  })()
`;

const EXPORT_BUNDLE_REGEX = /(exceljs|xlsx|jspdf|vendor-exceljs|vendor-xlsx|vendor-pdf)/i;

test('E2E Frontend SIGOA (Arquitectura, Navegación y Code Splitting)', async (t) => {
  if (!fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
    assert.fail('dist/index.html no existe. Ejecuta npm run build antes de correr las pruebas E2E.');
  }
  if (!findBrowserExecutable()) {
    t.skip('No se encontró Chrome/Chromium/Edge en este entorno para pruebas E2E de navegador.');
    return;
  }

  const server = createE2EServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const browser = await launchHeadlessBrowser();

  const requestedUrls = [];
  const runtimeErrors = [];
  browser.on('Network.requestWillBeSent', (params) => {
    if (params?.request?.url) requestedUrls.push(params.request.url);
  });
  browser.on('Runtime.exceptionThrown', (params) => {
    runtimeErrors.push(params?.exceptionDetails?.text || 'Uncaught exception');
  });

  try {
    await t.test('1. /login carga limpio sin descargar librerías pesadas de exportación y valida credenciales inválidas', async () => {
      requestedUrls.length = 0;
      await browser.goto(`${baseUrl}/login`);
      await browser.waitForFunction(`Boolean(document.querySelector('form button[type="submit"]'))`);

      // Verificar que NO se descargó ExcelJS, XLSX ni jsPDF en carga inicial
      const eagerHeavyAssets = requestedUrls.filter((u) => EXPORT_BUNDLE_REGEX.test(u));
      assert.deepEqual(eagerHeavyAssets, [], `Se descargaron librerías pesadas al cargar /login: ${eagerHeavyAssets.join(', ')}`);

      // Probar error controlado ante contraseña incorrecta
      await browser.evaluate(setReactInputValue('input[placeholder*="V-12345678"]', 'admin'));
      await browser.evaluate(setReactInputValue('input[type="password"]', 'clave-erronea'));
      await browser.evaluate(`document.querySelector('form button[type="submit"]').click()`);
      await browser.waitForFunction(`document.body.innerText.includes('Credenciales incorrectas')`);
    });

    await t.test('2. Inicio de sesión real y navegación SPA por módulos sin errores ni recarga de bundles de exportación', async () => {
      requestedUrls.length = 0;
      await browser.evaluate(setReactInputValue('input[placeholder*="V-12345678"]', 'admin'));
      await browser.evaluate(setReactInputValue('input[type="password"]', 'AdminTest123!'));
      await browser.evaluate(`document.querySelector('form button[type="submit"]').click()`);

      // Debe redirigir a Dashboard (/) tras autenticar
      await browser.waitForFunction(`window.location.pathname === '/' && document.body.innerText.includes('Panel')`);

      // Navegación SPA mediante enlaces reales o History API entre módulos críticos
      const routesToCheck = [
        { path: '/consultar', text: 'MARIA' },
        { path: '/docencia', text: 'Programación Académica' },
        { path: '/departamento/Matematica', text: 'Matemática' },
        { path: '/respaldos', text: 'Respaldo' }
      ];

      for (const route of routesToCheck) {
        await browser.evaluate(`
          (() => {
            window.history.pushState({}, '', ${JSON.stringify(route.path)});
            window.dispatchEvent(new PopStateEvent('popstate'));
          })()
        `);
        await browser.waitForFunction(
          `window.location.pathname === ${JSON.stringify(route.path)} && document.body.innerText.includes(${JSON.stringify(route.text)})`,
          10000
        );
      }

      // Verificar que navegar por toda la app NO descargó ExcelJS, XLSX ni jsPDF hasta que se pulse Exportar
      const heavyAfterNav = requestedUrls.filter((u) => EXPORT_BUNDLE_REGEX.test(u));
      assert.deepEqual(heavyAfterNav, [], `Se descargaron librerías pesadas solo por navegar: ${heavyAfterNav.join(', ')}`);
      assert.equal(runtimeErrors.length, 0, `Se detectaron excepciones JS en runtime: ${runtimeErrors.join('; ')}`);
    });

    await t.test('3. Deep-link directo (/departamento/Matematica y /registro), base: "/" y guard 404 en /assets/*', async () => {
      // Recarga directa en subruta profunda (verifica base: '/' y SPA fallback HTML)
      await browser.goto(`${baseUrl}/departamento/Matematica`);
      await browser.waitForFunction(`document.body.innerText.includes('MARIA') && !document.body.innerText.includes('Ha ocurrido un problema')`, 10000);

      // Ruta pública de registro docente
      await browser.goto(`${baseUrl}/registro`);
      await browser.waitForFunction(`document.body.innerText.toLowerCase().includes('registro') || document.body.innerText.toLowerCase().includes('docente')`, 10000);

      // Chunk inexistente en /assets/ debe responder 404 (nunca index.html 200)
      const missingAssetRes = await fetch(`${baseUrl}/assets/inexistente-e2e-chunk.js`);
      assert.equal(missingAssetRes.status, 404);
      assert.equal(runtimeErrors.length, 0, `Se detectaron excepciones JS: ${runtimeErrors.join('; ')}`);
    });
  } finally {
    await browser.close();
    server.closeAllConnections?.();
    server.close();
  }
});
