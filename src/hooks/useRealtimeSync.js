import { useEffect, useRef } from 'react';
import { API_URL } from '../data';

/**
 * Hook reutilizable para sincronización en tiempo real vía SSE (/api/sync/events)
 * con respaldo automático mediante polling ligero (/api/sync/version).
 */
export function useRealtimeSync(onSync, entities = ['docentes', 'general', 'periodos']) {
  const onSyncRef = useRef(onSync);
  onSyncRef.current = onSync;
  const entitiesKey = entities.join(',');

  useEffect(() => {
    let eventSource = null;
    let fallbackInterval = null;
    let lastKnownVersion = null;
    const allowedEntities = new Set(entitiesKey.split(',').filter(Boolean));

    function startSmartPolling() {
      if (fallbackInterval) return;
      fallbackInterval = setInterval(async () => {
        try {
          const res = await fetch(`${API_URL}/sync/version`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.version) {
              if (lastKnownVersion && data.version > lastKnownVersion) {
                lastKnownVersion = data.version;
                onSyncRef.current?.();
              } else if (!lastKnownVersion) {
                lastKnownVersion = data.version;
              }
            }
          }
        } catch (_) {}
      }, 25000);
    }

    if (typeof window !== 'undefined' && 'EventSource' in window) {
      try {
        eventSource = new EventSource(`${API_URL}/sync/events`);
        eventSource.onmessage = (e) => {
          try {
            const payload = JSON.parse(e.data);
            if (payload && (payload.type === 'change' || payload.type === 'connected')) {
              if (payload.timestamp && payload.timestamp !== lastKnownVersion) {
                const isFirst = lastKnownVersion === null;
                lastKnownVersion = payload.timestamp;
                if (!isFirst && (!payload.entity || allowedEntities.has(payload.entity))) {
                  onSyncRef.current?.();
                }
              }
            }
          } catch (_) {}
        };
        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          startSmartPolling();
        };
      } catch (_) {
        startSmartPolling();
      }
    } else {
      startSmartPolling();
    }

    return () => {
      if (eventSource) eventSource.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [entitiesKey]);
}
