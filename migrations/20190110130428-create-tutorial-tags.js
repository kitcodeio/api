'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('TutorialTags', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tutorial_id: {
        type: Sequelize.STRING,
        references: {
          model: 'Tutorials',
          key: 'id',
        },
        onDelete: 'cascade',
      },
      category_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Categories',
          key: 'id',
        },
        onDelete: 'set null',
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('TutorialTags');
  }
};
