const fs = require("fs");
const Docker = require('dockerode');
const shelljs = require('shelljs');
const Op = require('sequelize').Op;
const jwt = require('jsonwebtoken');
const Request = require('request');
const Sequelize = require('sequelize');

const dbms = require('./db');
const crypto = require('./crypto');
const Stats = require('./stats');
const AWS = require('./aws');
const Mail = require('./mail');
const redis = require('./redis').client;

var mail = {};
var db = {};
var stat = {};
var aws = {};

const docker = new Docker({
  socketPath: '/var/run/docker.sock'
});

async function getDomain() {
  let subdomain = await db.readEntry('Subdomain', 'findOne', {
    where: {
      occupied: false
    },
    order: [
      Sequelize.fn('RAND')
    ]
  });
  return subdomain;
}

async function createContainer(container_data, salt) {
  let container = await startContainer(container_data.id, container_data.container_id, salt);
  nginx(container.ip, salt);
  if (container.statusCode == 200)
    report = {
      statusCode: 200,
      entity: {
        container_id: container_data.id,
        subdomain: salt
      }
    };
  else report = {
    statusCode: container.statusCode,
    error: container.error
  }
  return report;

}

async function startContainer(entry_id, container_id, salt) {
  let image = await docker.getImage(container_id).inspect().catch(() => {});
  if (!image) return {
    statusCode: 500,
    error: 'image does not exist'
  };
  let container = await docker.createContainer({
    Image: container_id,
    Cmd: ['/bin/bash', '/kide/start.sh']
  });
  await container.start();
  let data = await container.inspect();
  let newContainer = await db.updateEntry('Container', {
    where: {
      id: entry_id
    }
  }, {
    container_id: data.Config.Hostname,
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
      id: data.Config.Hostname
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

module.exports = function(config, io) {
  const models = require('../models')(config);
  db = dbms(config);
  stat = Stats(config);
  mail = Mail(config);
  aws = AWS(config);
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
          if (crypto.hash(password, client.salt, 'md5') == client.password_hash) {
            if (client.verified) reply({
              'token': generateToken(client, config.secret.jwt)
            });
            else reply({
              error: 'account not verified check your email account and try again later'
            }).code(403);
          } else reply({
            error: 'invalid email or password'
          }).code(403);
        } else {
          reply({
            error: 'invalid email or password'
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
              if (client[request.payload.provider.toLowerCase()] == null) {
                client.image = request.payload.photoUrl;
                db.updateEntry('Client', {
                  where: {
                    id: client.id
                  }
                }, {
                  [request.payload.provider.toLowerCase()]: request.payload.id,
                  image: request.payload.photoUrl,
                  verified: true
                });
              }
              reply({
                token: generateToken(client, config.secret.jwt)
              });
            } else {
              let salt = crypto.generateSalt();
              let password_hash = crypto.hash(crypto.generateSalt(), salt, 'md5');
              let new_client = await db.createEntry('Client', {
                name: request.payload.name,
                email: request.payload.email,
                image: request.payload.photoUrl,
                role_type: 'user',
                password_hash,
                salt,
                [request.payload.provider.toLowerCase()]: request.payload.id,
                verified: true
              });
              reply({
                token: generateToken(new_client.entity, config.secret.jwt)
              });
            }
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
        data.password_hash = crypto.hash(data.password, data.salt, 'md5');
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
        let token = crypto.generateSalt();
        redis.set(token, data.email);
        mail.send({
          email: [data.email],
          type: 'verification',
          options: {
            token
          }
        });
      },
      image: async (request, reply) => {
        let client_id = request.auth.credentials.id;
        let label = request.payload.label;
        let Dockerfile = request.payload.file;
        let response;
        let err = await fs.promises.writeFile(__dirname + '/../dockerfiles/Dockerfile', Dockerfile);
        if (err) return console.log(err);
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
              reply({
                error: err,
                statusCode: 422
              }).code(422);
            } else {
              docker.modem.followProgress(stream, (err, res) => {
                if (err) db.deleteEntry('Image', response.entity.toJSON().id);
                stat.getClientSockets(request.auth.credentials.id).forEach(id => {
                  let remote = io.sockets.connected[id];
                  if (remote) remote.emit('result', err);
                });
              }, evt => {
                if (evt.stream)
                  if (evt.stream !== '\n') {
                    stat.getClientSockets(request.auth.credentials.id).forEach(id => {
                      let remote = io.sockets.connected[id];
                      if (remote) remote.emit('show', evt.stream);
                    });
                  }
              });
              reply(response).code(response.statusCode);
            }
          });
        } else reply(response).code(response.statusCode);
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
                let salt = subdomain.entity.toJSON().salt;
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
                  container_id: container_data.id,
                  subdomain: container_data.subdomain
                }
              };
            }
          } else {
            try {
              let subdomain = await getDomain();
              let salt = subdomain.entity.toJSON().salt;
              let course_detail = await db.readEntry('Course', 'findOne', {
                where: {
                  id: course_id
                }
              });
              course_detail.entity = course_detail.entity.toJSON();
              let container = await db.createEntry('Container', {
                course_id: course_id,
                client_id: user_id,
                base_image: course_detail.entity.image_id,
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
        let subdomain = await aws.createSubdomain().catch(err => console.log(err));
        if (!subdomain) return reply({
          statusCode: 500,
          error: 'unknow error occured'
        }), code(500);
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
        let { by, id, page } = request.query;
        let query;
        switch (by) {
          case 'image':
            query = {
              where: {
                client_id: request.auth.credentials.id,
                base_image: id
              }
            };
            break;
          case 'container':
            query = {
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
            break;
	  case 'client':
	    query = {
	      where: {
	        client_id: request.auth.credentials.id
	      }
	    };
	    break;
	  default:
            query = {
              limit: 10,
              offset: 10 * ((page || 1) - 1)
            };
        }
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
      let payload = request.payload;
      let filename = payload.file.hapi.filename;
      filename = crypto.generateSalt(16) + filename.slice(filename.lastIndexOf('.'));
      let location = await aws.s3(`${payload.model}/${filename}`, payload.file);
      reply({
        statusCode: 200,
        path: location
      });
    },
    verify: async (request, reply) => {
      let {
        token,
        verifyToken
      } = request.query;
      if (verifyToken !== undefined) {
        let client = await redis.get(verifyToken);
        if (client == null) return reply({
          error: 'invalid authorization token'
        });
        await redis.del(verifyToken);
        return reply({
          email: client
        });
      } else if (token !== undefined) {
        let client = await redis.get(token);
        if (!client) return reply({
          error: 'invalid authorization token'
        });
        await db.updateEntry('Client', {
          where: {
            email: client
          }
        }, {
          verified: true
        });
        reply.redirect('https://kitcode.io/#/root/verification_complete?token=' + token);
      } else return reply({
        error: 'authorization token missing'
      });
    },
    ping: async (request, reply) => {
      const xFF = request.headers['x-forwarded-for']
      reply({
        ip: xFF ? xFF.split(',')[0] : request.info.remoteAddress
      });
    },
    run: async (request, reply) => {
      let report = {
        statusCode: 500,
        error: 'try again later, while we fire the dev'
      };
      let container = await db.readEntry('Container', 'findOne', {
        where: {
          id: request.params.id
        }
      });
      if (container.entity) {
        container = container.entity.toJSON();
        if (container.state == 'closed') {
          try {
            let subdomain = await getDomain();
            let salt = subdomain.entity.toJSON().salt;
            report = await createContainer(container, salt);
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
              container_id: container.id,
              subdomain: container.subdomain
            }
          };
        }
        return reply(report).code(report.statusCode);
      }
      let image = await db.readEntry('Image', 'findOne', {
        where: {
          id: request.params.id
        }
      });
      if (!image.entity) return reply({
        statusCode: 500,
        error: 'image could not be found'
      }).code(500);
      try {
        let subdomain = await getDomain();
        let salt = subdomain.entity.toJSON().salt;
        container = await db.createEntry('Container', {
          client_id: request.auth.credentials.id,
          base_image: request.params.id,
          container_id: request.params.id,
          image_id: null
        });
        report = await createContainer(container.entity.toJSON(), salt);
      } catch (e) {
        report = {
          statusCode: 500,
          error: 'no free subdomains left, try again later'
        };
      }
      reply(report).code(report.statusCode);
    }
  }
}
