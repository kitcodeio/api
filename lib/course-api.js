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
      course: async () => {
        let id = req.params.id;
        let response = await db.readEntry('Course', 'findAll', {
          where: {
            category_id: id
          }
        });
        res.status(response.status).send(response);
      },
      section: async () => {
        let id = req.params.id;
        let response = await db.readEntry('CourseSection', 'findAll', {
          where: {
            course_id: id
          },
          include: {
            model: models.CourseChapter
          }
        });
      }
    },
    all: async (req, res) => {
      let response = await db.readEntry('CourseCategory', 'findAll', {});
      res.status(response.status).send(response);
    }
  }
}
