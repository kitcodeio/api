'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Containers', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      course_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Courses',
          key: 'id'
        },
	onDelete: 'set null'
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
      ip: {
        type: Sequelize.STRING
      },
      state: {
        type: Sequelize.STRING,
        defaultValue: 'idle'
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
