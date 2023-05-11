const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user");
const check = require("../middlewares/auth");

router.get("/test-user", check.authentification, UserController.testUser);
// get one user profile
router.get(
  "/profile/:id",
  check.authentification,
  UserController.getOneUserProfile
);
// get list of users
router.get(
  "/list/:page?",
  check.authentification,
  UserController.getListOfUsers
);

// register user
router.post("/register", UserController.register);
// login user
router.post("/login", UserController.login);


//update user

router.put(
    "/update",
    check.authentification,
    UserController.updateUser
  );



module.exports = router;
