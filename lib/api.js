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
      let userid = req.user._id;
      let label = req.body.label;
      let Dockerfile = req.body.file;
      let response;
      let err = await fs.writeFileSync('./dockerfiles/Dockerfile', Dockerfile);
      if(!err) {
	response = await db.createEntry('Image', {userid: userid,label:label});
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
      let imageid = req.body.imageid;
      let coursename = req.body.course;
      let user = req.body.user;
      let response;
      let image = await db.readEntry('Image', { imageid: imageid });
      if(image.entity[0].userid == req.user._id){
	docker.run(imageid, ['bash'], process.stdout,{Tty:false}, async (err, data, container) => {
          if(!err){
	    response = await db.updateEntry('Image', {imageid: imageid},{
              $push: {
	        containers: container.id
	      }
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
      let userid = req.user._id;
      let model = req.params['model'];
      let query = (model=='User' ? {_id:userid} : {userid:userid});
      let response = await db.readEntry(model, query);
      res.status(response.status).send(response);
  },
  delete: {
    image: async (req, res) => {
      let imageid = req.params['id'];
      let image = await db.readEntry('Image',{_id: imageid});
      console.log(image); 
      //let response = await db.deleteEntry('Image',image._id);
      //res.status(response.status).send(response);
    },
    container: async (req, res) => {
      let containerid = req.params['id'];
      let container = docker.getContainer(containerid);
      container.remove(async (err, data)=> {
        if(!err) {
	  let response = await db.updateEntry('Image', {
            $pull: { containers: conatinerid }
	  });
	  res.status(response.status).send(response);
	}
      });
    }
  }
}
