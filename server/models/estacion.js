const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Estacion = sequelize.define('Estacion', {
    id: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: true
    },
    barrio: {
      type: DataTypes.STRING,
      allowNull: true
    },
    comuna: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    coordenadas: {
      type: DataTypes.TEXT, // Guardar como string JSON
      allowNull: true
    },
    activa: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    tags: {
      type: DataTypes.TEXT, // Guardar como string separado por comas
      defaultValue: ''
    }
  }, {
    tableName: 'estaciones',
    timestamps: true,
    indexes: [
      {
        fields: ['barrio']
      },
      {
        fields: ['comuna']
      },
      {
        fields: ['activa']
      }
    ]
  });

  return Estacion;
};
