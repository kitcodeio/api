const Inert = require('inert');
const JWT = require('hapi-auth-jwt2');
const Cookie = require('hapi-auth-cookie');
const Routes = require('./lib/routes');
const Socket = require('./lib/Socket');
const strategy = require('./lib/strategy');

exports.register = async function(plugin, options, next) {
  const config = options.config;
  const io = new Socket(config, plugin.listener).io;

  await plugin.register([Inert, JWT, Cookie,]);
  strategy.register(plugin, config);
  plugin.route(Routes(config, io));

  return next();
};

exports.register.attributes = {
  pkg: require('./package.json'),
};
