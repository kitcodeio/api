'use strict';
module.exports = (sequelize, DataTypes) => {
  var Course = sequelize.define('Course', {
    index: DataTypes.INTEGER,
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
    },
    price: {
      type: DataTypes.INTEGER,
      defaultValue: 4999,
      allowNull: false
    },
    discount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      validate: {
        min: 0,
        max: 100
      }
    }
  }, {});
  Course.associate = function(models) {
    Course.hasMany(models.CourseSection, {
      foreignKey: 'course_id'
    });

    Course.hasMany(models.UserCourse, {
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
