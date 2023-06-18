//Model import
const Publication = require("../models/publications");
//necessary dependencies for publication getfiles
const fs = require("fs");
const path = require("path");
//import service to get array of users I follow
const followService = require("../services/followUserIds");

//testing route
const testPublication = (req, res) => {
  return res.status(200).send({
    message: "Message sended from: controller/pubublication.js",
  });
};
// Save publication
const savePublication = async (req, res) => {
  const paramsForm = req.body;

  if (!paramsForm.text)
    return res.status(400).send({ message: "Please enter information" });
  //create object
  let newPublication = new Publication(paramsForm);
  newPublication.user = req.user.id;
  //save object on db

  try {
    newPublication.save();

    return res.status(200).send({
      status: "success",
      message: "Publication saved successfully",
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Failed to save publication",
    });
  }
};

//get publication
const getPublication = async (req, res) => {
  const publicationId = req.params.id;

  console.log(publicationId);

  if (!publicationId)
    return res.status(404).send({ message: "Please enter a publication" });

  try {
    const publication = await Publication.findById({ _id: publicationId });
    return res.status(200).send({
      message: "Success",
      publicationId,
      publication,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Failed to save publication",
    });
  }
};

//delete publication
const deletePublication = async (req, res) => {
  const publicationToDelete = req.params.id;

  if (!publicationToDelete)
    return res.status(400).send({ message: "please enter a publication" });

  try {
    const publicationDeleted = await Publication.findByIdAndDelete({
      _id: publicationToDelete,
    });

    return res.status(200).send({
      message: "Publication",
      publication_deleted: publicationDeleted,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Failed to delete publication",
    });
  }
};

//get list of publications by user
const getPublicationsByUser = async (req, res) => {
  const userId = req.params.id;

  const page = 1;

  const itemsPerPage = 5;

  if (req.params.page) page = req.params.page;

  if (!userId)
    return res.status(404).send({ message: "Please enter a publication" });

  try {
    const publicationsByUser = await Publication.find({ user: userId })
      .sort("-created_at")
      .populate("user", "-password -__v -role")
      .paginate(page, itemsPerPage);

    if (publicationsByUser.length <= 0 || !publicationsByUser) {
      return res.status(404).send({
        status: "Error",
        message: "No publications to show you",
      });
    }

    return res.status(200).send({
      message: "success",
      user_publications: publicationsByUser,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Failed to find publications",
    });
  }
};
//upload file by publication
const uploadImage = async (req, res) => {
  const publicationId = req.params.id;

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
    const imagePublicationUploaded = await Publication.findByIdAndUpdate(
      { user: req.user.id, _id: publicationId.trim() },
      { file: req.file.filename },
      { new: true }
    );

    return res.status(200).send({
      message: "Success",
      user: req.user.name,
      publiation_file: imagePublicationUploaded,
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

// get publication image
const getPublicationImage = async (req, res) => {
  const file = req.params.file;

  const filePath = "./images/publications/" + file.trim();

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
//show publications feed
const showPublicationsFeedToUser = async (req, res) => {
  //get actual page

  let page = 1;

  if (req.params.page) page = req.params.page;

  //set number of items per page

  let itemsPerPage = 5;

  //get an array of user id´s from user that I already follow

  try {
    const myFollows = await followService.followUserIds(req.user.id);

    const publicationsByUsers = await Publication.find({
      user: myFollows.following,
    })
      .populate("user", "-password -role -__v -email")
      .sort("created_at")
      .paginate(page,itemsPerPage);

    return res.status(200).send({
      status: "success",
      message: "Publications feed router is working properly",
      total_publications: publicationsByUsers.length,
      page: page,
      pages: Math.ceil(publicationsByUsers.length/itemsPerPage),
      people_i_follow: myFollows.following,
      publications_by_user_I_follow: publicationsByUsers,

    });
  } catch (error) {
    return res.status(500).send({
      status: "ERROR",
      message: "Publications feed router is working properly",
    });
  }

  //Find publications
};

module.exports = {
  testPublication,
  savePublication,
  getPublication,
  deletePublication,
  getPublicationsByUser,
  uploadImage,
  getPublicationImage,
  showPublicationsFeedToUser,
};
