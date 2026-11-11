import { lazy } from 'react';

const RELOAD_STORAGE_KEY = 'sigoa_chunk_reload_at';
const RELOAD_COOLDOWN_MS = 15000;

function isChunkLoadError(err) {
  const msg = String(err?.message || err || '').toLowerCase();
  return (
    msg.includes('failed to fetch dynamically imported module') ||
    msg.includes('error loading dynamically imported module') ||
    msg.includes('importing a module script failed') ||
    msg.includes('loading chunk') ||
    msg.includes('chunkloaderror') ||
    err?.name === 'ChunkLoadError'
  );
}

/**
 * Envuelve React.lazy para recargar automáticamente una sola vez si el servidor
 * acaba de publicar un nuevo build y el navegador tenía referencias a chunks antiguos.
 */
export function lazyWithRetry(importer) {
  return lazy(async () => {
    try {
      return await importer();
    } catch (err) {
      if (typeof window !== 'undefined' && isChunkLoadError(err)) {
        try {
          const lastReload = parseInt(window.sessionStorage.getItem(RELOAD_STORAGE_KEY) || '0', 10);
          const now = Date.now();
          if (!lastReload || now - lastReload > RELOAD_COOLDOWN_MS) {
            window.sessionStorage.setItem(RELOAD_STORAGE_KEY, String(now));
            window.location.reload();
            return new Promise(() => {});
          }
        } catch (_) {
          // Si sessionStorage no está disponible, delegamos al ErrorBoundary
        }
      }
      throw err;
    }
  });
}
