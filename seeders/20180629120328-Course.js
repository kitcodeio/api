'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Courses', [{
      name: 'Node.js'
    }, {
      name: 'Python'
    }, {
      name: 'Tensorflow'
    }, {
      name: 'Watson'
    }], {});
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.bulkDelete('Courses', [{}]);
  }
};
