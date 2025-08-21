const { Sequelize } = require('sequelize');
require('dotenv').config();

async function testDatabaseConnection() {
  console.log('🧪 Probando conexión a la base de datos...');
  console.log('🔍 Variables de entorno:');
  console.log('  - NODE_ENV:', process.env.NODE_ENV);
  console.log('  - DATABASE_URL:', process.env.DATABASE_URL ? 'Definido' : 'No definido');
  
  if (process.env.DATABASE_URL) {
    console.log('  - DATABASE_URL (primeros 50 chars):', process.env.DATABASE_URL.substring(0, 50) + '...');
  }
  
  let sequelize;
  
  try {
    if (process.env.DATABASE_URL) {
      console.log('🔧 Configurando PostgreSQL...');
      sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: console.log,
        dialectOptions: {
          ssl: process.env.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false
          } : false
        }
      });
    } else {
      console.log('🔧 Configurando SQLite...');
      sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: './database.sqlite',
        logging: console.log
      });
    }
    
    console.log('🔍 Configuración de Sequelize:');
    console.log('  - Dialect:', sequelize.getDialect());
    console.log('  - Host:', sequelize.config.host);
    console.log('  - Port:', sequelize.config.port);
    console.log('  - Database:', sequelize.config.database);
    console.log('  - Username:', sequelize.config.username);
    
    console.log('🔄 Intentando conectar...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa!');
    
    // Obtener información de la base de datos
    if (sequelize.getDialect() === 'postgres') {
      try {
        const [results] = await sequelize.query('SELECT current_database() as db_name, current_user as user_name, version() as version');
        console.log('📊 Información de la base de datos:');
        console.log('  - Base de datos actual:', results[0].db_name);
        console.log('  - Usuario actual:', results[0].user_name);
        console.log('  - Versión:', results[0].version);
      } catch (error) {
        console.log('⚠️ No se pudo obtener información adicional:', error.message);
      }
    }
    
    // Verificar tablas
    try {
      const tables = await sequelize.getQueryInterface().showAllTables();
      console.log('📋 Tablas encontradas:', tables);
    } catch (error) {
      console.log('⚠️ No se pudieron listar las tablas:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.error('🔍 Stack trace:', error.stack);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Sugerencia: El servidor de base de datos no está ejecutándose o no es accesible');
    } else if (error.code === 'ENOTFOUND') {
      console.log('💡 Sugerencia: El host de la base de datos no se puede resolver');
    } else if (error.code === '28P01') {
      console.log('💡 Sugerencia: Error de autenticación - verifica usuario y contraseña');
    } else if (error.code === '3D000') {
      console.log('💡 Sugerencia: La base de datos no existe');
    }
  } finally {
    if (sequelize) {
      await sequelize.close();
      console.log('🔒 Conexión cerrada');
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testDatabaseConnection()
    .then(() => {
      console.log('✅ Prueba completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Prueba falló:', error);
      process.exit(1);
    });
}

module.exports = { testDatabaseConnection };
