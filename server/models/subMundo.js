const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SubMundo = sequelize.define('SubMundo', {
    id: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    orden: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    mundoId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'mundos',
        key: 'id'
      }
    }
  }, {
    tableName: 'sub_mundos',
    timestamps: true,
    indexes: [
      {
        fields: ['mundoId']
      },
      {
        fields: ['activo']
      },
      {
        fields: ['orden']
      }
    ]
  });

  return SubMundo;
};
