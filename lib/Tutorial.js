'use strict';

var Tutorial = (function() {

  let config, db, docker;

  async function approveTutorial(tutorial_id, label, user_id) {
    let image_name = [];

    let modules = await db.readEntry('Category', 'findAll', {
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

    modules.entity = JSON.parse(JSON.stringify(modules.entity));
    
    for(let i =0; i < modules.entity.length; i++) {
      if (modules.entity[i].parent_id) modules.entity[0].parent = await fetchParent(modules.entity[0].parent_id);
      else image_name.push(modules.entity[i].label.toLowerCase());
    }

    if (!modules.entity) return db.updateEntry('Tutorial', {
      where: {
        id: tutorial_id
      }
    }, {
      approved: false,
      status: 'error in building image'
    });

    image_name = image_name.sort().join('_').replace(' ', '-');

    let image = await db.readEntry('Image', 'findOne' ,{
      where: {
        label: image_name
      }
    });

    if (image.entity) return db.updateEntry('Tutorial', {
      where: {
        id: tutorial_id
      }
    }, {
      image_id: image.entity.toJSON().id,
      status: 'live'
    });

    let response = await db.createEntry('Image', {
      user_id: user_id,
      label: image_name
    });

    if (response.statusCode == 201) {
      await db.updateEntry('Tutorial', {
        where: {
          id: tutorial_id
        }
      }, {
        image_id: response.entity.toJSON().id,
        status: 'building image'
      });
      let image = await docker.buildImage(response.entity.toJSON().id, user_id, modules.entity, null, tutorial_id);
      if (image.statusCode !== 200) db.updateEntry('Tutorial', {
        where: {
          id: tutorial_id
        }
      }, {
        approved: false,
        status: 'error in building image'
      });
    }

  }

  function Tutorial(_config, _db, _docker) {
    config = _config;
    db = _db;
    docker = _docker;
  }

  Tutorial.prototype.create = async function(request, reply) {
    let data = request.payload;
    data.submitted_by = request.auth.credentials.id;
    data.approved = false;
    let tutorial = await db.createEntry('Tutorial', data);
    let tags = data.arr.map(category => ({
      category_id: category.id,
      tutorial_id: tutorial.entity.id
    }));
    reply(tutorial).code(tutorial.statusCode);
    await db.models.TutorialTags.bulkCreate(tags, {
      fields: ['category_id', 'tutorial_id']
    });
    //approveTutorial(tutorial.entity.id, tutorial.entity.label, request.auth.credentials.id);
  };

  Tutorial.prototype.read = async function(request, reply) {
    let user = request.auth.credentials;
    let category_id = request.params.id;
    let tutorials = await db.readEntry('Tutorial', 'findAll', {
      where: user ? ((user.role_type == 'admin') ? {} : {
        approved: true
      }) : {
        approved: true
      },
      include: category_id ? [{
        model: db.models.TutorialTags,
        where: {
          category_id
        }
      }] : []
    });
    reply(tutorials).code(tutorials.statusCode);
  };

  Tutorial.prototype.delete = async function(request, reply) {
    let tutorial_id = request.params.id;
    let tutorial = await db.readEntry('Tutorial', 'findOne', {
      where: {
        id: tutorial_id
      }
    });
    if (!tutorial.entity) return {
      statusCode: 404
    };
    tutorial = tutorial.entity.toJSON();
    let result = {
      statusCode: 200
    };
    if (tutorial.status == 'live') result = await docker.removeImage(tutorial.image_id);
    if (result.statusCode == 200) await db.deleteEntry('Tutorial', tutorial_id);
    return reply(result).code(result.statusCode);

  };

  Tutorial.prototype.approve = function(request, reply) {
    let {
      id,
      label
    } = request.payload;
    reply({
      statusCode: 200
    }).code(200);
    approveTutorial(id, label, request.auth.credentials.id);

  };

  Tutorial.prototype.detail = async function(request, reply) {
    let id = request.params.id;
    let tutorial = await db.readEntry('Tutorial', 'findOne', {
      where: {
        id: id,
        status: 'live'
      },
      include: [{
        model: db.models.Image,
        include: [{
          model: db.models.Container,
          where: {
            user_id: request.auth.credentials.id
          }
        }]
      }]
    });
    reply(tutorial).code(tutorial.statusCode);

  };

  return Tutorial;

}());

module.exports = Tutorial;
