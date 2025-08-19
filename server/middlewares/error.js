const multer = require('multer');

const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Errores de Multer
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'Archivo demasiado grande',
        details: `El archivo excede el límite de ${process.env.MAX_UPLOAD_BYTES || 157286400} bytes`
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Demasiados archivos',
        details: 'Solo se permite un archivo por vez'
      });
    }
    return res.status(400).json({
      error: 'Error en la subida del archivo',
      details: err.message
    });
  }

  // Errores de validación
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      details: err.errors.map(e => e.message)
    });
  }

  // Errores de base de datos
  if (err.name === 'SequelizeDatabaseError') {
    return res.status(500).json({
      error: 'Error de base de datos',
      details: 'Error interno del servidor'
    });
  }

  // Errores de archivo no encontrado
  if (err.code === 'ENOENT') {
    return res.status(404).json({
      error: 'Archivo no encontrado',
      details: 'El archivo solicitado no existe'
    });
  }

  // Error por defecto
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
