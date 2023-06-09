const Follow = require("../models/follow.js");


const followUserIds = async(userId) => {

    let follwing = await Follow.find(userId)
                               .select({"_id": 0,"__v":0, user: 0});

    let followers = false;

    return {

        follwing,
        followers,

    }

}

const userAlreadyFollowed = async(userId, profileUserId) => {

}


module.exports = {

    followUserIds
}
