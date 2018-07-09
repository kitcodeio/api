'use strict';
module.exports = (sequelize, DataTypes) => {
  var Subdomain = sequelize.define('Subdomain', {
    salt: DataTypes.STRING,
    occupied: DataTypes.BOOLEAN
  }, {
    timestamps: false
  });
  Subdomain.associate = function(models) {
    Subdomain.hasMany(models.Container,{
      foreignKey: 'subdomain'
    });
  };
  return Subdomain;
};
