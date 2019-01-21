'use strict';

const Models = require('../models');
const crypto = require('../utils/crypto');
const redis = require('./redis').client;

var Client = (function() {

  var models, config, mail;

  function Client(_config, _mail) {
    config = _config,
    mail = _mail;
    models = Models(config);
  }

  Client.prototype.create = async function(request, reply) {
    let data = request.payload;
    let client = await models.Client.create(data);

    if (!client) return reply({
      error: 'email already in use',
    }).code(403);

    reply({
      message: 'account creation success',
      email: client.email,
    });

    let token = crypto.generateSalt();
    redis.set(token, client.email);
    mail.send({
      email: [client.email, ],
      type: 'verification',
      options: {
        token,
      },
    });
  };

  return Client;

}());

module.exports = Client;
