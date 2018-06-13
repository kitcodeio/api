const db = require('./db');
const crypto = require('./crypto');

module.exports = {
  login: async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    let response = await db.readEntry('User', { email: email });
    if (response.status == 200) {
      if (crypto.md5(password, response.entity[0].salt) == response.entity[0].passwordhash)
        res.status(200).send({'token': 'token will be sent here'});
      else res.status(403).send({message: 'incorrect password'});
    } else {
      res.status(403).send({message: 'invalid email'});
    }
  },
  create: async (req, res) => {
    let model = req.params['model'];
    let data = req.body;
    let reponse;
    switch (model) {
      case 'User':
        response = await db.createEntry(model, data);
        break;
    }
    res.status(response.status).send(response);
  },
  update: {},
  read: {},
  delete: {}
}
