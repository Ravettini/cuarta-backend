const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Obtener directorio de uploads desde variables de entorno
const uploadDir = process.env.UPLOAD_DIR || './uploads';

// Nota: No creamos el directorio aquí, se hace en initStorage.js
// para asegurar que funcione correctamente en Render

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
  'image/ggif',
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

// Configurar multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_UPLOAD_BYTES) || 157286400, // 150 MB por defecto
    files: 1 // Solo un archivo por vez
  }
});

module.exports = upload;
