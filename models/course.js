'use strict';
module.exports = (sequelize, DataTypes) => {
  var Course = sequelize.define('Course', {
    label: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {});
  Course.associate = function(models) {
    Course.hasMany(models.CourseSection, {
      foreignKey: 'course_id'
    });

    Course.hasMany(models.Container, {
      foreignKey: 'course_id'
    });

    Course.belongsTo(models.Image, {
      foreignKey: 'image_id'
    });

    Course.belongsTo(models.CourseCategory, {
      foreignKey: 'category_id'
    });
  };
  return Course;
};
