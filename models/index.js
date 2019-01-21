'use strict';

const fs = require('fs');
const path = require('path');
const Schema = require('../schema');
const basename = path.basename(__filename);



module.exports = config => {
  const models = {};

  let schema = Schema(config);

  fs.readdirSync(__dirname)
    .filter(file => {
      return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(file => {
      let Model = require(path.join(__dirname, file));
      let model = new Model(config, schema);
      models[model.name] = model;
    });

  return models;

}

