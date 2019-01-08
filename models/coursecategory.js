'use strict';
module.exports = (sequelize, DataTypes) => {
  var CourseCategory = sequelize.define('CourseCategory', {
    index: DataTypes.INTEGER,
    label: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    visibility: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    timestamps: false,
  });
  CourseCategory.associate = function(models) {
    CourseCategory.hasMany(models.Course, {
      foreignKey: 'category_id',
    });
    CourseCategory.hasMany(models.CategoryVersion, {
      foreignKey: 'category_id',
      as: 'versions',
    });
  };
  return CourseCategory;
};
