const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// ===== RUTAS PARA USUARIOS =====

// Autenticación
router.post('/auth', userController.autenticarUsuario);

// CRUD de usuarios
router.get('/', userController.listarUsuarios);
router.get('/:id', userController.obtenerUsuario);
router.post('/', userController.crearUsuario);
router.put('/:id', userController.actualizarUsuario);
router.delete('/:id', userController.eliminarUsuario);

// Permisos
router.get('/:id/permisos', userController.obtenerPermisosUsuario);

module.exports = router;

