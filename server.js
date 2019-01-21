const Hapi = require('hapi');

const plugin = require('./index');
const config = require('./config/config.json');
const env = require("./.env.json").env;

config.db = config.db[env];

const server = new Hapi.Server();
server.connection({
  host: config.server.api.host,
  port: config.server.api.port,
  routes: {
    cors: true,
  },
});

plugin.register(server, {
  config: config,
}, async function() {
  await server.start();
  console.log('kitcode api server is online at http://' + config.server.api.host + ':' + config.server.api.port);
});
