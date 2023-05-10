//import model
const User = require("../models/user.js");
const bcrypt = require("bcrypt");

const testUser = (req, res) => {
  return res.status(200).send({
    message: "Message sended from: controller/user.js",
  });
};

// register

const register = (req, res) => {
  //get data from collection
  let data = req.body;

  if (!data.name || !data.email || !data.password || !data.nick) {
    return res.status(500).send({
      status: "error",
      message: "missing data",
    });
  }
  // save new user
  let newUser = new User(data);

  // user duplicate record control

  // User.find({
  //   $or: [
  //     { email: newUser.email.toLowerCase() },
  //     { email: newUser.nick.toLowerCase() },
  //   ],
  // }).exec((error, users) => {
  //   if (error)
  //     return res.status(500).json({
  //       status: "error",
  //       message: "Error trying to consult DB",
  //     });

  //   if (users && users.length >= 1) {
  //     return res.status(200).send({
  //       status: "success",
  //       message: "User already exists",
  //       data: data,
  //     });
  //   }

  //   // encrypt password

  //   bcrypt.hash(newUser.password, 10, (error, passhashed) => {
  //     console.log(passhashed);
  //   })


  // });

  return res.status(200).send({
    status: "success",
    message: "User registered successfully",
    newUser: newUser
  });
};

//user validate

module.exports = {
  testUser,
  register,
};
