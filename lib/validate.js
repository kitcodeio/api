module.exports = function(user, request, cb) {
  let path = request.path;
  if (user.role_type == 'admin') cb(null, true);
  else {
    if (path.includes('create/course') ||
      path.includes('create/api/Image') ||
      path.includes('delete') ||
      path.includes('read/api') ||
      path.includes('update') ||
      path.includes('run')) cb(null, false);
    else if (path.includes('search') && !path.includes('Course')) cb(null, false);
    else cb(null, true);
  }
};
