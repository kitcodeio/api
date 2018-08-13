module.exports = [{
  method: 'GET',
  path: '/{path*}',
  config: {
    handler: {
      directory: {
        path: __dirname + "/../public"
      }
    }
  }
}, {
  method: 'GET',
  path: '/lol',
  config: {
    auth: 'jwt'
  },
  handler: (request, reply) => {
    reply('hello World');
  }
}];
