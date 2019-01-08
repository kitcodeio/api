'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Courses', [{
      label: 'Node.js',
    }, {
      label: 'Python',
    }, {
      label: 'Tensorflow',
    }, {
      label: 'Watson',
    },], {});
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.bulkDelete('Courses', [{},]);
  },
};
