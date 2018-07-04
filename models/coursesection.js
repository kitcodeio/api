'use strict';
module.exports = (sequelize, DataTypes) => {
  var CourseSection = sequelize.define('CourseSection', {
    detail: DataTypes.STRING,
    name: DataTypes.STRING
  }, {
    timestamps: false
  });
  CourseSection.associate = function(models) {
    CourseSection.belongsTo(model.Courselink, {
      foreignKey: 'course_id'
    });
  };
  return CourseSection;
};
