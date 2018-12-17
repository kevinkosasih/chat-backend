 const Account = require('../models/accountmodel');
 const AccountSession = require('../models/accountsessionmodel');
 const crypto = require('crypto')
 const algorithm = 'aes-256-ctr'
 const KeyCookies = "setCookiesTokenChatApp"
 const btoa = require('btoa')
 const atob = require('atob')


module.exports.login = (req,res) => {
  const { body,rawHeaders } = req;
  const {
    username,
    password
  } = body;
  if (!username) {
      return res.send({
        success: false,
        message: 'Username cannot be blank.'
      });
    }
  if (!password) {
      return res.send({
        success: false,
        message: 'Password cannot be blank.'
      });
  }

  Account.find({
    username:username
  },(err,currentAccount) =>{
    if(err){
      return res.send({
        success: false,
        message: 'Error: Server error'
      });
    }
    if(currentAccount.length != 1){
      return res.send({
        success: false,
        message: 'Username or password is wrong.'
      });
    }

    const user = currentAccount[0];

    if(!user.validPassword(password)){
      return res.send({
        success: false,
        message: 'Username or password is wrong.'
      });
    }
    if((rawHeaders[1] == 'localhost:3001' && !currentAccount[0].isAdmin) || (rawHeaders[1]=='localhost:3002' && currentAccount[0].isAdmin)){
      return res.send({
        success: false,
        message: 'Username or password is wrong.'
      });
    }
    const session = new AccountSession();
    session.accountid = user._id;
    session.timestamp = Date.now()
    session.deleted =Date.now()
    session.save((err,doc) => {
      if(err){
        res.send(err)
      }
      const data  = JSON.stringify({
        token:doc._id,
        username:user.username
      })
      var cipher = crypto.createCipher(algorithm,KeyCookies)
      var crypted = cipher.update(data,'utf8','hex')
      crypted += cipher.final('hex');
      const encryptBtoa = btoa(crypted)
      const expDate = new Date(Date.now()+(1000*60*60*24))
      if(rawHeaders[1] == 'localhost:3001' && currentAccount[0].isAdmin){
        res.cookie('TokenAdmin',encryptBtoa,{expires:expDate,httpOnly: true})
      }
      else{
        res.cookie('TokenUser',encryptBtoa,{expires:expDate,httpOnly: true})
      }
      return res.send({
        success: true,
        message: 'Logged in',
        isAdmin: currentAccount[0].isAdmin
      });
    })
  })
}

module.exports.dataToken = (req,res) =>{
  const {headers,rawHeaders} = req;
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
    if(rawHeaders[1] == 'localhost:3001'){
      if(getToken[0] == "TokenAdmin" || getToken[0] == " TokenAdmin"){
        break;
      }
      else {
        getToken = []
      }
    }
    else {
      if(getToken[0] == "TokenUser" || getToken[0] == " TokenUser"){
        break;
      }
      else {
        getToken = []
      }
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
      Account.find({
        _id:data[0].accountid
      },{password:0,_id:0},(err,account)=>{
        if (err) {
          return res.send({
            success: false,
            message: 'Error: Server error'
          });
        }
        if(account.length ==  0 ){
          res.clearCookie("Token")
          return res.send({
            success:false
          })
        }
        const data  = JSON.stringify({
          token:JSON.parse(decrypted).token,
          username:JSON.parse(decrypted).username
        })
        var cipher = crypto.createCipher(algorithm,KeyCookies)
        var crypted = cipher.update(data,'utf8','hex')
        crypted += cipher.final('hex');
        const encryptBtoa = btoa(crypted)
        const expDate = new Date(Date.now()+(1000*60*60*24))
        if(rawHeaders[1] == 'localhost:3001' && account[0].isAdmin){
          res.cookie('TokenAdmin',encryptBtoa,{expires:expDate,httpOnly: true})
        }
        else{
          res.cookie('TokenUser',encryptBtoa,{expires:expDate,httpOnly: true})
        }
        const myaccount = account[0]
        return res.send({
          success:true,
          akun:myaccount
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
