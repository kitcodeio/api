const crypto = require('../utils/crypto');
const jwt = require('../utils/jwt');

var Client = (function() {

  function Client(config, schema) {
    
    this.name = 'Client';
    
    this.authenticate = async function(email, password) {
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
    }
  
  }

  return Client;

}());

module.exports = Client;
