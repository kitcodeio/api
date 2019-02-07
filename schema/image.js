'use strict';
module.exports = (sequelize, DataTypes) => {
  var Image = sequelize.define('Image', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    label: {
      type: DataTypes.STRING,
      defaultValue: 'Untitled',
      allowNull: false
    },
    description: DataTypes.STRING
  }, {});
  Image.associate = function(models) {
    Image.belongsTo(models.User, {
      foreignKey: 'user_id'
    });

    Image.hasMany(models.Container, {
      foreignKey: 'base_image'
    });

    Image.hasMany(models.Tutorial, {
      foreignKey: 'image_id'
    });
  };
  return Image;
};
