const Account = require('../models/accountmodel');
const AccountSession = require('../models/accountsessionmodel');
const crypto = require('crypto')
const algorithm = 'aes-256-ctr'
const KeyCookies = "setCookiesTokenChatApp"
const atob = require('atob')

module.exports.cekRequest = (req,res) =>{
  const {body,headers} = req;
  const {
    username
  } = body;
  const {cookie} = headers
  if(!cookie){
    return res.send({
      success:false
    })
  }
  console.log("username: ",username);
  if(!username){
    return res.send({
      success:false,
      message:'Error: Cannot be blank',
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
      _id: JSON.parse(decrypted).token,
      isDeleted:false
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

      const {accountid} = currentToken[0]
      Account.find({
        $and:[{_id:accountid},{'friendrequest.username':username}]
      },(err,account)=>{
        if(err){
          return res.send({
            success:false,
            message:'Error: Server error'
          })
        }
        if(account.length != 0){
          return res.send({
            success : false,
            requested : true,
            message : 'not yet added as friends'
          })
        }
        return res.send({
          success : true,
          requested : false
        })
      })
    })
  }
}
