const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user");
const check = require("../middlewares/auth");
const multer = require("multer");

// upload image multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./images/avatars");
  },
  filename: (req, file, cb) => {
    cb(null, "avatar-" + Date.now() + "-" + file.originalname);
  },
});
// multer object
const uploads = multer({storage});

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

// get avatar image
router.get(
  "/avatar/:file",
  check.authentification,
  UserController.getAvatar
);


// register user
router.post("/register", UserController.register);
// login user
router.post("/login", UserController.login);
// uppload image
router.post(
  "/upload",
  [check.authentification, uploads.single("file0")],
  UserController.uploadImage
);

//update user

router.put("/update", check.authentification, UserController.updateUser);

module.exports = router;
