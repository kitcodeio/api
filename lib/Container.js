'use strict';

const Models = require('../models');

var Container = (function() {

  var config, models, subdomain, docker, db;

  async function verifyImage(tutorial_id, user_id, image_id) {
    let image_name = [];
    let modules;
    let fetchParent = async id => {
      let parent = await db.readEntry('Category', 'findOne', {
        where: { id },
        include: [{
          model: db.models.CategoryVersion,
          as: 'versions'
        }] 
      });

      parent = JSON.parse(JSON.stringify(parent.entity));

      if (parent.parent_id) parent.parent = await fetchParent(parent.parent_id);
      image_name.push(parent.label.toLowerCase());
      return parent;
    };

    let fetchModules = async () => {
      modules = await db.readEntry('Category', 'findAll', {
        include: [{
          model: db.models.CategoryVersion,
          as: 'versions'
        }, {
          model: db.models.TutorialTags,
          where: {
            tutorial_id
          }
        }],
        attributes: ['label', 'parent_id']
      });

      modules.entity = JSON.parse(JSON.stringify(modules.entity));
    
      for(let i =0; i < modules.entity.length; i++) {
        if (modules.entity[i].parent_id) modules.entity[0].parent = await fetchParent(modules.entity[0].parent_id);
        else image_name.push(modules.entity[i].label.toLowerCase());
      }     
    
      image_name = image_name.sort().join('_').replace(' ', '-');
    };

    if (!image_id) {
      await fetchModules();

      let _image = (await models.Image.fetch({
        label: image_name
      }));

	    if (_image)  image_id = _image.id;

	    console.log(user_id, image_name);

      if(!image_id) image_id = (await models.Image.create(user_id, image_name)).id;

    }

    let info = await docker.inspect(image_id, 'image');
    let image;

    if (info.error) {
      if (!modules) await fetchModules();
      if (!modules.entity) {
          db.updateEntry('Tutorial', {
          where: {
            id: tutorial_id
          }
        }, {
          approved: false,
          status: 'error in building image'
        });

        return;
      }

      image = await docker.buildImage(image_id, user_id, modules.entity, null, tutorial_id);

      if (image.statusCode == 200){
        db.updateEntry('Tutorial', {
          where: {
            id: tutorial_id
          }
        }, {
          approved: true,
          status: 'live'
        });
        info = {};
      }
    }

    if (info) return image_id;
    return;
  }

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
      error: 'try again later, while we fire the dev'
    };
    let course_id = request.payload.course_id;
    let user_id = request.auth.credentials.id;
    let container_data = await models.Container.fetchByTutorial(course_id, user_id);
    let sub, salt, course_detail, container, modules;

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
                subdomain: container_data.subdomain
              }
            };
            
            return reply(report).code(report.statusCode);
          } else await docker.stopContainer(container_data.id);
        } else await docker.stopContainer(container_data.id);
      } else await docker.stopContainer(container_data.id);
    } 
 
    try {
      sub = await subdomain.get();
      salt = sub.toJSON().salt;
      course_detail = await db.readEntry('Tutorial', 'findOne', {
        where: {
          id: course_id
        }
      });

      let image_id = await verifyImage(course_id, course_detail.entity.submitted_by, course_detail.entity.image_id);

      modules = await db.readEntry('Category', 'findAll', {
        include: [{
          model: db.models.Category,
          as: 'parent',
          include: {
            model: db.models.CategoryVersion,
            as: 'versions'
          },
          attributes: ['parent_id']
        }, {
          model: db.models.CategoryVersion,
          as: 'versions'
        }, {
          model: db.models.TutorialTags,
          where: {
            tutorial_id: course_id
          }
        }],
        attributes: ['parent_id']
      });
      modules = modules.entity;

      course_detail.entity = course_detail.entity.toJSON();

      container = await models.Container.create({
        tutorial_id: course_id,
        user_id: user_id,
        base_image: image_id,
        container_id: image_id,
        image_id: null,
        state: 'closed'
      });
      
      let command = {};

      modules.forEach(module => {
        if (module.parent_id) command[module.id] = module.versions[0].command;
      });

      modules = [];

      for (let key in command) modules.push(command[key]);

      report = await docker.startContainer(container.id, container.container_id, salt, modules);
    } catch (e) {
      report = {
        statusCode: 500,
        error: 'no free subdomains left, try again later'
      };
    }

    return reply(report).code(report.statusCode);
  };

  Container.prototype.read = async function(request, reply) {
    let { by, id, page } = request.query;
    let containers;
    try{
      containers = await models.Container.fetchAll(by, id, page, request.auth.credentials.id);
    } catch (err) { 
      
      return reply(err).code(500);
    }
    
    return reply(containers);
  };

  /*
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
  */

  return Container;

}());

module.exports = Container;
