const express = require('express');
const { estacionesController, mundosController, subMundosController, desarrollosController } = require('../controllers/appController');
const userRoutes = require('./users');

const router = express.Router();

// ===== RUTAS PARA USUARIOS =====
router.use('/users', userRoutes);

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

// Endpoint temporal para inicializar datos por defecto
router.post('/init', desarrollosController.inicializarDatosPorDefecto);

module.exports = router;
