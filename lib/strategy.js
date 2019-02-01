const Validate = require('./validate');

exports.register = function(plugin, config) {
  plugin.auth.strategy('jwt', 'jwt', {
    key: config.secret.jwt,
    validateFunc: Validate,
    verifyOptions: {
      algorithms: ['HS256']
    }
  });

  plugin.app.cache = plugin.cache({
    segment: 'sessions',
    expiresIn: 3 * 24 * 60 * 60 * 1000
  });

  plugin.bind({
    cache: plugin.app.cache
  });

  plugin.auth.strategy('session', 'cookie', {
    password: 'hapissajafdhafdjahyfjkdgsyjasfydukfeyafdheavjdfaejmyfdja',
    cookie: 'sid-cuboid',
    redirectTo: false,
    isSecure: false,
    validateFunc: function(request, session, callback) {
      cache.get(session.sid, (err, cached) => {
        if (err) return callback(err, false);
        if (!cached) return callback(null, false);
        
        return callback(null, true, cached.account);
      });
    }
  });
};
