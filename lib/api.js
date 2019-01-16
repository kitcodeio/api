'use strict';

const fs = require('fs');
const Op = require('sequelize').Op;
const jwt = require('jsonwebtoken');
const Request = require('request');
const Sequelize = require('sequelize');

const Models = require('../models');
const Db = require('./db');
const Stat = require('./stats');
const Docker = require('./docker');
const Mail = require('./mail');
const Aws = require('./aws');

const crypto = require('./crypto');
const redis = require('./redis').client;

function Login(config, db) {

  function generateToken(client, secret) {
    let expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    return jwt.sign({
      id: client.id,
      name: client.name,
      email: client.email,
      image: client.image,
      role_type: client.role_type,
      exp: parseInt(expiry.getTime() / 1000),
    }, secret);
  }

  this.simple = async function(request, reply) {
    let email = request.payload.email;
    let password = request.payload.password;
    let response = await db.readEntry('Client', 'findOne', {
      where: {
        email: email,
      },
    });
    if (response.entity) {
      let client = response.entity.toJSON();
      if (crypto.hash(password, client.salt, 'md5') == client.password_hash) {
        if (client.verified) reply({
          'token': generateToken(client, config.secret.jwt),
        });
        else reply({
          error: 'account not verified check your email account and try again later',
        }).code(403);
      } else reply({
        error: 'invalid email or password',
      }).code(403);
    } else {
      reply({
        error: 'invalid email or password',
      }).code(403);
    }
  };

  this.social = async function(request, reply) {
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
            email: data.email,
          },
        });
        if (response.entity) {
          let client = response.entity.toJSON();
          if (client[request.payload.provider.toLowerCase()] == null) {
            client.image = request.payload.photoUrl;
            db.updateEntry('Client', {
              where: {
                id: client.id,
              },
            }, {
              [request.payload.provider.toLowerCase()]: request.payload.id,
              image: request.payload.photoUrl,
              verified: true,
            });
          }
          reply({
            token: this.generateToken(client, config.secret.jwt),
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
            verified: true,
          });
          reply({
            token: this.generateToken(new_client.entity, config.secret.jwt),
          });
        }
      } else reply({
        statusCode: 403,
        error: data.error.message,
      }).code(403);
    });
  };
}

function Client(config, db, mail) {

  this.create = async function(request, reply) {
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
      email: response.entity.email,
    };
    reply(response).code(response.statusCode);
    let token = crypto.generateSalt();
    redis.set(token, data.email);
    mail.send({
      email: [data.email, ],
      type: 'verification',
      options: {
        token,
      },
    });
  };
}

function Container(config, db, models, subdomain, docker) {

  this.create = async function(request, reply) {
    let report = {
      statusCode: 500,
      error: 'try again later, while we fire the dev',
    };
    let course_id = request.payload.course_id;
    let user_id = request.auth.credentials.id;
    let container_data = await db.readEntry('Container', 'findAll', {
      where: {
        client_id: user_id,
        tutorial_id: course_id,
      },
    });
    if (container_data.entity.length !== 0) {
      container_data = container_data.entity[0].toJSON();
      if (container_data.state == 'closed') {
        try {
          let subdomain = await subdomain.get();
          let salt = subdomain.entity.toJSON().salt;
          report = await docker.startContainer(container_data.id, container_data.container_id, salt);
        } catch (e) {
          report = {
            statusCode: 500,
            error: 'no free subdomains left, try again later',
          };
        }
      } else {
        report = {
          statusCode: 200,
          entity: {
            container_id: container_data.id,
            subdomain: container_data.subdomain,
          },
        };
      }
    } else {
      try {
        let subdomain = await subdomain.get();
        let salt = subdomain.entity.toJSON().salt;
        let course_detail = await db.readEntry('Tutorial', 'findOne', {
          where: {
            id: course_id,
          },
        });
        course_detail.entity = course_detail.entity.toJSON();
        let container = await db.createEntry('Container', {
          tutorial_id: course_id,
          client_id: user_id,
          base_image: course_detail.entity.image_id,
          container_id: course_detail.entity.image_id,
          image_id: null,
        });
        container = container.entity.toJSON();
        report = await docker.startContainer(container.id, container.container_id, salt);
      } catch (e) {
        report = {
          statusCode: 500,
          error: 'no free subdomains left, try again later',
        };
      }
    }

    return reply(report).code(report.statusCode);
  };

  this.read = async function(request, reply) {
    let {
      by,
      id,
      page,
    } = request.query;
    let query;
    switch (by) {
      case 'image':
        query = {
          where: {
            client_id: request.auth.credentials.id,
            base_image: id,
          },
        };
        break;
      case 'container':
        query = {
          where: {
            id: request.query.id,
          },
          include: {
            model: models.Client,
            attributes: {
              exclude: ['password_hash', 'salt', ],
            },
          },
        };
        break;
      case 'client':
        query = {
          where: {
            client_id: request.auth.credentials.id,
          },
        };
        break;
      default:
        query = {
          limit: 10,
          offset: 10 * ((page || 1) - 1),
        };
    }
    let containers = await db.readEntry('Container', 'findAndCountAll', query);
    reply(containers).code(containers.statusCode);

  };

  this.run = async function(request, reply) {
    let report = {
      statusCode: 500,
      error: 'try again later, while we fire the dev',
    };
    let container = await db.readEntry('Container', 'findOne', {
      where: {
        id: request.params.id,
      },
    });
    if (container.entity) {
      container = container.entity.toJSON();
      if (container.state == 'closed') {
        try {
          let subdomain = await subdomain.get();
          let salt = subdomain.entity.toJSON().salt;
          report = await docker.startContainer(container.id, container.container_id, salt);
        } catch (e) {
          report = {
            statusCode: 500,
            error: 'no free subdomains left, try again later',
          };
        }
      } else {
        report = {
          statusCode: 200,
          entity: {
            container_id: container.id,
            subdomain: container.subdomain,
          },
        };
      }

      return reply(report).code(report.statusCode);
    }

    let image = await db.readEntry('Image', 'findOne', {
      where: {
        id: request.params.id,
      },
    });
    if (!image.entity) return reply({
      statusCode: 500,
      error: 'image could not be found',
    }).code(500);
    try {
      let subdomain = await subdomain.get();
      let salt = subdomain.entity.toJSON().salt;
      container = await db.createEntry('Container', {
        client_id: request.auth.credentials.id,
        base_image: request.params.id,
        container_id: request.params.id,
        image_id: null,
      });
      container = container.entity.toJSON();
      report = await docker.startContainer(container.id, container.container_id, salt);
    } catch (e) {
      report = {
        statusCode: 500,
        error: 'no free subdomains left, try again later',
      };
    }

    return reply(report).code(report.statusCode);
  }
}

