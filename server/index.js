const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const db = require('./db');
const logger = require('./utils/logger');
const { authenticateToken } = require('./middlewares/auth');
const { securityHeaders } = require('./middlewares/securityHeaders');
const { maintenanceMiddleware } = require('./middlewares/maintenance');
const { syncDatabaseSchema } = require('./services/dbInit.service');

// Routers Modulares
const authRoutes = require('./routes/auth.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const configRoutes = require('./routes/config.routes');
const materiasRoutes = require('./routes/materias.routes');
const auditoriaRoutes = require('./routes/auditoria.routes');
const periodosRoutes = require('./routes/periodos.routes');
const docentesRoutes = require('./routes/docentes.routes');
const syncRoutes = require('./routes/sync.routes');
const mailRoutes = require('./routes/mail.routes');
const backupRoutes = require('./routes/backup.routes');
const aiRoutes = require('./routes/ai.routes');

const app = express();

// Middlewares globales de seguridad y rendimiento
app.use(securityHeaders);
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(authenticateToken);
app.use('/api', maintenanceMiddleware);

// Deshabilitar caché exclusivamente para respuestas dinámicas de la API (/api)
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Endpoint de verificación rápida de conectividad (Health Check)
app.get('/api/health', (req, res) => {
  res.json({ ok: true, timestamp: Date.now(), server: 'UPEL SIGOA Core' });
});

// Servir archivos públicos subidos (flyers, imágenes institucionales)
app.use(express.static(path.join(__dirname, '../public')));

// Inicializar esquema relacional de base de datos e índices
syncDatabaseSchema();

// Montaje de Routers Modulares
app.use('/api', authRoutes);
app.use('/api', usuariosRoutes);
app.use('/api', configRoutes);
app.use('/api', materiasRoutes);
app.use('/api', auditoriaRoutes);
app.use('/api', periodosRoutes.router);
app.use('/api', docentesRoutes);
app.use('/api', syncRoutes);
app.use('/api', mailRoutes);
app.use('/api', backupRoutes);
app.use('/api', aiRoutes);

// Servir frontend compilado (dist) para producción y alta concurrencia
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, {
    maxAge: '1d',
    setHeaders: (res, filePath) => {
      if (filePath.includes(path.sep + 'assets' + path.sep)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      }
    }
  }));
  app.get(/^(?!\/api).+/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Manejador 404 estructurado para rutas API no existentes (evita respuestas colgadas o HTML)
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Ruta API no encontrada: ${req.method} ${req.originalUrl}`
  });
});

// Middleware Centralizado de Manejo de Errores (Senior Error Boundary)
app.use((err, req, res, next) => {
  console.error('[SERVER_ERROR]', err);
  logger.error('Excepción no controlada en Express:', err);
  const status = err.status || err.statusCode || 500;
  const isDev = process.env.NODE_ENV === 'development';
  res.status(status).json({
    success: false,
    error: isDev ? err.message : 'Error interno en el servidor institucional. Por favor comuníquese con Soporte Técnico.',
    ...(isDev ? { stack: err.stack } : {})
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor backend corriendo en http://0.0.0.0:${PORT}`);
  // Verificación periódica automática de cierre de lapsos por fecha calendario (cada 1 hora)
  setInterval(periodosRoutes.verificarCierreAutomaticoLapsos, 60 * 60 * 1000);

  // Mantenimiento y optimización automática mensual de base de datos (Paso 4)
  setInterval(async () => {
    try {
      const now = new Date();
      if (now.getDate() === 1 && now.getHours() === 3) {
        if (typeof backupRoutes.ejecutarMantenimientoTablas === 'function') {
          console.log('[AUTO_MAINTENANCE] Ejecutando optimización mensual programada de base de datos...');
          await backupRoutes.ejecutarMantenimientoTablas(180);
          console.log('[AUTO_MAINTENANCE] Optimización mensual finalizada con éxito.');
        }
      }
    } catch (mErr) {
      console.warn('[AUTO_MAINTENANCE] Aviso en mantenimiento programado:', mErr.message);
    }
  }, 60 * 60 * 1000);
});
