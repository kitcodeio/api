'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Containers', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
      },
      base_image: {
        type: Sequelize.STRING,
        references: {
          model: 'Images',
          key: 'id',
        },
        onDelete: 'set null',
      },
      tutorial_id: {
        type: Sequelize.STRING,
        references: {
          model: 'Tutorials',
          key: 'id',
        },
        onDelete: 'set null',
      },
      user_id: {
        type: Sequelize.STRING,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      subdomain: {
        type: Sequelize.STRING,
        references: {
          model: 'Subdomains',
          key: 'salt',
        },
      },
      image_id: {
        type: Sequelize.STRING,
      },
      container_id: {
        type: Sequelize.STRING,
      },
      ip: {
        type: Sequelize.STRING,
      },
      state: {
        type: Sequelize.STRING,
        defaultValue: 'idle',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Containers');
  },
};
