const AccountSession = require('../models/accountsessionmodel');
const Account = require('../models/accountmodel');
const crypto = require('crypto')
const algorithm = 'aes-256-ctr'
const KeyCookies = "setCookiesTokenChatApp"
const atob = require('atob')

module.exports.verify = (req,res) => {
  const {headers} = req;
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
        _id:JSON.parse(decrypted).token,
        isDeleted: false
      }, (err, sessions) => {
        if (err) {
          console.log(err);
          return res.send({
            success: false,
            message: 'Error: Server error'
          });
        }

        if (sessions.length != 1) {
          return res.send({
            success: false,
            message: 'Error: Invalid'
          });

        } else {
          const {accountid} = sessions[0]
          Account.find({
            _id:accountid
          },{password:0},(err,account) => {
            if (err) {
              console.log(err);
              return res.send({
                success: false,
                message: 'Error: Server error'
              });
            }
            return res.send({
              success: true,
              message: 'Good'
            });
          })
        }
      });
    }
    else{
      return res.send({
      success:false
    })
  }
}
