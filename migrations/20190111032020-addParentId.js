'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('CourseCategories', 'parent_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'CourseCategories',
        key: 'id'
      },
      after: 'label'
    }).then(() => {
      return queryInterface.addColumn('Tutorials', 'status', Sequelize.STRING)
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('CourseCategories', 'parent_id').then(() => {
      return queryInterface.removeColumn('Tutorials', 'status');
    });
  }
};
