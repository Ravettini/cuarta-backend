const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { upload } = require('../middlewares/upload');

// Rutas específicas primero (antes de las dinámicas)
router.get('/health', fileController.health);
router.get('/diagnose', fileController.diagnose);
router.get('/test', fileController.test);
router.get('/debug', fileController.debug);
router.post('/test-upload', fileController.testUpload);
router.get('/disk-usage', fileController.getDiskUsage);
router.get('/recover', fileController.recoverFiles);
router.get('/cleanup', fileController.cleanupOrphanFiles);
router.post('/auto-recover', fileController.autoRecover);

// Rutas principales
router.get('/', fileController.listFiles);
router.post('/', upload, fileController.uploadFile);

// Rutas dinámicas al final
router.get('/:id/download', fileController.downloadFile);
router.delete('/:id', fileController.deleteFile);
router.get('/:id', fileController.getFile);

module.exports = router;
