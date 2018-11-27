const Account = require('../models/accountmodel');
const AccountSession = require('../models/accountsessionmodel');
const ChatHistory = require('../models/chathistorymodel');
const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const KeyCookies = "setCookiesTokenChatApp";
const atob = require('atob');

module.exports.unsendMessage = (req,res) =>{
  const {headers,body,file} = req
  const {cookie} = headers
  const {
    chatId,
    timeStamp
  } = body
  if(!cookie){
    return res.send({
      success:false
    })
  }
  let getcookie  = cookie.split(";")
  let getToken = []
  for(var i=0;i<getcookie.length;i++){
    getToken = getcookie[i].split("=")
    if(getToken[0] == "Token" || getToken[0] == " Token"){
      break;
    }
    else{
      getToken =[]
    }
  }

  if(getToken[0]){
    let decryptAtob = atob(decodeURIComponent(getToken[1]))
    var decipher = crypto.createDecipher(algorithm,KeyCookies)
    var decrypted = decipher.update(decryptAtob,'hex','utf8')
    decrypted += decipher.final('utf8');

    AccountSession.find({
      _id:JSON.parse(decrypted).token
    },(err,currentToken) => {
      if(err){
        return res.send({
          success:false,
          message:'Server error'
        })
      }

      if(currentToken.length != 1){
        return res.send({
          success:false,
          message:'Error : Invalid data'
        })
      }

      const {accountid} = currentToken[0]
      Account.find({
        _id : accountid
      },(err, currentAccount)=>{
        const account = currentAccount[0];
        if(err){
          return res.send({
            success:false,
            message:'Error: Server error'
          })
        }
        const time = new Date(timeStamp)
        ChatHistory.deleteOne({
          chatId : chatId,
          timeStamp:time
        },(err,message)=>{
          if(err){
            return res.send({
              success:false,
              message:'message not found'
            })
          }
          return res.send({
            success : true,
            message: message
          })
        })
      })
    })
  }
}
