'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Clients', {
      id: {
        allowNull: false,
        primaryKey: true,
	unique: true,
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING,
	unique: true,
	validate: {
	  isEmail: true
	}
      },
      password_hash: {
        type: Sequelize.STRING
      },
      salt: {
        type: Sequelize.STRING
      },
      verified: {
        type: Sequelize.BOOLEAN
      },
      subdomain: {
        type: Sequelize.STRING,
	allowNull: false,
	unique: true,
	reference: {
	  model: 'subdomain',
          key: 'salt'
	}
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
    return queryInterface.dropTable('Clients');
  }
};
