const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50]
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [4, 100]
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'user'),
      allowNull: false,
      defaultValue: 'user'
    },
    permittedWorldIds: {
      type: DataTypes.TEXT, // JSON string para compatibilidad con SQLite
      allowNull: false,
      defaultValue: '[]'
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'users',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['username']
      }
    ],
    hooks: {
      beforeSave: (user) => {
        // Asegurar que permittedWorldIds sea siempre un string JSON
        if (user.permittedWorldIds !== undefined) {
          if (Array.isArray(user.permittedWorldIds)) {
            user.permittedWorldIds = JSON.stringify(user.permittedWorldIds);
          } else if (typeof user.permittedWorldIds === 'object' && user.permittedWorldIds !== null) {
            user.permittedWorldIds = JSON.stringify(user.permittedWorldIds);
          }
        }
      },
      afterFind: (users) => {
        // Convertir string JSON de vuelta a array
        const userArray = Array.isArray(users) ? users : [users];
        userArray.forEach(user => {
          if (user && user.permittedWorldIds && typeof user.permittedWorldIds === 'string') {
            try {
              if (user.permittedWorldIds === '*') {
                user.permittedWorldIds = '*';
              } else {
                user.permittedWorldIds = JSON.parse(user.permittedWorldIds);
              }
            } catch (error) {
              console.error('Error parsing permittedWorldIds:', error);
              user.permittedWorldIds = [];
            }
          }
        });
      }
    }
  });

  return User;
};

