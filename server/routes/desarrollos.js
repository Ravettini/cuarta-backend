const express = require('express');
const router = express.Router();
const desarrolloController = require('../controllers/desarrolloController');

// ===== RUTAS DESARROLLOS =====

// GET /api/v1/desarrollos - Listar todos los desarrollos
router.get('/', desarrolloController.getAllDesarrollos);

// GET /api/v1/desarrollos/sub-mundo/:subMundoId - Obtener desarrollos de un sub-mundo específico
router.get('/sub-mundo/:subMundoId', desarrolloController.getDesarrollosBySubMundo);

// GET /api/v1/desarrollos/:id - Obtener desarrollo por ID
router.get('/:id', desarrolloController.getDesarrolloById);

// POST /api/v1/desarrollos - Crear nuevo desarrollo
router.post('/', desarrolloController.createDesarrollo);

// PUT /api/v1/desarrollos/:id - Actualizar desarrollo
router.put('/:id', desarrolloController.updateDesarrollo);

// DELETE /api/v1/desarrollos/:id - Eliminar desarrollo
router.delete('/:id', desarrolloController.deleteDesarrollo);

module.exports = router;
