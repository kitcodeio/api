const fs = require('fs');
const Docker = require('dockerode');
const shelljs = require('shelljs');
const multer = require('multer');

const db = require('./db');
const crypto = require('./crypto');
const models = require('../models');
const stat = require('./stats');

const docker = new Docker({
  socketPath: '/var/run/docker.sock'
});
const store = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, __dirname + '/../uploads');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '.' + file.originalname);
  }
});
const upload = multer({
  storage: store
}).single('file');

async function getDomain() {
  let subdomain = await db.readEntry('Subdomain', 'findAll', {
    where: {
      occupied: false
    },
    limit: 1
  });
  return subdomain
}

async function createContainer(container_data, salt) {
  let container = await startContainer(container_data.id, container_data.container_id, salt);
  nginx(container.ip, salt);
  if (container.status == 200)
    report = {
      status: 200,
      entity: {
        kide: salt + '-kide.kitcode.io',
        terminal: salt + '-terminal.kitcode.io',
        app: salt + '-app.kitcode.io'
      }
    };
  else report = {
    status: container.status,
    error: container.error
  }
  return report;

}

async function startContainer(entry_id, container_id, salt) {
  let output = await shelljs.exec('docker run -d ' + container_id + ' bash start.sh ' + entry_id + ' ' + salt, {
    silent: true
  });
  id = output.stdout.replace("\n", "").substring(0, 12);
  let container = docker.getContainer(id);
  let data = await container.inspect();
  let newContainer = await db.updateEntry('Container', {
    where: {
      id: entry_id
    }
  }, {
    container_id: container.id,
    state: 'idle',
    ip: data.NetworkSettings.IPAddress,
    subdomain: salt
  });
  let domain = await db.updateEntry('Subdomain', {
    where: {
      salt: salt
    }
  }, {
    occupied: true
  });
  if (newContainer.status == 200 && domain.status == 200) {
    stat.makeIdle(entry_id);
    return {
      status: 200,
      ip: data.NetworkSettings.IPAddress,
      id: id
    };
  } else return {
    status: 500,
    error: 'try again later, while we fire the dev'
  }
}

function nginx(ip, salt) {
  let virtualhost = __dirname + '/virtualhost.sh';
  shelljs.exec("sudo bash " + virtualhost + " " + salt + " " + ip, {
    silent: true
  });
}

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
      data.role_type = 'user';
      let response = await db.createEntry('Client', data);
      if (response.entity) {
        response.data = {
          token: response.entity.token
        };
      } else {
        try {
          response.data = {
            error: response.error.errors[0].message
          };
        } catch (err) {
          console.log(err);
          response.data = {
            error: response.error
          };

        }
      }
      res.status(response.status).send(response.data);
    },
    image: async (req, res) => {
      let client_id = req.user.id;
      let label = req.body.label;
      let Dockerfile = req.body.file;
      let response;
      let err = await fs.writeFileSync(__dirname + '/../dockerfiles/Dockerfile', Dockerfile);

      if (!err) {
        response = await db.createEntry('Image', {
          client_id: client_id,
          label: label
        });
        if (response.status == 201) {
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
      let report = {
        status: 500,
        error: 'try again later, while we fire the dev'
      };
      let course_id = req.body.course_id;
      let user_id = req.user.id;
      let userCourse = await db.readEntry('UserCourse', 'findAll', {
        where: {
          client_id: user_id,
          course_id: course_id
        },
        attributes: ['id']
      });
      if (userCourse.entity.length !== 0) {
        let container_data = await db.readEntry('Container', 'findAll', {
          where: {
            client_id: user_id,
            course_id: course_id
          }
        });
        if (container_data.entity.length !== 0) {
          container_data = container_data.entity[0].toJSON();
          if (container_data.state == 'closed') {
            try {
              let subdomain = await getDomain();
              let salt = subdomain.entity[0].toJSON().salt;
              report = await createContainer(container_data, salt);
            } catch (e) {
              console.log(e);
            }
          } else {
            report = {
              status: 200,
              entity: {
                kide: container_data.subdomain + '-kide.kitcode.io',
                terminal: container_data.subdomain + '-terminal.kitcode.io',
                app: container_data.subdomain + '-app.kitcode.io'
              }
            };
          }
        } else {
          try {
            let subdomain = await getDomain();
            let salt = subdomain.entity[0].toJSON().salt;
            let course_detail = await db.readEntry('Course', 'findOne', {
              where: {
                id: course_id
              }
            });
            course_detail.entity = course_detail.entity.toJSON();
            let container = await db.createEntry('Container', {
              course_id: course_id,
              client_id: user_id,
              container_id: course_detail.entity.image_id,
            });
            report = await createContainer(container.entity.toJSON(), salt);
          } catch (e) {
            console.log(e);
          }
        }
      } else report = {
        status: 403,
        error: 'you need to buy the course first'
      };
      res.status(report.status).send(report);
    },
    subdomain: async (req, res)=> {
      let subdomain = req.body.subdomain;
      let response = await db.createEntry('Subdomain', {
        salt: subdomain,
	occupied: false
      });
      res.status(response.status).send(response);
    }
  },
  update: async (req, res) => {
    let id = req.body.id;
    let data = req.body.data;
    let model = req.params['model'];
    let response = await db.updateEntry(model, {
      where: {
        id: id
      }
    }, data);
    res.status(response.status).send(response);
  },
  read: {
    image: async (req, res) => {
      let client_id = req.user.id;
      let response = await db.readEntry('Image', 'findAll', {
        where: {
          client_id: client_id
        }
      });
      res.status(response.status).send(response);
    },
    subdomain: async (req, res) => {
      let client_id = req.user.id;
      let response = await db.readEntry('Subdomain', 'findAll', {});
      res.status(response.status).send(response);
    }
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
        'error': 'you didn\'t say the magic spell'
      });
    }
  },
  upload: async (req, res) => {
    let err = await upload(req, res);
    if (err) console.log(err);
    else res.status(200).send({
      msg: "ho gis"
    });
  },
  //pnf = page not found
  pnf: (req, res) => {
    res.status(404).send({
      error: 'this route is a unicorn, it dosen\'t exist'
    });
  }
}
