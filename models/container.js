'use strict';
module.exports = (sequelize, DataTypes) => {
  var Container = sequelize.define('Container', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
    },
    container_id: DataTypes.STRING
  }, {});
  Container.associate = function(models) {
    Container.belongsTo(models.Image, {
      foreignKey: 'image_id'
    });
  };
  return Container;
};
