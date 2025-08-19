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
      defaultValue: '[]',
      get() {
        const value = this.getDataValue('permittedWorldIds');
        if (value === '*') return '*';
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch (error) {
            console.error('Error parsing permittedWorldIds:', error);
            return [];
          }
        }
        return value;
      },
      set(value) {
        if (Array.isArray(value)) {
          this.setDataValue('permittedWorldIds', JSON.stringify(value));
        } else if (typeof value === 'object' && value !== null) {
          this.setDataValue('permittedWorldIds', JSON.stringify(value));
        } else {
          this.setDataValue('permittedWorldIds', value);
        }
      }
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
    ]
  });

  return User;
};

