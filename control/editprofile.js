const Account = require ('../models/accountmodel')
const AccountSession = require('../models/accountsessionmodel');
const crypto = require('crypto')
const bcrypt = require('bcrypt');
const algorithm = 'aes-256-ctr'
const KeyCookies = "setCookiesTokenChatApp"
const atob = require('atob')

module.exports.editprofile = (req,res) =>{
  const {headers,body} = req
  const {cookie} = headers
  const {name} = body
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
        isDeleted: false
      }, (err, sessions) => {
        if (err) {
          console.log(err);
          return res.send({
            success: false,
            message: 'Error: Server error'
          });
        }
        console.log("id: ",JSON.parse(decrypted));
        if (sessions.length != 1) {
          return res.send({
            success: false,
            message: 'Error: Invalid'
          });

        } else {
          const {accountid} = sessions[0]
          console.log("Session: ",sessions[0]);
          Account.find({
            _id:accountid
          },(err,account) => {
            if (err) {
              return res.send({
                success: false,
                message: 'Error: Server error'
              });
            }
            else if (account) {
              const akun = account[0];
              res.send({
                success : true
              })
              Account.update({_id: akun._id}, {$set: {name : name}}).exec()
            }
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
