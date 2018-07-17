'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    queryInterface.addColumn(
      'CourseCategories',
      'logo',
      Sequelize.STRING
    );

  },

  down: function(queryInterface, Sequelize) {
    queryInterface.removeColumn(
      'CourseCategories',
      'logo'
    );
  }
}
