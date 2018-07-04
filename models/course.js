'use strict';
module.exports = (sequelize, DataTypes) => {
  var Course = sequelize.define('Course', {
    label: DataTypes.STRING,
    description: DataTypes.STRING,
    logo: DataTypes.STRING
  }, {
    timestamps: false
  });
  Course.associate = function(models) {
    Course.hasMany(models.CourseSection, {
      foreignKey: 'course_id'
    });
  };
  return Course;
};
