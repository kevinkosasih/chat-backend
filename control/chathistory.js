const ChatHistory = require('../models/chathistorymodel');
const Account = require('../models/accountmodel');
const AccountSession = require('../models/accountsessionmodel');
const crypto = require('crypto')
const algorithm = 'aes-256-ctr'
const KeyCookies = "setCookiesTokenChatApp"
const atob = require('atob')

module.exports.savechat = (req,res) =>{
  const {body,headers,file} = req;

  const {
    chatId,
    message,
    sender,
    time,
    date,
    reciever
  }=body
  const {cookie} = headers;
  if(!cookie){
    return res.send({
      success:false
    })
  }
  if(!chatId || !message || !sender || !time){
    return res.send({
      success:false,
      message:'Error: cannot be blank'
    })
  }
  console.log("chat ID : ",chatId);
  console.log("message : ",message);
  console.log("sender : ",sender);
  console.log("time : ",time);
  console.log("date : ",date);

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
    },(err,currentToken)=>{
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

      const newChatHistory = new ChatHistory();
      if(file){
        const {filename} = file;
        newChatHistory.chatId = chatId;
        newChatHistory.message = newChatHistory.encrypt(message,"asd");
        newChatHistory.sender = sender;
        newChatHistory.timestamp.date = date;
        newChatHistory.timestamp.time = time;
        newChatHistory.attachment = filename;
      } else {
        newChatHistory.chatId = chatId;
        newChatHistory.message = newChatHistory.encrypt(message,"asd");
        newChatHistory.sender = sender;
        newChatHistory.timestamp.date = date;
        newChatHistory.timestamp.time = time;
      }
      newChatHistory.save((err) =>{
        if(err){
          return res.send({
            success:false,
            message:'Error: server error'
          })
        }
        return res.send({
          success:true,
          message:'Message sent'
        })
      })
    })
  }
};
