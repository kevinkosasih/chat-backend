const ChatHistory = require('../models/chathistorymodel');
const Account = require('../models/accountmodel');

module.exports.savechat = (req,res) =>{
  const {body,headers} = req;
  const {
    chatId,
    message,
    sender,
    time
  }=body;
  const {cookie} = headers

  if(!chatId || !message || !sender || !time){
    return res.send({
      success:false,
      message:'Error: cannot be blank'
    })
  }
  if(!cookie){
    return res.send({
      success:false
    })
  }

  const newChatHistory = new ChatHistory();

  newChatHistory.chatId = chatId;
  newChatHistory.message = newChatHistory.encrypt(message);
  newChatHistory.sender = sender;
  newChatHistory.time = time;

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
};
