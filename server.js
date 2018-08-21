const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan')
const compression = require("compression");
const helmet = require('helmet')
const app = express();
const io = require('socket.io')();
const cookieParser = require('cookie-parser')


app.use(morgan('common'))
app.use (helmet())
//middleware using cors and bodyParser
app.use(cors({origin:'http://10.183.28.154:3000'}));

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
const addFriends = require('./control/addfriend')
//routing API
app.get('/getdata',loginAccount.dataToken)
app.get('/logout',logoutAccount.logout)
app.get('/verify',verify.verify)
app.post('/login',loginAccount.login)
app.post('/regisnew',regisAccount.newRegis)
app.post('/chat',chathitory.savechat)
app.put('/Friends', addFriends.addFriends)
app.put('/addchatroom',chathitory.newchatroom)

//port API (can be change)
const port = 3001;
//openconnection for socket.io
io.on('connection', (client) => {
  console.log("connected");
  client.on('sendChat', (message) => {
    client.broadcast.emit(message.reciever,{message,send:1});
    client.emit(message.sender,{message,send:0});
  });
});
// port for socket.io (can be change || cannot same with port app)
io.listen(8000);
//API hosted @ port
app.listen(port, () => {
  console.log('Server start at '+port)
});

module.exports = app;
