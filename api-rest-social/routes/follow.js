const express = require('express');
const router = express.Router();
const FollowController = require("../controllers/follow");
const check = require("../middlewares/auth");



//Test endpoint
router.get('/test-follow', FollowController.testFollow);

//Followed users
router.get('/followeduserlist/:id?/:page?',check.authentification, FollowController.getFollowedUserslist);
//List of followers

//Follow user
router.post('/follow-user',check.authentification,FollowController.followUser);

//Unfollow user
router.delete('/unfollow-user/:id',check.authentification,FollowController.unfollow);

//



module.exports = router;
