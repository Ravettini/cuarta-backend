const { User, Mundo } = require('../models');

// Usuarios por defecto que se crearán en la base de datos
const DEFAULT_USERS = [
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

async function migrateUsers() {
  try {
    console.log('🚀 Iniciando migración de usuarios...');

    // Verificar si ya existen usuarios
    const existingUsers = await User.findAll();
    if (existingUsers.length > 0) {
      console.log('✅ Ya existen usuarios en la base de datos, saltando migración');
      return;
    }

    // Obtener mundos para asignar permisos
    const mundos = await Mundo.findAll();
    const mundosMap = {};
    mundos.forEach(mundo => {
      mundosMap[mundo.nombre] = mundo.id;
    });

    // Crear usuarios por defecto
    for (const userData of DEFAULT_USERS) {
      let permittedWorldIds = userData.permittedWorldIds;

      // Si no es admin, asignar mundos específicos
      if (userData.role !== 'admin') {
        if (userData.username === 'estaciones') {
          permittedWorldIds = [mundosMap['Estaciones Saludables']].filter(Boolean);
        } else if (userData.username === 'sanfer') {
          permittedWorldIds = [mundosMap['San Fernando']].filter(Boolean);
        } else if (userData.username === 'ambos') {
          permittedWorldIds = [
            mundosMap['Estaciones Saludables'],
            mundosMap['San Fernando']
          ].filter(Boolean);
        }
      }

      await User.create({
        username: userData.username,
        password: userData.password,
        role: userData.role,
        permittedWorldIds: permittedWorldIds
      });

      console.log(`✅ Usuario creado: ${userData.username}`);
    }

    console.log('🎉 Migración de usuarios completada exitosamente');
    console.log(`📊 Total de usuarios creados: ${DEFAULT_USERS.length}`);

  } catch (error) {
    console.error('❌ Error durante la migración de usuarios:', error);
    throw error;
  }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
  migrateUsers()
    .then(() => {
      console.log('✅ Script de migración completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en script de migración:', error);
      process.exit(1);
    });
}

module.exports = { migrateUsers };

