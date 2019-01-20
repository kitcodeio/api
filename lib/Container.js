'use strict';

function Container(config, db, subdomain, docker) {

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
            model: db.models.Client,
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

module.exports = Container;
