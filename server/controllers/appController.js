const { Estacion, Mundo, SubMundo, Desarrollo } = require('../models');

// Controlador para estaciones
const estacionesController = {
  // Listar todas las estaciones
  async listarEstaciones(req, res) {
    try {
      const { barrio, comuna, activa } = req.query;
      
      const where = {};
      if (barrio) where.barrio = barrio;
      if (comuna) where.comuna = parseInt(comuna);
      if (activa !== undefined) where.activa = activa === 'true';
      
      const estaciones = await Estacion.findAll({
        where,
        order: [['nombre', 'ASC']]
      });
      
      res.json({
        success: true,
        data: estaciones,
        total: estaciones.length
      });
    } catch (error) {
      console.error('Error listando estaciones:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  // Obtener estación por ID
  async obtenerEstacion(req, res) {
    try {
      const { id } = req.params;
      const estacion = await Estacion.findByPk(id);
      
      if (!estacion) {
        return res.status(404).json({
          success: false,
          error: 'Estación no encontrada'
        });
      }
      
      res.json({
        success: true,
        data: estacion
      });
    } catch (error) {
      console.error('Error obteniendo estación:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  // Crear nueva estación
  async crearEstacion(req, res) {
    try {
      const { nombre, direccion, barrio, comuna, coordenadas, tags } = req.body;
      
      if (!nombre) {
        return res.status(400).json({
          success: false,
          error: 'El nombre es obligatorio'
        });
      }
      
      const estacion = await Estacion.create({
        nombre,
        direccion,
        barrio,
        comuna,
        coordenadas,
        tags: (tags || []).join(', ')
      });
      
      res.status(201).json({
        success: true,
        data: estacion
      });
    } catch (error) {
      console.error('Error creando estación:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
};

// Controlador para mundos
const mundosController = {
  // Listar todos los mundos con sus sub-mundos y desarrollos
  async listarMundos(req, res) {
    try {
      const mundos = await Mundo.findAll({
        where: { activo: true },
        include: [
          {
            model: SubMundo,
            as: 'subMundos',
            where: { activo: true },
            required: false,
            include: [
              {
                model: Desarrollo,
                as: 'desarrollos',
                where: { activo: true },
                required: false,
                order: [['orden', 'ASC']]
              }
            ],
            order: [['orden', 'ASC']]
          }
        ],
        order: [['orden', 'ASC'], ['nombre', 'ASC']]
      });
      
      res.json({
        success: true,
        data: mundos,
        total: mundos.length
      });
    } catch (error) {
      console.error('Error listando mundos:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  // Obtener mundo por ID con toda su estructura
  async obtenerMundo(req, res) {
    try {
      const { id } = req.params;
      const mundo = await Mundo.findByPk(id, {
        include: [
          {
            model: SubMundo,
            as: 'subMundos',
            where: { activo: true },
            required: false,
            include: [
              {
                model: Desarrollo,
                as: 'desarrollos',
                where: { activo: true },
                required: false,
                order: [['orden', 'ASC']]
              }
            ],
            order: [['orden', 'ASC']]
          }
        ]
      });
      
      if (!mundo) {
        return res.status(404).json({
          success: false,
          error: 'Mundo no encontrado'
        });
      }
      
      res.json({
        success: true,
        data: mundo
      });
    } catch (error) {
      console.error('Error obteniendo mundo:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  // Crear nuevo mundo
  async crearMundo(req, res) {
    try {
      const { nombre, descripcion, orden } = req.body;
      
      if (!nombre) {
        return res.status(400).json({
          success: false,
          error: 'El nombre es obligatorio'
        });
      }
      
      const mundo = await Mundo.create({
        nombre,
        descripcion,
        orden: orden || 0
      });
      
      res.status(201).json({
        success: true,
        data: mundo
      });
    } catch (error) {
      console.error('Error creando mundo:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
};

// Controlador para sub-mundos
const subMundosController = {
  // Listar sub-mundos de un mundo
  async listarSubMundos(req, res) {
    try {
      const { mundoId } = req.params;
      const subMundos = await SubMundo.findAll({
        where: { 
          mundoId,
          activo: true 
        },
        include: [
          {
            model: Desarrollo,
            as: 'desarrollos',
            where: { activo: true },
            required: false,
            order: [['orden', 'ASC']]
          }
        ],
        order: [['orden', 'ASC'], ['nombre', 'ASC']]
      });
      
      res.json({
        success: true,
        data: subMundos,
        total: subMundos.length
      });
    } catch (error) {
      console.error('Error listando sub-mundos:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  // Crear nuevo sub-mundo
  async crearSubMundo(req, res) {
    try {
      const { nombre, descripcion, orden, mundoId } = req.body;
      
      if (!nombre || !mundoId) {
        return res.status(400).json({
          success: false,
          error: 'El nombre y mundoId son obligatorios'
        });
      }
      
      const subMundo = await SubMundo.create({
        nombre,
        descripcion,
        orden: orden || 0,
        mundoId
      });
      
      res.status(201).json({
        success: true,
        data: subMundo
      });
    } catch (error) {
      console.error('Error creando sub-mundo:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
};

// Controlador para desarrollos
const desarrollosController = {
  // Listar desarrollos de un sub-mundo
  async listarDesarrollos(req, res) {
    try {
      const { subMundoId } = req.params;
      const desarrollos = await Desarrollo.findAll({
        where: { 
          subMundoId,
          activo: true 
        },
        order: [['orden', 'ASC'], ['titulo', 'ASC']]
      });
      
      res.json({
        success: true,
        data: desarrollos,
        total: desarrollos.length
      });
    } catch (error) {
      console.error('Error listando desarrollos:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  // Crear nuevo desarrollo
  async crearDesarrollo(req, res) {
    try {
      const { titulo, descripcion, url, tipo, tags, orden, subMundoId } = req.body;
      
      if (!titulo || !subMundoId) {
        return res.status(400).json({
          success: false,
          error: 'El título y subMundoId son obligatorios'
        });
      }
      
      const desarrollo = await Desarrollo.create({
        titulo,
        descripcion,
        url,
        tipo: tipo || 'mapa',
        tags: (tags || []).join(', '),
        orden: orden || 0,
        subMundoId
      });
      
      res.status(201).json({
        success: true,
        data: desarrollo
      });
    } catch (error) {
      console.error('Error creando desarrollo:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
};

// Endpoint temporal para inicializar datos por defecto
const inicializarDatosPorDefecto = async (req, res) => {
  try {
    console.log('🚀 Iniciando inicialización de datos por defecto...');

    // Verificar si ya existen mundos
    const existingMundos = await Mundo.findAll();
    if (existingMundos.length > 0) {
      return res.json({
        success: true,
        message: 'Ya existen datos en la base de datos',
        mundos: existingMundos.length
      });
    }

    // Crear mundos por defecto
    const mundoEstaciones = await Mundo.create({
      nombre: "Estaciones Saludables",
      descripcion: "Mundo de estaciones saludables",
      activo: true,
      orden: 1
    });

    const mundoSanfer = await Mundo.create({
      nombre: "San Fernando",
      descripcion: "Mundo de San Fernando",
      activo: true,
      orden: 2
    });

    console.log('✅ Mundos creados:', mundoEstaciones.nombre, mundoSanfer.nombre);

    // Crear sub-mundos para Estaciones Saludables
    const subMundoMapas = await SubMundo.create({
      nombre: "Mapas",
      descripcion: "Mapas de estaciones",
      activo: true,
      orden: 1,
      mundoId: mundoEstaciones.id
    });

    const subMundoBI = await SubMundo.create({
      nombre: "BI",
      descripcion: "Business Intelligence",
      activo: true,
      orden: 2,
      mundoId: mundoEstaciones.id
    });

    const subMundoReportes = await SubMundo.create({
      nombre: "Reportes",
      descripcion: "Reportes y análisis",
      activo: true,
      orden: 3,
      mundoId: mundoEstaciones.id
    });

    // Crear sub-mundos para San Fernando
    const subMundoMapasSanfer = await SubMundo.create({
      nombre: "Mapas",
      descripcion: "Mapas de San Fernando",
      activo: true,
      orden: 1,
      mundoId: mundoSanfer.id
    });

    const subMundoDocsSanfer = await SubMundo.create({
      nombre: "Documentos",
      descripcion: "Documentos de San Fernando",
      activo: true,
      orden: 2,
      mundoId: mundoSanfer.id
    });

    console.log('✅ Sub-mundos creados');

    // Crear algunos desarrollos de ejemplo
    await Desarrollo.create({
      titulo: "Mapa de Rangos de Visitas",
      descripcion: "Visualización por rangos",
      url: "Mapas Estaciones/mapa_rangos.html",
      tipo: "web",
      tags: JSON.stringify(["mapa", "CABA"]),
      activo: true,
      orden: 1,
      subMundoId: subMundoMapas.id
    });

    await Desarrollo.create({
      titulo: "Dashboard Power BI",
      descripcion: "Dashboard interactivo",
      url: "https://app.powerbi.com/view?r=eyJrIjoiOGRmY2FlYTYtNjllNS00OWE5LWJjMzEtODhiNjBkMmMyOTgwIiwidCI6IjIzNzc0NzJlLTgwMDQtNDY0OC04NDU2LWJkOTY4N2FmYTE1MCIsImMiOjR9&pageName=ReportSectiona3847c630a8d7da06b55",
      tipo: "web",
      tags: JSON.stringify(["bi", "dashboard"]),
      activo: true,
      orden: 1,
      subMundoId: subMundoBI.id
    });

    console.log('✅ Desarrollos de ejemplo creados');

    res.json({
      success: true,
      message: 'Datos por defecto creados exitosamente',
      mundos: 2,
      subMundos: 5,
      desarrollos: 2
    });

  } catch (error) {
    console.error('❌ Error durante la inicialización de datos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor durante la inicialización'
    });
  }
};

module.exports = {
  estacionesController,
  mundosController,
  subMundosController,
  desarrollosController,
  inicializarDatosPorDefecto
};
