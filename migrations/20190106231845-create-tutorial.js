'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Tutorials', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      submitted_by: {
        type: Sequelize.STRING,
        references: {
	  model: 'Clients',
	  key: 'id'
	},
	onDelete: 'set null'
      },
      link: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          is: {
            args: /((([A-Za-z]{4,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/,
            msg: 'that doesn\'t look like a valid link'
          }
        }
      },
      tags: {
        type: Sequelize.STRING,
        allowNull: false
      },
      approved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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
    return queryInterface.dropTable('Tutorials');
  }
};
