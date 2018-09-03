const mongoose = require('mongoose')

const AccountSessionModel = mongoose.Schema({
  accountid:{type:String, default:''},
  timestamp:{type:Date,default:Date.now()},
  isDeleted:{type:Boolean, default: false},
  deleted:{type:Date, default:Date.now()}
})
AccountSessionModel.methods.key = function(){
  const pass = 'keyEncryptionToken'
  return pass
}
module.exports = mongoose.model('AccountSessionModel', AccountSessionModel)
