const Inert = require('inert');
const JWT = require('hapi-auth-jwt2');
const Bell = require('bell');
const Routes = require('./lib/routes');
const Sockets = require('./lib/socket');
const strategy = require('./lib/strategy');
const env = process.env.NODE_ENV || 'staging';


exports.register = async function(plugin, options, next) {
  const config = options.config;
  const io = require('socket.io')(plugin.listener); 
  io.on('connection', Sockets(config));
  await plugin.register([Inert, Bell, JWT]);
  strategy.register(plugin, config);
  plugin.route(Routes(config));
  return next();
}

exports.register.attributes = {
  pkg: require('./package.json')
}
