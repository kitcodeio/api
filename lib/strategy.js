const Validate = require('./validate');

exports.register = function(plugin, config) {
  plugin.auth.strategy('jwt', 'jwt', {
    key: config.secret.jwt,
    validateFunc: Validate,
    verifyOptions: {
      algorithms: ['HS256',],
    },
  });
};
