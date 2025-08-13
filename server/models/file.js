const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const File = sequelize.define('File', {
    id: {
      type: DataTypes.STRING,
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
      comment: 'Carpeta opcional (Mapas Estaciones, Mapas Sanfer, img, etc.)'
    }
  }, {
    tableName: 'files',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_files_folder',
        fields: ['folder']
      },
      {
        name: 'idx_files_created_at',
        fields: ['created_at']
      },
      {
        name: 'idx_files_name',
        fields: ['name']
      }
    ]
  });

  return File;
};
