const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Obtener directorio de uploads desde variables de entorno
const uploadDir = process.env.UPLOAD_DIR || './uploads';

// Nota: No creamos el directorio aquí, se hace en initStorage.js
// para asegurar que funcione correctamente en Render

// Límites inteligentes por tipo de archivo (en bytes)
const FILE_SIZE_LIMITS = {
  // Documentos pequeños
  'application/pdf': 10 * 1024 * 1024,        // 10MB
  'text/csv': 5 * 1024 * 1024,                // 5MB
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 20 * 1024 * 1024, // 20MB
  
  // Archivos comprimidos
  'application/zip': 50 * 1024 * 1024,        // 50MB
  'application/x-rar-compressed': 50 * 1024 * 1024, // 50MB
  'application/x-7z-compressed': 50 * 1024 * 1024,  // 50MB
  
  // Imágenes
  'image/jpeg': 5 * 1024 * 1024,              // 5MB
  'image/png': 5 * 1024 * 1024,               // 5MB
  'image/gif': 10 * 1024 * 1024,              // 10MB
  'image/webp': 5 * 1024 * 1024,              // 5MB
  'image/svg+xml': 1 * 1024 * 1024,           // 1MB
  
  // Límite por defecto para otros tipos
  'default': 25 * 1024 * 1024                 // 25MB
};

// Función para obtener límite de tamaño según tipo MIME
function getFileSizeLimit(mimetype) {
  return FILE_SIZE_LIMITS[mimetype] || FILE_SIZE_LIMITS.default;
}

// Configurar almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Crear subcarpeta por año-mes
    const date = new Date();
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const uploadPath = path.join(uploadDir, yearMonth);
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generar nombre único: uuid + extensión original
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    cb(null, fileName);
  }
});

// Validar tipos MIME permitidos
const allowedMimeTypes = process.env.ALLOWED_MIME_TYPES?.split(',') || [
  'application/pdf',
  'application/zip',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
];

const fileFilter = (req, file, cb) => {
  // Verificar si el tipo MIME está permitido
  const isAllowed = allowedMimeTypes.some(allowedType => {
    if (allowedType.endsWith('/*')) {
      // Para tipos como "image/*"
      const baseType = allowedType.split('/')[0];
      return file.mimetype.startsWith(baseType + '/');
    }
    return file.mimetype === allowedType;
  });

  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`), false);
  }
};

// Middleware personalizado para validar tamaño según tipo
const validateFileSize = (req, file, cb) => {
  console.log('🔍 validateFileSize - Iniciando validación de tamaño');
  console.log('🔍 validateFileSize - Archivo a validar:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });
  
  const maxSize = getFileSizeLimit(file.mimetype);
  const maxSizeMB = Math.round(maxSize / (1024 * 1024));
  
  console.log('🔍 validateFileSize - Límite máximo:', maxSize, 'bytes (', maxSizeMB, 'MB)');
  console.log('🔍 validateFileSize - Tamaño del archivo:', file.size, 'bytes');
  
  if (file.size > maxSize) {
    console.log('❌ validateFileSize - Archivo demasiado grande');
    return cb(new Error(`Archivo demasiado grande. Máximo ${maxSizeMB}MB para ${file.mimetype}`), false);
  }
  
  console.log('✅ validateFileSize - Archivo cumple con el límite de tamaño');
  cb(null, true);
};

// Configurar multer con límites inteligentes
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_UPLOAD_BYTES) || 157286400, // 150 MB como límite absoluto
    files: 1 // Solo un archivo por vez
  }
}).single('file');

// Middleware wrapper que incluye validación de tamaño inteligente
const uploadWithSmartValidation = (req, res, next) => {
  console.log('🔍 uploadWithSmartValidation - Iniciando middleware de upload');
  console.log('🔍 uploadWithSmartValidation - req.body antes de multer:', req.body);
  console.log('🔍 uploadWithSmartValidation - req.headers:', req.headers);
  
  upload(req, res, (err) => {
    console.log('🔍 uploadWithSmartValidation - Callback de multer ejecutado');
    console.log('🔍 uploadWithSmartValidation - Error de multer:', err);
    console.log('🔍 uploadWithSmartValidation - req.file después de multer:', req.file);
    console.log('🔍 uploadWithSmartValidation - req.body después de multer:', req.body);
    
    if (err) {
      console.log('❌ uploadWithSmartValidation - Error en multer:', err);
      console.log('❌ uploadWithSmartValidation - Error code:', err.code);
      console.log('❌ uploadWithSmartValidation - Error message:', err.message);
      
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          error: 'Archivo demasiado grande',
          details: 'El archivo excede el límite de tamaño permitido'
        });
      }
      if (err.message.includes('Archivo demasiado grande')) {
        return res.status(400).json({ 
          error: 'Archivo demasiado grande',
          details: err.message
        });
      }
      return res.status(400).json({ 
        error: 'Error en la subida del archivo',
        details: err.message 
      });
    }
    
    // Validar tamaño según tipo MIME
    if (req.file) {
      console.log('🔍 uploadWithSmartValidation - Validando tamaño del archivo...');
      console.log('🔍 uploadWithSmartValidation - Archivo recibido:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      });
      
      validateFileSize(req, req.file, (err) => {
        if (err) {
          console.log('❌ uploadWithSmartValidation - Error en validación de tamaño:', err);
          // Eliminar archivo si ya se subió pero no pasa validación
          if (req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
          return res.status(400).json({ 
            error: 'Archivo demasiado grande',
            details: err.message 
          });
        }
        console.log('✅ uploadWithSmartValidation - Archivo validado correctamente');
        next();
      });
    } else {
      console.log('🔍 uploadWithSmartValidation - No hay archivo para validar');
      next();
    }
  });
};

module.exports = { upload: uploadWithSmartValidation, getFileSizeLimit };
