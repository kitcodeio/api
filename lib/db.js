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
      if (model == 'User') {
        result.salt = null;
        result.passwordhash = null;
        result.password = null;
      }
      report = {
        status: 200,
        message: model + ' create succesful',
        entity: result
      };
    }
    return report;
  },
  updateEntry: async (model, _id, data) => {
    let report;
    let result = await models[model].findOneAndUpdate({
        _id: _id
      }, data, {
        new: true
      })
      .catch(err => {
        report = {
          err: 422,
          message: 'inavlid _id'
        };
      });
    if (result) {
      report = {
        status: 200,
        message: model + ' update succesful',
        entity: result
      };
    }
    return report;
  },
  readEntry: async (model, _id) => {
    let report;
    let result = await models[model].find({
        _id: _id
      })
      .catch(err => {
        report = {
          status: 422,
          message: 'inavlid _id'
        };
      });
    if (result) {
      report = {
        status: 200,
        message: model + ' read succesful',
        entity: result
      };
    }
    return report;
  },
  deleteEntry: async (model, _id) => {
    let report;
    let result = await models[model].findByIdAndRemove(_id)
      .catch(err => {
        report = {
          status: 422,
          message: 'invalid _id'
        };
      });
    if (result == undefined || result == null) {
      report = {
        status: 422,
        message: 'invalid _id'
      };
    } else {
      report = {
        status: 200,
        message: model + ' delete succesful',
        entity: result
      }
    }
    return report;
  }
}
