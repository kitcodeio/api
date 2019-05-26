'use strict';

const Models = require('../models');
const crypto = require('../utils/crypto');
const redis = require('./redis').client;

var User = (function() {

  var models, config, mail;

  function User(_config, _mail) {
    config = _config,
    mail = _mail;
    models = Models(config);
  }

  User.prototype.create = async function(request, reply) {
    let data = request.payload;
    let user = await models.User.create(data);
    let token;

    if (user == 'temporary_email') return reply({
      error: 'temporary email service providers are not accepted'
    }).code(403);

    if (!user) return reply({
      error: 'email already in use'
    }).code(403);

    reply({
      message: 'account creation success',
      email: user.email
    });

    token = crypto.generateSalt();
    redis.set(token, user.email);
    mail.send({
      email: [user.email],
      type: 'verification',
      options: {
        token
      }
    });
  };

  return User;

}());

module.exports = User;
