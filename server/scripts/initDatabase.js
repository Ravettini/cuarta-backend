const { sequelize } = require('../models');
const { DataTypes } = require('sequelize');

/**
 * Script para inicializar la base de datos y crear la tabla files si no existe
 * Funciona tanto en SQLite como en PostgreSQL
 */
async function initDatabase() {
  try {
    console.log('🔍 Inicializando base de datos...');
    console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL ? 'Definido' : 'No definido');
    console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
    
    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');
    
    // Obtener información de la base de datos
    const [results] = await sequelize.query('SELECT current_database() as db_name, current_user as user_name');
    console.log('🔍 Base de datos actual:', results[0]);
    
    // Crear tabla files si no existe
    const tableExists = await sequelize.getQueryInterface().showAllTables();
    console.log('📋 Tablas existentes:', tableExists);
    
    if (!tableExists.includes('files')) {
      console.log('📁 Creando tabla files...');
      
      try {
        await sequelize.getQueryInterface().createTable('files', {
          id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
          },
          name: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'Nombre mostrado del archivo'
          },
          file_name: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'Nombre original del archivo'
          },
          path: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'Ruta del archivo en el sistema'
          },
          content_type: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'Tipo MIME del archivo'
          },
          size: {
            type: DataTypes.BIGINT,
            allowNull: false,
            comment: 'Tamaño en bytes'
          },
          tags: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Tags separados por coma o JSON'
          },
          folder: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Carpeta opcional'
          },
          created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
          },
          updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
          }
        });
        
        console.log('✅ Tabla files creada exitosamente');
      } catch (createError) {
        console.error('❌ Error creando tabla files:', createError);
        throw createError;
      }
    } else {
      console.log('✅ Tabla files ya existe');
    }
    
    // Verificar que la tabla realmente existe
    const tablesAfter = await sequelize.getQueryInterface().showAllTables();
    console.log('📋 Tablas después de la inicialización:', tablesAfter);
    
    if (tablesAfter.includes('files')) {
      console.log('✅ Verificación: Tabla files confirmada');
    } else {
      console.log('❌ Verificación: Tabla files NO encontrada');
    }
    
    console.log('🎉 Base de datos inicializada correctamente');
    
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    console.error('❌ Error stack:', error.stack);
    throw error;
  }
}

module.exports = { initDatabase };

// Si se ejecuta directamente
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('🎉 Script de inicialización de BD completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en script de inicialización de BD:', error);
      process.exit(1);
    });
}
