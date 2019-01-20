const dbms = require('./db');
const Op = require('sequelize').Op;

var db = {};

module.exports = function(config) {
  db = dbms(config);
  return {
    make: {
      all: async (request, reply) => {
        let model = request.params.model;
        let data = request.payload;
        let response = await db.createEntry(model, data);
        reply(response).code(response.statusCode);
      },
      versions: async (request, reply) => {
        let res = await db.models.CategoryVersion.bulkCreate(request.payload, {
          fields: ['id', 'category_id', 'version', 'command',],
          updateOnDuplicate: ['version', 'command',],
        }).catch(err => console.log(err));
        reply(res);
      },
    },
    study: {
      one: {
        course: async (request, reply) => {
          let id = request.params.id;
          let response = await db.readEntry('Course', 'findAll', {
            where: {
              category_id: id,
            },
            order: [
              ['index',],
            ],
          });
          reply(response).code(response.statusCode);
        },
        section: async (request, reply) => {
          let id = request.params.id;
          let response = await db.readEntry('CourseSection', 'findAll', {
            where: {
              course_id: id,
            },
            include: {
              model: db.models.CourseChapter,
            },
            order: [
              ['index',],
            ],
          });
          reply(response).code(response.statusCode);
        },
        chapter: async (request, reply) => {
          let id = request.params.id;
          let response = await db.readEntry('CourseChapter', 'findAll', {
            where: {
              section_id: id,
            },
            order: [
              ['index',],
            ],
          });
          reply(response).code(response.statusCode);
        },
        usercourse: async (request, reply) => {
          let result = await db.readEntry('Course', 'findOne', {
            where: {
              id: request.params.id,
            },
          });
          if (result.entity !== null) {
            result.entity = result.entity.toJSON();
            if (request.query.id) {
              let userCourse = await db.readEntry('UserCourse', 'count', {
                where: {
                  client_id: request.query.id,
                  course_id: request.params.id,
                },
              });
              if (userCourse.entity == 1) result.entity.status = 'purchased';
              else result.entity.status = 'not purchased';
            } else {
              result.entity.status = 'auth required';
            }
          } else result = {
            statusCode: 404,
            error: 'course not found',
            message: 'invalid course id',
          };
          reply(result).code(result.statusCode);
        },
      },
      all: async (request, reply) => {
        let response = await db.readEntry('CourseCategory', 'findAll', {
          order: [
            ['index',],
          ],
          include: [{
            model: db.models.CategoryVersion,
            as: 'versions',
          },],
        });
        reply(response).code(response.statusCode);
      },
    },
    remove: async (request, reply) => {
      let id = request.params['id'];
      let model = request.params['model'];
      let report = await db.deleteEntry(model, id);
      reply(report).code(report.statusCode);
    },
    signup: async (request, reply) => {
      let report = {
        statusCode: 200,
      };
      let user = await db.readEntry('Client', 'findAll', {
        where: {
          id: request.auth.credentials.id,
        },
        attributes: ['credit',],
      });
      if (user.entity[0].credit > 0) {
        let result = await db.readEntry('UserCourse', 'count', {
          where: {
            client_id: request.auth.credentials.id,
            course_id: request.params.id,
          },
        });
        if (result.entity == 0) {
          let userCourse = await db.createEntry('UserCourse', {
            client_id: request.auth.credentials.id,
            course_id: request.params.id,
          });
          let newCredit = await db.updateEntry('Client', {
            where: {
              id: request.auth.credentials.id,
            },
          }, {
            credit: user.entity[0].credit - 1,
          });
          report = {
            statusCode: 200,
            entity: 'course signup successful',
          };
        } else {
          report = {
            statusCode: 200,
            entity: 'user has already subscribed for this course',
          };
        }
      } else {
        report = {
          statusCode: 403,
          error: 'no more free credits left',
        };
      }
      reply(report).code(report.statusCode);
    },
    search: async (request, reply) => {
      let model = request.params.model;
      let result = await db.readEntry(model, 'findAll', {
        where: {
          label: {
            [Op.like]: '%' + request.query.term + '%',
          },
        },
        attributes: ['id', 'label',],
        limit: 5,
      });
      reply(result.entity).code(result.statusCode);
    },
  };
};
