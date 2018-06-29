'use strict';
module.exports = (sequelize, DataTypes) => {
  var Course = sequelize.define('Course', {
    name: DataTypes.STRING
  }, {
    timestamps: false
  });
  Course.associate = function(models) {
    // associations can be defined here
  };
  return Course;
};
