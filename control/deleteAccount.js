const Account = require('../models/accountmodel');
const AccountSession = require('../models/accountsessionmodel');
const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const KeyCookies = "setCookiesTokenChatApp";
const atob = require('atob');

module.exports.deleteAccount = (req,res) =>{
  const {headers,body,file} = req
  const {cookie} = headers

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
        _id:accountid
      },(err,currentAccount) =>{
        const account = currentAccount[0];
        if(err){
          return res.send ({
            success:false,
            message:'Error: Server error'
          })
        }
        Account.update({'friends.username':account.username},
        {
          $pull:{friends:{username:account.username}}
        }).exec()
        Account.update({'friendrequest.username':account.username},
        {
          $pull:{friendrequest:{username:account.username}}
        }).exec()
        Account.update({'blacklist.username':account.username},
        {
          $pull:{blacklist:{username:account.username}}
        }).exec()
        Account.update({'chatList.username':account.username},
        {$set:
          {"chatList.$[elem].username":"",
          "chatList.$[elem].name": " ",
          "chatList.$[elem].picture": "DefaultPicture.png",
          "chatList.$[elem].description": "Hello there, I'm using tweey"}
        },
        {
          arrayFilters : [{'elem.username' : account.username}],
          multi : true
        },(err,user)=>{
          console.log(user);
        })
        AccountSession.findOneAndUpdate({
          _id:JSON.parse(decrypted).token,
          isDeleted:false
        }, {
            $set: {
              isDeleted:true,
              deleted:Date.now()
            }
          }, null,(err,accountToken) => {
            if (err) {
              console.log(err);
              return res.send({
                success: false,
                message: 'Error: Server error'
              });
            }
          })
        Account.deleteOne({
          _id:accountid
        }).exec()
        res.clearCookie("Token")
        return res.send({
          success:true,
          name :"",
          picture : "DefaultPicture.png",
          username:account.username,
          description : "Hello there, I'm using tweey"
        })
      })
    })
  }
}
