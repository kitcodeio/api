'use strict';
module.exports = (sequelize, DataTypes) => {
  var CourseCategory = sequelize.define('CourseCategory', {
    label: DataTypes.STRING
  }, {
    timestamps: false
  });
  CourseCategory.associate = function(models) {
    CourseCategory.hasMany(models.Course, {
      foreignKey: 'category_id'
    });
  };
  return CourseCategory;
};
