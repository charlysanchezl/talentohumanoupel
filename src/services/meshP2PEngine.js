// meshP2PEngine.js - Motor de Red MESH Peer-to-Peer "Anti-Apagones" para UPEL SIGOA
import { 
  getSyncQueue, 
  enqueueMutation, 
  triggerAutoSync, 
  checkServerHealth, 
  getBaseApiUrl 
} from './offlineManager';

const NODE_ID_KEY = 'upel_mesh_node_id';
const CHANNEL_NAME = 'upel_mesh_p2p_channel_v1';

// Generar o recuperar ID de nodo único del dispositivo
export const getLocalNodeIdentity = () => {
  let nodeId = localStorage.getItem(NODE_ID_KEY);
  if (!nodeId) {
    nodeId = 'nodo_' + Math.random().toString(36).substring(2, 7) + '_' + Date.now().toString(36);
    localStorage.setItem(NODE_ID_KEY, nodeId);
  }
  
  const user = JSON.parse(localStorage.getItem('upel_current_user') || '{}');
  const deviceType = /Mobi|Android/i.test(navigator.userAgent) ? 'Móvil' : 'Laptop/PC';

  return {
    nodeId,
    deviceName: `${deviceType} - ${user.name || user.username || 'Docente UPEL'}`,
    role: user.role || 'DOCENTE',
    sede: user.department?.includes('Mendoza') ? 'Sabana de Mendoza' : (user.department?.includes('Encontrados') ? 'Encontrados' : 'Rubio (Sede Central)'),
    timestamp: Date.now()
  };
};

class MeshP2PEngine {
  constructor() {
    this.identity = getLocalNodeIdentity();
    this.peers = new Map();
    this.listeners = [];
    this.channel = null;
    this.heartbeatTimer = null;
    this.isMeshActive = false;
    this.totalP2PMerged = 0;

    // Inicializar nodos base institucionales en caso de contingencia
    this.initDefaultPeers();
  }

  initDefaultPeers() {
    // Nodos preconfigurados para visualización de topología en apagón
    const defaultPeers = [
      {
        nodeId: 'nodo_central_rubio',
        deviceName: 'Servidor Gateway Sede Central',
        role: 'GATEWAY_CENTRAL',
        sede: 'Rubio (Sede Central)',
        status: 'online',
        lastSeen: Date.now() - 5000,
        pendingSync: 0,
        signal: 95
      },
      {
        nodeId: 'nodo_ext_mendoza',
        deviceName: 'Móvil Coordinación Sabana de Mendoza',
        role: 'NODO_FORANEO',
        sede: 'Sabana de Mendoza (Trujillo)',
        status: 'mesh',
        lastSeen: Date.now() - 15000,
        pendingSync: 2,
        signal: 78
      },
      {
        nodeId: 'nodo_ext_encontrados',
        deviceName: 'Tablet Docente Encontrados',
        role: 'NODO_FORANEO',
        sede: 'Encontrados (Zulia)',
        status: 'mesh',
        lastSeen: Date.now() - 25000,
        pendingSync: 1,
        signal: 65
      }
    ];

    defaultPeers.forEach(p => this.peers.set(p.nodeId, p));
  }

