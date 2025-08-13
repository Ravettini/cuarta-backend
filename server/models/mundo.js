const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Mundo = sequelize.define('Mundo', {
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
    }
  }, {
    tableName: 'mundos',
    timestamps: true,
    indexes: [
      {
        fields: ['activo']
      },
      {
        fields: ['orden']
      }
    ]
  });

  return Mundo;
};
