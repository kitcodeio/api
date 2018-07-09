'use strict';
module.exports = (sequelize, DataTypes) => {
  var Course = sequelize.define('Course', {
    label: DataTypes.STRING,
    description: DataTypes.STRING,
  }, {
    timestamps: false
  });
  Course.associate = function(models) {
    Course.hasMany(models.CourseSection, {
      foreignKey: 'course_id'
    });
    
    Course.hasMany(models.Conatainer, {
      foreignKey: 'course_id'
    });

    Course.belongsTo(models.Image, {
      foreignKey: 'image_id'
    });

    Course.belongsTo(models.CourseCategory, {
      foreignKey: 'category_id'
    });
  };
  return Course;
};
