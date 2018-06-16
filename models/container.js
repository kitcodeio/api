'use strict';
module.exports = (sequelize, DataTypes) => {
  var Container = sequelize.define('Container', {
    container_id: DataTypes.STRING
  }, {});
  Container.associate = function(models) {
    Container.belongsTo(models.Image) {
      foreignKey: 'image_id'
    }
  };
  return Container;
};
