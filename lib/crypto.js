var crypto = require('crypto');

module.exports = {
  generateSalt: () => {
    console.log('humko bula rae h');
    return crypto.randomBytes(127).toString('hex');
  },
  md5: (password, salt) => {
    var hash = crypto.createHmac('md5', salt);
    hash.update(password);
    var value = hash.digest('hex');
    return value;
  }
}
