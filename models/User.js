var mongoose = require('mongoose');

var crypto = require('../lib/crypto');

var Schema = mongoose.Schema;
if (mongoose.connection.readyState === 0) {
  mongoose.connect(require('./connection-string'));
}


var newSchema = new Schema({
  
  'name': { type: String, required: true },
  'username': { type: String, unique: true, required: true },
  'email' : { 
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
      },
      message: '{VALUE} is not a valid email address!'
    }
  },
  'password' : { type: String, default: null, select: false },
  'salt' : { type: String, required: true },
  'passwordhash' : { type: String, required: true },
  'createdAt': { type: Date, default: Date.now },
  'updatedAt': { type: Date, default: Date.now }
});

newSchema.pre('validate', function(next){
  this.salt = crypto.generateSalt();
  this.passwordhash = crypto.md5(this.password, this.salt);
  this.password = null; 
  next();
});

newSchema.pre('save', function(next){
  this.updatedAt = Date.now();
  next();
});

newSchema.pre('update', function() {
  this.update({}, { $set: { updatedAt: Date.now() } });
});

newSchema.pre('findOneAndUpdate', function() {
  this.update({}, { $set: { updatedAt: Date.now() } });
});



module.exports = mongoose.model('User', newSchema);
