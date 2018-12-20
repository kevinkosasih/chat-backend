const ChatHistory = require('../models/chathistorymodel');
const Account = require('../models/accountmodel');
const AccountSession = require('../models/accountsessionmodel');
const crypto = require('crypto')
const algorithm = 'aes-256-ctr'
const KeyCookies = "setCookiesTokenChatApp"
const atob = require('atob');
const multer = require('multer');
const path = require('path');

const storageAttachment = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, './attachment/')
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g,'-') + '-' + file.originalname)
  }
})

const attachPhoto = multer({
  storage : storageAttachment,
  limits: {files:1},
  fileFilter : function(req,file,cb){
    checkFileType(file,cb);
  }

}).single('Attachment')

function checkFileType(file,cb){
  //allowed file
  const fileTypes = /jpeg|jpg|png|gif/;
  //check ext
  const extname = fileTypes.test(path.extname(new Date().toISOString().replace(/:/g,'-') + '-' + file.originalname).toLowerCase());
  //check mime
  const mimetype = fileTypes.test(file.mimetype);
  if(mimetype && extname){
    return cb(null,true);
  }
  else if (file.mimetype == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"){
    return cb(null,true);
  }
  else {
    return cb("You can only upload .png/.jpeg/.jpg/.gif/.docx file");
  }
}

module.exports.savechat = (req,res) =>{
  attachPhoto(req,res,(err) =>{
    const {body,headers,file,rawHeaders} = req;
    const {
      chatId,
      message,
      senderUsername,
      sender,
      timeStamp,
      date,
      receiveUsername,
      receiveName
    }=body
    const {cookie} = headers;

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
        _id:JSON.parse(decrypted).token
      },(err,currentToken)=>{
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

        const newChatHistory = new ChatHistory();
        if(file){
          const {filename,mimetype,size} = file;
          if(size > 5000000){
            return res.send({
              success : false,
              message : "You can only upload 5 MB File"
            })
          }
          newChatHistory.chatId = chatId;
          newChatHistory.message = newChatHistory.encrypt(message,"asd");
          newChatHistory.sender.username = senderUsername;
          newChatHistory.sender.name = sender;
          newChatHistory.timeStamp = timeStamp;
          newChatHistory.date = date;
          newChatHistory.attachment.name = filename;
          newChatHistory.attachment.type = mimetype;
          newChatHistory.reciever = [{username : receiveUsername, name : receiveName}];
          newChatHistory.save((err) =>{
            if(err){
              return res.send({
                success:false,
                message:'Error: server error'
              })
            }
            return res.send({
              success:true,
              message:'Message sent',
              time : timeStamp,
              filename :filename
            })
          })
        } else {
          if(!chatId || !message || !sender || !timeStamp){
            return res.send({
              success:false,
              message:'Error: cannot be blank'
            })
          }
          newChatHistory.chatId = chatId;
          newChatHistory.message = newChatHistory.encrypt(message,"asd");
          newChatHistory.sender.username = senderUsername;
          newChatHistory.sender.name = sender;
          newChatHistory.timeStamp = timeStamp;
          newChatHistory.date = date;
          newChatHistory.reciever = [{username : receiveUsername ,name : receiveName}];
          newChatHistory.save((err) =>{
            if(err){
              return res.send({
                success:false,
                message:'Error: server error'
              })
            }
            return res.send({
              success:true,
              message:'Message sent',
              time : timeStamp
            })
          })
        }
      })
    }
  })
};
