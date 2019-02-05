'use strict';

const Models = require('../models');

var Container = (function() {

  var config, models, subdomain, docker, db;

  function Container(_config, _subdomain, _docker, _db) {
    config = _config;
    subdomain = _subdomain;
    docker = _docker;
    db = _db;
    models = Models(config);
  }

  Container.prototype.create = async function(request, reply) {
    let report = {
      statusCode: 500,
      error: 'try again later, while we fire the dev',
    };
    let course_id = request.payload.course_id;
    let user_id = request.auth.credentials.id;
    let container_data = await models.Container.fetchByTutorial(course_id, user_id);
    let sub, salt, course_detail, container, modules, name;

    if (container_data) {
      container_data = container_data.toJSON();
      if (container_data.state == 'idle' || container_data.state == 'active') {

        let info = await docker.inspect(container_data.container_id);

        if (!info.error){ 
          if (info.State.Status == 'running') {
            report = {
              statusCode: 200,
              entity: {
                container_id: container_data.id,
                subdomain: container_data.subdomain,
              },
            };
 
            return reply(report).code(report.statusCode);
          } else await docker.stopContainer(container_data.id);

        } else await models.Container.delete(container_data.id);
      } else docker.stopContainer(container_data.id);
    } 
 
    try {
      sub = await subdomain.get();
      salt = sub.toJSON().salt;
      course_detail = await db.readEntry('Tutorial', 'findOne', {
        where: {
          id: course_id,
        },
        include: [{
          model: db.models.Image,
          attributes: ['label',],
        },],
      });
      modules = await db.readEntry('Category', 'findAll', {
        include: [{
          model: db.models.Category,
          as: 'parent',
          include: {
            model: db.models.CategoryVersion,
            as: 'versions',
          },
          attributes: ['parent_id',],
        }, {
          model: db.models.CategoryVersion,
          as: 'versions',
        }, {
          model: db.models.TutorialTags,
          where: {
            tutorial_id: course_id,
          },
        },],
        attributes: ['parent_id',],
      });
      modules = modules.entity;

      course_detail.entity = course_detail.entity.toJSON();

      name = user_id + '_' + course_detail.entity.Image.label;

      container = await models.Container.create({
        tutorial_id: course_id,
        user_id: user_id,
        base_image: course_detail.entity.image_id,
        container_id: course_detail.entity.image_id,
        image_id: null,
        state: 'closed',
      });
      
      let command = {};

      modules.forEach(module => {
        if (module.parent_id) command[module.id] = module.versions[0].command;
      });

      modules = [];

      for (let key in command) modules.push(command[key]);

      report = await docker.startContainer(container.id, container.container_id, salt, modules, name);
    } catch (e) {
      report = {
        statusCode: 500,
        error: 'no free subdomains left, try again later',
      };
    }

    return reply(report).code(report.statusCode);
  };

  Container.prototype.read = async function(request, reply) {
    let { by, id, page, } = request.query;
    let containers;
    try{
      containers = await models.Container.fetchAll(by, id, page, request.auth.credentials.id);
    } catch (err) { 
      
      return reply(err).code(500);
    }
    
    return reply(containers);
  };

  Container.prototype.run = async function(request, reply) {
    let report = {
      statusCode: 500,
      error: 'try again later, while we fire the dev',
    };
    let container = await models.Container.fetch(request.params.id);
    let sub, salt;

    if (container) {
      container = container.toJSON();
      if (container.state !== 'closed') {
        report = {
          statusCode: 200,
          entity: {
            container_id: container.id,
            subdomain: container.subdomain,
          },
        }; 
        return reply(report).code(report.statusCode);
      }
 
      try {
        sub = await subdomain.get();
        salt = sub.toJSON().salt;
        report = await docker.startContainer(container.id, container.container_id, salt);
      } catch (e) {
        report = {
          statusCode: 500,
          error: 'no free subdomains left, try again later',
        };
      }

      return reply(report).code(report.statusCode);
    }

    let image = await models.Image.fetch(request.params.id);
    
    if (!image) return reply({
      statusCode: 500,
      error: 'image could not be found',
    }).code(500);

    try {
      sub = await subdomain.get();
      salt = sub.toJSON().salt;
      container = await models.Container.create({
        user_id: request.auth.credentials.id,
        base_image: request.params.id,
        container_id: request.params.id,
        image_id: null,
      });
      report = await docker.startContainer(container.id, container.container_id, salt);
    } catch (e) {
      report = {
        statusCode: 500,
        error: 'no free subdomains left, try again later',
      };
    }

    return reply(report).code(report.statusCode);
  };

  return Container;

}());

module.exports = Container;
