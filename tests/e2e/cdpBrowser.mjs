import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';

const BROWSER_CANDIDATES = process.platform === 'win32'
  ? [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
    ]
  : [
      '/usr/bin/google-chrome',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/snap/bin/chromium'
    ];

export function findBrowserExecutable() {
  for (const candidate of BROWSER_CANDIDATES) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

/**
 * Cliente ligero CDP (Chrome DevTools Protocol) sin dependencias externas,
 * basado en WebSocket nativo de Node.js >= 22.
 */
export async function launchHeadlessBrowser() {
  const executable = findBrowserExecutable();
  if (!executable) {
    throw new Error('No se encontró Chrome, Chromium ni Edge instalado para ejecutar pruebas E2E.');
  }

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sigoa-e2e-'));
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--remote-debugging-port=0',
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ];

  const proc = spawn(executable, args, { stdio: ['ignore', 'ignore', 'pipe'] });

  const wsBrowserUrl = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Timeout esperando inicio de navegador headless CDP'));
    }, 15000);

    let stderrBuf = '';
    proc.stderr.on('data', (chunk) => {
      stderrBuf += chunk.toString('utf8');
      const match = stderrBuf.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) {
        clearTimeout(timeout);
        resolve(match[1]);
      }
    });

    proc.once('exit', (code) => {
      clearTimeout(timeout);
      reject(new Error(`El navegador terminó prematuramente (código ${code}): ${stderrBuf}`));
    });
  });

  // Obtener la primera pestaña abierta vía /json/list
  const port = new URL(wsBrowserUrl).port;
  const targetsRes = await fetch(`http://127.0.0.1:${port}/json/list`);
  const targets = await targetsRes.json();
  const pageTarget = targets.find((t) => t.type === 'page');
  if (!pageTarget?.webSocketDebuggerUrl) {
    throw new Error('No se encontró target tipo page en DevTools');
  }

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', (err) => reject(err.error || new Error('Error WebSocket CDP')), { once: true });
  });

  let nextId = 1;
  const pending = new Map();
  const eventListeners = new Map();

  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(String(event.data));
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message || JSON.stringify(msg.error)));
      else resolve(msg.result);
    } else if (msg.method && eventListeners.has(msg.method)) {
      for (const fn of eventListeners.get(msg.method)) {
        fn(msg.params);
      }
    }
  });

  const send = (method, params = {}) => {
    const id = nextId++;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  };

  const on = (method, fn) => {
    if (!eventListeners.has(method)) eventListeners.set(method, new Set());
    eventListeners.get(method).add(fn);
    return () => eventListeners.get(method)?.delete(fn);
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');

  const evaluate = async (expression) => {
    const res = await send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.text || res.exceptionDetails.exception?.description || 'Error en evaluate');
    }
    return res.result?.value;
  };

  const goto = async (url) => {
    const loaded = new Promise((resolve) => {
      const off = on('Page.loadEventFired', () => {
        off();
        resolve();
      });
    });
    await send('Page.navigate', { url });
    await Promise.race([loaded, new Promise((r) => setTimeout(r, 8000))]);
  };

  const waitForFunction = async (jsPredicate, timeoutMs = 8000) => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const ok = await evaluate(jsPredicate);
      if (ok) return true;
      await new Promise((r) => setTimeout(r, 100));
    }
    throw new Error(`Timeout esperando condición en navegador: ${jsPredicate}`);
  };

  const close = async () => {
    try { ws.close(); } catch (_) {}
    try { proc.kill('SIGKILL'); } catch (_) {}
    await new Promise((r) => setTimeout(r, 250));
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (_) {}
  };

  return { send, on, evaluate, goto, waitForFunction, close };
}
