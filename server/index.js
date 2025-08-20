require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { syncModels } = require('./models');
const fileRoutes = require('./routes/files');
const appRoutes = require('./routes/app');
const mundoRoutes = require('./routes/mundos');
const subMundoRoutes = require('./routes/subMundos');
const desarrolloRoutes = require('./routes/desarrollos');
const errorHandler = require('./middlewares/error');
const { initStorage, verifyStorageIntegrity, recoverLostFiles } = require('./scripts/initStorage');
const { initDatabase } = require('./scripts/initDatabase');
const BackgroundMonitor = require('./scripts/backgroundMonitor');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  credentials: true
}));

// Logging de requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Rutas de la API
app.use('/api/v1/files', fileRoutes);
app.use('/api/v1/mundos', mundoRoutes);
app.use('/api/v1/sub-mundos', subMundoRoutes);
app.use('/api/v1/desarrollos', desarrolloRoutes);
app.use('/api/v1', appRoutes);

// Health check global
app.get('/api/v1/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Servir archivos estáticos del frontend PRIMERO
app.use(express.static(path.join(__dirname, '..')));

// Servir archivos estáticos (solo para descargas)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Ruta para el frontend
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Ruta raíz - solo si no es un archivo estático
app.get('/', (req, res) => {
  // Verificar si existe index.html
  const indexPath = path.join(__dirname, '..', 'index.html');
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({
      message: 'Cuarta Backend API - Express + Sequelize + PostgreSQL',
      version: '1.0.0',
      endpoints: {
        health: '/api/v1/health',
        files: '/api/v1/files',
        upload: 'POST /api/v1/files',
        download: 'GET /api/v1/files/:id/download',
        delete: 'DELETE /api/v1/files/:id',
        estaciones: '/api/v1/estaciones',
        mundos: '/api/v1/mundos',
        subMundos: '/api/v1/mundos/:mundoId/sub-mundos',
        desarrollos: '/api/v1/sub-mundos/:subMundoId/desarrollos'
      }
    });
  }
});

// Manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Inicializar servidor
const startServer = async () => {
  try {
    // Inicializar almacenamiento
    console.log('📁 Inicializando almacenamiento...');
    await initStorage();
    console.log('✅ Almacenamiento inicializado');
    
    // Inicializar base de datos
    console.log('🗄️ Inicializando base de datos...');
    await initDatabase();
    console.log('✅ Base de datos inicializada');
    
    // Sincronizar modelos con la base de datos
    await syncModels();
    
    // Verificar integridad del almacenamiento después de sincronizar modelos
    console.log('🔍 Verificando integridad del almacenamiento...');
    const { File } = require('./models');
    const integrityResult = await verifyStorageIntegrity(File);
    console.log('✅ Verificación de integridad completada');
    
    // Si hay archivos perdidos, intentar recuperación automática
    if (integrityResult.hasIssues && integrityResult.missingCount > 0) {
      console.log(`⚠️ Se detectaron ${integrityResult.missingCount} archivos perdidos, iniciando recuperación automática...`);
      
      const recoveryResult = await recoverLostFiles(File);
      if (recoveryResult.success) {
        console.log(`✅ Recuperación automática exitosa: ${recoveryResult.recovered} archivos recuperados`);
      } else {
        console.warn(`⚠️ Recuperación automática falló, los archivos pueden estar temporalmente no disponibles`);
      }
    }
    
    // Iniciar monitoreo en segundo plano para Render Disk
    console.log('🔍 Iniciando monitoreo en segundo plano...');
    const backgroundMonitor = new BackgroundMonitor(File, process.env.UPLOAD_DIR || './uploads', {
      intervalMs: 2 * 60 * 1000, // Verificar cada 2 minutos
      maxRetries: 5
    });
    
    backgroundMonitor.start();
    console.log('✅ Monitoreo en segundo plano iniciado');
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📁 API disponible en http://localhost:${PORT}/api/v1`);
      console.log(`🔍 Health check: http://localhost:${PORT}/api/v1/health`);
      console.log(`💾 Almacenamiento: ${process.env.UPLOAD_DIR || './uploads'}`);
      console.log(`🔍 Monitoreo: Verificando integridad cada 2 minutos`);
    });
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
};

// Manejo de señales de terminación
process.on('SIGINT', () => {
  console.log('\n🛑 Servidor detenido por SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Servidor detenido por SIGTERM');
  process.exit(0);
});

// Iniciar servidor
startServer();
