const jwt = require('jsonwebtoken');

exports.generate = function (client, secret) {
  let expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);
  return jwt.sign({
    id: client.id,
    name: client.name,
    email: client.email,
    image: client.image,
    role_type: client.role_type,
    exp: parseInt(expiry.getTime() / 1000),
  }, secret);
};
