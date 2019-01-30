'use strict';

const Op = require('sequelize').Op;

const Auth = require('./Auth');
const Subdomain = require('./Subdomain');
const Client = require('./Client');
const Container = require('./Container');
const Image = require('./Image');
const Docker = require('./Docker');
const Tutorial = require('./Tutorial');
const Stats = require('./Stats');

const Db = require('./db');
const Mail = require('./mail');
const Aws = require('./aws');

const crypto = require('../utils/crypto');

var Api = (function () {

  var db, stat, docker, mail, aws;

  function Api(config, io) { 
    db = Db(config);
    mail = Mail(config);
    aws = Aws(config);

    stat = new Stats(config);
    docker = new Docker(config, stat, db);

    this.auth = new Auth(config);
    this.subdomain = new Subdomain(config, aws);
    this.client = new Client(config, mail);
    this.container = new Container(config, this.subdomain, docker, db);
    this.image = new Image(config, docker, io);
    this.tutorial = new Tutorial(config, db, docker);
  }

  Api.prototype.update = async function(request, reply) {
    let id = request.payload.id;
    let data = request.payload.data;
    let model = request.params['model'];
    let query = { id, };
    switch (model) {
    case 'Container':
      query = {
        subdomain: id,
      };
    }
    let response = await db.updateEntry(model, {
      where: query,
    }, data);
    reply(response).code(response.statusCode);
  };

  Api.prototype.search = async function(request, reply) {
    let model = request.params.model;
    let attribute;
    let attributes = ['id',];
    switch (model) {
    case 'Client':
      attribute = 'email';
      attributes.push('name', 'email');
      break;
    default:
      attribute = 'label';
      attributes.push('label');
    }
    let result = await db.readEntry(model, 'findAll', {
      where: {
        [attribute]: {
          [Op.like]: '%' + request.query.term + '%',
        },
      },
      attributes: attributes,
      limit: 5,
    });
    reply(result.entity).code(result.statusCode);
  };

  Api.prototype.upload = async function(request, reply) {
    let payload = request.payload;
    let filename = payload.file.hapi.filename;
    filename = crypto.generateSalt(16) + filename.slice(filename.lastIndexOf('.'));
    let location = await aws.s3(`${payload.model}/${filename}`, payload.file);
    reply({
      statusCode: 200,
      path: location,
    });
  };

  return Api;
}());

module.exports = Api;