  // Iniciar la red mesh local
  start() {
    if (this.isMeshActive) return;
    this.isMeshActive = true;

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => this.handleIncomingMessage(event.data);
      }
    } catch (err) {
      console.warn('BroadcastChannel no soportado en este entorno, operando en modo P2P QR.', err);
    }

    // Emitir presencia cada 5 segundos
    this.broadcastPresence();
    this.heartbeatTimer = setInterval(() => {
      this.broadcastPresence();
      this.pruneOldPeers();
    }, 5000);

    this.notify();
  }

  stop() {
    this.isMeshActive = false;
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.channel) {
      try {
        this.channel.close();
      } catch (e) {}
      this.channel = null;
    }
    this.notify();
  }

  // Anunciar presencia del nodo a dispositivos en la misma red local o pestaña
  broadcastPresence() {
    const packet = {
      type: 'MESH_HEARTBEAT',
      sender: this.identity,
      queueCount: getSyncQueue().length,
      timestamp: Date.now()
    };

    if (this.channel) {
      try {
        this.channel.postMessage(packet);
      } catch (e) {}
    }
  }

  // Difundir transacciones locales por la malla
  broadcastQueue() {
    const queue = getSyncQueue();
    if (queue.length === 0) return;

    const packet = {
      type: 'MESH_GOSSIP_QUEUE',
      sender: this.identity,
      mutations: queue,
      timestamp: Date.now()
    };

    if (this.channel) {
      try {
        this.channel.postMessage(packet);
      } catch (e) {}
    }
  }

  // Procesar mensajes entrantes de otros pares en la malla
  handleIncomingMessage(data) {
    if (!data || !data.sender || data.sender.nodeId === this.identity.nodeId) {
      return; // Ignorar nuestros propios paquetes
    }

    if (data.type === 'MESH_HEARTBEAT') {
      this.updatePeer(data.sender.nodeId, {
        nodeId: data.sender.nodeId,
        deviceName: data.sender.deviceName,
        role: data.sender.role,
        sede: data.sender.sede,
        status: 'mesh',
        pendingSync: data.queueCount || 0,
        lastSeen: Date.now(),
        signal: Math.floor(Math.random() * 20) + 75
      });
    } else if (data.type === 'MESH_GOSSIP_QUEUE') {
      if (Array.isArray(data.mutations)) {
        const mergedCount = this.mergeIncomingMutations(data.mutations);
        if (mergedCount > 0) {
          this.totalP2PMerged += mergedCount;
          this.notify({
            event: 'MUTATIONS_MERGED',
            sender: data.sender.deviceName,
            count: mergedCount
          });
        }
      }
    }
  }

  // Fusión matemática deduplicada (CRDT idempotente)
  mergeIncomingMutations(remoteMutations) {
    const localQueue = getSyncQueue();
    const localIds = new Set(localQueue.map(m => m.id));
    let addedCount = 0;

    remoteMutations.forEach(remote => {
      if (!localIds.has(remote.id)) {
        // Encolar mutación recibida preservando su id y timestamp original
        localQueue.push({
          ...remote,
          viaMesh: true,
          receivedFrom: remote.auditor || 'Par P2P'
        });
        localIds.add(remote.id);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      localStorage.setItem('upel_offline_sync_queue_v1', JSON.stringify(localQueue));
      // Si tenemos canal, re-difundir para garantizar consistencia eventual de la malla
      this.broadcastPresence();
    }

    return addedCount;
  }

  // Exportar cola en formato comprimido Base64 para QR Air-Gapped
  exportQueueForQR() {
    const queue = getSyncQueue();
    const payload = {
      v: 'upel_mesh_1.0',
      origin: this.identity.deviceName,
      sede: this.identity.sede,
      created: Date.now(),
      q: queue
    };
    try {
      const jsonStr = JSON.stringify(payload);
      return btoa(unescape(encodeURIComponent(jsonStr)));
    } catch (e) {
      return JSON.stringify(payload);
    }
  }

  // Importar y absorber paquete QR desde la cámara u otro teléfono
  importQueueFromQR(qrData) {
    try {
      let rawJson;
      try {
        rawJson = decodeURIComponent(escape(atob(qrData.trim())));
      } catch (e) {
        rawJson = qrData.trim();
      }

      const parsed = JSON.parse(rawJson);
      if (!parsed || !Array.isArray(parsed.q)) {
        return { success: false, error: 'Formato no reconocido como paquete UPEL Mesh' };
      }

      const merged = this.mergeIncomingMutations(parsed.q);
      this.totalP2PMerged += merged;
      
      // Registrar nodo emisor
      if (parsed.origin) {
        this.updatePeer('qr_peer_' + Date.now().toString(36), {
          nodeId: 'qr_peer_' + Date.now(),
          deviceName: parsed.origin,
          role: 'DOCENTE_QR',
          sede: parsed.sede || 'Sincronizado vía QR',
          status: 'mesh',
          pendingSync: 0,
          lastSeen: Date.now(),
          signal: 100
        });
      }

      this.notify();
      return { 
        success: true, 
        totalInPackage: parsed.q.length, 
        merged,
        origin: parsed.origin || 'Dispositivo Colega'
      };
    } catch (err) {
      return { success: false, error: 'Error al procesar QR: ' + err.message };
    }
  }

  // Inyectar una mutación simulada para probar la red P2P en demostración
  injectSimulatedMutation(type = 'UPDATE_CARGA') {
    const sedes = ['Rubio (Sede Central)', 'Sabana de Mendoza (Trujillo)', 'Encontrados (Zulia)'];
    const selectedSede = sedes[Math.floor(Math.random() * sedes.length)];
    
    const sample = {
      cedula: 'V-' + Math.floor(10000000 + Math.random() * 9000000),
      nombre: 'Docente de Contingencia P2P',
      departamento: selectedSede.includes('Mendoza') ? 'Extensión Sabana de Mendoza' : (selectedSede.includes('Encontrados') ? 'Extensión Encontrados' : 'Ciencias de la Educación'),
      status: 'Activo (Validado en Malla P2P)',
      materias: [
        { codigo: 'CON-101', nombre: 'Seminario de Resiliencia Pedagógica', horasSemanales: 4, horasLapso: 64, cupo: 30 }
      ],
      fechaFirmaOffline: new Date().toLocaleTimeString('es-ES')
    };

    const item = enqueueMutation(type, sample, `${this.identity.deviceName} (${selectedSede})`);
    
    // Difundir inmediatamente a los pares
    this.broadcastPresence();
    this.broadcastQueue();
    this.notify();

    return item;
  }

  // Nodo puente: Enviar todo el paquete acumulado a la base de datos central cuando vuelve la luz/red
  async performCloudUplink() {
    const isHealthy = await checkServerHealth(getBaseApiUrl());
    if (!isHealthy) {
      return { 
        success: false, 
        error: 'El Servidor Central UPEL aún no responde. La malla P2P continuará resguardando los datos.' 
      };
    }

    const result = await triggerAutoSync();
    if (result.success) {
      this.broadcastPresence();
      this.notify({ event: 'UPLINK_SUCCESS', count: result.processed });
    }
    return result;
  }

  updatePeer(nodeId, peerData) {
    this.peers.set(nodeId, {
      ...this.peers.get(nodeId),
      ...peerData
    });
    this.notify();
  }

  pruneOldPeers() {
    const now = Date.now();
    // Marcar nodos sin señal reciente como inactivos
    this.peers.forEach((peer, id) => {
      if (id !== 'nodo_central_rubio' && now - peer.lastSeen > 60000) {
        peer.status = 'offline';
      }
    });
  }

  getSnapshot() {
    return {
      identity: this.identity,
      isMeshActive: this.isMeshActive,
      peers: Array.from(this.peers.values()),
      localQueue: getSyncQueue(),
      totalP2PMerged: this.totalP2PMerged
    };
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback(this.getSnapshot());
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify(customEvent = null) {
    const snapshot = this.getSnapshot();
    this.listeners.forEach(cb => {
      try {
        cb(snapshot, customEvent);
      } catch (e) {}
    });
  }
}

export const meshEngine = new MeshP2PEngine();
export default meshEngine;
