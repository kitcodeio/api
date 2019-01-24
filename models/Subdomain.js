'use strict';

const Sequelize = require('sequelize');

var Subdomain = (function() {

  var config, schema;

  function Subdomain(_config, _schema) {
    this.name = 'Subdomain';
    config = _config;
    schema = _schema;
  }

  Subdomain.prototype.create = async function(salt) {
    let subdomain;
    try{
      subdomain = await schema.Subdomain.create({ salt, });
    } catch(err) { return; }
  
    return subdomain;
  };

  Subdomain.prototype.fetchAll = async function(page) {
    let subdomains;
    
    try{ 
      subdomains = await  schema.Subdomain.findAndCountAll({
        limit: 10,
        offset: 10 * (page - 1)
      });
    } catch(err) { return; }

    return subdomains;
  };

  Subdomain.prototype.get = async function() {
    let subdomain;
    
    try {
      subdomain = await schema.Subdomain.findOne({
        where: {
          occupied: false
        },
        order: [
          Sequelize.fn('RAND')
        ]
      });

      return subdomain;
    } catch (err) { return; }
  };

  return Subdomain;

}());

module.exports = Subdomain;
