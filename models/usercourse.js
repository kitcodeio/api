'use strict';
module.exports = (sequelize, DataTypes) => {
  var UserCourse = sequelize.define('UserCourse', {
  }, {});
  UserCourse.associate = function(models) {
    UserCourse.belongsTo(models.Client, {
      foreign_key: 'client_id'
    });
    UserCourse.belongsTo(models.Course, {
      foreign_key: 'course_id'
    });
  };
  return UserCourse;
};
