const express = require('express');
const router = express.Router();
const publicationController = require("../controllers/publication");
const check = require("../middlewares/auth");
const multer = require("multer");

// upload image multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./images/publications");
    },
    filename: (req, file, cb) => {
      cb(null, "pub-" + Date.now() + "-" + file.originalname);
    },
  });

// multer object
const uploads = multer({storage});

router.get('/test-publication', publicationController.testPublication);

//Show one publication
router.get('/publication/:id',check.authentification, publicationController.getPublication);
//Show one publications by user id
router.get('/publications/:id/:page?',check.authentification, publicationController.getPublicationsByUser);

//Create a new publication
router.post('/save-publication',check.authentification,publicationController.savePublication);

//Delete a publication
router.delete('/publication/:id',check.authentification, publicationController.deletePublication);

//upload publication file
router.post('/upload/:id',[check.authentification, uploads.single("file0")] , publicationController.uploadImage)
//get publication image
router.get('/publication-image/:file?',check.authentification, publicationController.getPublicationImage);
//get feed
router.get('/publications-feed/:page?',check.authentification, publicationController.showPublicationsFeedToUser);



module.exports = router;
