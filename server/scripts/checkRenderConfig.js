const { Sequelize } = require('sequelize');
require('dotenv').config();

async function checkRenderConfig() {
  console.log('🔍 Verificando configuración de Render...');
  console.log('📊 Variables de entorno disponibles:');
  
  const envVars = [
    'NODE_ENV',
    'PORT',
    'DATABASE_URL',
    'DATABASE_NAME',
    'DATABASE_USER',
    'UPLOAD_DIR',
    'MAX_UPLOAD_BYTES',
    'ALLOWED_MIME_TYPES',
    'ALLOWED_ORIGIN'
  ];
  
  envVars.forEach(key => {
    const value = process.env[key];
    if (value) {
      if (key === 'DATABASE_URL') {
        console.log(`  ✅ ${key}: ${value.substring(0, 50)}...`);
      } else {
        console.log(`  ✅ ${key}: ${value}`);
      }
    } else {
      console.log(`  ❌ ${key}: No definido`);
    }
  });

  console.log('\n🔍 Verificando configuración de base de datos...');
  
  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL no está definido');
    console.log('💡 Esto significa que el servicio está usando SQLite local');
    console.log('💡 Para usar PostgreSQL en Render, verifica:');
    console.log('   1. Que render.yaml tenga la configuración correcta');
    console.log('   2. Que el servicio de BD esté creado en Render');
    console.log('   3. Que se haya hecho redeploy después de cambiar render.yaml');
    return;
  }

  console.log('✅ DATABASE_URL está definido');
  
  try {
    // Parsear la URL de la base de datos
    const url = new URL(process.env.DATABASE_URL);
    console.log('\n📊 Información de la URL de la base de datos:');
    console.log(`  - Protocolo: ${url.protocol}`);
    console.log(`  - Host: ${url.hostname}`);
    console.log(`  - Puerto: ${url.port}`);
    console.log(`  - Base de datos: ${url.pathname.substring(1)}`);
    console.log(`  - Usuario: ${url.username}`);
    console.log(`  - Contraseña: ${url.password ? '***' : 'No definida'}`);
    
    // Verificar si es una URL de Render
    if (url.hostname.includes('render.com') || url.hostname.includes('onrender.com')) {
      console.log('\n✅ Detectada URL de Render');
    } else {
      console.log('\n⚠️ URL no parece ser de Render');
    }
    
  } catch (parseError) {
    console.log('❌ Error parseando DATABASE_URL:', parseError.message);
  }

  console.log('\n🔍 Verificando conexión a la base de datos...');
  
  let sequelize;
  try {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      retry: {
        max: 3
      }
    });

    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a PostgreSQL en Render');
    
    // Verificar tablas
    try {
      const tables = await sequelize.getQueryInterface().showAllTables();
      console.log(`✅ Tablas encontradas: ${tables.length}`);
      if (tables.length > 0) {
        console.log('  - Tablas:', tables.join(', '));
      }
    } catch (error) {
      console.log('⚠️ No se pudieron listar las tablas:', error.message);
    }
    
  } catch (error) {
    console.log('❌ Error conectando a la base de datos:', error.message);
    console.log('🔍 Código de error:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 El servidor de BD no está ejecutándose');
    } else if (error.code === 'ENOTFOUND') {
      console.log('💡 El host de la BD no se puede resolver');
    } else if (error.code === '28P01') {
      console.log('💡 Error de autenticación - verifica usuario y contraseña');
    } else if (error.code === '3D000') {
      console.log('💡 La base de datos no existe');
    } else if (error.code === 'ECONNRESET') {
      console.log('💡 La conexión fue reseteada');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('💡 Timeout de conexión');
    }
    
    console.log('\n🔧 Pasos para solucionar:');
    console.log('1. Ve al dashboard de Render');
    console.log('2. Verifica que el servicio de BD "cuarta-postgres" esté activo');
    console.log('3. Verifica que el servicio web "cuarta-backend" esté activo');
    console.log('4. En el servicio web, ve a "Environment" y verifica que DATABASE_URL esté presente');
    console.log('5. Si no está, haz redeploy del servicio');
    
  } finally {
    if (sequelize) {
      await sequelize.close();
      console.log('🔒 Conexión cerrada');
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  checkRenderConfig()
    .then(() => {
      console.log('\n✅ Verificación completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Verificación falló:', error);
      process.exit(1);
    });
}

module.exports = { checkRenderConfig };
