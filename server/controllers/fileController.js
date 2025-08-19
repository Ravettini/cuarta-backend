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
      return res.status(404).json({ error: 'Archivo físico no encontrado' });
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
