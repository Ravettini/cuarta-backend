const { sequelize } = require('../models');
const { DataTypes } = require('sequelize');

/**
 * Script para inicializar la base de datos y crear la tabla files si no existe
 * Funciona tanto en SQLite como en PostgreSQL
 */
async function initDatabase() {
  try {
    console.log('🔍 Inicializando base de datos...');
    
    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');
    
    // Crear tabla files si no existe
    const tableExists = await sequelize.getQueryInterface().showAllTables();
    console.log('📋 Tablas existentes:', tableExists);
    
    if (!tableExists.includes('files')) {
      console.log('📁 Creando tabla files...');
      
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
    } else {
      console.log('✅ Tabla files ya existe');
    }
    
    console.log('🎉 Base de datos inicializada correctamente');
    
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
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
