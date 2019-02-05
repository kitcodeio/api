'use strict';

var Container = (function() {

  var config, schema;

  function Container(_config, _schema) {
    this.name = 'Container';
    config = _config;
    schema = _schema;
  }

  Container.prototype.fetch = async function(id) {
    return schema.Container.findOne({
      where: { id,},
    });
  };

  Container.prototype.fetchByTutorial = async function(tutorial_id, user_id) {
    return schema.Container.findOne({
      where: { tutorial_id, user_id, },
    });
  };

  Container.prototype.fetchAll = async function(by, id, page, user_id, tutorial_id) {
    let query;
    switch (by) {
    case 'image':
      query = {
        where: {
          user_id,
          base_image: id,
        },
      };
      break;
    case 'container':
      query = {
        where: {
          id,
        },
        include: {
          model: schema.User,
          attributes: {
            exclude: ['password_hash', 'salt',],
          },
        },
      };
      break;
    case 'user':
      query = {
        where: {
          user_id,
        },
      };
      break;
    case 'tutorial':
      query = {
        where: {
          user_id,
          tutorial_id,
        },
      };
      break;
    default:
      query = {
        limit: 10,
        offset: 10 * ((page || 1) - 1),
      };
    }

    return await schema.Container.findAll(query);

  };

  Container.prototype.create = async function(data) {
    let container;
    try {
      container = await schema.Container.create(data);
    
      return container.toJSON();
    } catch (err) {
      return;
    }
  };

  Container.prototype.delete = function(id) {
    return schema.Container.destroy({
      where: { id, },
    });
  };

  return Container;

}());

module.exports = Container;
