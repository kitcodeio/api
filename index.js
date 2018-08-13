const Inert = require('inert');
const JWT = require('hapi-auth-jwt2');

const Routes = require('./lib/route');

async function validate(decoded, request, cb) {
  return cb(null, true)
}

exports.register = async function(plugin, options, next) {
  const config = options.config;
  await plugin.register([Inert, JWT]);
  plugin.auth.strategy('jwt', 'jwt', {
    key: config.jwtsecret,
    validateFunc: validate,
    verifyOptions: {
      algorithms: ['HS256']
    }
  });
  plugin.route(Routes);
  return next();
}

exports.register.attributes = {
  pkg: require('./package.json')
};
