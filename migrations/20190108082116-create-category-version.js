'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('CategoryVersions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      category_id: {
        type: Sequelize.INTEGER,
        references: {
	        model: 'Categories',
	        key: 'id'
        },
        onDelete: 'cascade'
      },
      version: {
        type: Sequelize.STRING
      },
      command: {
        type: Sequelize.TEXT
      },
      filename: {
        type: Sequelize.STRING
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('CategoryVersions');
  }
};
