const Account = require ('../models/accountmodel')
const AccountSession = require('../models/accountsessionmodel');
const crypto = require('crypto')
const bcrypt = require('bcrypt');
const algorithm = 'aes-256-ctr'
const KeyCookies = "setCookiesTokenChatApp"
const atob = require('atob')

module.exports.changePassword = (req,res) =>{
  const {headers,body} = req
  const {cookie} = headers
  const {oldPass,newPass} = body
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
              console.log("ini Chibay: ",account);
              if(oldPass == ""){
                res.send({
                  success: false,
                  message : "Old password is required"
                })
              }
              else if(bcrypt.compareSync(oldPass, akun.password)){
                console.log("SAMA KNTL");
                console.log("oldPass: "+oldPass);
                console.log("newPass: "+newPass);

                const account = new Account();
                res.send({
                  success: true,
                  message: ''
                });
                Account.update({_id: akun._id}, {$set: {password: account.generateHash(newPass)}}).exec();

              }
              else{
                console.log("BEDA KNTL");
                res.send({
                  success : false,
                  message : "Wrong old password"
                })
              }
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
