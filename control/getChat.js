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
    let decryptAtob = atob(getToken[1])
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
        let chatList = []
        for(let count = 0; count < chatlog.length;count++){
          let chat = chatlog[count];
          chat = chat.decrypt(chat.decrypt,chat.chatid)
          chatlist = chatList.concat(chat)
          console.log(chat);
          console.log(chatList);
        }

        return res.send({
          success:true,
          chatList
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
