const fs = require('fs');

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
  create: {
    user: async (req, res) => {
      let imagedetail;
      let data = req.body;
      let reponse = await db.createEntry('User', data);
      res.status(response.status).send(response);
    },
    image: async (req, res) => {
      let userid = req.user._id || 'asdaskugfiuesf'; //needs to be dynamic after the use of jwt
      let Dockerfile = req.body;
      let err = await fs.writeFile('./dockerfiles/Dockerfile', Dockerfile);
      if(!err) {
        //use dockerode and create dockerfile and get id
      }
      let response = await db.createEntry('Image', {userid: userid, imageid: 'adsfasdfsaf'}); 
      res.status(response.status).send(response);
    },
    container: async (req, res) => {
      let imageid = req.body.imageid;
      //let container = await create container;
      //let data = container.start
      let reponse = await db.updateEntry('Image', {imageid: imageid},{
        $push: {
	  containers: 'kugaerfiuerf' //containerid
	}
      });
      res.status(response.status).send(response);
    }
  },
  update: async (req, res) => {
    let _id = req.body._id;
    let data = req.body.data;
    let model = req.params['model'];
    let response = await db.updateEntry(model,{ _id: _id }, data);
    res.status(response.status).send(response);
  },
  read: async (req, res) => {
      let userid = req.user._id || 'asdaskugfiuesf';
      let model = req.params['model'];
      let query = (model=='User' ? {_id:userid} : {userid:userid});
      let response = await db.readEntry(model, query);
      res.status(response.status).send(response);
  },
  delete: {
    image: async (req, res) => {
      let imageid = req.params['id'];
      //remove image
      //after success response
      let image = await db.readEntry('Image',{imageid: imageid});
      let response = await db.deleteEntry('Image',image._id);
      res.status(response.status).send(response);
    },
    container: async (req, res) => {
      let containerid = req.params['id'];
      //remove container
      //after success response
      let response = await db.updateEntry('Image', {
        $pull: {
	  containers: 'kugaerfiuerf'
	}
      });
      res.status(res.status).send(response);
    }
  }
}
