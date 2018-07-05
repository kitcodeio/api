'use strict';

const env = process.env.NODE_ENV || 'development';
const jwt = require('jsonwebtoken');
const config = require('../config/serverconfig.json');

module.exports = (sequelize, DataTypes) => {
  var Client = sequelize.define('Client', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true
    },
    name: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true
      }
    },
    role_type: DataTypes.STRING,
    password_hash: DataTypes.STRING,
    salt: DataTypes.STRING,
    verified: DataTypes.BOOLEAN,
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
        }, config[env].jwtsecret);
      }
    }
  });
  Client.associate = function(models) {
    Client.hasMany(models.Image, {
      foreignKey: 'client_id'
    });
    Client.belongsTo(models.Subdomain, {
      foreignKey: 'subdomain'
    });
  };
  return Client;
};
