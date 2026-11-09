const cluster = require('cluster');
const os = require('os');

// Balancear carga utilizando los núcleos de la CPU (máximo 4 para balancear recursos en entornos Windows)
const numCPUs = Math.max(1, Math.min(os.cpus().length, 4));

if (cluster.isPrimary) {
  console.log('=======================================================');
  console.log(`⚡ UPEL SIGOA - MOTOR MULTI-CORE (ALTA CONCURRENCIA)`);
  console.log(`   PID Maestro: ${process.pid}`);
  console.log(`   Núcleos asignados: ${numCPUs}`);
  console.log(`   Capacidad: Optimizado para 500+ usuarios concurrentes`);
  console.log('=======================================================');

  const setupWorkerIPC = (worker) => {
    worker.on('message', (msg) => {
      if (msg && (msg.type === 'CACHE_INVALIDATE' || msg.type === 'REALTIME_BROADCAST')) {
        // Difundir invalidación de caché y eventos en tiempo real a todos los demás workers activos del cluster
        for (const id in cluster.workers) {
          const w = cluster.workers[id];
          if (w && w.process && w.process.pid !== worker.process.pid && w.isConnected()) {
            w.send(msg);
          }
        }
      }
    });
  };

  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();
    setupWorkerIPC(worker);
  }

  cluster.on('exit', (worker, code, signal) => {
    console.warn(`⚠️ Trabajador PID ${worker.process.pid} finalizó. Regenerando proceso inmediatamente...`);
    const newWorker = cluster.fork();
    setupWorkerIPC(newWorker);
  });
} else {
  // Cada worker atiende peticiones en paralelo compartiendo el puerto 3001
  require('./index.js');
}
