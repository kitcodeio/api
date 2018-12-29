module.exports = function(config) {
  const models = require('../models')(config);
  return {
    createEntry: async (model, data) => {
      let report;
      let entry = await models[model].create(data)
        .catch(err => {
          report = {
            statusCode: 422,
            error: err
          };
        });
      if (entry) report = {
        statusCode: 201,
        entity: entry
      };
      return report;
    },
    updateEntry: async (model, query, data) => {
      let report;
      let user = await models[model].findOne(query);
      if (user) {
        let result = await models[model].update(data, query)
          .catch(err => {
            report = {
              statusCode: 400,
              error: 'are you sure, you sent the right data?'
            };
          });
        if (!report) {
          if (result[0] !== 0) report = {
            statusCode: 200,
            message: 'update succesful'
          };
          else report = {
            statusCode: 422,
            message: 'nothing was updated'
          };
        }
      } else report = {
        statusCode: 422,
        error: 'invalid id'
      };
      return report;
    },
    readEntry: async (model, method, query) => {
      let report, error;
      let entity = await models[model][method](query)
        .catch(err => {
          report = {
            statusCode: 500,
            error: err
          };
        });
      if (!report) report = {
        statusCode: 200,
        entity: entity
      };
      return report;
    },
    deleteEntry: async (model, id) => {
      let report;
      let entity = await models[model].findById(id);
      if (entity) {
        try {
          await models[model].destroy({
            where: {
              id: id
            }
          });
          report = {
            statusCode: 200,
            message: 'delete succesful'
          };
        } catch (err) {
          report = {
            statusCode: 405,
            error: err
          };
        }
      } else {
        report = {
          statusCode: 400,
          error: 'invalid id'
        };
      }
      return report;
    }
  }
}
