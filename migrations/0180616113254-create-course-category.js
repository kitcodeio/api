'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Categories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      label: {
        type: Sequelize.STRING,
        allowNull: false,
      }, 
      parent_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Categories',
          key: 'id'
        },
      },
      logo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      visibility: {
        type: Sequelize.BOOLEAN,
        defaultValue: true, 
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('CourseCategories');
  },
};
