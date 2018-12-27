const AccountSession = require('../models/accountsessionmodel');
const crypto = require('crypto')
const algorithm = 'aes-256-ctr'
const KeyCookies = "setCookiesTokenChatApp"
const atob = require('atob')


module.exports.logout = (req,res) => {
  const {headers,rawHeaders} = req;
  const {cookie} = headers
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
    else{
      if(getToken[0] == "TokenUser" || getToken[0] == " TokenUser"){
        break;
      }
      else {
        getToken = []
      }
    }
  }
  let decryptAtob = atob(decodeURIComponent(getToken[1]))
  var decipher = crypto.createDecipher(algorithm,KeyCookies)
  var decrypted = decipher.update(decryptAtob,'hex','utf8')
  decrypted += decipher.final('utf8');

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
      res.clearCookie("Token")
      return res.send({
        success: true,
        message: 'Good'
      });
    })
}
