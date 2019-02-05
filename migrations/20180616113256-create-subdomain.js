'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Subdomains', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      salt: {
        type: Sequelize.STRING,
        unique: true
      },
      occupied: {
        type: Sequelize.BOOLEAN,
        default: false
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Subdomains');
  }
};
