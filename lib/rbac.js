const db = require('../models');

String.prototype.contains = function() {
  return String.prototype.indexOf.apply(this, arguments) !== -1;
};

module.exports = () => {
  return async (req, res, next) => {
    let path = req.path;
    if (path.contains('login') || path.contains('register') || path.contains('read/course')) next();
    else {
      let user = req.user;
      if (user.role_type == 0) next();
      else {
        if (path.contains('create/course') ||
          path.contains('create/api/Image') ||
          path.contains('delete') ||
          path.contains('read/api') ||
          path.contains('update'))
          forbidden();
        else next();
      }
    }

    function forbidden() {
      res.status(403).send({
        error: "You do not have permission to perform the following action"
      });
    }
  }
};