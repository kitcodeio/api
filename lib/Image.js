'use strict';

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

module.exports = Image;
