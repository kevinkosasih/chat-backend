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
const fs = require('file-system');

app.use(morgan('common'))
app.use (helmet())
//middleware using cors and bodyParser
app.use(cors());
app.use(express.static('./uploads'))
app.use(express.static('./attachment'))
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
const changePassword = require ('./control/changePassword')
const notification = require('./control/notification')

//routing API
app.get('/verify',verify.verify)
app.get('/getdata',loginAccount.dataToken)
app.get('/logout',logoutAccount.logout)
app.post('/getchat',getChat.getchat)
app.post('/login',loginAccount.login)
app.post('/regisnew',regisAccount.newRegis)
app.post('/chat',chathitory.savechat)
app.put('/addchatroom',newChatRoom.newchatroom)
app.put('/changepassword',changePassword.changePassword)
app.put('/readNotif',notification.read)

//port API (can be change)s
const port = 3000;
//openconnection for socket.io
io.on('connection', (client) => {
  console.log("connected");
  client.on('sendChat', (message) => {
    console.log(message);
    client.broadcast.emit(message.chatId,{message});
    client.emit(message.chatId,{message});
  });

  client.on('newchatlist', (message) => {
    client.broadcast.emit('chatlist'+message.otherusername,{username:message.myusername,name:message.myname,chatId:message.chatId,profilePicture : "DefaultPicture.png"});
    client.emit('chatlist'+message.myusername,{username:message.otherusername,name:message.othername,chatId:message.chatId});
  });

  client.on('readchat', (message) => {
    client.broadcast.emit('readchat'+message,message);
  });

  client.on('closechatroom', (message) => {
    client.emit('closechatroom'+message,message);
  });

  client.on('changechatroom', (message) => {
    client.emit('changechatroom');
  });

  client.on('openchatroom', (message) => {
    client.emit('openchatroom'+message,message);
  });
});
// port for socket.io (can be change || cannot same with port app)
io.listen(8000);
//API hosted @ port
app.listen(port, () => {
  console.log('Server start at '+port)
});

module.exports = app;
