const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { upload } = require('../middlewares/upload');

// Health check
router.get('/health', fileController.health);

// Endpoint de diagnóstico para verificar el estado de la base de datos
router.get('/diagnose', fileController.diagnose);

// Endpoint de prueba simple
router.get('/test', fileController.test);

// Endpoint de prueba para simular upload
router.post('/test-upload', fileController.testUpload);

// Verificar uso del disco
router.get('/disk-usage', fileController.getDiskUsage);

// Listar archivos
router.get('/', fileController.listFiles);

// Subir archivo
router.post('/', upload, fileController.uploadFile);

// Obtener archivo por ID (DEBE ir DESPUÉS de las rutas específicas)
router.get('/:id', fileController.getFile);

// Descargar archivo
router.get('/:id/download', fileController.downloadFile);

// Eliminar archivo
router.delete('/:id', fileController.deleteFile);

module.exports = router;
