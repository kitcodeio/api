'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Images', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      label: {
        type: Sequelize.STRING,
        defaultValue: 'Untitled',
        allowNull: false
      },
      description: {
        type: Sequelize.STRING
      },
      user_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Images');
  }
};
