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
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          is: {
            args: /^([^0-9!<@#$%^,&*\-`~()_+=\/\\?}\]{\[>]*)$/,
            msg: 'oops! that doesn\'t look like a real name'
          }
        }
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
        validate: {
          isEmail: true
        }
      },
      phone: {
        type: Sequelize.STRING,
        unique: true
      },
      image: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'http://cdn.kitcode.io/default_pro_pic.png'
      },
      role_type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      github: {
        type: Sequelize.STRING,
      },
      twitter: {
        type: Sequelize.STRING,
      },
      google: {
        type: Sequelize.STRING,
      },
      facebook: {
        type: Sequelize.STRING
      },
      password_hash: {
        type: Sequelize.STRING,
        allowNull: false
      },
      salt: {
        type: Sequelize.STRING,
        allowNull: false
      },
      verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      credit: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 5
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
