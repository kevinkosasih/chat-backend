const Account = require('../models/accountmodel');
const AccountSession = require('../models/accountsessionmodel');
const crypto = require('crypto')
const algorithm = 'aes-256-ctr'
const KeyCookies = "setCookiesTokenChatApp"
const atob = require('atob')

module.exports.search = (req,res) => {
  const {headers,body} = req
  const {cookie} = headers
  const {username} = body

  if(!cookie){
    return res.send({
      success:false
    })
  }
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

    let decryptAtob = atob(getToken[1])
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
      Account.find({
        _id: currentToken[0].accountid
      },(err,checkAccount) => {
        if(err){
          return res.send ({
            success:false,
            message:'Error: Server error'
          })
        }
        if(checkAccount.length != 1 ){
          return res.send({
            success: false,
            message: 'Error: No username found'
          });
        }
        if(checkAccount[0].username == username){
          return res.send({
            success:true,
            username : username,
            name : checkAccount[0].name,
            picture : checkAccount[0].profilePicture,
            message : "You can't add yourself as friend"
          })
        }
        for(var blocked in checkAccount[0].blacklist){
          if(checkAccount[0].blacklist[blocked] != null && checkAccount[0].blacklist[blocked].username == username){
            return res.send({
              success:true,
              username:username,
              name:checkAccount[0].blacklist[blocked].name,
              picture : checkAccount[0].blacklist[blocked].picture,
              message:'You blocked this user'
            })
          }
        }
        for(var request in checkAccount[0].friendrequest){
          if(checkAccount[0].friendrequest[request] != null && checkAccount[0].friendrequest[request].username == username){
            return res.send({
              success:true,
              username:username,
              name:checkAccount[0].friendrequest[request].name,
              picture : checkAccount[0].friendrequest[request].picture,
              request:true
            })
          }
        }
        for(var friend in checkAccount[0].friends){
          if(checkAccount[0].friends[friend] != null && checkAccount[0].friends[friend].username == username){
            return res.send({
              success:true,
              username:username,
              name:checkAccount[0].friends[friend].name,
              picture : checkAccount[0].friends[friend].picture,
              message:'Already added as friend'
            })
          }
        }
        Account.find({
          username:username
        },(err,currentAccount) =>{
          if(err){
            return res.send ({
              success:false,
              message:'Error: Server error'
            })
          }

          if(currentAccount.length != 1){
            return res.send({
              success: false,
              message: 'No username found'
            });
          }
          return res.send({
            success:true,
            username: currentAccount[0].username,
            name : currentAccount[0].name,
            picture : currentAccount[0].profilePicture
          })
        })
      })
    })
  }
}
