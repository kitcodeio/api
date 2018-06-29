'use strict';
module.exports = (sequelize, DataTypes) => {
  var CourseLink = sequelize.define('CourseLink', {
    link: DataTypes.STRING
  }, {
    timestamps: false
  });
  CourseLink.associate = function(models) {
    CourseLink.belongsTo(models.Course, {
      foreignKey: 'course_id'
    });
  };
  return CourseLink;
};
