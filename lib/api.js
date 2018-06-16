const fs = require('fs');
const jwt = require('jsonwebtoken');
const Docker = require('dockerode');

const db = require('./db');
const crypto = require('./crypto');
const config = require('../config.json');

const docker = new Docker({socketPath: '/var/run/docker.sock'});
const env = process.env.NODE_ENV || 'development';

module.exports = {
  login: async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    let response = await db.readEntry('User', { email: email });
    if (response.status == 200) {
      if (crypto.md5(password, response.entity[0].salt) == response.entity[0].passwordhash){
        response.entity[0].passwordhash = null;
	response.entity[0].salt = null;
        let expiry = new Date();
        expiry.setDate(expiry.getDate() + 7);
	response.entity[0].exp = parseInt(expiry.getTime() / 1000);
        res.status(200).send({'token': jwt.sign(response.entity[0].toJSON(),config[env].jwtsecret)});
      } else res.status(403).send({message: 'incorrect password'});
    } else {
      res.status(403).send({message: 'invalid email'});
    }
  },
  create: {
    user: async (req, res) => {
      let data = req.body;
      let response = await db.createEntry('User', data);
      res.status(response.status).send(response);
    },
    image: async (req, res) => {
      let user_id = req.user._id;
      let label = req.body.label;
      let Dockerfile = req.body.file;
      let response;
      let err = await fs.writeFileSync('./dockerfiles/Dockerfile', Dockerfile);
      if(!err) {
	response = await db.createEntry('Image', {user_id: user_id,label:label});
	if(response.status == 200){
          docker.buildImage({
            context: __dirname+'/../dockerfiles',
            src: ['Dockerfile']
          }, {t: response.entity._id+""},(err, stream) => {
            if (err){
	      db.deleteEntry('Image', response.entity._id);
	    }
	    stream.pipe(process.stdout);
          });
	  res.status(response.status).send(response);
        }
	else res.status(response.status).send(response);
      }
    },
    container: async (req, res) => {
      let image_id = req.body.image_id;
      let response;
      let image = await db.readEntry('Image', { _id: image_id });
      if(image.entity[0].user_id == req.user._id){
	docker.run(image_id, ['bash'], process.stdout,{Tty:false}, async (err, data, container) => {
          if(!err){
	    response = await db.createEntry('Container', {
	      image_id: image_id,
	      container_id : container.id
	    });
	    res.status(200).send({container_id: container.id});
	  }
	  else res.status(500).send(err);
        });	
      } 
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
      let user_id = req.user._id;
      let model = req.params['model'];
      let query = (model=='User' ? {_id:user_id} : {user_id:user_id});
      let response = await db.readEntry(model, query);
      res.status(response.status).send(response);
  },
  delete: {
    image: async (req, res) => {
      let _id = req.params['id'];
      let user_id = req.user._id;
      let image = await db.readEntry(model,{_id:_id});
      let response;
      if(image.entity[0].user_id == user_id){
        response = await db.deleteEntry(model, image_id);
	res.status(response.status).send(response);
      }
      else res.status(403).send({'error': 'UnauthorizedError: u are not entitled to delete this image'});
    },
    container: async (req, res) => {
      let container_id = req.params['id'];
      let container = docker.getContainer(container_id);
      container.remove(async (err, data)=> {
        if(!err) {
	  let entity = await db.readEntry('Container', {container_id: container_id});
	  let response = await db.deleteEntry('Container', entity.entity[0]._id);
	  res.status(response.status).send(response);
	}
	else res.status(422).send({error: err.json.message});;
      });
    }
  }
}
