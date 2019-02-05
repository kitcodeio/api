'use strict';

const jwt = require('jsonwebtoken');

exports.generate = function (user, secret) {
  let expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);
  return jwt.sign({
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    role_type: user.role_type,
    exp: parseInt(expiry.getTime() / 1000),
  }, secret);
};
