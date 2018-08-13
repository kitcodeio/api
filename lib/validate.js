String.prototype.contains = function() {
  return String.prototype.indexOf.apply(this, arguments) !== -1;
};

module.exports = function(user, request, cb) {
  let path = request.path;
  if (user.role_type == 'admin') cb(null, true);
  else {
    if (path.contains('create/course') ||
      path.contains('create/api/Image') ||
      path.contains('delete') ||
      path.contains('read/api') ||
      path.contains('update')) cb(null, false);
    else if (path.contains('search') &&
      !path.contains('Course')) cb(null, false);
    else cb(null, true)
  }
};
