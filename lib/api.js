const fs = require('fs');
const Docker = require('dockerode');

const db = require('./db');
const crypto = require('./crypto');
const models = require('../models');

const docker = new Docker({
  socketPath: '/var/run/docker.sock'
});

module.exports = {
  login: async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    let response = await db.readEntry('Client', 'findOne', {
      where: {
        email: email
      }
    });
    if (response.entity) {
      let client = response.entity.toJSON();
      if (crypto.md5(password, client.salt) == client.password_hash) {
        res.status(200).send({
          'token': client.token
        });
      } else res.status(403).send({
        error: 'incorrect password'
      });
    } else {
      res.status(403).send({
        error: 'invalid email'
      });
    }
  },
  create: {
    client: async (req, res) => {
      let data = req.body;
      data.salt = crypto.generateSalt();
      data.password_hash = crypto.md5(data.password, data.salt);
      delete data.password;
      let response = await db.createEntry('Client', data);
      if (response.entity) response.data = {
        token: response.entity.token
      };
      else response.data = {
        error: response.error.errors[0].message
      };
      res.status(response.status).send(response.data);
    },
    image: async (req, res) => {
      let client_id = req.user.id;
      let label = req.body.label;
      let Dockerfile = req.body.file;
      let response;
      let err = await fs.writeFileSync('./dockerfiles/Dockerfile', Dockerfile);
      if (!err) {
        response = await db.createEntry('Image', {
          client_id: client_id,
          label: label
        });
        console.log(response);
        if (response.status == 200) {
          docker.buildImage({
            context: __dirname + '/../dockerfiles',
            src: ['Dockerfile']
          }, {
            t: response.entity.id + ""
          }, (err, stream) => {
            if (err || !stream) {
              db.deleteEntry('Image', response.entity.toJSON().id);
            } else
              stream.pipe(process.stdout);
          });
          res.status(response.status).send(response);
        } else res.status(response.status).send(response);
      }
    },
    container: async (req, res) => {
      let image_id = req.body.image_id;
      let response;
      //let image = await db.readEntry('Image', 'findOne', {
      //  where: {
      //    id: image_id
      //  }
      //});
      //if (!!image.entity.toJSON().client_id == req.user.id) {
      docker.run(image_id, ['bash', 'start.sh'], process.stdout, {
        tty: false
      }, async (err, data, container) => {
        console.log(container);
        if (!err) {
          response = await db.createEntry('Container', {
            image_id: image_id,
            container_id: container.id
          });
          res.status(response.status).send(response);
        } else res.status(500).send(err);
      });
      //}
    }
  },
  update: async (req, res) => {
    let id = req.body.id;
    let data = req.body.data;
    let model = req.params['model'];
    let response = await db.updateEntry(model, {
      id: id
    }, data);
    res.status(response.status).send(response);
  },
  read: async (req, res) => {
    let client_id = req.user.id;
    let model = req.params['model'];
    let query = {};
    switch (model) {
      case 'Image':
        query = {
          where: {
            client_id: client_id
          },
          include: {
            model: models.Container
          }
        };
        break;
      case 'Course':
        query = {
          include: {
            model: models.CourseLink,
            order: [
              ['index', 'ASC']
            ]
          }
        };
    }
    let response = await db.readEntry(model, 'findAll', query);
    res.status(response.status).send(response);
  },
  delete: {
    image: async (req, res) => {
      let id = req.params['id'];
      let client_id = req.user.id;
      let image = await db.readEntry('Image', 'findAll', {
        where: {
          id: id
        }
      });
      if (image.entity[0].client_id == client_id) {
        response = await db.deleteEntry('Image', id);
        res.status(response.status).send(response);
      } else res.status(403).send({
        'error': 'UnauthorizedError: u are not entitled to delete this image'
      });
    },
    container: async (req, res) => {
      let container_id = req.params['id'];
      let container = docker.getContainer(container_id);
      container.remove(async (err, data) => {
        if (!err) {
          let entity = await db.readEntry('Container', {
            container_id: container_id
          });
          let response = await db.deleteEntry('Container', entity.entity[0].id);
          res.status(response.status).send(response);
        } else res.status(422).send({
          error: err.json.message
        });;
      });
    }
  },
  submit: async (req, res) => {
    let link = req.body;
    let response = await db.createEntry('CourseLink', link);
    res.status(response.status).send(response);;
  }
}
