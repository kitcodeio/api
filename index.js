const Inert = require('inert');
const JWT = require('hapi-auth-jwt2');
const Routes = require('./lib/routes');
const Sockets = require('./lib/socket');
const strategy = require('./lib/strategy');

exports.register = async function(plugin, options, next) {
  const config = options.config;
  const io = require('socket.io')(plugin.listener); 
  io.on('connection', Sockets(config));
  await plugin.register([Inert, JWT,]);
  strategy.register(plugin, config);
  plugin.route(Routes(config, io));
  return next();
};

exports.register.attributes = {
  pkg: require('./package.json'),
};
