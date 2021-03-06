const mongoose = require('mongoose');
const crypto = require('crypto')

const algorithm = 'aes-256-ctr'

const ChatHistory  = mongoose.Schema({
  chatId:{type:String,require:true,default:''},
  message:{type:String,require:true,default:''},
  sender:{
    username : {type : String, require : true, default:''},
    name : {type : String, require : true, default:''}
  },
  timeStamp:{ type : Date , require : true , default : ''},
  attachment : {type : String},
  reciever:[{
    username:{type:String, require:true, default:''},
    read:{type:Boolean , require:true, default:false}
  }]
})

ChatHistory.methods.encrypt = (message,password) => {
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(message,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}

ChatHistory.methods.decrypt = (message,password) => {
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(message,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

module.exports = mongoose.model('ChatHistory',ChatHistory);
