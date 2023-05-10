const express = require('express');
const router = express.Router();
const UserController = require("../controllers/follow");





router.get('/test-follow', UserController.testFollow);


module.exports = router;
