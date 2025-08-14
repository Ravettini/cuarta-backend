const { Mundo, SubMundo, Desarrollo, Estacion } = require('../models');
const { migrateUsers } = require('./migrateUsers');

// Datos existentes extraídos de app.js
const DEFAULT_DATA = {
  worlds: [
    {
      id: 'estaciones-saludables-2025',
      name: "Estaciones Saludables",
      subWorlds: [
        {
          id: 'estaciones-mapas-2025',
          name: "Mapas",
          devs: [
            {
              id: 'mapa-rangos-visitas',
              title: "Mapa de Rangos de Visitas",
              desc: "Visualización por rangos",
              url: "Mapas Estaciones/mapa_rangos.html",
              tags: ["mapa", "CABA"]
            },
            {
              id: 'mapa-analitico-asistentes',
              title: "Mapa Analítico de Asistentes",
              desc: "Análisis de asistentes",
              url: "Mapas Estaciones/Mapa_Asistentes_CABA_Analitico.html",
              tags: ["mapa", "analítico"]
            },
            {
              id: 'mapa-dispersion-distancias',
              title: "Mapa de Dispersión de Distancias",
              desc: "Dispersión de distancias",
              url: "Mapas Estaciones/mapa_distancias.html",
              tags: ["mapa", "distancias"]
            },
            {
              id: 'mapa-cobertura-barrial',
              title: "Mapa Cobertura Barrial",
              desc: "Mapa genérico de cobertura por barrio",
              url: "Mapas Estaciones/mapa_cobertura_barrial.html",
              tags: ["mapa", "genérico"]
            },
            {
              id: 'mapa-calor-asistencia',
              title: "Mapa Calor de Asistencia",
              desc: "Mapa de calor genérico",
              url: "Mapas Estaciones/mapa_calor_asistencia.html",
              tags: ["mapa", "calor"]
            },
            {
              id: 'mapa-puntos-atencion',
              title: "Mapa Puntos de Atención",
              desc: "Marcadores de puntos de atención",
              url: "Mapas Estaciones/mapa_puntos_atencion.html",
              tags: ["mapa", "puntos"]
            },
            {
              id: 'mapa-tendencias-temporales',
              title: "Mapa Tendencias Temporales",
              desc: "Tendencias por periodo",
              url: "Mapas Estaciones/mapa_tendencias_temporales.html",
              tags: ["mapa", "tendencias"]
            }
          ]
        },
        {
          id: 'estaciones-bi-2025',
          name: "BI",
          devs: [
            {
              id: 'dashboard-power-bi',
              title: "Dashboard Power BI",
              desc: "Dashboard interactivo",
              url: "https://app.powerbi.com/view?r=eyJrIjoiOGRmY2FlYTYtNjllNS00OWE5LWJjMzEtODhiNjBkMmMyOTgwIiwidCI6IjIzNzc0NzJlLTgwMDQtNDY0OC04NDU2LWJkOTY4N2FmYTE1MCIsImMiOjR9&pageName=ReportSectiona3847c630a8d7da06b55",
              tags: ["bi", "dashboard"]
            }
          ]
        },
        {
          id: 'estaciones-reportes-2025',
          name: "Reportes",
          devs: [
            {
              id: 'reporte-general',
              title: "Reporte General",
              desc: "Notion",
              url: "https://www.notion.so/An-lisis-de-Cobertura-y-Participaci-n-Estaciones-Saludables-CABA-2025-2470723826b580fa8654c9aa5b6a1a51?source=copy_link",
              tags: ["reporte"]
            }
          ]
        }
      ]
    },
    {
      id: 'san-fernando-2025',
      name: "San Fernando",
      subWorlds: [
        {
          id: 'sanfer-mapas-2025',
          name: "Mapas",
          devs: [
            {
              id: 'ganador-tipo-piso',
              title: "Ganador por tipo de piso",
              url: "Mapas Sanfer/mapa_ganador_x_tipo_piso.html",
              tags: ["mapa"]
            },
            {
              id: 'ganador-nivel-educativo',
              title: "Ganador por nivel educativo",
              url: "Mapas Sanfer/mapa_nivel_educativo (1).html",
              tags: ["mapa"]
            },
            {
              id: 'ganador-nivel-obra-social',
              title: "Ganador por nivel educativo y obra social",
              url: "Mapas Sanfer/mapa_partido_ganador (1).html",
              tags: ["mapa"]
            },
            {
              id: 'uso-garrafa',
              title: "Uso de garrafa",
              url: "Mapas Sanfer/mapa_uso_garrafa (1).html",
              tags: ["mapa"]
            },
            {
              id: 'mesas-potencial-2023',
              title: "Mesas con Potencial 2023",
              url: "Mapas Sanfer/mapa_san_fernando_circuitos (1).html",
              tags: ["mapa"]
            },
            {
              id: 'mesas-competitivas-2023',
              title: "Mesas Competitivas 2023",
              url: "Mapas Sanfer/mapa_san_fernando_circuitos (4).html",
              tags: ["mapa"]
            }
          ]
        },
        {
          id: 'sanfer-documentos-2025',
          name: "Documentos",
          devs: [
            {
              id: 'tablon',
              title: "TABLON",
              url: "https://docs.google.com/spreadsheets/d/1Mu0lNlZRNEa91xgV37TvwMnltyAA9-wH/edit?usp=drive_link&ouid=105283006911507845368&rtpof=true&sd=true",
              tags: ["doc"]
            },
            {
              id: 'ultimo-reporte',
              title: "Último Reporte",
              url: "https://docs.google.com/document/d/1UzqBDIozeX_vEP_F20vcHD_IBDyT373RW7R_r2JkYao/edit?usp=drive_link",
              tags: ["doc"]
            },
            {
              id: 'reporte-eze',
              title: "Reporte Eze",
              url: "https://www.notion.so/Datos-226e1238ed6c807f94f6e8d66a143fa0?source=copy_link",
              tags: ["doc"]
            }
          ]
        }
      ]
    }
  ]
};

