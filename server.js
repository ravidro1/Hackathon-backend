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

const ExcelFunctions = require("./Controller/ExcelController");
const UserController = require("./Controller/UserController");

app.post("/SignUp", UserController.signup);
app.post("/Login", UserController.login);
app.post(
  "/LoginVerifyAndCheckIfUserAlreadyLogged",
  UserController.loginVerifyAndCheckIfUserAlreadyLogged
);

// app.post("/GetUser", UserController.getUser);
// app.post("/Logout", UserController.logout);

// app.post("/UploadFile", excelFunctions.UploadFile);

app.post("/HandleFileUpload", ExcelFunctions.handleFileUpload);
app.post("/UploadTableToDataBase", ExcelFunctions.uploadTableToDataBase);
app.post("/GetAllTable", ExcelFunctions.getAllTable);
app.post("/AddRowToTable", ExcelFunctions.addRowToTable);
app.post("/DeleteTable", ExcelFunctions.deleteTable);
app.post("/EditExcel", ExcelFunctions.editExcel);

app.listen(8000, () => console.log("listen on port 8000"));
