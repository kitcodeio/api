const db = require('./db');
const models = require('../models');

module.exports = {
  make: async (req, res) => {
    let model = req.params.model;
    let data = req.body;
    let response = await db.createEntry(model, data);
    res.status(response.status).send(response);
  },
  study: {
    one: {
      course: async (req, res) => {
        let id = req.params.id;
        let response = await db.readEntry('Course', 'findAll', {
          where: {
            category_id: id
          }
        });
        res.status(response.status).send(response);
      },
      section: async (req, res) => {
        let id = req.params.id;
        let response = await db.readEntry('CourseSection', 'findAll', {
          where: {
            course_id: id
          },
          include: {
            model: models.CourseChapter
          }
        });
        res.status(response.status).send(response);
      },
      chapter: async (req, res) => {
        let id = req.params.id;
        let response = await db.readEntry('CourseChapter', 'findAll', {
          where: {
            section_id: id
          }
        });
        res.status(response.status).send(response);
      },
      usercourse: async (req, res) => {
        let result = await db.readEntry('Course', 'findOne', {
          where: {
            id: req.params.id
          }
        });
        result.entity = result.entity.toJSON();
        if (req.query.id) {
          let userCourse = await db.readEntry('UserCourse', 'count', {
	    where: {
	      client_id: req.query.id,
	      course_id: req.params.id
	    }
	  });
	  if (userCourse.entity == 1) result.entity.status = 'purchased';
	  else result.entity.status = 'not purchased'
        } else {
          result.entity.status = 'auth required'
        }
        res.status(result.status).send(result);
      }
    },
    all: async (req, res) => {
      let response = await db.readEntry('CourseCategory', 'findAll', {
        where: {
          visibility: true
        }
      });
      res.status(response.status).send(response);
    }
  },
  remove: async (req, res) => {
    let id = req.params['id'];
    let model = req.params['model'];
    let report = await db.deleteEntry(model, id);
    res.status(report.status).send(report);
  },
  signup: async (req, res) => {
    let report = {
      status: 200
    };
    let user = await db.readEntry('Client', 'findAll', {
      where: {
        id: req.user.id
      },
      attributes: ['credit']
    });
    if (user.entity[0].credit > 0) {
      let result = await db.readEntry('UserCourse', 'count', {
        where: {
          client_id: req.user.id,
          course_id: req.params.id
        }
      });
      if (result.entity == 0) {
        let userCourse = await db.createEntry('UserCourse', {
          client_id: req.user.id,
          course_id: req.params.id
        });
        let newCredit = await db.updateEntry('Client', {
          where: {
            id: req.user.id
          }
        }, {
          credit: user.entity[0].credit - 1
        });
        report = {
          status: 200,
          entity: 'course signup successful'
        };
      } else {
        report = {
          status: 200,
          entity: 'user has already subscribed for this course'
        };
      }
    } else {
      report = {
        status: 403,
        error: 'no more free credits left'
      }
    }
    res.status(report.status).send(report);
  } 
}
