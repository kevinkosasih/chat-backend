const ChatHistory = require('../models/chathistorymodel');
const AccountSession = require('../models/accountsessionmodel');
const crypto = require('crypto')
const algorithm = 'aes-256-ctr'
const KeyCookies = "setCookiesTokenChatApp"
const atob = require('atob')

module.exports.getchat = (req,res) => {
  const{body,headers} = req
  const {cookie} = headers
  const {token} = body
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
      _id:JSON.parse(decrypted).token,
      isDeleted:false
    },(err,data) =>{
      if (err) {
        console.log(err);
        return res.send({
          success: false,
          message: 'Error: Server error'
        });
      }
      if(data.length != 1){
        return res.send({
          success: false,
          message: 'Error: '
        });
      }
      ChatHistory.find({
        chatId:token
      },(err,chatlog) =>{
        if(err){
          return res.send({
            success:false
          })
        }
        if(chatlog.length == 0){
          return res.send({
            success : false,
            chatId : token
          })
        }
        const chatHistory = new ChatHistory();
        let chatlist = []
        for(var index in chatlog){
          let chat = chatHistory.decrypt(chatlog[index].message,'asd');
          chatlist = chatlist.concat({
            sender: chatlog[index].sender,
            message : chat,
            chatId : chatlog[index].chatId,
            receiver : chatlog[index].receiver,
            time : chatlog[index].timeStamp,
            receiver : chatlog[index].reciever
          })
        }
        return res.send({
          success : true,
          message : chatlist,
          chatId : token
        })
      })
    })
  }
  else{
    return res.send({
      success:false
    })
  }
}
