const fs = require('fs');
const Docker = require('dockerode');
const shelljs = require('shelljs');
const multer = require('multer');
const Op = require('sequelize').Op;
const jwt = require('jsonwebtoken');
const Request = require('request');

const dbms = require('./db');
const crypto = require('./crypto');
const Stats = require('./stats');
const sub = require('./subdomain-generator');

var db = {};
var stat = {};

const docker = new Docker({
  socketPath: '/var/run/docker.sock'
});
const store = multer.diskStorage({
  destination: function(request, file, cb) {
    cb(null, __dirname + '/../uploads');
  },
  filename: function(request, file, cb) {
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
  if (container.statusCode == 200)
    report = {
      statusCode: 200,
      entity: {
        kide: salt + '-kide.kitcode.io',
        terminal: salt + '-terminal.kitcode.io',
        app: salt + '-app.kitcode.io'
      }
    };
  else report = {
    statusCode: container.statusCode,
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
    subdomain: salt,
    image_id: container_id.includes('-') ? null : container_id
  });
  let domain = await db.updateEntry('Subdomain', {
    where: {
      salt: salt
    }
  }, {
    occupied: true
  });
  if (newContainer.statusCode == 200 && domain.statusCode == 200) {
    stat.makeIdle(entry_id);
    return {
      statusCode: 200,
      ip: data.NetworkSettings.IPAddress,
      id: id
    };
  } else return {
    statusCode: 500,
    error: 'try again later, while we fire the dev'
  }
}

function nginx(ip, salt) {
  let virtualhost = __dirname + '/virtualhost.sh';
  shelljs.exec("sudo bash " + virtualhost + " " + salt + " " + ip, {
    silent: true
  });
}

function generateToken(client, secret) {
  let expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);
  return jwt.sign({
    id: client.id,
    name: client.name,
    email: client.email,
    image: client.image,
    role_type: client.role_type,
    exp: parseInt(expiry.getTime() / 1000)
  }, secret);

}

