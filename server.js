const express = require('express');
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
const addFriends = require('./control/addfriend')
const changePassword = require ('./control/changePassword')
const editprofile = require('./control/editprofile')
const request = require('./control/addblock')
const checkrequest = require('./control/checkrequest')
const search = require('./control/searchfriend')
const notification = require('./control/notification')
const unsendMessage = require('./control/unsendMessage')

//routing API
app.get('/getdata',loginAccount.dataToken)
app.get('/logout',logoutAccount.logout)
app.get('/verify',verify.verify)
app.post('/getchat',getChat.getchat)
app.post('/login',loginAccount.login)
app.post('/regisnew',regisAccount.newRegis)
app.post('/search',search.search)
app.post('/chat',chathitory.savechat)
app.post('/check',checkrequest.cekRequest)
app.put('/add',request.add)
app.put('/Friends', addFriends.addFriends)
app.put('/addchatroom',newChatRoom.newchatroom)
app.put('/changepassword',changePassword.changePassword)
app.put('/editprofile',editprofile.editprofile)
app.put('/readNotif',notification.read)
app.delete('/unsendMessage',unsendMessage.unsendMessage)

//port API (can be change)
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
    console.log(message);
    client.broadcast.emit('chatlist'+message.otherusername,{username:message.myusername,name:message.myname,chatId:message.chatId,picture : message.mypicture,description : message.mydescription});
    client.emit('chatlist'+message.myusername,{username:message.otherusername,name:message.othername,chatId:message.chatId,picture : message.otherpicture,description : message.otherdescription});
  });

  client.on('editprofile', (message) => {
    client.broadcast.emit('edit'+message.username,{message});
  });

  client.on('newfriend', (message) => {
    client.emit('newfriend'+message.myUsername,message);
  });

  client.on('blockfriend', (message) => {
    client.emit('blockfriend'+message.myUsername,message);
  });

  client.on('blockchat', (message) => {
    client.emit('blockchat'+message,message);
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

  client.on('scrollMyChatroom', (message) => {
    client.emit('scrollMyChatroom');
  });

  client.on('scrollOtherChatroom', (message) => {
    client.broadcast.emit('scrollOtherChatroom');
  });

  client.on('unsendMessage', (message) => {
    client.broadcast.emit('unsendMessage'+message.chatId,message.timeStamp);
    client.emit('unsendMessage'+message.chatId,message.timeStamp);
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
