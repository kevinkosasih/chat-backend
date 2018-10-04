const Account = require('../models/accountmodel');
const AccountSession = require('../models/accountsessionmodel');
const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const KeyCookies = "setCookiesTokenChatApp";
const atob = require('atob');

module.exports.newchatroom = (req,res) =>{
  const {body,headers} = req;
  const{
      chatid,
      user
  } = body;
  const {cookie} = headers
  if(!cookie){
    return res.send({
      success:false
    })
  }
  if(!chatid || !user){
    return res.send({
      success:false,
      message:'Error: Cannot be blank'
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
    let blocked = false
    AccountSession.find({
      _id:JSON.parse(decrypted).token,
      isDeleted:false
    },(err,currentToken) =>{
      if(err){
        return res.send({
          success: false,
          message: 'Error: Server error'
        });
      }
      if(currentToken.length != 1){
        return res.send({
          success: false,
          message: 'Error: invalid data.'
        });
      }
      const{accountid}=currentToken[0]
      Account.find({
        $or:[{_id:accountid},{username:user}]
      },(err,account)=>{
        if(err){
          return res.send({
            success:false,
            message:'Error : Server Error'
          })
        }

        if(account.length != 2){
          return res.send({
            success:false,
            message:'Error: Data is invalid'
          })
        }
        for(var akun in account){
          if(account[akun].username == user){
            for(var block in account[akun].blacklist){
              if(account[akun].blacklist[block].username == JSON.parse(decrypted).username){
                Account.findOneAndUpdate({
                  _id : accountid
                },{
                  $push:{
                    chatList:{
                      chatId:chatid,
                      username:account[akun].username,
                      name:account[akun].name
                    }
                  }
                },{new: true},(err) =>{
                  if(err){
                    return res.send({
                      success:false,
                      message:'Error: Server error'
                    })
                  }
                  blocked = true
                  return res.send({
                    success:true,
                    message:"block"
                  })
                })
                break ;
              }
            }
            break;
          }
        }
        if(blocked){
          Account.findOneAndUpdate({
            _id:account[0]._id
          },{
            $push:{
              chatList:{
                chatId:chatid,
                username:account[1].username,
                name:account[1].name
              }
            }
          },{new: true},(err)=>{
                if(err){
                  return res.send({
                    success:false,
                    message:'Error: Server Error'
                  })
                }
                Account.findOneAndUpdate({
                  _id: account[1]._id
                },{
                  $push:{
                    chatList:{
                      chatId:chatid,
                      username:account[0].username,
                      name:account[0].name
                    }
                  }
                },{new: true},(err)=>{
                    if(err){
                      return res.send({
                        success:false,
                        message:'Error: Server Error'
                      })
                    }
                    return res.send({
                      success:true
                    })
                })
          })
        }
      })
  })
  }
};
