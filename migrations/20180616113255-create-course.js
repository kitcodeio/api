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
        type: Sequelize.STRING,
        allowNull: false
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'CourseCategories',
          key: 'id'
        }
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false
      },
      image_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'Images',
          key: 'id'
        }
      },
      created_by: {
        type: Sequelize.STRING,
        allowNull: false
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
    return queryInterface.dropTable('Courses');
  }
};
