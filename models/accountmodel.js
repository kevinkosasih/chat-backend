const mongoose = require('mongoose');
var bcrypt = require('bcrypt');

const AccountModel = mongoose.Schema({
  username:{type:String,require:true,default:''},
  password:{type:String,require:true,default:''},
  email:{type:String,require:true,default:''},
  name:{type:String,require:true,default:''},
  description:{type:String,default:''},
  registerDate:{type:Date,require:true,default:Date.now()},
  profilePicture : {type : String, default :''},
  friends:[{
    username:{type:String},
    name:{type:String}
  }],
  chatList:[{
    chatId:{type:String},
    username:{type:String},
    name:{type:String}
  }],
  blacklist:[{
    username:{type:String},
    name:{type:String}
  }],
  friendrequest:[{
    username:{type:String},
    name:{type:String}
  }]
})
AccountModel.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

AccountModel.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('Account',AccountModel);
