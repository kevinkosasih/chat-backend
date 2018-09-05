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
    $or:[{email: email},{username: username}]
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
          message: 'Error: Account already exist.'
        });
      } else if (previousAccounts[0].email == email) {
        return res.send({
          success: false,
          message: 'Error: Email already exist.'
        });
      } else if (previousAccounts[0].username == username) {
        return res.send({
          success: false,
          message: 'Error: Username already exist.'
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
    newAccount.save((err, user) => {
      if (err) {
        return res.send({
          success: false,
          message: 'Error: Server error'
        });
      }
      return res.send({
        success: true,
        message: 'Signed up'
      });
    });
  });
};
