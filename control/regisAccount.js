const Account = require('../models/accountmodel');

module.exports.newRegis= (req,res) => {
  const { body } = req;
  const {
    username,
    password,
    name
  } = body;
  let {
    email
  } = body;

  if (!username) {
      return res.send({
        success: false,
        message: 'Error: username cannot be blank.'
      });
    }
  if (!password) {
      return res.send({
        success: false,
        message: 'Error: Password cannot be blank.'
      });
  }
  if (!name) {
      return res.send({
        success: false,
        message: 'Error: name cannot be blank.'
      });
    }
    if (!email) {
      return res.send({
        success: false,
        message: 'Error: email cannot be blank.'
      });
  }
  email = email.toLowerCase();
  email = email.trim();
  // Steps:
  // 1. Verify email doesn't exist
  // 2. Save
  Account.find({
    $or:[{username: username},{email: email}]
  }, (err, previousAccounts) => {
    if (err) {
      return res.send({
        success: false,
        message: 'Error: Server error'
      });
    }

    if(previousAccounts.length != 0){

       if (previousAccounts[0].username == username && previousAccounts[0].email == email) {
        return res.send({
          success: false,
          message: 'Account already exist.'
        });
      } else if (previousAccounts[0].username == username) {
        return res.send({
          success: false,
        });
      } else if (previousAccounts[0].email == email) {
        return res.send({
          success: false,
        });
      }
    }

    const newAccount = new Account({
      friends:[],
      chatList:[],
    });

    newAccount.username = username
    newAccount.password = newAccount.generateHash(password)
    newAccount.email = email
    newAccount.name = name
    newAccount.registerDate = Date.now();
    newAccount.save((err, newUser) => {
      if (err) {
        return res.send({
          success: false,
          message: 'Error: Server error'
        });
      }
      Account.findOneAndUpdate({
        username:"ADMIN"
      },{
        $push:{
          friends:[{
            username:newUser.username,
            name:newUser.name
          }]
        }
      },{new:true},(err,adminAccount) =>{
        if(err){
          return res.send({
            success:false
          })
        }
        Account.findOneAndUpdate({
          username:newUser.username
        },{
          $push:{
            friends:[{
              username:adminAccount.username,
              name:adminAccount.name
            }]
          }
        },{new:true},(err) =>{
          if(err){
            return res.send({
              success:false
            })
          }
          return res.send({
            success: true,
            message: 'Signed up'
          });
        })
      })
    });
  });
};
