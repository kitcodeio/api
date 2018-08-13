exports.register = function(plugin, options, next) {

  return next();
}

exports.register.attributes = {
  pkg: require('./package.json')
};
