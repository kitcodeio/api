const crypto = require('../utils/crypto');
const jwt = require('../utils/jwt');

var Client = (function() {

  var config, schema;

  function Client(_config, _schema) {
    this.name = 'Client';
    config = _config;
    schema = _schema;
  }

  Client.prototype.create = async function(data) {
    let client;

    data.salt = crypto.generateSalt();
    data.password_hash = crypto.hash(data.password, data.salt, config.secret.algorithm);
    delete data.password;
    data.role_type = 'user';

    try {
      client = await schema.Client.create(data);
      return client;
    } catch (err) {

      return;
    }
  };

  Client.prototype.findOrCreate = async function(data) {
    let client = await schema.Client.findOne({
      where: {
        email: data.email,
      },
    });

    if (!client) {
      data.salt = crypto.generateSalt();
      data.password_hast = crypto.hash(crypto.generateSalt(), data.salt, config.secret.algorithm);
      delete data.password;
      data.role_type = 'user';
      client = await schema.Client.create(data);
    }

    delete client.salt;
    delete client.password_hash;
    client.jwt = jwt.generate(client, config.secret.jwt);
    
    return client;
  };

  Client.prototype.update = async function(email, data) {
    let client = await schema.Client.findOne({
      where: { email, },
    });

    if (!client) return {
      statusCode: 404,
    };
    let state = await schema.Client.upddate(data, {
      where: { email, },
    }).catch(error => state = { error, });

    if(state.error) return state;
    
    return {
      statusCode: 200,
    };
  };

  Client.prototype.authenticate = async function(email, password) {
    let client = await schema.Client.findOne({
      where: {
        email: email,
      },
    });

    if (!client) return;
    client = client.toJSON();
    if (crypto.hash(password, client.salt, config.secret.algorithm) !== client.password_hash) return;

    delete client.salt;
    delete client.password_hash;
    client.jwt = jwt.generate(client, config.secret.jwt);

    return client;
  };

  return Client;

}());

module.exports = Client;
