const Inert = require('inert');
const JWT = require('hapi-auth-jwt2');

const Routes = require('./lib/route');
const Validate = require('./lib/validate');

exports.register = async function(plugin, options, next) {
  const config = options.config;
  plugin.register([Inert, JWT], function(err) {
    if (err) throw err;
    plugin.auth.strategy('jwt', 'jwt', {
      key: config.jwtsecret,
      validateFunc: Validate,
      verifyOptions: {
        algorithms: ['HS256']
      }
    });
    plugin.route(Routes);
  });
  return next();
}

exports.register.attributes = {
  pkg: require('./package.json')
};
