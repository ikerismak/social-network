const jwt = require("jwt-simple");
const moment = require("moment");
const libJwt = require("../services/jwt");

// import secret keys

const secretKey = libJwt.secretKey;

// authentication function

exports.authentification = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(403).send({
      status: "error",
      message: "request header is missing",
    });
  }

  // clean token

  let token = req.headers.authorization.replace(/['"]+/g, "");

  try {
    let payload = jwt.decode(token, secretKey);

    console.log(payload.exp);
    console.log(moment().unix());

    if (payload.exp <= moment().unix()) {
      return res.status(401).send({
        status: "error",
        message: "token has expired",
      });
    }

    req.user = payload

  } catch (error) {
    return res.status(404).send({
      status: "error",
      message: "Invalid token",
      error,
    });
  }

  next();
};

// check headers

// encrypt token

// add user data to a resquest

// execute action
