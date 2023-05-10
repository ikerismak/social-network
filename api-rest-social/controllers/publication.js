const testPublication = (req, res) => {
  return res.status(200).send({
    message: "Message sended from: controller/pubublication.js",
  });
};

module.exports = {
  testPublication,
};
