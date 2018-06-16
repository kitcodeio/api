'use strict';
module.exports = (sequelize, DataTypes) => {
  var Image = sequelize.define('Image', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    }
  }, {});
  Image.associate = function(models) {
    Image.belongsTo(models.Client, {
      foreignKey: 'client_id'
    });
  };
  return Image;
};
