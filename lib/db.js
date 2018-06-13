const models = require('../models/all-models');

module.exports = {
  createEntry: async (model, data) => {
    let report;
    let entry = new models[model](data);
    let result = await entry.save()
      .catch(err => {
        report = {
          status: 422,
          message: err.message
        };
      });
    if (result) {
      report = {
        status: 200,
        entity: result
      };
    }
    return report;
  },
  updateEntry: async function() {},
  readEntry: async function() {},
  deleteEntry: async function() {}
}
