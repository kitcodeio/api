const Validate = require('./validate');

exports.register = function(plugin, config) {
  plugin.auth.strategy('jwt', 'jwt', {
    key: config.secret.jwt,
    validateFunc: Validate,
    verifyOptions: {
      algorithms: ['HS256']
    }
  });
  plugin.auth.strategy('facebook', 'bell', {
    provider: 'facebook',
    password: config.secret.cookie,
    isSecure: false,
    clientId: config.auth.facebook.id,
    clientSecret: config.auth.facebook.secret,
  });
  plugin.auth.strategy('google', 'bell', {
    provider: 'google',
    password: config.secret.cookie,
    isSecure: false,
    clientId: config.auth.google.id,
    clientSecret: config.auth.google.secret,
  });
}
