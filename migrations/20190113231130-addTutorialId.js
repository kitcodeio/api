'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Containers', 'course_id').then(() => {
      return queryInterface,addColumn('Containers', 'tutorial_id', {
        type: Sequelize.INTEGER,
	references: {
	  model: 'Tutorials',
	  key: 'id'
	},
	onDelete: 'set null',
	after: 'base_image'
      });
    });
  },
  down: (queryInterface, Sequelize) => {
  }
};
