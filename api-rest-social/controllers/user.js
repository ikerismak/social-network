//import model
const User = require("../models/user.js");
const Follow = require("../models/follow.js");
const Publication = require("../models/publications");
//import libraries
const bcrypt = require("bcrypt");
const jwt = require("../services/jwt");
const Moongoosepaginate = require("mongoose-pagination");
const fs = require("fs");
const path = require("path");
const followService = require("../services/followUserIds");

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

    const followinfo = await followService.doIFollowThisUser(req.user.id, id);

    return res.status(200).send({
      status: "success",
      user: userProfile,
      following: followinfo.following,
      follower: followinfo.followers,
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
    const listUsers = await User.find()
      .select("-password -email -role -__v")
      .sort("_id")
      .paginate(page, itemPerPage);
    const totalUsers = await User.find().sort("_id");

    const total = parseInt(totalUsers.length);

    if (!listUsers) {
      return res.status(404).send({
        status: "error",
        message: "list dont finded it",
      });
    }

    const followinfo = await followService.followUserIds(req.user.id);

    return res.status(200).send({
      status: "success",
      message: "List of users",
      listUsers,
      page,
      itemPerPage,
      total,
      pages: Math.ceil(total / itemPerPage),
      following: followinfo.following,
      follower: followinfo.followers,
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

    if (userToUpdate.password) {
      const passhashed = await bcrypt.hash(userToUpdate.password, salt);
      userToUpdate.password = passhashed;
    }else{
      delete userToUpdate.password;
    }


    try {
      const userUpdated = await User.findByIdAndUpdate(
        userIdentity.id,
        userToUpdate,
        {
          new: true,
        }
      );

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
const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(200).send({
      status: "error",
      message: "image not found",
    });
  }

  let imageFile = req.file.originalname;

  // get extension

  const imageFileExtension = imageFile.split(".");
  const extension = imageFileExtension[1];

  //confirm extension

  if (
    extension != "png" &&
    extension != "jpg" &&
    extension != "jpeg" &&
    extension != "gif"
  ) {
    //get fil path to delete the wrong extension file
    const filePath = req.file.path;
    console.log(filePath);
    //delete file looking in the path
    const fileDeleted = fs.unlinkSync(filePath);
    //response with error message
    return res.status(400).send({
      status: "error",
      message: "Invalid extension file",
      file: filePath,
    });
  }

  // upload imagefile
  try {
    const imageUploaded = await User.findByIdAndUpdate(
      { _id: req.user.id },
      { image: req.file.filename },
      { new: true }
    );

    return res.status(200).send({
      message: "Success",
      user: req.user.name,
      file: req.file,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "error traiying to upload file",
      error,
    });
  }
};

const getAvatar = async (req, res) => {
  const file = req.params.file;

  const filePath = "./images/avatars/" + file;

  console.log(filePath);

  // if exists
  fs.stat(filePath, (error, exist) => {
    if (!exist) {
      return res.status(404).send({
        status: "error",
        message: "File does not exist",
      });
    }

    //response file existed
    return res.sendFile(path.resolve(filePath));
  });
};

const counters = async (req, res) => {
  let userId = req.user.id;

  if (req.params.id) {
    userId = req.params.id;
  }

  try {
    const following = await Follow.count({ user: userId });
    const followed = await Follow.count({ followed: userId });
    const publications = await Publication.count({ user: userId });

    return res.status(200).send({
      status: "success",
      message: "Counters",
      number_of_followed_users: followed,
      number_of_following_users: following,
      number_of_publications: publications,
    });
  } catch (error) {
    return res.status(200).send({
      status: "Error",
      message: "Failed to find data",
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
  uploadImage,
  getAvatar,
  counters
};
