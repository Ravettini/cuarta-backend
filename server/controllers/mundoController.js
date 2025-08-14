const { Mundo, SubMundo } = require('../models');

// ===== CRUD MUNDOS =====

// Crear mundo
async function createMundo(req, res) {
  try {
    const { nombre, descripcion } = req.body;
    
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del mundo es requerido'
      });
    }

    const mundo = await Mundo.create({
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || '',
      activo: true,
      orden: 1
    });

    res.status(201).json({
      success: true,
      data: mundo,
      message: 'Mundo creado exitosamente'
    });
  } catch (error) {
    console.error('Error creando mundo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Obtener todos los mundos
async function getMundos(req, res) {
  try {
    const mundos = await Mundo.findAll({
      where: { activo: true },
      order: [['orden', 'ASC']],
      include: [{
        model: SubMundo,
        as: 'subMundos',
        where: { activo: true },
        required: false,
        order: [['orden', 'ASC']]
      }]
    });

    res.json({
      success: true,
      data: mundos,
      total: mundos.length,
      message: 'Mundos listados exitosamente'
    });
  } catch (error) {
    console.error('Error obteniendo mundos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Obtener mundo por ID
async function getMundoById(req, res) {
  try {
    const { id } = req.params;
    
    const mundo = await Mundo.findByPk(id, {
      include: [{
        model: SubMundo,
        as: 'subMundos',
        where: { activo: true },
        required: false,
        order: [['orden', 'ASC']]
      }]
    });

    if (!mundo) {
      return res.status(404).json({
        success: false,
        message: 'Mundo no encontrado'
      });
    }

    res.json({
      success: true,
      data: mundo,
      message: 'Mundo encontrado'
    });
  } catch (error) {
    console.error('Error obteniendo mundo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Actualizar mundo
async function updateMundo(req, res) {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del mundo es requerido'
      });
    }

    const mundo = await Mundo.findByPk(id);
    if (!mundo) {
      return res.status(404).json({
        success: false,
        message: 'Mundo no encontrado'
      });
    }

    await mundo.update({
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || mundo.descripcion
    });

    res.json({
      success: true,
      data: mundo,
      message: 'Mundo actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando mundo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Eliminar mundo (ELIMINACIÓN PERMANENTE)
async function deleteMundo(req, res) {
  try {
    const { id } = req.params;
    
    const mundo = await Mundo.findByPk(id);
    if (!mundo) {
      return res.status(404).json({
        success: false,
        message: 'Mundo no encontrado'
      });
    }

    // ELIMINACIÓN PERMANENTE: borrar de la base de datos
    await mundo.destroy();

    res.json({
      success: true,
      message: 'Mundo eliminado permanentemente'
    });
  } catch (error) {
    console.error('Error eliminando mundo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

module.exports = {
  createMundo,
  getMundos,
  getMundoById,
  updateMundo,
  deleteMundo
};
