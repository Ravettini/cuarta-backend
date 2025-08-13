const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const upload = require('../middlewares/upload');

// Health check
router.get('/health', fileController.health);

// Listar archivos
router.get('/', fileController.listFiles);

// Obtener archivo por ID
router.get('/:id', fileController.getFile);

// Subir archivo
router.post('/', upload.single('file'), fileController.uploadFile);

// Descargar archivo
router.get('/:id/download', fileController.downloadFile);

// Eliminar archivo
router.delete('/:id', fileController.deleteFile);

module.exports = router;
