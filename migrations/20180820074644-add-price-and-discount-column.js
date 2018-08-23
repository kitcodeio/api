'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.addColumn('Courses', 'price', {
        type: Sequelize.INTEGER,
        defaultValue: 4999,
        allowNull: false
      }),
      queryInterface.addColumn('Courses', 'discount', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,	
        validate: {
          min: 0,
          max: 100
        }
      }),
    ];
  },
  down: (queryInterface, Sequelize) => {
    return [
      queryInterface.removeColumn('Courses', 'price'),
      queryInterface.removeColumn('Courses', 'discount'),

    ];
  }
};