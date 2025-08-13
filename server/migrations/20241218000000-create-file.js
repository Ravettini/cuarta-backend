'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('files', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Nombre mostrado del archivo'
      },
      file_name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Nombre original del archivo'
      },
      path: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Ruta del archivo en el sistema'
      },
      content_type: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Tipo MIME del archivo'
      },
      size: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'Tamaño en bytes'
      },
      tags: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Tags separados por coma o JSON'
      },
      folder: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Carpeta opcional (Mapas Estaciones, Mapas Sanfer, img, etc.)'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Crear índices
    await queryInterface.addIndex('files', ['folder'], {
      name: 'idx_files_folder'
    });

    await queryInterface.addIndex('files', ['created_at'], {
      name: 'idx_files_created_at'
    });

    await queryInterface.addIndex('files', ['name'], {
      name: 'idx_files_name'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('files');
  }
};
