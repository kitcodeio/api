'use strict';

module.exports = config => {
  const models = require('../models')(config);
  const db = require('./db')(config);
  return {
    async create(request, reply) {
      let data = request.payload;
      data.submitted_by = request.auth.credentials.id;
      let tutorial = await db.createEntry('Tutorial', data);
      reply(tutorial).code(tutorial.statusCode);
    },
    async read(request, reply) {
      let user = request.auth.credentials;
      let tutorials = await db.readEntry('Tutorial', 'findAll', {
        where: (user.role_type=='admin')?{}:{
	  approved: true
	}
      });
      reply(tutorials).code(tutorials.statusCode);
    },
    async approve(request, reply) {
      let id = request.payload.id;
      let result = await db.updateEntry('Tutorial', {
        where: { id }
      }, {
        approved: request.payload.approved,
        tags: request.payload.tags
      });
      //create image
      reply(result).code(result.statusCode);
    }
  }
}
