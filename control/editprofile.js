const Account = require ('../models/accountmodel')
const AccountSession = require('../models/accountsessionmodel');
const crypto = require('crypto')
const bcrypt = require('bcrypt');
const algorithm = 'aes-256-ctr';
const KeyCookies = "setCookiesTokenChatApp";
const atob = require('atob');
const fs = require('file-system');
const multer = require('multer');

module.exports.editprofile = (req,res) =>{
  const {headers,body,file} = req
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
        if (sessions.length != 1) {
          return res.send({
            success: false,
            message: 'Error: Invalid'
          });

        } else {
          const {accountid} = sessions[0]
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
              const akun = account[0];//account cccccc
              console.log("akun: ",akun);
              if(file){
                const {filename} = file
                console.log("file : ",file);
                Account.update({_id: akun._id}, {$set: {name : name, profilePicture : filename}}).exec()// ngubah diri sendiri
                Account.update({'friends.username':akun.username},
                {$set:
                  {"friends.$[elem].username":akun.username,
                  "friends.$[elem].name":name,
                  "friends.$[elem].picture":filename}
                },
                {
                  arrayFilters: [{'elem.username':akun.username}]
                }
              ).exec()//ngubah 1 database yang berteman dengan cccccc
                res.send({
                  success : true
                })
              }
              else{
                Account.update({_id: akun._id}, {$set: {name : name}}).exec()
                Account.update({'friends.username':akun.username},
                {$set:
                  {"friends.$[elem].username":akun.username,
                  "friends.$[elem].name":name,
                  "friends.$[elem].picture":akun.profilePicture}
                },
                {
                  arrayFilters: [{'elem.username':akun.username}]
                }
              ).exec()
                res.send({
                  success : true
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
