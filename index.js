const Inert = require('inert');
const JWT = require('hapi-auth-jwt2');
const Routes = require('./lib/routes');
const Validate = require('./lib/validate');
const Sockets = require('./lib/socket');
var config = require("./config/config.json");

exports.register = async function(plugin, options, next) {
  config = options.config || config;
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
