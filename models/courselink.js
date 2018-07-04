'use strict';
module.exports = (sequelize, DataTypes) => {
  var CourseLink = sequelize.define('CourseLink', {
    link: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    title: DataTypes.STRING,
    index: DataTypes.INTEGER
  }, {
    timestamps: false
  });
  CourseLink.associate = function(models) {
    CourseLink.belongsTo(models.CourseSection, {
      foreignKey: 'section_id'
    });
  };
  return CourseLink;
};
