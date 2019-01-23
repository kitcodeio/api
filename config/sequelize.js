const env = require('../.env.json').env;
const config = require('./config.json');

module.exports = config.db[env];
