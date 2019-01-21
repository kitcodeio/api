'use strict';

const Models = require('../models');
const crypto = require('../utils/crypto');
const redis = require('./redis').client;

function Client(config, db, mail) {

  const models = Models(config);

  this.create = async function(request, reply) {
    let data = request.payload;
    let client = await models.Client.create(data);

    if (!client) return reply({
      error: 'email already in use'
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

};

module.exports = Client;
