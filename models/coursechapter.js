'use strict';
module.exports = (sequelize, DataTypes) => {
  var CourseChapter = sequelize.define('CourseChapter', {
    index: DataTypes.INTEGER,
    label: {
      type: DataTypes.STRING,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    }
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
