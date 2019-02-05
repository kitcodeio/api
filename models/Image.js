'use strict';

var Image = (function() {

  var config, schema;

  function Image(_config, _schema) {
    this.name = 'Image';
    config = _config;
    schema = _schema;
  }

  Image.prototype.create = async function(user_id, label) {
    let image;
    try {
      image = await schema.Image.create({ user_id, label });

      return image;
    } catch (err) { return; }
  };

  Image.prototype.fetch = function(id) {
    return schema.Image.findOne({
      where: { id }
    });
  };

  Image.prototype.fetchAll = async function(page, user_id) {
    let images;
    try {
      images = schema.Image.findAndCountAll({
        where: { user_id},
        limit: 10,
        offset: 10 * (page - 1)
      });
      return images;
    } catch (err) { return; }
  };

  Image.prototype.destroy = async function(id) {
    let image;
    try {
      image = await schema.Image.findOne({
        where: { id }
      });
    } catch (err) { return; }
    
    if (!image) return;

    await schema.Image.destroy({
      where: { id }
    });

    return {
      statusCode: 200,
      message: 'image delete success'
    };

  };

  return Image;

}());

module.exports = Image;
