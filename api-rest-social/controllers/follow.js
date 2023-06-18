const { findById } = require("../models/follow.js");
const Follow = require("../models/follow.js");
const User = require("../models/user.js");
const Moongoosepaginate = require("mongoose-pagination");
const followService = require("../services/followUserIds");

const testFollow = (req, res) => {
  return res.status(200).send({
    message: "Message sended from: controller/follow.js",
  });
};

const followUser = async (req, res) => {
  //get user to follow by body

  const userToFollow = req.body;
  const userIdentified = req.user;

  console.log(userToFollow.followed);

  const UserAndFollowed = new Follow({
    user: userIdentified.id,
    followed: userToFollow.followed.trim(),
  });

  //get id of the identified user
  //save follow

  try {
    if (!UserAndFollowed) {
      return res.status(500).send({
        status: "error",
        message: "form or user does not exist",
      });
    }

    UserAndFollowed.save();

    return res.status(200).send({
      status: "success",
      message: "Now you are following this user",
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Failed to follow this user",
    });
  }
};

const unfollow = async (req, res) => {
  const userToUnfollow = req.params.id;
  const userIdentified = req.user.id;
  console.log("user" + userIdentified);
  console.log("followed:" + userToUnfollow);

  try {
    const followStorage = await Follow.find({
      user: userIdentified,
      followed: userToUnfollow,
    }).deleteMany();

    if (!followStorage) {
      return res.status(404).send({
        status: "not found",
        message: "this user is already unfollowed",
      });
    }

    return res.status(200).send({
      status: "succes",
      message: "this user is not longer followed by you",
    });
  } catch (error) {
    return res.status(404).send({
      status: error,
      message: "Filed to found this follow",
    });
  }
};

const getFollowedUserslist = async (req, res) => {
  const userIdentified = req.user.id;

  if (req.params.ide) userIdentified = req.params.id;

  let page = 1;

  if (req.params.page) page = req.params.page;

  const itemsPerPage = 5;

  try {
    //populate:  brings the complete object related with the id that the user is following
    //paginate:  only shows a few items per page and made more pages
    const followedUsersLIst = await Follow.find({
      user: userIdentified,
    })
      .populate("user followed", "-password -role -__v -email")
      .paginate(page, itemsPerPage);

    const total = parseInt(followedUsersLIst.length);

    //list of user id´s that i follow and they are follow me

    let followUserIds = await followService.followUserIds(userIdentified);

    return res.status(200).send({
      message: "List of follows",
      followedUsersLIst,
      total,
      pages: Math.ceil(total / itemsPerPage),
      followed_users: followUserIds.following,
      folloers: followUserIds.followers,
    });
  } catch (error) {
    return res.status(404).send({
      status: error,
      message: "Filed to found this request",
    });
  }
};

const getFollowers = async (req, res) => {

  const userIdentified = req.user.id;


  if (req.params.ide) userIdentified = req.params.id;

  let page = 1;

  if (req.params.page) page = req.params.page;

  const itemsPerPage = 5;

  try {
    //populate:  brings the complete object related with the id that the user is following
    //paginate:  only shows a few items per page and made more pages
    const followersLIst = await Follow.find({
      followed: userIdentified,
    })
      .populate("user", "-password -role -__v -email")
      .paginate(page, itemsPerPage);

    const total = parseInt(followersLIst.length);

    //list of user id´s that i follow and they are follow me

    let followUserIds = await followService.followUserIds(userIdentified);

    return res.status(200).send({
      message: "List of followers",
      followersLIst,
      total,
      pages: Math.ceil(total / itemsPerPage),
      followed_users: followUserIds.following,
      folloers: followUserIds.followers,
    });
  } catch (error) {
    return res.status(404).send({
      status: error,
      message: "Filed to found this request",
    });
  }



}

module.exports = {
  testFollow,
  followUser,
  unfollow,
  getFollowedUserslist,
  getFollowers
};
