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
        try {
          return JSON.parse(value || '[]');
        } catch {
          return [];
        }
      },
      set(value) {
        if (value === '*') {
          this.setDataValue('permittedWorldIds', '*');
        } else {
          this.setDataValue('permittedWorldIds', JSON.stringify(value || []));
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

