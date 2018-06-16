'use strict';

const config = require('../config/serverconfig.json');

module.exports = (sequelize, DataTypes) => {
  var Client = sequelize.define('Client', {
    name: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true
      }
    },
    passwordhash: DataTypes.STRING,
    salt: DataTypes.STRING,
    verified: DataTypes.BOOLEAN
  }, {
    getterMethods: {
      token() {
	let expiry = new Date();
	expiry.setDate(expiry.getDate() + 7);
        return jwt.sign({
	  id: this.id,
	  name: this.name,
	  email: this.email,
          exp: parseInt(expiry.getTime() / 1000)
	}, config.token);
      }
    }
  });
  Client.associate = function(models) {
    Client.hasMany(models.Image) {
      foreignKey: 'client_id'
    }
  };
  return Client;
};
