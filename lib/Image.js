'use strict';

const Models = require('../models');

var Image = (function() {

  var config, models, io, docker;

  function Image(_config, _docker, _io) {
    config = _config;
    docker = _docker;
    io = _io;
    models = Models(config);
  }

  Image.prototype.create = async function(request, reply) {
    let user_id = request.auth.credentials.id;
    let label = request.payload.label;
    let Dockerfile = request.payload.file;
    let image = await models.Image.create(user_id, label);
    let imageId, credentialId;

    if (!image) return reply({
      error: 'unknow error occured'
    }).code(500);

    imageId = image.toJSON().id;
    credentialId = request.auth.credentials.id;
    image = await docker.buildImage(imageId, credentialId, Dockerfile, io);

    if (image.statusCode == 200) return reply(image);

    return reply(image).code(image.statusCode);
  };

  Image.prototype.read = async function(request, reply) {
    let page = request.query.page || 1;
    let user_id = request.auth.credentials.id;
    let images = await models.Image.fetchAll(page, user_id);

    if (!images) return reply({
      error: 'unknow error occured'
    }).code(500);

    return reply(images);
  };

  return Image;

}());

module.exports = Image;
