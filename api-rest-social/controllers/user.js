//import model
const User = require("../models/user.js");
const bcrypt = require("bcrypt");

const testUser = (req, res) => {
  return res.status(200).send({
    message: "Message sended from: controller/user.js",
  });
};

// user register

const register = async (req, res) => {
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

  try {
    // user duplicate record control
    const existingUser = await User.findOne({
      $or: [
        { email: newUser.email.toLowerCase() },
        { email: newUser.nick.toLowerCase() },
      ],
    });

    if (existingUser) {
      return res.status(200).send({
        status: "success",
        message: "User already exists",
      });
    }

    // encrypt password
    const salt = await bcrypt.genSalt(10);
    const passhashed = await bcrypt.hash(newUser.password, salt);

    newUser.password = passhashed;

    await newUser.save((error, userStored) => {
      if (error || !userStored)
        return res.status(500).send({ status: "error" });
    });

    return res.status(200).send({
      status: "success",
      message: "User registered successfully",
      newUser: newUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: "Error trying to consult DB",
    });
  }
};

const login = async (req, res) => {
  let userData = req.body;

  if (!userData.email || !userData.password) {
    return res.status(500).send({
      status: "error",
      message: "missing data",
    });
  }

  try {
    const dataForLogin = await User.findOne({ email: userData.email });
    // .select({ password: 0});

    if (!dataForLogin) {
      return res.status(404).send({
        status: "error",
        message: "user does not exist in DB",
      });
    }
    // check and compare password

    const verifyPassword = bcrypt.compareSync(
      userData.password,
      dataForLogin.password
    );

    if (!verifyPassword) {
      return res.status(400).send({
        status: "error",
        message: "The password is incorrect",
      });
    }

    const token = false;

    return res.status(200).send({
      status: "success",
      message: "User login successfully",
      dataForLogin: {
        id: dataForLogin.id,
        name: dataForLogin.name,
        nickname: dataForLogin.nickname,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: "Error trying to consult DB",
    });
  }
};

module.exports = {
  testUser,
  register,
  login,
};
