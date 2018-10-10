const Account = require('../models/accountmodel');
const AccountSession = require('../models/accountsessionmodel');
const crypto = require('crypto')
const algorithm = 'aes-256-ctr'
const KeyCookies = "setCookiesTokenChatApp"
const atob = require('atob')

module.exports.add = (req,res) => {
  const {headers,body} = req
  const {
    username,
    name,
    picture
  } = body
  const{
    cookie
  } = headers
  if(!cookie){
    return res.send({
      success:false
    })
  }
  if(!username && !name){
    return res.send({
      success:false,
      message:'Error: Cannot be blank',
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
      _id:JSON.parse(decrypted).token
    },(err,currentToken) => {
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

      const {accountid} = currentToken[0]
      Account.find({
        _id:accountid
      },(err,currentAccount) =>{
        if(err){
          return res.send ({
            success:false,
            message:'Error: Server error'
          })
        }

        if(currentAccount.length != 1){
          return res.send({
            success: false,
            message: 'Error: Data Invalid.'
          });
        }

        Account.findOneAndUpdate({
          _id:currentAccount[0]._id
        }, {
          $push: {friends:{
            username:username,
            name: name,
            picture : picture
          }}
        },{new: true},(err)=>{
          if(err){
            return res.send ({
              success:false,
              message:'Error: Server error'
            })
          }
          Account.findOneAndUpdate({
            _id:currentAccount[0]._id
          }, {
            $pull: {friendrequest:{
              username:username,
              name: name,
              picture : picture
            }}
          },{new: true},(err)=>{
            if(err){
              return res.send ({
                success:false,
                message:'Error: Server error'
              })
            }
            console.log(err);
            return res.send ({
              success:true,
              message : "Added as a friend",
              picture : picture
            })
          })
        })
      })
    })
  }
};

module.exports.block = (req,res) => {
  const {headers,body} = req
  const {
    username,
    name,
    picture
  } = body
  const{
    cookie
  } = headers
  if(!cookie){
    return res.send({
      success:false
    })
  }
  if(!username){
    return res.send({
      success:false,
      message:'Error: Cannot be blank',
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
      _id:JSON.parse(decrypted).token
    },(err,currentToken) => {
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

      const {accountid} = currentToken[0]
      Account.find({
        _id:accountid
      },(err,currentAccount) =>{
        if(err){
          return res.send ({
            success:false,
            message:'Error: Server error'
          })
        }

        if(currentAccount.length != 1){
          return res.send({
            success: false,
            message: 'Error: Username or password is wrong.'
          });
        }

        Account.findOneAndUpdate({
          _id:currentAccount[0]._id
        }, {
          $push: {blacklist:{
            username:username,
            name: name,
            picture : picture
          }}
        },{new: true},(err)=>{
          if(err){
            return res.send ({
              success:false,
              message:'Error: Server error'
            })
          }
          Account.findOneAndUpdate({
            _id:currentAccount[0]._id
          }, {
            $pull: {friendrequest:{
              username:username,
              name: name,
              picture : picture
            }}
          },{new: true},(err)=>{
            if(err){
              return res.send ({
                success:false,
                message:'Error: Server error'
              })
            }
            console.log(err);
            return res.send ({
              success:true,
              message : "You block this user",
              picture : picture
            })
          })
        })
      })
    })
  }
};
