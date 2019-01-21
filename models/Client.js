const crypto = require('../utils/crypto');
const jwt = require('../utils/jwt');

var Client = (function() {

  var config;
  var schema;

  function Client(_config, _schema) {
    this.name = 'Client';
    config = _config;
    schema = _schema;
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
    if (!client.verified) return;

    return {
      token: jwt.generate(client, config.secret.jwt)
    };
  };

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
  }

  return Client;

}());

module.exports = Client;
