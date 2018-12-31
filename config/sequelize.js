const config = require('./config.json');
const env = process.env.NODE_ENV || 'beta';

module.exports = config[env].db;
