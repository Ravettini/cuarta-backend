const { Desarrollo, SubMundo } = require('../models');

// ===== CRUD DESARROLLOS =====

// Crear desarrollo
async function createDesarrollo(req, res) {
  try {
    console.log('🚀 createDesarrollo - Request body:', req.body);
    const { titulo, url, descripcion, tags, subMundoId } = req.body;
    
    console.log('🔍 Datos recibidos:', { titulo, url, descripcion, tags, subMundoId });
    
    if (!titulo || !titulo.trim()) {
      console.log('❌ Validación fallida: título faltante');
      return res.status(400).json({
        success: false,
        message: 'El título del desarrollo es requerido'
      });
    }

    if (!subMundoId) {
      console.log('❌ Validación fallida: subMundoId faltante');
      return res.status(400).json({
        success: false,
        message: 'El ID del sub-mundo es requerido'
      });
    }

    // Verificar que el sub-mundo existe
    console.log('🔍 Verificando existencia del sub-mundo:', subMundoId);
    const subMundo = await SubMundo.findByPk(subMundoId);
    console.log('🔍 Sub-mundo encontrado:', subMundo);
    
    if (!subMundo) {
      console.log('❌ Sub-mundo no encontrado');
      return res.status(404).json({
        success: false,
        message: 'Sub-mundo no encontrado'
      });
    }

    // Convertir tags de array a string separado por comas
    const tagsString = Array.isArray(tags) ? tags.join(', ') : (tags || '');
    console.log('🔍 Tags convertidos:', tagsString);
    
    console.log('🔍 Creando desarrollo con datos:', {
      titulo: titulo.trim(),
      url: url?.trim() || '',
      descripcion: descripcion?.trim() || '',
      tags: tagsString,
      subMundoId: subMundoId,
      activo: true,
      orden: 1
    });
    
    const desarrollo = await Desarrollo.create({
      titulo: titulo.trim(),
      url: url?.trim() || '',
      descripcion: descripcion?.trim() || '',
      tags: tagsString,
      subMundoId: subMundoId,
      activo: true,
      orden: 1
    });
    
    console.log('✅ Desarrollo creado exitosamente:', desarrollo.toJSON());

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

// Obtener todos los desarrollos
async function getAllDesarrollos(req, res) {
  try {
    const desarrollos = await Desarrollo.findAll({
      where: { activo: true },
      order: [['orden', 'ASC']]
    });

    res.json({
      success: true,
      data: desarrollos,
      total: desarrollos.length,
      message: 'Todos los desarrollos listados exitosamente'
    });
  } catch (error) {
    console.error('Error obteniendo todos los desarrollos:', error);
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

// Eliminar desarrollo (ELIMINACIÓN PERMANENTE)
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

    // ELIMINACIÓN PERMANENTE: borrar de la base de datos
    await desarrollo.destroy();

    res.json({
      success: true,
      message: 'Desarrollo eliminado permanentemente'
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
  getAllDesarrollos,
  getDesarrollosBySubMundo,
  getDesarrolloById,
  updateDesarrollo,
  deleteDesarrollo
};
