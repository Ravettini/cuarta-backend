const express = require('express');
const { 
  estacionesController, 
  mundosController, 
  subMundosController, 
  desarrollosController 
} = require('../controllers/appController');

const router = express.Router();

// ===== RUTAS PARA ESTACIONES =====
router.get('/estaciones', estacionesController.listarEstaciones);
router.get('/estaciones/:id', estacionesController.obtenerEstacion);
router.post('/estaciones', estacionesController.crearEstacion);

// ===== RUTAS PARA MUNDOS =====
router.get('/mundos', mundosController.listarMundos);
router.get('/mundos/:id', mundosController.obtenerMundo);
router.post('/mundos', mundosController.crearMundo);

// ===== RUTAS PARA SUB-MUNDOS =====
router.get('/mundos/:mundoId/sub-mundos', subMundosController.listarSubMundos);
router.post('/sub-mundos', subMundosController.crearSubMundo);

// ===== RUTAS PARA DESARROLLOS =====
router.get('/sub-mundos/:subMundoId/desarrollos', desarrollosController.listarDesarrollos);
router.post('/desarrollos', desarrollosController.crearDesarrollo);

module.exports = router;
