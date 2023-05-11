//import model
const User = require("../models/user.js");
const bcrypt = require("bcrypt");
const jwt = require("../services/jwt");
const Moongoosepaginate = require("mongoose-pagination");

const testUser = (req, res) => {
  return res.status(200).send({
    message: "Message sended from: controller/user.js",
    user: req.user,
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

    try {
      await newUser.save();
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Error trying to consult DB",
      });
    }

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
// user login
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

    // tokengenerator imported

    const token = jwt.tokenGenerator(dataForLogin);

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
// user porfile
const getOneUserProfile = async (req, res) => {
  //get id by url
  const id = req.params.id;

  try {
    const userProfile = await User.findById(id);

    if (!userProfile) {
      return res.status(404).send({
        status: "error",
        message: "User does not exist",
      });
    }

    return res.status(200).send({
      status: "success",
      user: userProfile,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error trying to consult DB",
    });
  }
  //consult db profile
  //get user profile
};
// list of users
const getListOfUsers = async (req, res) => {
  let page = 1;

  if (req.params.page) {
    page = req.params.page;
  }

  page = parseInt(page);

  let itemPerPage = 5;

  try {
    const listUsers = await User.find().sort("_id").paginate(page, itemPerPage);
    const totalUsers = await User.find().sort("_id");

    const total = parseInt(totalUsers.length);

    if (!listUsers) {
      return res.status(404).send({
        status: "error",
        message: "list dont finded it",
      });
    }

    return res.status(200).send({
      status: "success",
      message: "List of users",
      listUsers,
      page,
      itemPerPage,
      total,
      pages: Math.ceil(total / itemPerPage),
    });
  } catch (error) {
    return res.status(404).send({
      status: "error",
      message: "list dont finded it",
      error,
    });
  }
};
//update user
const updateUser = async (req, res) => {
  let userIdentity = req.user;
  let userToUpdate = req.body;

  delete userToUpdate.iat;
  delete userToUpdate.exp;
  delete userToUpdate.rol;
  console.log("--------------------------------existing data");
  console.log(userIdentity);
  console.log("--------------------------------new info");
  console.log(userToUpdate);

  try {
    // user duplicate record control
    const existingUser = await User.find({
      $or: [
        { email: userToUpdate.email.toLowerCase() },
        { nick: userToUpdate.nick.toLowerCase() },
      ],
    });

    let userExistingFlag = false;

    existingUser.forEach((singleUser) => {
      if (singleUser && singleUser.id != userToUpdate.id) {
        userExistingFlag = true;
      }
    });

    if (userExistingFlag) {
      return res.status(403).send({
        status: "Alert",
        message: "User already exists",
      });
    }
    // encrypt password
    const salt = await bcrypt.genSalt(10);
    const passhashed = await bcrypt.hash(userToUpdate.password, salt);

    userToUpdate.password = passhashed;

    try {
      const userUpdated = await User.findByIdAndUpdate(userIdentity.id, userToUpdate, {
        new: true,
      });

      return res.status(200).send({
        status: "success",
        message: "User updated successfully",
        userUpdated,
      });
    } catch (error) {
      return res.status(404).send({
        status: "error",
        message: "error traiying to update user",
        error,
      });
    }
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "user update failed",
    });
  }
};

module.exports = {
  testUser,
  register,
  login,
  getOneUserProfile,
  getListOfUsers,
  updateUser,
};
