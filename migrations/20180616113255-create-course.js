'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Courses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      label: {
        type: Sequelize.STRING
      },
      category_id: {
        type: Sequelize.INTEGER,
	references: {
	  model: 'CourseCategories',
	  key: 'id'
	}
      },
      description: {
        type: Sequelize.STRING
      },
      image_id: {
        type: Sequelize.STRING,
	references: {
	  model: 'Images',
	  key: 'id' 
	}
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Courses');
  }
};
