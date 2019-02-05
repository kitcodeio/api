'use strict';
module.exports = (sequelize, DataTypes) => {
  const TutorialTags = sequelize.define('TutorialTags', {
  }, {
    timestamps: false
  });
  TutorialTags.associate = function(models) {
    TutorialTags.belongsTo(models.Tutorial, {
      foreignKey: 'tutorial_id'
    });
    TutorialTags.belongsTo(models.Category, {
      foreignKey: 'category_id'
    });
  };
  return TutorialTags;
};
