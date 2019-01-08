'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.addColumn('Containers', 'ip_location', Sequelize.STRING),
      queryInterface.addColumn('Containers', 'geo_location', Sequelize.STRING),
    ];
  },
  down: (queryInterface, Sequelize) => {
    return [
      queryInterface.removeColumn('Containers', 'ip_location'),
      queryInterface.removeColumn('Containers', 'geo_location'),
    ];
  },
};
