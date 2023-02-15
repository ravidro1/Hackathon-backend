const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();

mongoose
  .connect(
    "mongodb+srv://q:q@cluster0.il93isu.mongodb.net/?retryWrites=true&w=majority",
    {}
  )
  .then(() => {
    console.log("connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(cors());
app.use(bodyParser.json());

const ExeclFunctions = require("./Controller/ExeclController");
const UserController = require("./Controller/UserController");

app.post("/SignUp", UserController.signup);
app.post("/Login", UserController.login);
app.post(
  "/LoginVerifyAndCheckIfUserAlreadyLogged",
  UserController.loginVerifyAndCheckIfUserAlreadyLogged
);
// app.post("/GetUser", UserController.getUser);
// app.post("/Logout", UserController.logout);

// app.post("/UploadFile", ExeclFunctions.UploadFile);
app.post("/HandleFileUpload", ExeclFunctions.handleFileUpload);
app.post("/UploadTableToDataBase", ExeclFunctions.uploadTableToDataBase);

app.listen(8000, () => console.log("listen on port 8000"));
