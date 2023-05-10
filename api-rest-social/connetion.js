const mongoose = require('mongoose');


const connection = async() => {

    try {
        await mongoose.connect("mongodb://localhost:27017/social-network");
        console.log("connection established");
    } catch (error) {
        console.log(error);
        throw new Error ("No se ah podido conectar  a la base de datos ");
    }
}


module.exports = {

    connection

}
