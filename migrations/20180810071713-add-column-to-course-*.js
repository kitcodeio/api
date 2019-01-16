'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('CourseCategories', 'index', Sequelize.INTEGER).then(() => {
      return queryInterface.addColumn('Courses', 'index', Sequelize.INTEGER).then(() => {
        return queryInterface.addColumn('CourseSections', 'index', Sequelize.INTEGER).then(() => {
          return queryInterface.addColumn('CourseChapters', 'index', Sequelize.INTEGER)
        })
      });
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('CourseCategories', 'index', Sequelize.INTEGER).then(() => {
      return queryInterface.removeColumn('Courses', 'index', Sequelize.INTEGER).then(() => {
        return queryInterface.removeColumn('CourseSections', 'index', Sequelize.INTEGER).then(() => {
          return queryInterface.removeColumn('CourseChapters', 'index', Sequelize.INTEGER)
        });
      });
    });
  },
};
