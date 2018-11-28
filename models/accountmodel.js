const mongoose = require('mongoose');
var bcrypt = require('bcrypt');

const AccountModel = mongoose.Schema({
  username:{type:String,require:true,default:''},
  password:{type:String,require:true,default:''},
  email:{type:String,require:true,default:''},
  name:{type:String,require:true,default:''},
  description:{type:String,default:"Hello there, I'm using tweey"},
  registerDate:{type:Date,require:true,default:Date.now()},
  profilePicture : {type : String, default :'DefaultPicture.png'},
  friends:[{
    username:{type:String},
    name:{type:String},
    picture : {type : String},
    description : {type : String}
  }],
  chatList:[{
    chatId:{type:String},
    username:{type:String},
    name:{type:String},
    picture : {type : String},
    description : {type : String},
    createdDate : {type : Date}
  }],
  friendrequest:[{
    username:{type:String},
    name:{type:String},
    picture : {type : String},
    description : {type : String}
  }],
  isAdmin : {type:Boolean , require:true, default:false}
})
AccountModel.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

AccountModel.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('Account',AccountModel);