function Subdomain(config, db, aws) {

  this.create = async function(request, reply) {
    let subdomain = await aws.createSubdomain().catch(err => console.log(err));
    if (!subdomain) return reply({
      statusCode: 500,
      error: 'unknow error occured',
    }), code(500);
    let response = await db.createEntry('Subdomain', {
      salt: subdomain,
      occupied: false,
    });

    return reply(response).code(response.statusCode);
  };

  this.read = async function(request, reply) {
    let page = request.query.page || 1;
    let response = await db.readEntry('Subdomain', 'findAndCountAll', {
      limit: 10,
      offset: 10 * (page - 1),
    });

    return reply(response).code(response.statusCode);
  };

  this.get = async function() {
    let subdomain = await db.readEntry('Subdomain', 'findOne', {
      where: {
        occupied: false,
      },
      order: [
        Sequelize.fn('RAND'),
      ],
    });
    return subdomain;
  };
}

function Image(config, db, io) {

  this.create = async function(request, reply) {
    let client_id = request.auth.credentials.id;
    let label = request.payload.label;
    let Dockerfile = request.payload.file;
    let response = await db.createEntry('Image', {
      client_id: client_id,
      label: label,
    });
    if (response.statusCode == 201) {
      let image = await docker.buildImage(response.entity.toJSON().id, request.auth.credentials.id, Dockerfile, io);
      if (image.statusCode == 200) return reply(response).code(response.statusCode);

      return reply(image).code(image.statusCode);
    } else return reply(response).code(response.statusCode);
  };

  this.read = async function(request, reply) {
    let page = request.query.page || 1;
    let client_id = request.auth.credentials.id;
    let response = await db.readEntry('Image', 'findAndCountAll', {
      where: {
        client_id: client_id,
      },
      limit: 10,
      offset: 10 * (page - 1),
    });

    return reply(response).code(response.statusCode);

  }

}

function Api(config, io) {

  const models = Models(config);
  const db = Db(config);
  const stat = Stat(config);
  const docker = Docker(config, stat);
  const mail = Mail(config);
  const aws = Aws(config);

  this.login = new Login(config, db);
  this.subdomain = new Subdomain(config, db, aws);
  this.client = new Client(db, mail);
  this.container = new Container(config, db, models, this.subdomain, docker);
  this.image =  new Image(config, db, io);

  this.update = async function(request, reply) {
    let id = request.payload.id;
    let data = request.payload.data;
    let model = request.params['model'];
    let query = {
      id: id,
    };
    switch (model) {
      case 'Container':
        query = {
          subdomain: id,
        };
    }
    let response = await db.updateEntry(model, {
      where: query,
    }, data);
    reply(response).code(response.statusCode);
  };

  this.search = async function(request, reply) {
    let model = request.params.model;
    let attribute;
    let attributes = ['id', ];
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
          [Op.like]: '%' + request.query.term + '%',
        },
      },
      attributes: attributes,
      limit: 5,
    });
    reply(result.entity).code(result.statusCode);
  };

  this.upload = async function(request, reply) {
    let payload = request.payload;
    let filename = payload.file.hapi.filename;
    filename = crypto.generateSalt(16) + filename.slice(filename.lastIndexOf('.'));
    let location = await aws.s3(`${payload.model}/${filename}`, payload.file);
    reply({
      statusCode: 200,
      path: location,
    });
  };

  this.verify = async function(request, reply) {
    let {
      token,
      verifyToken,
    } = request.query;
    if (verifyToken !== undefined) {
      let client = await redis.get(verifyToken);
      if (client == null) return reply({
        error: 'invalid authorization token',
      });
      await redis.del(verifyToken);
      return reply({
        email: client,
      });
    } else if (token !== undefined) {
      let client = await redis.get(token);
      if (!client) return reply({
        error: 'invalid authorization token',
      });
      await db.updateEntry('Client', {
        where: {
          email: client,
        },
      }, {
        verified: true,
      });
      reply.redirect('https://kitcode.io/#/root/verification_complete?token=' + token);
    } else return reply({
      error: 'authorization token missing',
    });
  };

};

module.exports = Api;
