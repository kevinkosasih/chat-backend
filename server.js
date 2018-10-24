 const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const compression = require("compression");
const helmet = require('helmet');
const app = express();
const io = require('socket.io')();
const cookieParser = require('cookie-parser');
const multer = require('multer');
const fs = require('file-system');

const storageProfilePhoto = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g,'-') + '-' + file.originalname)
  }
})

const uploadImage = multer({storage : storageProfilePhoto, limits: {fileSize: 1000000, files:1}}).single('Image')

const storageAttachment = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, './attachment/')
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g,'-') + '-' + file.originalname)
  }
})

const attachPhoto = multer({storage : storageAttachment, limits: {fileSize: 1000000, files:1}}).single('attachment')

app.use(morgan('common'))
app.use (helmet())
//middleware using cors and bodyParser
app.use(cors());
app.use(express.static('./uploads'))
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cookieParser());

app.use(compression());

//import database
const config = require('./config/database');
//connect to mongoDB
mongoose.connect(config.database);
// validate connection to mongoDB
mongoose.connection.on('connected',() => {
  console.log('Connected to '+config.database)
})
mongoose.connection.on('error',(err) => {
  console.log('Database error '+err);
})

//import controller
const loginAccount  = require('./control/loginAccount')
const regisAccount = require('./control/regisAccount')
const logoutAccount = require('./control/logoutAccount')
const verify = require('./control/verify')
const chathitory = require('./control/chathistory')
const newChatRoom = require('./control/newchatroom')
const getChat = require('./control/getChat')
const addFriends = require('./control/addfriend')
const changePassword = require ('./control/changePassword')
const editprofile = require('./control/editprofile')
const request = require('./control/addblock')
const checkrequest = require('./control/checkrequest')
const search = require('./control/searchfriend')
const notification = require('./control/notification')

//routing API
app.get('/getdata',loginAccount.dataToken)
app.get('/logout',logoutAccount.logout)
app.get('/verify',verify.verify)
app.post('/getchat',getChat.getchat)
app.post('/login',loginAccount.login)
app.post('/regisnew',regisAccount.newRegis)
app.post('/search',search.search)
app.post('/chat',attachPhoto,chathitory.savechat)
app.post('/check',checkrequest.cekRequest)
app.put('/add',request.add)
app.put('/block',request.block)
app.put('/Friends', addFriends.addFriends)
app.put('/addchatroom',newChatRoom.newchatroom)
app.put('/changepassword',changePassword.changePassword)
app.put('/editprofile',uploadImage,editprofile.editprofile)
app.put('/readNotif',notification.read)

//port API (can be change)s
const port = 3000;
//openconnection for socket.io
io.on('connection', (client) => {
  console.log("connected");
  client.on('sendChat', (message) => {
    client.broadcast.emit(message.chatId,{message});
    client.emit(message.chatId,{message});
  });

  client.on('newchatlist', (message) => {
    client.broadcast.emit('chatlist'+message.otherusername,{username:message.myusername,name:message.myname,chatid:message.chatId,picture : message.mypicture});
    client.emit('chatlist'+message.myusername,{username:message.otherusername,name:message.othername,chatid:message.chatId,picture : message.otherpicture});
  });

  client.on('editprofile', (message) => {
    console.log(message);
    client.broadcast.emit('edit'+message.username,{message});
  });

  client.on('closechatroom', (message) => {
    client.emit('closechatroom'+message,message);
  });
  client.on('openchatroom', (message) => {
    client.emit('openchatroom'+message,message);
  });

  client.on('newchatlist', (message) => {
    console.log(message);
    client.broadcast.emit('chatlist'+message.otherusername,{username:message.myusername,name:message.myname,chatid:message.chatid});
    client.emit('chatlist'+message.myusername,{username:message.otherusername,name:message.othername,chatid:message.chatid});
  });
});
// port for socket.io (can be change || cannot same with port app)
io.listen(8000);
//API hosted @ port
app.listen(port, () => {
  console.log('Server start at '+port)
});

module.exports = app;
