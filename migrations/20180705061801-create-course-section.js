'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('CourseSections', {
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
      course_id: {
        type: Sequelize.INTEGER,
	allowNull: false,
	references: {
	  model: 'Courses',
	  key: 'id'
	},
        onDelete: 'cascade'
      },
      description: {
        type: Sequelize.STRING,
	allowNull: false
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('CourseSections');
  }
};
