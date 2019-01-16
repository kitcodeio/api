'use strict';

const Op = require('sequelize').Op;

const Auth = require('./Auth');
const Subdomain = require('./Subdomain');
const Client = require('./Client');
const Container = require('./Container');
const Image = require('./Image');

const Models = require('../models');
const Db = require('./db');
const Stat = require('./stats');
const Docker = require('./docker');
const Mail = require('./mail');
const Aws = require('./aws');

const crypto = require('./crypto');

function Api(config, io) {

  const models = Models(config);
  const db = Db(config);
  const stat = Stat(config);
  const docker = Docker(config, stat);
  const mail = Mail(config);
  const aws = Aws(config);

  this.auth = new Auth(config, db);
  this.subdomain = new Subdomain(config, db, aws);
  this.client = new Client(db, mail);
  this.container = new Container(config, db, models, this.subdomain, docker);
  this.image = new Image(config, db, io);

  this.update = async function(request, reply) {
    let id = request.payload.id;
    let data = request.payload.data;
    let model = request.params['model'];
    let query = {
      id: id,
    };
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

  this.search = async function(request, reply) {
    let model = request.params.model;
    let attribute;
    let attributes = ['id', ];
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

  this.upload = async function(request, reply) {
    let payload = request.payload;
    let filename = payload.file.hapi.filename;
    filename = crypto.generateSalt(16) + filename.slice(filename.lastIndexOf('.'));
    let location = await aws.s3(`${payload.model}/${filename}`, payload.file);
    reply({
      statusCode: 200,
      path: location,
    });
  };

};

module.exports = Api;
