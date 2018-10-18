const Account = require ('../models/accountmodel');
const AccountSession = require('../models/accountsessionmodel');
const ChatHistory = require ('../models/chathistorymodel');
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
  const {name,description} = body
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
                console.log(filename);
                console.log("file : ",file);
                Account.update({_id: akun._id},
                  {$set:
                    {name : name,
                    profilePicture : filename,
                    description : description}}).exec()// ngubah diri sendiri
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
                Account.update({'chatList.username' : akun.username},
                {
                  $set:
                  { "chatList.$[elem].name":name,
                    "chatList.$[elem].picture" : filename}
                },
                {
                  arrayFilters : [{'elem.username' : akun.username}]
                }
                ).exec()
                Account.update({'friendrequest.username' : akun.username},
                {
                  $set:
                  { "friendrequest.$[elem].name":name,
                    "friendrequest.$[elem].picture" : filename,
                    "friendrequest.$[elem].description" : description}
                },
                {
                  arrayFilters : [{'elem.username' : akun.username}]
                }
                ).exec()
                  res.send({
                    success : true
                  })
                }
              else{
                Account.update({_id: akun._id}, {$set: {name : name, description : description}}).exec()
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
                Account.update({'chatList.username' : akun.username},
                {
                  $set:
                  { "chatList.$[elem].name":name,
                    "chatList.$[elem].picture":akun.profilePicture}
                },
                {
                  arrayFilters : [{'elem.username' : akun.username}]
                }
                ).exec()
                Account.update({'friendrequest.username' : akun.username},
                {
                  $set:
                  { "friendrequest.$[elem].name":name,
                    "friendrequest.$[elem].picture" : akun.profilePicture,
                    "friendrequest.$[elem].description" : description}
                },
                {
                  arrayFilters : [{'elem.username' : akun.username}]
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
