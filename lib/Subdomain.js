'use strict';

const Models = require('../models');

var Subdomain = (function() {

  var config, aws, models;

  function Subdomain(_config, _aws) {
    config = _config;
    aws = _aws;
    models = Models(config);
  }

  Subdomain.prototype.create = async function(request, reply) {
    let subdomain, salt;

    try{
      subdomain = await aws.createSubdomain();
    } catch(err) {
      return reply({
        error: 'unknow error occured',
      }).code(500);
    }

    if (!subdomain) return reply({
      error: 'unknow error occured',
    }).code(500);
    salt = await models.Subdomain.create(subdomain);
    
    if (salt) return reply({ salt, });

    return reply({
      error: 'unknown error occured',
    }).code(500);
  };

  Subdomain.prototype.read = async function(request, reply) {
    let page = request.query.page || 1;
    let subdomains = models.Subdomain.fetchAll(page);

    if (subdomains) return reply(subdomains);

    return reply({
      error: 'unknown error occured',
    }).code(500);
  };

  Subdomain.prototype.get = async function() {
    let subdomain = await models.Subdomain.get();
    
    return subdomain;
  };

  return Subdomain;
}());

module.exports = Subdomain;
