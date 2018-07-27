const Op = require('sequelize').Op;

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
  search: async (req, res) => {
    let result = await db.readEntry('Course', 'findAll', {
      where: {
        label: {
          [Op.like]: '%' + req.query.term + '%'
        }
      },
      limit: 5
    });
    res.status(result.status).send(result.entity);
  }
}
