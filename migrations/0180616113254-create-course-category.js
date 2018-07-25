'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('CourseCategories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      label: {
        type: Sequelize.STRING,
	allowNull: false
      },
      logo: {
        type: Sequelize.STRING,
	allowNull: false
      },
      visibility: {
        type: Sequelize.BOOLEAN,
	defaultValue: true 
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('CourseCategories');
  }
};
