'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Containers', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      image_id: {
        type: Sequelize.STRING,
	references: {
	  model: 'Images',
	  key: 'id'
	}
      },
      course_id: {
        type: Sequelize.INTEGER,
	references: {
	  model: 'Courses',
	  key: 'id'
	}
      },
      client_id: {
        type: Sequelize.STRING,
	references: {
	  model: 'Clients',
	  key: 'id'
	}
      },
      subdomain: {
        type: Sequelize.STRING,
	references: {
	  model: 'Subdomains',
	  key: 'salt'
	}
      },
      container_id: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Containers');
  }
};