// Función para migrar datos
async function migrateData() {
  try {
    console.log('🚀 Iniciando migración de datos...');
    
    // Limpiar datos existentes
    await Desarrollo.destroy({ where: {} });
    await SubMundo.destroy({ where: {} });
    await Mundo.destroy({ where: {} });
    console.log('✅ Datos existentes limpiados');
    
    // Migrar mundos
    for (const world of DEFAULT_DATA.worlds) {
      console.log(`📁 Creando mundo: ${world.name}`);
      
      const mundo = await Mundo.create({
        id: world.id,
        nombre: world.name,
        descripcion: `Mundo: ${world.name}`,
        orden: world.name === "Estaciones Saludables" ? 1 : 2
      });
      
      // Migrar sub-mundos
      for (const subWorld of world.subWorlds) {
        console.log(`  📂 Creando sub-mundo: ${subWorld.name}`);
        
        const subMundo = await SubMundo.create({
          id: subWorld.id,
          nombre: subWorld.name,
          descripcion: `Sub-mundo: ${subWorld.name}`,
          orden: subWorld.name === "Mapas" ? 1 : 
                 subWorld.name === "BI" ? 2 : 
                 subWorld.name === "Reportes" ? 3 :
                 subWorld.name === "Documentos" ? 2 : 1,
          mundoId: mundo.id
        });
        
        // Migrar desarrollos
        for (const dev of subWorld.devs) {
          console.log(`    📄 Creando desarrollo: ${dev.title}`);
          
          // Determinar tipo basado en URL o tags
          let tipo = 'mapa';
          if (dev.url && dev.url.includes('powerbi.com')) tipo = 'bi';
          else if (dev.url && dev.url.includes('notion.so')) tipo = 'reporte';
          else if (dev.url && dev.url.includes('docs.google.com')) tipo = 'documento';
          else if (dev.url && dev.url.includes('http')) tipo = 'link';
          else if (dev.tags && dev.tags.includes('archivo')) tipo = 'archivo';
          
          await Desarrollo.create({
            id: dev.id,
            titulo: dev.title,
            descripcion: dev.desc || '',
            url: dev.url || '',
            tipo: tipo,
            tags: (dev.tags || []).join(', '), // Convertir array a string
            orden: 0,
            subMundoId: subMundo.id
          });
        }
      }
    }
    
    // Crear algunas estaciones de ejemplo
    console.log('🏥 Creando estaciones de ejemplo...');
    const estaciones = [
      {
        nombre: "Estación Saludable Palermo",
        direccion: "Av. Santa Fe 1234",
        barrio: "Palermo",
        comuna: 14,
        coordenadas: { lat: -34.6037, lng: -58.3816 },
        tags: ["palermo", "caba"]
      },
      {
        nombre: "Estación Saludable Recoleta",
        direccion: "Av. Callao 567",
        barrio: "Recoleta",
        comuna: 2,
        coordenadas: { lat: -34.5890, lng: -58.3920 },
        tags: ["recoleta", "caba"]
      }
    ];
    
    for (const estacionData of estaciones) {
      await Estacion.create({
        nombre: estacionData.nombre,
        direccion: estacionData.direccion,
        barrio: estacionData.barrio,
        comuna: estacionData.comuna,
        coordenadas: JSON.stringify(estacionData.coordenadas), // Convertir objeto a string JSON
        tags: estacionData.tags.join(', ') // Convertir array a string
      });
    }
    
    // Migrar usuarios
    await migrateUsers();

    console.log('✅ Migración completada exitosamente!');
    console.log(`📊 Resumen:`);
    console.log(`   - Mundos: ${DEFAULT_DATA.worlds.length}`);
    console.log(`   - Sub-mundos: ${DEFAULT_DATA.worlds.reduce((acc, w) => acc + w.subWorlds.length, 0)}`);
    console.log(`   - Desarrollos: ${DEFAULT_DATA.worlds.reduce((acc, w) => acc + w.subWorlds.reduce((acc2, sw) => acc2 + sw.devs.length, 0), 0)}`);
    console.log(`   - Estaciones: ${estaciones.length}`);
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
  migrateData()
    .then(() => {
      console.log('🎉 Migración finalizada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { migrateData };
