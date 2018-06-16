'use strict';
module.exports = (sequelize, DataTypes) => {
  var Image = sequelize.define('Image', {
  }, {});
  Image.associate = function(models) {
    Image.belongsTo(models.User) {
      foreignKey: 'client_id'
    }
  };
  return Image;
};
