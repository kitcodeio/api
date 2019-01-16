'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Containers', 'tutorial_id', {
      type: Sequelize.STRING,
      references: {
        model: 'Tutorials',
        key: 'id'
      },
      onDelete: 'set null',
      after: 'base_image'
    });
  },
  down: (queryInterface, Sequelize) => {}
};
