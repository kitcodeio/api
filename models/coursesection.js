'use strict';
module.exports = (sequelize, DataTypes) => {
  var CourseSection = sequelize.define('CourseSection', {
    index: DataTypes.INTEGER,
    label: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    timestamps: false
  });
  CourseSection.associate = function(models) {
    CourseSection.hasMany(models.CourseChapter, {
      foreignKey: 'section_id'
    });

    CourseSection.belongsTo(models.Course, {
      foreignKey: 'course_id'
    });
  };
  return CourseSection;
};
