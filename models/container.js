'use strict';
module.exports = (sequelize, DataTypes) => {
  var Container = sequelize.define('Container', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true,
    },
    container_id: DataTypes.STRING,
    image_id: DataTypes.STRING,
    ip: DataTypes.STRING,
    state: {
      type: DataTypes.STRING,
      defaultValue: 'idle',
    },
  }, {});
  Container.associate = function(models) {

    Container.belongsTo(models.Image, {
      foreignKey: 'base_image',
    });

    Container.belongsTo(models.Client, {
      foreignKey: 'client_id',
    });

    Container.belongsTo(models.Tutorial, {
      foreignKey: 'tutorial_id',
    });

    Container.belongsTo(models.Subdomain, {
      foreignKey: 'subdomain',
    });

  };
  return Container;
};
