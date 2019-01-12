'use strict';
module.exports = (sequelize, DataTypes) => {
  const CategoryVersion = sequelize.define('CategoryVersion', {
    version: DataTypes.STRING,
    command: DataTypes.STRING,
    default: DataTypes.BOOLEAN
  }, {
    timestamps: false,
  });
  CategoryVersion.associate = function(models) {
    CategoryVersion.belongsTo(models.CourseCategory, {
      foreignKey: 'category_id',
    });
  };
  return CategoryVersion;
};
