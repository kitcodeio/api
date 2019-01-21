'use strict';

const Request = require('request-promise-native');

const Models = require('../models');
const crypto = require('../utils/crypto');
const redis = require('./redis').client;

var Auth = (function() {

  function Auth(config, db) {

    const models = Models(config);
    
    this.simple = async function(request, reply) {
      const { email, password } = request.payload;
      const jwt = await models.Client.authenticate(email, password);

      if (!jwt) return reply({
        error: 'invalid email, password, or account may not be verified',
      }).code(403);
    
      return reply(jwt);
    };

    this.social = async function(request, reply) {
      let access_token, url;
      switch (request.payload.provider) {
        case 'FACEBOOK':
          access_token = request.payload.authToken;
          url = 'https://graph.facebook.com/v3.1/me?access_token=' + access_token + '&debug=all&fields=id%2Cname%2Cemail&format=json&method=get&pretty=0&suppress_http_code=1';
          break;
        case 'GOOGLE':
          access_token = request.payload.authToken;
          url = 'https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=' + access_token;
          break;
      }
      let data = await Request.get(url);
      data = JSON.parse(data);
      if (!data.error || !data.error_description) {
        let response = await db.readEntry('Client', 'findOne', {
          where: {
            email: data.email,
          },
        });
        if (response.entity) {
          let client = response.entity.toJSON();
          if (client[request.payload.provider.toLowerCase()] == null) {
            client.image = request.payload.photoUrl;
            db.updateEntry('Client', {
              where: {
                id: client.id,
              },
            }, {
              [request.payload.provider.toLowerCase()]: request.payload.id,
              image: request.payload.photoUrl,
              verified: true,
            });
          }
          reply({
            token: generateToken(client, config.secret.jwt),
          });
        } else {
          let salt = crypto.generateSalt();
          let password_hash = crypto.hash(crypto.generateSalt(), salt, config.secret.algorithm);
          let new_client = await db.createEntry('Client', {
            name: request.payload.name,
            email: request.payload.email,
            image: request.payload.photoUrl,
            role_type: 'user',
            password_hash,
            salt,
            [request.payload.provider.toLowerCase()]: request.payload.id,
            verified: true,
          });
          reply({
            token: generateToken(new_client.entity, config.secret.jwt),
          });
        }
      } else reply({
        statusCode: 403,
        error: data.error.message,
      }).code(403);
    };

    this.verify = async function(request, reply) {
      const { token, verifyToken } = request.query;
      if (verifyToken !== undefined) {
        let client = await redis.get(verifyToken);
        if (client == null) return reply({
          error: 'invalid authorization token',
        });
        await redis.del(verifyToken);
        return reply({
          email: client,
        });
      } else if (token !== undefined) {
        let client = await redis.get(token);
        if (!client) return reply({
          error: 'invalid authorization token',
        });
        await db.updateEntry('Client', {
          where: {
            email: client,
          },
        }, {
          verified: true,
        });
        reply.redirect('https://kitcode.io/#/root/verification_complete?token=' + token);
      } else return reply({
        error: 'authorization token missing',
      });
    };

  }

  return Auth;

}());

module.exports = Auth;
