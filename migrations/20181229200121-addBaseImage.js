'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addColumn('Containers', 'base_image', {
      type: Sequelize.STRING,
      references: {
        model: 'Images',
        key: 'id'
      },
      onDelete: 'set null',
      after: 'id'
    });
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn('Containers', 'base_image');
  }
};
