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
    password: 'cookie_encryption_password_secure',
    isSecure: false,
    clientId: config.auth.facebook.id,
    clientSecret: config.auth.facebook.secret,
  });
}
