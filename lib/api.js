const db = require('./db');

module.exports = {
    login: async (req, res) => {
        let Email = req.body.Email;
        let password = req.body.Password;
    },
    create: async (req, res) => {},
    update: {},
    read: {},
    delete: {}
}
