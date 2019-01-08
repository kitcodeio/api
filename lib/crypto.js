var crypto = require('crypto');

module.exports = {
  generateSalt: (len) => {
    return crypto.randomBytes(len || 127).toString('hex');
  },
  hash: (password, salt, algo) => {
    var hash = crypto.createHmac(algo || 'md5', salt);
    hash.update(password);
    var value = hash.digest('hex');
    return value;
  },
};
