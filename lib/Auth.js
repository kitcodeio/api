'use strict';

const jwt = require('jsonwebtoken');
const Request = require('request');

const crypto = require('./crypto');
const redis = require('./redis').client;

function Auth(config, db) {

  function generateToken(client, secret) {
    let expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    return jwt.sign({
      id: client.id,
      name: client.name,
      email: client.email,
      image: client.image,
      role_type: client.role_type,
      exp: parseInt(expiry.getTime() / 1000),
    }, secret);
  }

  async function check(err, res, data) {
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
          token: this.generateToken(client, config.secret.jwt),
        });
      } else {
        let salt = crypto.generateSalt();
        let password_hash = crypto.hash(crypto.generateSalt(), salt, 'md5');
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
          token: this.generateToken(new_client.entity, config.secret.jwt),
        });
      }
    } else reply({
      statusCode: 403,
      error: data.error.message,
    }).code(403);
  }

  this.simple = async function(request, reply) {
    let email = request.payload.email;
    let password = request.payload.password;
    let response = await db.readEntry('Client', 'findOne', {
      where: {
        email: email,
      },
    });
    if (response.entity) {
      let client = response.entity.toJSON();
      if (crypto.hash(password, client.salt, 'md5') == client.password_hash) {
        if (client.verified) reply({
          'token': generateToken(client, config.secret.jwt),
        });
        else reply({
          error: 'account not verified check your email account and try again later',
        }).code(403);
      } else reply({
        error: 'invalid email or password',
      }).code(403);
    } else {
      reply({
        error: 'invalid email or password',
      }).code(403);
    }
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
    Request(url, check);
  };

  this.verify = async function(request, reply) {
    let {
      token,
      verifyToken,
    } = request.query;
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

module.exports = Auth;
