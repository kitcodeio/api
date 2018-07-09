'use strict';
module.exports = (sequelize, DataTypes) => {
  var CourseChapter = sequelize.define('CourseChapter', {
    label: DataTypes.STRING,
    url: DataTypes.STRING
  }, {
    timestamps: false
  });
  CourseChapter.associate = function(models) {
    CourseChapter.belongsTo(models.CourseSection, {
      foreignKey: 'section_id'
    });
  };
  return CourseChapter;
};