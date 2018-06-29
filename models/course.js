'use strict';
module.exports = (sequelize, DataTypes) => {
  var Course = sequelize.define('Course', {
    label: DataTypes.STRING
  }, {
    timestamps: false
  });
  Course.associate = function(models) {
    Course.hasMany(models.CourseLink, {
      foreignKey: 'course_id'
    });
  };
  return Course;
};
