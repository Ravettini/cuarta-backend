const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Desarrollo = sequelize.define('Desarrollo', {
    id: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tipo: {
      type: DataTypes.ENUM('mapa', 'bi', 'reporte', 'documento', 'link', 'archivo'),
      defaultValue: 'mapa'
    },
    tags: {
      type: DataTypes.TEXT, // Guardar como string separado por comas
      defaultValue: ''
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    orden: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    subMundoId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'sub_mundos',
        key: 'id'
      }
    }
  }, {
    tableName: 'desarrollos',
    timestamps: true,
    indexes: [
      {
        fields: ['subMundoId']
      },
      {
        fields: ['tipo']
      },
      {
        fields: ['activo']
      },
      {
        fields: ['orden']
      }
    ]
  });

  return Desarrollo;
};
