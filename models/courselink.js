'use strict';
module.exports = (sequelize, DataTypes) => {
  var CourseLink = sequelize.define('CourseLink', {
    link: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    }
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
