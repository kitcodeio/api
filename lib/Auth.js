'use strict';

const Request = require('request-promise-native');

const Models = require('../models');
const redis = require('./redis').client;

var Auth = (function() {

  var config;
  var models;

  function Auth(_config) {
    config = _config;
    models = Models(config);
  }

  Auth.prototype.simple = async function(request, reply) {
    const { email, password, } = request.payload;
    const client = await models.Client.authenticate(email, password);

    if (!client) return reply({
      error: 'invalid email, password'
    }).code(403);

    if (!client.verified) return reply({
      error: 'email not verified'
    }).code(403);

    return reply({
      token: client.jwt
    });
  };

  Auth.prototype.social = async function(request, reply) {
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

    if (data.error || data.error_description) return reply({
      statusCode: 403,
      error: data.error.message
    }).code(403);

    let client = await models.Clinet.findOrCreate({
      name: data.name,
      email: data.email,
      image: request.payload.photoUrl,
      verfied: true
    });

    if (!client.verified) return reply({
      error: 'email not verfied'
    }).code(403);

    return reply({
      token: client.jwt
    });
  
  };

  Auth.prototype.verify = async function(request, reply) {
    const { token, verifyToken, } = request.query;
    if (verifyToken !== undefined) {
      let client = await redis.get(verifyToken);
      if (client == null) return reply({
        error: 'invalid authorization token'
      });
      await redis.del(verifyToken);

      return reply({
        email: client
      });
    } else if (token !== undefined) {
      let client = await redis.get(token);
      if (!client) return reply({
        error: 'invalid authorization token'
      });
      await models.Client.update(client, {
        verified: true
      });

      return reply.redirect('https://kitcode.io/#/root/verification_complete?token=' + token);
    } else return reply({
      error: 'authorization token missing'
    });
  };

  return Auth;

}());

module.exports = Auth;
