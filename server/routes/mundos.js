const express = require('express');
const router = express.Router();
const mundoController = require('../controllers/mundoController');

// Middleware para procesar JSON en rutas de mundos
router.use(express.json({ limit: '150mb' }));
router.use(express.urlencoded({ extended: true, limit: '150mb' }));

// ===== RUTAS MUNDOS =====

// GET /api/v1/mundos - Listar todos los mundos
router.get('/', mundoController.getMundos);

// GET /api/v1/mundos/:id - Obtener mundo por ID
router.get('/:id', mundoController.getMundoById);

// POST /api/v1/mundos - Crear nuevo mundo
router.post('/', mundoController.createMundo);

// PUT /api/v1/mundos/:id - Actualizar mundo
router.put('/:id', mundoController.updateMundo);

// DELETE /api/v1/mundos/:id - Eliminar mundo
router.delete('/:id', mundoController.deleteMundo);

module.exports = router;
