'use strict';
module.exports = (sequelize, DataTypes) => {
  var CourseCategory = sequelize.define('CourseCategory', {
    label: {
      type: DataTypes.STRING,
      allowNull: false
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: false
    }
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
