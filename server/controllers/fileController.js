const { File } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs').promises;
const path = require('path');
const sequelize = require('../config/db'); // Added sequelize import

// Health check
exports.health = (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
};

// Endpoint de diagnóstico para verificar el estado de la base de datos
exports.diagnose = async (req, res) => {
  try {
    console.log('🔍 Diagnóstico de base de datos iniciado');
    
    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');
    
    // Obtener información de la base de datos
    const [results] = await sequelize.query('SELECT current_database() as db_name, current_user as user_name');
    console.log('🔍 Base de datos actual:', results[0]);
    
    // Verificar tablas existentes
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('📋 Tablas existentes:', tables);
    
    // Verificar si la tabla files existe
    const filesTableExists = tables.includes('files');
    console.log('🔍 Tabla files existe:', filesTableExists);
    
    // Si la tabla files existe, verificar su estructura
    let tableStructure = null;
    if (filesTableExists) {
      try {
        const [columns] = await sequelize.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = 'files'
          ORDER BY ordinal_position
        `);
        tableStructure = columns;
        console.log('🔍 Estructura de tabla files:', columns);
      } catch (error) {
        console.error('❌ Error obteniendo estructura de tabla files:', error);
      }
    }
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        name: results[0]?.db_name,
        user: results[0]?.user_name,
        tables: tables,
        filesTableExists: filesTableExists,
        filesTableStructure: tableStructure
      }
    });
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    res.status(500).json({ 
      status: 'error',
      error: error.message,
      stack: error.stack
    });
  }
};

// Endpoint de prueba simple para verificar si el problema es básico
exports.test = async (req, res) => {
  try {
    console.log('🧪 Endpoint de prueba ejecutándose...');
    
    // Prueba básica de respuesta
    res.json({
      status: 'ok',
      message: 'Endpoint de prueba funcionando',
      timestamp: new Date().toISOString(),
      test: 'simple'
    });
    
  } catch (error) {
    console.error('❌ Error en endpoint de prueba:', error);
    res.status(500).json({ 
      status: 'error',
      error: error.message
    });
  }
};

// Endpoint de prueba para simular el proceso de upload
exports.testUpload = async (req, res) => {
  try {
    console.log('🧪 testUpload - Iniciando prueba de upload...');
    console.log('🧪 testUpload - req.body:', req.body);
    console.log('🧪 testUpload - req.headers:', req.headers);
    
    // Verificar que el modelo File esté disponible
    console.log('🧪 testUpload - Verificando modelo File...');
    if (!File) {
      console.error('❌ testUpload - Modelo File no disponible');
      return res.status(500).json({ 
        error: 'Modelo File no disponible',
        test: 'upload-simulation-failed'
      });
    }
    
    // Simular la creación de un archivo en la base de datos
    console.log('🧪 testUpload - Intentando crear registro en BD...');
    
    const testFileRecord = await File.create({
      name: 'test-file.html',
      file_name: 'test-file.html',
      path: '/tmp/test-path',
      content_type: 'text/html',
      size: 1024,
      tags: 'test',
      folder: 'test'
    });
    
    console.log('✅ testUpload - Archivo de prueba creado en BD:', testFileRecord.id);
    
    // Eliminar el archivo de prueba
    await testFileRecord.destroy();
    console.log('🧹 testUpload - Archivo de prueba eliminado');
    
    res.json({
      status: 'ok',
      message: 'Prueba de upload completada exitosamente',
      timestamp: new Date().toISOString(),
      test: 'upload-simulation',
      database: 'working',
      fileCreation: 'success',
      modelFile: 'available'
    });
    
  } catch (error) {
    console.error('❌ Error en testUpload:', error);
    console.error('❌ Error stack:', error.stack);
    
    // Devolver información más detallada del error
    res.status(500).json({ 
      status: 'error',
      error: error.message,
      stack: error.stack,
      test: 'upload-simulation-failed',
      errorType: error.constructor.name,
      modelFile: File ? 'available' : 'not-available'
    });
  }
};

// Endpoint de debug para identificar exactamente dónde falla
exports.debug = async (req, res) => {
  try {
    console.log('🔍 debug - Iniciando debug completo...');
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        UPLOAD_DIR: process.env.UPLOAD_DIR,
        MAX_UPLOAD_BYTES: process.env.MAX_UPLOAD_BYTES,
        ALLOWED_MIME_TYPES: process.env.ALLOWED_MIME_TYPES
      },
      models: {
        File: File ? 'available' : 'not-available',
        sequelize: sequelize ? 'available' : 'not-available'
      },
      database: {
        connected: false,
        tables: [],
        config: {
          dialect: sequelize.getDialect(),
          host: sequelize.config.host,
          port: sequelize.config.port,
          database: sequelize.config.database,
          username: sequelize.config.username
        }
      }
    };
    
    // Verificar conexión a la base de datos
    try {
      await sequelize.authenticate();
      debugInfo.database.connected = true;
      console.log('✅ debug - Conexión a BD exitosa');
      
      // Verificar tablas
      const tables = await sequelize.getQueryInterface().showAllTables();
      debugInfo.database.tables = tables;
      console.log('✅ debug - Tablas encontradas:', tables);
      
      // Obtener información adicional de la base de datos
      try {
        const [dbInfo] = await sequelize.query('SELECT current_database() as db_name, current_user as user_name, version() as version');
        debugInfo.database.info = dbInfo[0];
        console.log('✅ debug - Info de BD:', dbInfo[0]);
      } catch (infoError) {
        console.log('⚠️ debug - No se pudo obtener info adicional de BD:', infoError.message);
      }
      
    } catch (dbError) {
      console.error('❌ debug - Error de BD:', dbError);
      debugInfo.database.error = dbError.message;
      debugInfo.database.stack = dbError.stack;
    }
    
    // Verificar directorio de uploads
    try {
      const fs = require('fs');
      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      debugInfo.uploadDir = {
        path: uploadDir,
        exists: fs.existsSync(uploadDir),
        writable: false
      };
      
      if (fs.existsSync(uploadDir)) {
        try {
          fs.accessSync(uploadDir, fs.constants.W_OK);
          debugInfo.uploadDir.writable = true;
        } catch (permError) {
          debugInfo.uploadDir.writable = false;
          debugInfo.uploadDir.permissionError = permError.message;
        }
      }
      
    } catch (fsError) {
      console.error('❌ debug - Error de sistema de archivos:', fsError);
      debugInfo.uploadDir.error = fsError.message;
    }
    
    console.log('✅ debug - Debug completado');
    res.json(debugInfo);
    
  } catch (error) {
    console.error('❌ Error en debug:', error);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
};

// Verificar espacio disponible en disco
exports.getDiskUsage = async (req, res) => {
  try {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    
    // Calcular espacio usado por archivos en la base de datos
    const totalSize = await File.sum('size') || 0;
    const totalFiles = await File.count();
    
    // Debug: Mostrar información detallada
    console.log('🔍 getDiskUsage - totalSize:', totalSize, 'bytes');
    console.log('🔍 getDiskUsage - totalFiles:', totalFiles);
    
    // Límites de Render Disk (1GB = 1,073,741,824 bytes)
    const DISK_LIMIT_BYTES = 1 * 1024 * 1024 * 1024;
    const availableSpace = Math.max(0, DISK_LIMIT_BYTES - totalSize);
    
    // Calcular porcentajes
    const usedPercentage = Math.round((totalSize / DISK_LIMIT_BYTES) * 100);
    const availablePercentage = 100 - usedPercentage;
    
    res.json({
      disk: {
        total: DISK_LIMIT_BYTES,
        used: totalSize,
        available: availableSpace,
        usedPercentage,
        availablePercentage
      },
      files: {
        count: totalFiles,
        totalSize
      },
      limits: {
        maxFileSize: process.env.MAX_UPLOAD_BYTES || 157286400,
        maxFileSizeMB: Math.round((process.env.MAX_UPLOAD_BYTES || 157286400) / (1024 * 1024))
      },
      recommendations: {
        warning: usedPercentage > 80 ? 'El disco está casi lleno. Considera eliminar archivos antiguos.' : null,
        critical: usedPercentage > 95 ? '¡CRÍTICO! El disco está casi lleno. Elimina archivos inmediatamente.' : null
      }
    });
  } catch (error) {
    console.error('Error obteniendo uso del disco:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Listar archivos con filtros
exports.listFiles = async (req, res) => {
  try {
    const { folder, q, limit = 50, offset = 0 } = req.query;
    
    // Construir where clause
    const whereClause = {};
    
    if (folder) {
      whereClause.folder = folder;
    }
    
    if (q) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${q}%` } },
        { tags: { [Op.iLike]: `%${q}%` } }
      ];
    }

    // Validar parámetros
    const validLimit = Math.min(parseInt(limit), 100);
    const validOffset = Math.max(parseInt(offset), 0);

    const { count, rows } = await File.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: validLimit,
      offset: validOffset
    });

    res.json({
      files: rows,
      total: count,
      limit: validLimit,
      offset: validOffset
    });
  } catch (error) {
    console.error('Error listando archivos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Subir archivo
exports.uploadFile = async (req, res) => {
  try {
    console.log('🔍 uploadFile - Iniciando subida de archivo');
    console.log('🔍 uploadFile - req.file:', req.file);
    console.log('🔍 uploadFile - req.body:', req.body);
    
    if (!req.file) {
      console.log('❌ uploadFile - No se proporcionó ningún archivo');
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    const { folder, tags } = req.body;
    const file = req.file;

    // Debug: Mostrar información del archivo
    console.log('🔍 uploadFile - file.size:', file.size, 'bytes');
    console.log('🔍 uploadFile - file.originalname:', file.originalname);
    console.log('🔍 uploadFile - file.mimetype:', file.mimetype);
    console.log('🔍 uploadFile - file.path:', file.path);
    
    console.log('🔍 uploadFile - Intentando crear registro en la base de datos...');
    
    // Crear registro en la base de datos
    const fileRecord = await File.create({
      name: file.originalname,
      file_name: file.originalname,
      path: file.path,
      content_type: file.mimetype,
      size: file.size,
      tags: tags || null,
      folder: folder || null
    });
    
    console.log('✅ uploadFile - Archivo creado en BD con ID:', fileRecord.id, 'y tamaño:', fileRecord.size);

    res.status(201).json({
      message: 'Archivo subido exitosamente',
      file: fileRecord
    });
  } catch (error) {
    console.error('❌ Error subiendo archivo:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Descargar archivo
exports.downloadFile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const file = await File.findByPk(id);
    if (!file) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    // Verificar que el archivo físico existe
    try {
      await fs.access(file.path);
    } catch (error) {
      console.warn(`⚠️ Archivo físico no encontrado: ${file.path} (ID: ${id})`);
      
      // Si el archivo físico no existe, devolver información del archivo pero con error
      return res.status(404).json({ 
        error: 'Archivo físico no encontrado',
        fileInfo: {
          id: file.id,
          name: file.name,
          file_name: file.file_name,
          content_type: file.content_type,
          size: file.size,
          path: file.path,
          created_at: file.created_at
        },
        message: 'El archivo existe en la base de datos pero no se encuentra físicamente. Esto puede ocurrir después de un reinicio del servidor.',
        suggestion: 'Intente subir el archivo nuevamente o contacte al administrador.'
      });
    }

    // Enviar archivo como adjunto
    res.download(file.path, file.file_name);
  } catch (error) {
    console.error('Error descargando archivo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar archivo
exports.deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const file = await File.findByPk(id);
    if (!file) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    // Eliminar archivo físico
    try {
      await fs.unlink(file.path);
    } catch (error) {
      console.warn(`No se pudo eliminar archivo físico: ${file.path}`, error);
    }

    // Eliminar registro de la base de datos
    await file.destroy();

    res.json({ message: 'Archivo eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando archivo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener archivo por ID
exports.getFile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const file = await File.findByPk(id);
    if (!file) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    res.json(file);
  } catch (error) {
    console.error('Error obteniendo archivo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Endpoint para recuperar archivos perdidos
exports.recoverFiles = async (req, res) => {
  try {
    console.log('🔧 Iniciando recuperación de archivos...');
    
    // Obtener todos los archivos de la base de datos
    const files = await File.findAll();
    console.log(`📊 Total de archivos en BD: ${files.length}`);
    
    const results = {
      total: files.length,
      existing: 0,
      missing: 0,
      recovered: 0,
      details: []
    };
    
    for (const file of files) {
      try {
        // Verificar si el archivo físico existe
        await fs.access(file.path);
        results.existing++;
        results.details.push({
          id: file.id,
          name: file.name,
          status: 'ok',
          path: file.path
        });
      } catch (error) {
        results.missing++;
        results.details.push({
          id: file.id,
          name: file.name,
          status: 'missing',
          path: file.path,
          error: 'Archivo físico no encontrado'
        });
        
        console.warn(`⚠️ Archivo perdido: ${file.path} (ID: ${file.id})`);
      }
    }
    
    console.log(`📊 Resumen de recuperación:`, {
      total: results.total,
      existentes: results.existing,
      faltantes: results.missing
    });
    
    res.json({
      status: 'ok',
      message: 'Recuperación de archivos completada',
      timestamp: new Date().toISOString(),
      results: results
    });
    
  } catch (error) {
    console.error('❌ Error en recuperación de archivos:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

// Endpoint para limpiar archivos huérfanos (registros en BD sin archivos físicos)
exports.cleanupOrphanFiles = async (req, res) => {
  try {
    console.log('🧹 Iniciando limpieza de archivos huérfanos...');
    
    // Obtener todos los archivos de la base de datos
    const files = await File.findAll();
    console.log(`📊 Total de archivos en BD: ${files.length}`);
    
    const orphanFiles = [];
    
    for (const file of files) {
      try {
        // Verificar si el archivo físico existe
        await fs.access(file.path);
      } catch (error) {
        // El archivo físico no existe, es un huérfano
        orphanFiles.push(file);
      }
    }
    
    console.log(`📊 Archivos huérfanos encontrados: ${orphanFiles.length}`);
    
    if (orphanFiles.length === 0) {
      return res.json({
        status: 'ok',
        message: 'No se encontraron archivos huérfanos',
        timestamp: new Date().toISOString(),
        orphanCount: 0
      });
    }
    
    // Si se solicita limpiar, eliminar los registros huérfanos
    if (req.query.clean === 'true') {
      console.log(`🧹 Eliminando ${orphanFiles.length} archivos huérfanos...`);
      
      for (const orphanFile of orphanFiles) {
        await orphanFile.destroy();
        console.log(`🗑️ Eliminado registro huérfano: ${orphanFile.name} (ID: ${orphanFile.id})`);
      }
      
      res.json({
        status: 'ok',
        message: `Limpieza completada. ${orphanFiles.length} archivos huérfanos eliminados.`,
        timestamp: new Date().toISOString(),
        orphanCount: orphanFiles.length,
        cleaned: true
      });
    } else {
      // Solo mostrar información, no limpiar
      res.json({
        status: 'ok',
        message: `${orphanFiles.length} archivos huérfanos encontrados`,
        timestamp: new Date().toISOString(),
        orphanCount: orphanFiles.length,
        orphanFiles: orphanFiles.map(f => ({
          id: f.id,
          name: f.name,
          file_name: f.file_name,
          path: f.path,
          size: f.size,
          created_at: f.created_at
        })),
        suggestion: 'Use ?clean=true para eliminar archivos huérfanos'
      });
    }
    
  } catch (error) {
    console.error('❌ Error en limpieza de archivos huérfanos:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

// Endpoint para recuperación automática manual
exports.autoRecover = async (req, res) => {
  try {
    console.log('🔧 Iniciando recuperación automática manual...');
    
    // Importar la función de recuperación
    const { recoverLostFiles } = require('../scripts/initStorage');
    
    // Ejecutar recuperación automática
    const result = await recoverLostFiles(File, 10, 3000); // 10 intentos, 3 segundos entre intentos
    
    if (result.success) {
      res.json({
        status: 'ok',
        message: 'Recuperación automática completada exitosamente',
        timestamp: new Date().toISOString(),
        result: result
      });
    } else {
      res.json({
        status: 'warning',
        message: 'Recuperación automática falló, algunos archivos pueden estar temporalmente no disponibles',
        timestamp: new Date().toISOString(),
        result: result,
        suggestion: 'Los archivos pueden aparecer automáticamente en los próximos minutos'
      });
    }
    
  } catch (error) {
    console.error('❌ Error en recuperación automática:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};
