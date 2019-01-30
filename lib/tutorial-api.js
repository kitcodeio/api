'use strict';

const Docker = require('./Docker');

module.exports = config => {
  const db = require('./db')(config);
  const docker = new Docker()(config);

  async function approveTutorial(tutorial_id, label, user_id) {
    let modules = await db.readEntry('CourseCategory', 'findAll', {
      include: [{
        model: db.models.CourseCategory,
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
          tutorial_id
        }
      }],
      attributes: ['parent_id']
    });

    if(!modules.entity) return db.updateEntry('Tutorial', {
      where: {
        id: tutorial_id
      }
    }, {
      approved: false,
      status: 'error in building image'
    });

    let response = await db.createEntry('Image', {
      client_id: user_id,
      label: label
    });
    if (response.statusCode == 201) {
      let update = await db.updateEntry('Tutorial', {
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

  return {
    async create(request, reply) {
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
      approveTutorial(tutorial.entity.id, tutorial.entity.label, request.auth.credentials.id);
    },
    async read(request, reply) {
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
    },
    async delete(request, reply) {
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
    },
    async approve(request, reply) {
      let {
        id,
        label
      } = request.payload;
      reply({
        statusCode: 200
      }).code(200);
      approveTutorial(id, label, request.auth.credentials.id);
    },
    async detail(request, reply) {
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
              client_id: request.auth.credentials.id
            }
          }]
        }]
      });
      reply(tutorial).code(tutorial.statusCode);
    }
  };
};
