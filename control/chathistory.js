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
  limits: {fileSize: 1000000, files:1},
  fileFilter : function(req,file,cb){
    checkFileType(file,cb);
  }

}).single('Attachment')

function checkFileType(file,cb){
  //allowed file
  const fileTypes = /jpeg|jpg|png|gif/;
  console.log("ini file: ",file);
  //check ext
  const extname = fileTypes.test(path.extname(new Date().toISOString().replace(/:/g,'-') + '-' + file.originalname).toLowerCase());
  //check mime
  const mimetype = fileTypes.test(file.mimetype);
  if(mimetype && extname){
    return cb(null,true);
  }
  else if (file.mimetype == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"){
    return cb(null,true);
  } else {
    cb("ERROR");
  }
}

module.exports.savechat = (req,res) =>{
  attachPhoto(req,res,(err) =>{
    const {body,headers,file} = req;
    const {
      chatId,
      message,
      senderUsername,
      sender,
      timeStamp,
      date,
      recieve
    }=body
    const {cookie} = headers;

    if(err){
      return res.send({
        success : false,
        message : "You can only upload .png/.jpeg/.jpg/.gif/.docx file"
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
          const {filename,mimetype} = file;
          newChatHistory.chatId = chatId;
          newChatHistory.message = newChatHistory.encrypt(message,"asd");
          newChatHistory.sender.username = senderUsername;
          newChatHistory.sender.name = sender;
          newChatHistory.timeStamp = timeStamp;
          newChatHistory.date = date;
          newChatHistory.attachment.name = filename;
          newChatHistory.attachment.type = mimetype;
          newChatHistory.reciever = [{username : recieve}];
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
          newChatHistory.reciever = [{username : recieve}];
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
