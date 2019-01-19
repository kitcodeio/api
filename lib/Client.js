'use strict';

const crypto = require('./crypto');
const redis = require('./redis').client;

function Client(config, db, mail) {

  this.create = async function(request, reply) {
    let data = request.payload;
    data.salt = crypto.generateSalt();
    data.password_hash = crypto.hash(data.password, data.salt, config.secret.algorithm);
    delete data.password;
    data.role_type = 'user';
    let response = await db.createEntry('Client', data);
    if (!response.entity) {
      try {
        response.error = response.error.errors[0].message;
      } catch (err) {
        response.error = response.error;
      }
    } else response.entity = {
      message: 'account creation success',
      email: response.entity.email,
    };
    reply(response).code(response.statusCode);
    let token = crypto.generateSalt();
    redis.set(token, data.email);
    mail.send({
      email: [data.email, ],
      type: 'verification',
      options: {
        token,
      },
    });
  };

};

module.exports = Client;
