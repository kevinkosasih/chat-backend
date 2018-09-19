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
  console.log(friendlist.username);
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
    let decryptAtob = atob(getToken[1])
    var decipher = crypto.createDecipher(algorithm,KeyCookies)
    var decrypted = decipher.update(decryptAtob,'hex','utf8')
    decrypted += decipher.final('utf8');
    AccountSession.find({
      _id:JSON.parse(decrypted).token,
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
        $or:[{_id:accountid},{username:friendlist.username}]
      },(err,account)=>{
        if(err){
          return res.send({
            success: false,
            message: 'Error: Server error'
          });
        }
        if(account.length != 2 ){
          return res.send({
            success:false,
            message:"Error: Data invalid"
          })
        }
        let userfriendList = [] ,
            userRequesList = []
        if(accountid === account[0]._id){
          let userfriendList = account[0].friends.concat({
            username:friendlist.username,
            name:friendlist.name
          })
          let userRequesList = account[1].friendrequest.concat({
            username:account[0].username,
            name:account[0].name
          })
        } else {
          let userfriendList = account[1].friends.concat({
            username:friendlist.username,
            name:friendlist.name
          })
          let userRequesList = account[0].friendrequest.concat({
            username:account[1].username,
            name:account[1].name
          })
        }
        console.log(account[0].friendrequest);
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
          Account.findOneAndUpdate({
            username:friendlist.username
          },{
            $set:{
              friendrequest:userRequesList
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
