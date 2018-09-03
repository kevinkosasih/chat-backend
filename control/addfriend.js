const Account = require('../models/accountmodel');
const AccountSession = require('../models/accountsessionmodel');
const crypto = require('crypto')
const algorithm = 'aes-256-ctr'
const KeyCookies = "setCookiesTokenChatApp"
const atob = require('atob')


module.exports.addFriends = (req,res) =>{
  const {body,headers} = req;
  const {
    friendlist,
  } = body;
  const {cookie} = headers
  if(!cookie){
    return res.send({
      success:false
    })
  }
  if(!friendlist|| !friendlist.username|| !friendlist.name){
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
    AccountSession.find({
      _id:token,
      isDeleted:false
    },(err,currentToken) =>{
      if(err){
        return res.send({
          success: false,
          message: 'Error: Server error'
        });
      }
      if(currentToken.length != 1){
        return res.send({
          success: false,
          message: 'Error: invalid data.'
        });
      }
      const{accountid}=currentToken[0]
      Account.find({
        _id:accountid
      },(err,account)=>{
        if(err){
          return res.send({
            success: false,
            message: 'Error: Server error'
          });
        }
        console.log(friendlist.username,friendlist.name);
        let userfriendList = account[0].friends.concat({
          username:friendlist.username,
          name:friendlist.name
        })
        Account.findOneAndUpdate({
          _id:accountid
        },{
          $set:{
            friends:userfriendList
          }
        },null,(err)=>{
          if(err){
            return res.send({
              success: false,
              message: 'Error: Server error'
            });
          }
          return res.send({
            success:true,
            message:'success'
          })
        })
      })
      }
    )
  }
  else{
    return res.send({
      success:false
    })
  }
};
