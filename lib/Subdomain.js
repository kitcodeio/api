'use strict';

const Sequelize = require('sequelize');

function Subdomain(config, db, aws) {

  this.create = async function(request, reply) {
    let subdomain = await aws.createSubdomain().catch(err => console.log(err));
    if (!subdomain) return reply({
      statusCode: 500,
      error: 'unknow error occured',
    }), code(500);
    let response = await db.createEntry('Subdomain', {
      salt: subdomain,
      occupied: false,
    });

    return reply(response).code(response.statusCode);
  };

  this.read = async function(request, reply) {
    let page = request.query.page || 1;
    let response = await db.readEntry('Subdomain', 'findAndCountAll', {
      limit: 10,
      offset: 10 * (page - 1),
    });

    return reply(response).code(response.statusCode);
  };

  this.get = async function() {
    let subdomain = await db.readEntry('Subdomain', 'findOne', {
      where: {
        occupied: false,
      },
      order: [
        Sequelize.fn('RAND'),
      ],
    });
    return subdomain;
  };

}

module.exports = Subdomain;
