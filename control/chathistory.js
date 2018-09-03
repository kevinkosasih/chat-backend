const ChatHistory = require('../models/chathistorymodel');
const Account = require('../models/accountmodel');

module.exports.savechat = (req,res) =>{
  const{body} = req;
  const {
    chatId,
    message,
    sender,
    time
  }=body;
  console.log(body);
  let adsf = new ChatHistory();
  console.log(adsf.encrypt(message,'asdodw'));
  if(!chatId){
    return res.send({
      success:false,
      message:'Error: cannot be blank'
    })
  }
  if(!message){
    return res.send({
      success:false,
      message:'Error: cannot be blank'
    })
  }if(!sender){
    return res.send({
      success:false,
      message:'Error: cannot be blank'
    })
  }if(!time){
    return res.send({
      success:false,
      message:'Error: cannot be blank'
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

module.exports.newchatroom = (req,res) =>{
  const{body} = req;
  const{
    chatid,
    user
  } = body;
  if(!chatId){
    return res.send({
      success:false,
      message:'Error: chatid cannot be blank'
    })
  }
  if(!user){
    return res.send({
      success:false,
      message:'Error: user cannot be blank'
    })
  }
  Account.find({
    $or:[{username:user[0]},{username:user[1]}]
  },{_id:0,password:0,email:0,registerDate:0},(err,result)=>{
    if(err){
      return res.send({
        success:false,
        message:'Error: Server error'
      })
    }
    if(result.length != 2){
      return res.send({
        success:false,
        message:"Error: User didn't exists"
      })
    }
    else{
      let user1 = result[0].chatList.concat({chatId:chatid,username:result[1].username,name:result[1].name})
      let user2 = result[1].chatList.concat({chatId:chatid,username:result[0].username,name:result[0].name})
      Account.findOneAndUpdate({username:result[0].username},
      {$set:{chatList:user1}},null,(err,ress)=>{
        if (err) {
          console.log(err);
          return res.send({
            success: false,
            message: 'Error: Server error'
          });
        }
      })
      Account.findOneAndUpdate({username:result[1].username},
      {$set:{chatList:user2}},null,(err,ress)=>{
        if (err) {
          console.log(err);
          return res.send({
            success: false,
            message: 'Error: Server error'
          });
        }
      })
      return res.send({
        success:true,
        message:'Success',
        chatId:chatid
      })
    }
  })
};

module.exports.getchat = (req,res) =>{
  const {query} = req;
  const {
    token
  }=query;

  ChatHistory.find({chatId:token},(err,chat)=>{
    if(err){
      return res.send({
        success:false,
        message:'Error: Server error'
      })
    }

  })
}
