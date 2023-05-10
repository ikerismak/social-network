const express = require('express');
const router = express.Router();
const UserController = require("../controllers/publication");





router.get('/test-publication', UserController.testPublication);


module.exports = router;
