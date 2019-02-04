'use strict';
module.exports = (sequelize, DataTypes) => {
  var Category = sequelize.define('Category', {
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
  Category.associate = function(models) {

    Category.hasMany(models.CategoryVersion, {
      foreignKey: 'category_id',
      as: 'versions',
    });

    Category.hasMany(models.TutorialTags, {
      foreignKey: 'category_id',
    });

    Category.belongsTo(Category, {
      foreignKey: 'parent_id',
      as: 'parent'
    });
  };
  return Category;
};
