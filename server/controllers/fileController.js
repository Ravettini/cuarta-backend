const { File } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs').promises;
const path = require('path');

// Health check
exports.health = (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    const { folder, tags } = req.body;
    const file = req.file;

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

    res.status(201).json({
      message: 'Archivo subido exitosamente',
      file: fileRecord
    });
  } catch (error) {
    console.error('Error subiendo archivo:', error);
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
