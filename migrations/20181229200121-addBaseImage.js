'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Containers', 'base_image', {
      type: Sequelize.STRING,
      references: {
        model: 'Images',
        key: 'id',
      },
      onDelete: 'set null',
      after: 'id',
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Containers', 'base_image');
  },
};
