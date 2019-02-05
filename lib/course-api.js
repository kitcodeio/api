const dbms = require('./db');
const Op = require('sequelize').Op;

var db = {};

module.exports = function(config) {
  db = dbms(config);
  return {
    make: {
      all: async (request, reply) => {
        let model = request.params.model;
        let data = request.payload;
        let response = await db.createEntry(model, data);
        reply(response).code(response.statusCode);
      },
      versions: async (request, reply) => {
        let res = await db.models.CategoryVersion.bulkCreate(request.payload, {
          fields: ['id', 'category_id', 'version', 'command', 'filename',],
          updateOnDuplicate: ['version', 'command', 'filename',],
        }).catch(err => console.error(err));
        reply(res);
      },
    },
    study: {
      all: async (request, reply) => {
        let response = await db.readEntry('Category', 'findAll', {
          include: [{
            model: db.models.CategoryVersion,
            as: 'versions',
          },],
        });
        reply(response).code(response.statusCode);
      },
    },
    remove: async (request, reply) => {
      let id = request.params['id'];
      let model = request.params['model'];
      let report = await db.deleteEntry(model, id);
      reply(report).code(report.statusCode);
    },
    search: async (request, reply) => {
      let model = request.params.model;
      let result = await db.readEntry(model, 'findAll', {
        where: {
          label: {
            [Op.like]: '%' + request.query.term + '%',
          },
        },
        attributes: ['id', 'label',],
        limit: 5,
      });
      reply(result.entity).code(result.statusCode);
    },
  };
};
