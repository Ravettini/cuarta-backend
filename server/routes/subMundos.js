const express = require('express');
const router = express.Router();
const subMundoController = require('../controllers/subMundoController');

// ===== RUTAS SUB-MUNDOS =====

// GET /api/v1/sub-mundos - Listar todos los sub-mundos
router.get('/', subMundoController.getSubMundosByMundo);

// GET /api/v1/sub-mundos/:id - Obtener sub-mundo por ID
router.get('/:id', subMundoController.getSubMundoById);

// POST /api/v1/sub-mundos - Crear nuevo sub-mundo
router.post('/', subMundoController.createSubMundo);

// PUT /api/v1/sub-mundos/:id - Actualizar sub-mundo
router.put('/:id', subMundoController.updateSubMundo);

// DELETE /api/v1/sub-mundos/:id - Eliminar sub-mundo
router.delete('/:id', subMundoController.deleteSubMundo);

module.exports = router;
