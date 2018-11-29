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
const path = require('path');

const storageProfilePhoto = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g,'-') + '-' + file.originalname)
  }
})

const uploadImage = multer({
  storage : storageProfilePhoto,
  limits: {files:1},
  fileFilter : function(req,file,cb){
    checkFileType(file,cb);
  }
}).single('Image')

function checkFileType(file,cb){
  console.log(file);
  //allowed file
  const fileTypes = /jpeg|jpg|png|gif/;
  //check ext
  const extname = fileTypes.test(path.extname(new Date().toISOString().replace(/:/g,'-') + '-' + file.originalname).toLowerCase());
  //check mime
  const mimetype = fileTypes.test(file.mimetype);
  if(mimetype && extname){
    return cb(null,true);
  }
  else {
    cb("Images Only!");
  }
}

module.exports.editprofile = (req,res) =>{
  uploadImage(req,res,(err) => {
    const {headers,body,file} = req
    const {cookie} = headers
    const {name,description} = body
    if(err){
      return res.send({
        success : false,
        message : err
      })
    }
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
                if(file){
                  const {filename,size} = file
                  if(size > 1000000){
                    return res.send({
                      success : false,
                      message : "You can only upload 1 MB File"
                    })
                  }
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
                    arrayFilters: [{'elem.username':akun.username}],
                    multi:true
                  }
                  ).exec()//ngubah 1 database yang berteman dengan cccccc
                  Account.update({'chatList.username' : akun.username},
                  {
                    $set:
                    { "chatList.$[elem].name":name,
                      "chatList.$[elem].picture" : filename}
                  },
                  {
                    arrayFilters : [{'elem.username' : akun.username}],
                    multi:true
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
                    arrayFilters : [{'elem.username' : akun.username}],
                    multi:true
                  }
                  ).exec()
                    res.send({
                      success : true,
                      photo: filename
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
                    arrayFilters: [{'elem.username':akun.username}],
                    multi:true
                  }
                  ).exec()
                  Account.update({'chatList.username' : akun.username},
                  {
                    $set:
                    { "chatList.$[elem].name":name,
                      "chatList.$[elem].picture":akun.profilePicture}
                  },
                  {
                    arrayFilters : [{'elem.username' : akun.username}],
                    multi:true
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
                    arrayFilters : [{'elem.username' : akun.username}],
                    multi:true
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
  })
}
