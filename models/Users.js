'use strict';

const crypto = require('../utils/crypto');
const jwt = require('../utils/jwt');

var User = (function() {

  var config, schema;

  function User(_config, _schema) {
    this.name = 'User';
    config = _config;
    schema = _schema;
  }

  User.prototype.create = async function(data) {
    let user;

    data.salt = crypto.generateSalt();
    data.password_hash = crypto.hash(data.password, data.salt, config.secret.algorithm);
    delete data.password;
    data.role_type = 'user';

    try {
      user = await schema.User.create(data);
      return user;
    } catch (err) {

      return;
    }
  };

  User.prototype.findOrCreate = async function(data) {
    let user = await schema.User.findOne({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      data.salt = crypto.generateSalt();
      data.password_hast = crypto.hash(crypto.generateSalt(), data.salt, config.secret.algorithm);
      delete data.password;
      data.role_type = 'user';
      user = await schema.User.create(data);
    }

    delete user.salt;
    delete user.password_hash;
    user.jwt = jwt.generate(user, config.secret.jwt);
    
    return user;
  };

  User.prototype.update = async function(email, data) {
    let user = await schema.User.findOne({
      where: { email,},
    });

    if (!user) return {
      statusCode: 404,
    };
    let state = await schema.User.update(data, {
      where: { email,},
    }).catch(error => state = { error,});

    if(state.error) return state;
    
    return {
      statusCode: 200,
    };
  };

  User.prototype.authenticate = async function(email, password) {
    let user = await schema.User.findOne({
      where: { email },
    });

    if (!user) return;
    user = user.toJSON();
    if (crypto.hash(password, user.salt, config.secret.algorithm) !== user.password_hash) return;

    delete user.salt;
    delete user.password_hash;
    user.jwt = jwt.generate(user, config.secret.jwt);

    return user;
  };

  return User;

}());

module.exports = User;
