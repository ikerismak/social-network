const Follow = require("../models/follow.js");

const followUserIds = async (userId) => {
  let following = await Follow.find({ user: userId }).select({
    _id: 0,
    __v: 0,
    user: 0,
  });

  let followers = await Follow.find({ followed: userId }).select({
    _id: 0,
    __v: 0,
  });

  // only followed array
  let followingArrayCleaned = following.map((follow) => follow.followed);

  //onlyfollowers
  let followersArrayCleaned = followers.map((follower) => follower.user);

  // if(followersArrayCleane) followersArrayCleaned = ["you don´t have any followers"];

  return {
    following: followingArrayCleaned,
    followers: followersArrayCleaned,
  };
};

const doIFollowThisUser = async (userId, profileUserId) => {
    let following = await Follow.findOne({ user: userId, followed: profileUserId});

    let followers = await Follow.findOne({ user: profileUserId, followed: userId});

    return {
        following,
        followers
    }
};

module.exports = {
  followUserIds,
  doIFollowThisUser
};