module.exports = function(config) {
  const models = require('../models')(config);
  db = dbms(config);
  stat = Stats(config);
  return {
    login: {
      simple: async (request, reply) => {
        let email = request.payload.email;
        let password = request.payload.password;
        let response = await db.readEntry('Client', 'findOne', {
          where: {
            email: email
          }
        });
        if (response.entity) {
          let client = response.entity.toJSON();
          if (crypto.md5(password, client.salt) == client.password_hash) {
            reply({
              'token': generateToken(client, config.secret.jwt)
            });
          } else reply({
            error: 'incorrect password'
          }).code(403);
        } else {
          reply({
            error: 'invalid email'
          }).code(403);
        }
      },
      social: async (request, reply) => {
        let access_token, url;
        switch (request.payload.provider) {
          case 'FACEBOOK':
            access_token = request.payload.authToken;
            url = 'https://graph.facebook.com/v3.1/me?access_token=' + access_token + '&debug=all&fields=id%2Cname%2Cemail&format=json&method=get&pretty=0&suppress_http_code=1';
            break;
          case 'GOOGLE':
            access_token = request.payload.authToken;
            url = 'https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=' + access_token;
            break;
        }
        Request(url, async function(err, res, data) {
          data = JSON.parse(data);
          if (!data.error || !data.error_description) {
            let response = await db.readEntry('Client', 'findOne', {
              where: {
                email: data.email
              }
            });
            if (response.entity) {
              let client = response.entity.toJSON();
              reply({
                token: generateToken(client, config.secret.jwt)
              });
            } else reply({
              statusCode: 403,
              error: 'this account is not registered with kitcode'
            }).code(403);
          } else reply({
            statusCode: 403,
            error: data.error.message
          }).code(403);
        });
      }
    },
    create: {
      client: async (request, reply) => {
        let data = request.payload;
        data.salt = crypto.generateSalt();
        data.password_hash = crypto.md5(data.password, data.salt);
        delete data.password;
        data.role_type = 'user';
        let response = await db.createEntry('Client', data);
        if (!response.entity) {
          try {
            response.error = response.error.errors[0].message;
          } catch (err) {
            response.error = response.error;
          }
        } else response.entity = {
          message: 'account creation success',
          email: response.entity.email
        }
        reply(response).code(response.statusCode);
      },
      image: async (request, reply) => {
        let client_id = request.auth.credentials.id;
        let label = request.payload.label;
        let Dockerfile = request.payload.file;
        let response;
        let err = await fs.writeFileSync(__dirname + '/../dockerfiles/Dockerfile', Dockerfile);

        if (!err) {
          response = await db.createEntry('Image', {
            client_id: client_id,
            label: label
          });
          if (response.statusCode == 201) {
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
            reply(response).code(response.statusCode);
          } else reply(response).code(response.statusCode);
        }
      },
      container: async (request, reply) => {
        let report = {
          statusCode: 500,
          error: 'try again later, while we fire the dev'
        };
        let course_id = request.payload.course_id;
        let user_id = request.auth.credentials.id;
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
                report = {
                  statusCode: 500,
                  error: 'no free subdomains left, try again later'
                };
              }
            } else {
              report = {
                statusCode: 200,
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
                image_id: null
              });
              report = await createContainer(container.entity.toJSON(), salt);
            } catch (e) {
              report = {
                statusCode: 500,
                error: 'no free subdomains left, try again later'
              };
            }
          }
        } else report = {
          statusCode: 403,
          error: 'you need to buy the course first'
        };
        reply(report).code(report.statusCode);
      },
      subdomain: async (request, reply) => {
        let subdomain = sub();
        let response = await db.createEntry('Subdomain', {
          salt: subdomain,
          occupied: false
        });
        reply(response).code(response.statusCode);
      }
    },
    update: async (request, reply) => {
      let id = request.payload.id;
      let data = request.payload.data;
      let model = request.params['model'];
      let query = {
        id: id
      };
      switch (model) {
        case 'Container':
          query = {
            subdomain: id
          };
      }
      let response = await db.updateEntry(model, {
        where: query
      }, data);
      reply(response).code(response.statusCode);
    },
    read: {
      image: async (request, reply) => {
        let page = request.query.page || 1;
        let client_id = request.auth.credentials.id;
        let response = await db.readEntry('Image', 'findAndCountAll', {
          where: {
            client_id: client_id
          },
          limit: 10,
          offset: 10 * (page - 1)
        });
        reply(response).code(response.statusCode);
      },
      subdomain: async (request, reply) => {
        let page = request.query.page || 1;
        let response = await db.readEntry('Subdomain', 'findAndCountAll', {
          limit: 10,
          offset: 10 * (page - 1)
        });
        reply(response).code(response.statusCode);
      },
      container: async (request, reply) => {
        let page = request.query.page || 1;
        let query = (!request.query.id) ? {
          limit: 10,
          offset: 10 * (page - 1)
        } : {
          where: {
            id: request.query.id
          },
          include: {
            model: models.Client,
            attributes: {
              exclude: ['password_hash', 'salt']
            }
          }
        };
        let containers = await db.readEntry('Container', 'findAndCountAll', query);
        reply(containers).code(containers.statusCode);
      }
    },
    delete: {
      image: async (request, reply) => {
        let id = request.params['id'];
        let client_id = request.auth.credentials.id;
        let image = await db.readEntry('Image', 'findAll', {
          where: {
            id: id
          }
        });
        if (image.entity.length !== 0) {
          if (image.entity[0].client_id == client_id) {
            response = await db.deleteEntry('Image', id);
            reply(response).code(response.statusCode);
          } else reply({
            'error': 'you didn\'t say the magic spell'
          }).code(403);
        } else {
          reply({
            statusCode: 422,
            error: 'invalid id'
          }).code(422);
        }
      }
    },
    search: async (request, reply) => {
      let model = request.params.model;
      let attribute;
      let attributes = ['id'];
      switch (model) {
        case 'Client':
          attribute = 'email';
          attributes.push('name', 'email');
          break;
        default:
          attribute = 'label';
          attributes.push('label');
      }
      let result = await db.readEntry(model, 'findAll', {
        where: {
          [attribute]: {
            [Op.like]: '%' + request.query.term + '%'
          }
        },
        attributes: attributes,
        limit: 5
      });
      reply(result.entity).code(result.statusCode);
    },
    upload: async (request, reply) => {
      let err = await upload(request, reply);
      if (err) console.log(err);
      else reply({
        msg: "ho gis"
      });
    }
  }
}
