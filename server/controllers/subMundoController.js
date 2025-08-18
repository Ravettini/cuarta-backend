const { SubMundo, Mundo, Desarrollo } = require('../models');

// ===== CRUD SUB-MUNDOS =====

// Crear sub-mundo
async function createSubMundo(req, res) {
  try {
    const { nombre, descripcion, mundoId } = req.body;
    
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del sub-mundo es requerido'
      });
    }

    if (!mundoId) {
      return res.status(400).json({
        success: false,
        message: 'El ID del mundo es requerido'
      });
    }

    // Verificar que el mundo existe
    const mundo = await Mundo.findByPk(mundoId);
    if (!mundo) {
      return res.status(404).json({
        success: false,
        message: 'Mundo no encontrado'
      });
    }

    const subMundo = await SubMundo.create({
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || '',
      mundoId: mundoId,
      activo: true,
      orden: 1
    });

    res.status(201).json({
      success: true,
      data: subMundo,
      message: 'Sub-mundo creado exitosamente'
    });
  } catch (error) {
    console.error('Error creando sub-mundo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Obtener todos los sub-mundos
async function getAllSubMundos(req, res) {
  try {
    const subMundos = await SubMundo.findAll({
      where: { activo: true },
      order: [['orden', 'ASC']],
      include: [{
        model: Desarrollo,
        as: 'desarrollos',
        where: { activo: true },
        required: false,
        order: [['orden', 'ASC']]
      }]
    });

    res.json({
      success: true,
      data: subMundos,
      total: subMundos.length,
      message: 'Todos los sub-mundos listados exitosamente'
    });
  } catch (error) {
    console.error('Error obteniendo todos los sub-mundos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Obtener sub-mundos de un mundo
async function getSubMundosByMundo(req, res) {
  try {
    const { mundoId } = req.params;
    
    // Verificar que el mundo existe
    const mundo = await Mundo.findByPk(mundoId);
    if (!mundo) {
      return res.status(404).json({
        success: false,
        message: 'Mundo no encontrado'
      });
    }

    const subMundos = await SubMundo.findAll({
      where: { 
        mundoId: mundoId,
        activo: true 
      },
      order: [['orden', 'ASC']],
      include: [{
        model: Desarrollo,
        as: 'desarrollos',
        where: { activo: true },
        required: false,
        order: [['orden', 'ASC']]
      }]
    });

    res.json({
      success: true,
      data: subMundos,
      total: subMundos.length,
      message: 'Sub-mundos listados exitosamente'
    });
  } catch (error) {
    console.error('Error obteniendo sub-mundos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Obtener sub-mundo por ID
async function getSubMundoById(req, res) {
  try {
    const { id } = req.params;
    
    const subMundo = await SubMundo.findByPk(id, {
      include: [{
        model: Desarrollo,
        as: 'desarrollos',
        where: { activo: true },
        required: false,
        order: [['orden', 'ASC']]
      }]
    });

    if (!subMundo) {
      return res.status(404).json({
        success: false,
        message: 'Sub-mundo no encontrado'
      });
    }

    res.json({
      success: true,
      data: subMundo,
      message: 'Sub-mundo encontrado'
    });
  } catch (error) {
    console.error('Error obteniendo sub-mundo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Actualizar sub-mundo
async function updateSubMundo(req, res) {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del sub-mundo es requerido'
      });
    }

    const subMundo = await SubMundo.findByPk(id);
    if (!subMundo) {
      return res.status(404).json({
        success: false,
        message: 'Sub-mundo no encontrado'
      });
    }

    await subMundo.update({
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || subMundo.descripcion
    });

    res.json({
      success: true,
      data: subMundo,
      message: 'Sub-mundo actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando sub-mundo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Eliminar sub-mundo (ELIMINACIÓN PERMANENTE)
async function deleteSubMundo(req, res) {
  try {
    const { id } = req.params;
    
    const subMundo = await SubMundo.findByPk(id);
    if (!subMundo) {
      return res.status(404).json({
        success: false,
        message: 'Sub-mundo no encontrado'
      });
    }

    // ELIMINACIÓN PERMANENTE: borrar de la base de datos
    await subMundo.destroy();

    res.json({
      success: true,
      message: 'Sub-mundo eliminado permanentemente'
    });
  } catch (error) {
    console.error('Error eliminando sub-mundo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

module.exports = {
  createSubMundo,
  getAllSubMundos,
  getSubMundosByMundo,
  getSubMundoById,
  updateSubMundo,
  deleteSubMundo
};
