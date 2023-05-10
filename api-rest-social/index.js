// import dependencies
const {connection} = require("./connetion");
const express = require("express");
const cors = require("cors");




console.log("**** API NODE SOCIAL NETWORK IS WORIKIG PROPIERLY ***");
connection()



const app = express();

const port = 3900;


app.use(cors());

app.use(express.json());

app.use(express.urlencoded({extended: true}));


const UserRoutes = require("./routes/user");
const PublicationRoutes = require("./routes/publication");
const FollowRoutes = require("./routes/follow");


app.use("/api/user", UserRoutes);
app.use("/api/publication", PublicationRoutes);
app.use("/api/follow", FollowRoutes);






// test route

app.get("/test-route", (req, res) => {

    return res.status(200).json(
        {
            "id": 1,
            "name": "Iker",
            "web": "ikertoscano.com"
        }
    )
})


app.listen(port, ()=>{
    console.log("server listening on port", port);
})
