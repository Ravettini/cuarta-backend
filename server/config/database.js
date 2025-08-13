require('dotenv').config();

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: console.log
  },
  test: {
    dialect: 'sqlite',
    storage: './test-database.sqlite',
    logging: false
  },
  production: {
    dialect: 'sqlite',
    storage: './production-database.sqlite',
    logging: false
  }
};
