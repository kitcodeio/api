'use strict';

const env = process.env.NODE_ENV || 'development';
const jwt = require('jsonwebtoken');
const config = require('../config/serverconfig.json');

module.exports = (sequelize, DataTypes) => {
  var Client = sequelize.define('Client', {
    id: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: {
          args: /^([^0-9!<@#$%^,&*\-`~()_+=\/\\?}\]{\[>]*)$/,
          msg: 'oops! that doesn\'t look like a real name'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING,
      unique: true,
    },
    image: {
      type: DataTypes.STRING,
      dafaultValue: 'http://cdn.kitcode.io/default_pro_pic.png'
    },
    role_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    salt: {
      type: DataTypes.STRING,
      allowNull: false
    },
    github: DataTypes.STRING,
    twitter: DataTypes.STRING,
    angel: DataTypes.STRING,
    linkedin: DataTypes.STRING,
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
  }, {
    getterMethods: {
      token() {
        let expiry = new Date();
        expiry.setDate(expiry.getDate() + 7);
        return jwt.sign({
          id: this.id,
          name: this.name,
          email: this.email,
          role_type: this.role_type,
          exp: parseInt(expiry.getTime() / 1000)
        }, config[env].jwtsecret);
      }
    }
  });
  Client.associate = function(models) {
    Client.hasMany(models.Image, {
      foreignKey: 'client_id'
    });
    Client.hasMany(models.Container, {
      foreignKey: 'client_id'
    });
  };
  return Client;
};
