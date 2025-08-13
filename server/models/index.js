const sequelize = require('../config/db');
const File = require('./file')(sequelize);
const Estacion = require('./estacion')(sequelize);
const Mundo = require('./mundo')(sequelize);
const SubMundo = require('./subMundo')(sequelize);
const Desarrollo = require('./desarrollo')(sequelize);

// Definir asociaciones
Mundo.hasMany(SubMundo, { foreignKey: 'mundoId', as: 'subMundos' });
SubMundo.belongsTo(Mundo, { foreignKey: 'mundoId', as: 'mundo' });

SubMundo.hasMany(Desarrollo, { foreignKey: 'subMundoId', as: 'desarrollos' });
Desarrollo.belongsTo(SubMundo, { foreignKey: 'subMundoId', as: 'subMundo' });

// Sincronizar modelos con la base de datos
const syncModels = async () => {
  try {
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ Modelos sincronizados con la base de datos');
  } catch (error) {
    console.error('❌ Error sincronizando modelos:', error);
  }
};

module.exports = {
  sequelize,
  File,
  Estacion,
  Mundo,
  SubMundo,
  Desarrollo,
  syncModels
};
