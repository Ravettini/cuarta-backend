const { User, Mundo } = require('../models');

// ===== CONTROLADOR DE USUARIOS =====

// Listar todos los usuarios
const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await User.findAll({
      where: { activo: true },
      attributes: { exclude: ['password'] }, // No enviar contraseñas
      order: [['username', 'ASC']]
    });

    res.json({
      success: true,
      data: usuarios,
      message: 'Usuarios listados exitosamente'
    });
  } catch (error) {
    console.error('Error listando usuarios:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Obtener un usuario por ID
const obtenerUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: usuario,
      message: 'Usuario obtenido exitosamente'
    });
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Crear nuevo usuario
const crearUsuario = async (req, res) => {
  try {
    console.log('🚀 Creando usuario con datos:', req.body);
    const { username, password, role, permittedWorldIds } = req.body;

    // Validaciones
    if (!username || !password) {
      console.log('❌ Validación fallida: username o password faltantes');
      return res.status(400).json({
        success: false,
        error: 'Username y password son requeridos'
      });
    }

    if (password.length < 4) {
      return res.status(400).json({
        success: false,
        error: 'La contraseña debe tener al menos 4 caracteres'
      });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await User.findOne({ where: { username } });
    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        error: 'El username ya está en uso'
      });
    }

    // Crear usuario
    const nuevoUsuario = await User.create({
      username,
      password, // En producción, aquí se debería hashear
      role: role || 'user',
      permittedWorldIds: permittedWorldIds ? JSON.stringify(permittedWorldIds) : '[]'
    });

    // Retornar usuario sin contraseña
    const { password: _, ...usuarioSinPassword } = nuevoUsuario.toJSON();
    
    console.log('✅ Usuario creado exitosamente:', usuarioSinPassword);

    res.status(201).json({
      success: true,
      data: usuarioSinPassword,
      message: 'Usuario creado exitosamente'
    });
  } catch (error) {
    console.error('❌ Error creando usuario:', error);
    console.error('❌ Detalles del error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Actualizar usuario
const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, role, permittedWorldIds } = req.body;

    const usuario = await User.findByPk(id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Actualizar campos
    if (username && username !== usuario.username) {
      // Verificar si el nuevo username ya existe
      const usuarioExistente = await User.findOne({ where: { username } });
      if (usuarioExistente) {
        return res.status(400).json({
          success: false,
          error: 'El username ya está en uso'
        });
      }
      usuario.username = username;
    }

    if (password && password.length >= 4) {
      usuario.password = password; // En producción, aquí se debería hashear
    }

    if (role) {
      usuario.role = role;
    }

    if (permittedWorldIds !== undefined) {
      usuario.permittedWorldIds = permittedWorldIds;
    }

    await usuario.save();

    // Retornar usuario sin contraseña
    const { password: _, ...usuarioSinPassword } = usuario.toJSON();

    res.json({
      success: true,
      data: usuarioSinPassword,
      message: 'Usuario actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Eliminar usuario (soft delete)
const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await User.findByPk(id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    if (usuario.username === 'admin') {
      return res.status(400).json({
        success: false,
        error: 'No se puede eliminar el usuario admin'
      });
    }

    // Soft delete
    usuario.activo = false;
    await usuario.save();

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Autenticar usuario
const autenticarUsuario = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username y password son requeridos'
      });
    }

    const usuario = await User.findOne({
      where: { username, activo: true }
    });

    if (!usuario || usuario.password !== password) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Retornar usuario sin contraseña
    const { password: _, ...usuarioSinPassword } = usuario.toJSON();

    res.json({
      success: true,
      data: usuarioSinPassword,
      message: 'Autenticación exitosa'
    });
  } catch (error) {
    console.error('Error autenticando usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Obtener permisos de usuario
const obtenerPermisosUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await User.findByPk(id, {
      attributes: ['id', 'username', 'role', 'permittedWorldIds']
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Si es admin, puede ver todos los mundos
    if (usuario.role === 'admin') {
      const mundos = await Mundo.findAll({
        where: { activo: true },
        attributes: ['id', 'nombre'],
        order: [['orden', 'ASC']]
      });

      return res.json({
        success: true,
        data: {
          usuario: {
            id: usuario.id,
            username: usuario.username,
            role: usuario.role,
            permittedWorldIds: '*'
          },
          mundos: mundos
        }
      });
    }

    // Para usuarios normales, obtener solo los mundos permitidos
    const mundosPermitidos = await Mundo.findAll({
      where: {
        id: usuario.permittedWorldIds,
        activo: true
      },
      attributes: ['id', 'nombre'],
      order: [['orden', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        usuario: {
          id: usuario.id,
          username: usuario.username,
          role: usuario.role,
          permittedWorldIds: usuario.permittedWorldIds
        },
        mundos: mundosPermitidos
      }
    });
  } catch (error) {
    console.error('Error obteniendo permisos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Endpoint temporal para inicializar usuarios por defecto
const inicializarUsuariosPorDefecto = async (req, res) => {
  try {
    console.log('🚀 Iniciando inicialización de usuarios por defecto...');

    // Verificar si ya existen usuarios
    const existingUsers = await User.findAll();
    if (existingUsers.length > 0) {
      return res.json({
        success: true,
        message: 'Ya existen usuarios en la base de datos',
        count: existingUsers.length
      });
    }

    // Crear usuarios por defecto
    const usuariosPorDefecto = [
      {
        username: "admin",
        password: "1234",
        role: "admin",
        permittedWorldIds: "*"
      },
      {
        username: "estaciones",
        password: "est2025",
        role: "user",
        permittedWorldIds: []
      },
      {
        username: "sanfer",
        password: "sf2025",
        role: "user",
        permittedWorldIds: []
      },
      {
        username: "ambos",
        password: "fullaccess",
        role: "user",
        permittedWorldIds: []
      }
    ];

    // Crear usuarios
    for (const userData of usuariosPorDefecto) {
      await User.create(userData);
      console.log(`✅ Usuario creado: ${userData.username}`);
    }

    console.log('🎉 Inicialización de usuarios completada exitosamente');

    res.json({
      success: true,
      message: 'Usuarios por defecto creados exitosamente',
      usuariosCreados: usuariosPorDefecto.length,
      usuarios: usuariosPorDefecto.map(u => ({ username: u.username, role: u.role }))
    });

  } catch (error) {
    console.error('❌ Error durante la inicialización de usuarios:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor durante la inicialización'
    });
  }
};

module.exports = {
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  autenticarUsuario,
  obtenerPermisosUsuario,
  inicializarUsuariosPorDefecto
};

