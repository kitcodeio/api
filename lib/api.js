const db = require('./db');
const crypto = require('crypto');

module.exports = {
  login: async (req, res) => {
    let Email = req.body.Email;
    let password = req.body.Password;
    let response = db.readEntry('User', {email: email});
    if (response.status == 200) {
      if(crypto.md5(password,response.entity.salt)==response.entity.passwordhash)
        res.status(403).send({
	  message: 'incorrect password' 
	});
    } else {
      res.status(response.status).send(message: 'invalid email');
    }
  },
  create: async (req, res) => {},
  update: {},
  read: {},
  delete: {}
}
