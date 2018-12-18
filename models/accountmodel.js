const mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var crypto = require("crypto");

const AccountModel = mongoose.Schema({
  username:{type:String,require:true,default:''},
  password:{type:String,require:true,default:''},
  email:{type:String,require:true,default:''},
  name:{type:String,require:true,default:''},
  chatID:{type:String,require:true,default:crypto.randomBytes(20).toString('hex')+Date.now()},
  registerDate:{type:Date,require:true,default:Date.now()},
  isAdmin:{type: Boolean, default:false},
  chatList:[{
    chatId:{type:String},
    username:{type:String},
    name:{type:String},
    createdDate : {type : Date},
    profilePicture :{type:String,default:'DefaultPicture.png'}
  }]
})
AccountModel.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

AccountModel.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('Account',AccountModel);
