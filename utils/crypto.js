'use strict';

const crypto = require('crypto');

module.exports = {
  generateSalt: (len) => {
    return crypto.randomBytes(len || 127).toString('hex');
  },
  hash: (password, salt, algo) => {
    let hash = crypto.createHmac(algo || 'SHA256', salt);
    hash.update(password);
    let value = hash.digest('hex');
    return value;
  }
};
