'use strict';
module.exports = (sequelize, DataTypes) => {
  const CategoryVersion = sequelize.define('CategoryVersion', {
    version: DataTypes.STRING,
    command: DataTypes.STRING,
    filename: DataTypes.STRING,
  }, {
    timestamps: false,
  });
  CategoryVersion.associate = function(models) {
    CategoryVersion.belongsTo(models.Category, {
      foreignKey: 'category_id',
    });
  };
  return CategoryVersion;
};
