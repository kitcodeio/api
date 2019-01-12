'use strict';

module.exports = config => {
  const models = require('../models')(config);
  const db = require('./db')(config);
  const docker = require('./docker')(config);

  async function approveTutorial(tutorial_id, label) {
    let Dockerfile = await docker.generateDockerFile(user_id).catch(err => {
      db.updateEntry('Tutorial', {
        where: {
          id: tutorial_id
        }
      }, {
        status: 'error in generating dockerfile'
      });
    });
    if (typeof dockerFile !== 'string') return;
    let admin_id = 'a3bb0dc4-906e-4de1-850e-4db3c9a9771d';
    let response = await db.createEntry('Image', {
      client_id: admin_id,
      label: label,
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
      let image = await docker.buildImage(response.entity.toJSON().id, admin_id, Dockerfile, null, tutorial_id);
      if (image.statusCode !== 200) db.updateEntry('Tutorial', {
        where: {
          id: tutorial_id
        }
      }, {
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
      await models.TutorialTags.bulkCreate(tags, {
        fields: ['category_id', 'tutorial_id']
      });
      approveTutorial(tutorial.entity.id, tutorial.entity.label);
    },
    async read(request, reply) {
      try {
        let user = request.auth.credentials;
        let category_id = request.params.id;
        let tutorials = await db.readEntry('Tutorial', 'findAll', {
          where: user ? ((user.role_type == 'admin') ? {} : {
            approved: true,
          }) : {
            approved: true,
          },
          include: category_id ? [{
            model: models.TutorialTags,
            where: {
              category_id
            }
          }] : []
        });
        reply(tutorials).code(tutorials.statusCode);
      } catch (err) {
        console.log(err);
      }
    },
    async approve(request, reply) {
      let {
        id,
        label
      } = request.payload;
      reply({
        statusCode: 200
      }).code(200);
      approveTutorial(id, label);
    },
  };
};
