'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('CourseChapters', {
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
      section_id: {
        type: Sequelize.INTEGER,
	allowNull: false,
	references: {
	  model: 'CourseSections',
	  key: 'id'
	},
        onDelete: 'cascade'
      },
      url: {
        type: Sequelize.STRING,
	allowNull: false
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('CourseChapters');
  }
};
