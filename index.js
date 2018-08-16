const Inert = require('inert');
const JWT = require('hapi-auth-jwt2');
const Routes = require('./lib/routes');
const Validate = require('./lib/validate');
const Sockets = require('./lib/socket');
const env = process.env.NODE_ENV || 'staging';

var apiConfig = require("./config/config.json")[env];

exports.register = async function(plugin, options, next) {
  config = options.config || apiConfig;
  config.db = apiConfig.db;
  const io = require('socket.io')(plugin.listener);

  plugin.register([Inert, JWT], function(err) {
    if (err) throw err;
    plugin.auth.strategy('jwt', 'jwt', {
      key: config.jwtsecret,
      validateFunc: Validate,
      verifyOptions: {
        algorithms: ['HS256']
      }
    });
    plugin.route(Routes(config));
    io.on('connection', Sockets);
  });
  return next();
}

exports.register.attributes = {
  pkg: require('./package.json')
};
