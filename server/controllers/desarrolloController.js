const { Desarrollo, SubMundo } = require('../models');

// ===== CRUD DESARROLLOS =====

// Crear desarrollo
async function createDesarrollo(req, res) {
  try {
    const { titulo, url, descripcion, tags, subMundoId } = req.body;
    
    if (!titulo || !titulo.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El título del desarrollo es requerido'
      });
    }

    if (!subMundoId) {
      return res.status(400).json({
        success: false,
        message: 'El ID del sub-mundo es requerido'
      });
    }

    // Verificar que el sub-mundo existe
    const subMundo = await SubMundo.findByPk(subMundoId);
    if (!subMundo) {
      return res.status(404).json({
        success: false,
        message: 'Sub-mundo no encontrado'
      });
    }

    const desarrollo = await Desarrollo.create({
      titulo: titulo.trim(),
      url: url?.trim() || '',
      descripcion: descripcion?.trim() || '',
      tags: tags || [],
      subMundoId: subMundoId,
      activo: true,
      orden: 1
    });

    res.status(201).json({
      success: true,
      data: desarrollo,
      message: 'Desarrollo creado exitosamente'
    });
  } catch (error) {
    console.error('Error creando desarrollo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Obtener desarrollos de un sub-mundo
async function getDesarrollosBySubMundo(req, res) {
  try {
    const { subMundoId } = req.params;
    
    // Verificar que el sub-mundo existe
    const subMundo = await SubMundo.findByPk(subMundoId);
    if (!subMundo) {
      return res.status(404).json({
        success: false,
        message: 'Sub-mundo no encontrado'
      });
    }

    const desarrollos = await Desarrollo.findAll({
      where: { 
        subMundoId: subMundoId,
        activo: true 
      },
      order: [['orden', 'ASC']]
    });

    res.json({
      success: true,
      data: desarrollos,
      total: desarrollos.length,
      message: 'Desarrollos listados exitosamente'
    });
  } catch (error) {
    console.error('Error obteniendo desarrollos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Obtener desarrollo por ID
async function getDesarrolloById(req, res) {
  try {
    const { id } = req.params;
    
    const desarrollo = await Desarrollo.findByPk(id);

    if (!desarrollo) {
      return res.status(404).json({
        success: false,
        message: 'Desarrollo no encontrado'
      });
    }

    res.json({
      success: true,
      data: desarrollo,
      message: 'Desarrollo encontrado'
    });
  } catch (error) {
    console.error('Error obteniendo desarrollo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Actualizar desarrollo
async function updateDesarrollo(req, res) {
  try {
    const { id } = req.params;
    const { titulo, url, descripcion, tags } = req.body;
    
    if (!titulo || !titulo.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El título del desarrollo es requerido'
      });
    }

    const desarrollo = await Desarrollo.findByPk(id);
    if (!desarrollo) {
      return res.status(404).json({
        success: false,
        message: 'Desarrollo no encontrado'
      });
    }

    await desarrollo.update({
      titulo: titulo.trim(),
      url: url?.trim() || desarrollo.url,
      descripcion: descripcion?.trim() || desarrollo.descripcion,
      tags: tags || desarrollo.tags
    });

    res.json({
      success: true,
      data: desarrollo,
      message: 'Desarrollo actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando desarrollo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Eliminar desarrollo (soft delete)
async function deleteDesarrollo(req, res) {
  try {
    const { id } = req.params;
    
    const desarrollo = await Desarrollo.findByPk(id);
    if (!desarrollo) {
      return res.status(404).json({
        success: false,
        message: 'Desarrollo no encontrado'
      });
    }

    // Soft delete: marcar como inactivo
    await desarrollo.update({ activo: false });

    res.json({
      success: true,
      message: 'Desarrollo eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando desarrollo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

module.exports = {
  createDesarrollo,
  getDesarrollosBySubMundo,
  getDesarrolloById,
  updateDesarrollo,
  deleteDesarrollo
};
