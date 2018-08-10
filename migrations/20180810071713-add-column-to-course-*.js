'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.addColumn('CourseCategories', 'index', Sequelize.INTEGER),
      queryInterface.addColumn('Courses', 'index', Sequelize.INTEGER),
      queryInterface.addColumn('CourseSections', 'index', Sequelize.INTEGER),
      queryInterface.addColumn('CourseChapters', 'index', Sequelize.INTEGER)
    ];
  },
  down: (queryInterface, Sequelize) => {
    return [
      queryInterface.removeColumn('CourseCategories', 'index', Sequelize.INTEGER),
      queryInterface.removeColumn('Courses', 'index', Sequelize.INTEGER),
      queryInterface.removeColumn('CourseSections', 'index', Sequelize.INTEGER),
      queryInterface.removeColumn('CourseChapters', 'index', Sequelize.INTEGER)
    ];
  }
};
