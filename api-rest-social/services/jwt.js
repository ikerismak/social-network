const jtw = require("jwt-simple");
const moment = require("moment");


// secret key

const secretKey =  "SECRET_KEY_OF_SOTIAL_NETWORK";


// TOKEN GENERATOR
const tokenGenerator = (user) =>{

     const payload  = {
        id: user.id,
        name: user.name,
        surname: user.surname,
        nick: user.nick,
        email: user.email,
        role: user.role,
        imagen: user.imagen,
        iat: moment().unix(),
        exp: moment().add(30,"days").unix()

     };

     return jtw.encode(payload,secretKey);
}

module.exports = {

   tokenGenerator,
   secretKey,




}
