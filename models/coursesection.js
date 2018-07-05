'use strict';
module.exports = (sequelize, DataTypes) => {
  var CourseSection = sequelize.define('CourseSection', {
    label: DataTypes.STRING,
    description: DataTypes.STRING
  }, {
    timestamps: false
  });
  CourseSection.associate = function(models) {
    CourseSection.hasMany(models.CourseChapter, {
      foreignKey: 'section_id'
    });    
	  
    CourseSection.belongsTo(models.Course, {
      'course_id'
    });
  };
  return CourseSection;
};
