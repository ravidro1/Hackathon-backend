const csvtojson = require("csvtojson");
const xlsx = require("xlsx");
const readXlsxFile = require("read-excel-file/node");
const {default: axios} = require("axios");
const multer = require("multer");
const Execl = require("../Models/Execl");
const User = require("../Models/User");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
  },
});

const upload = multer({storage: storage});

exports.handleFileUpload = async (req, res) => {
  try {
    // Call upload.single to save the file to disk
    upload.single("uploadFile")(req, res, async (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({message: "Internal Server Error"});
      }

      // Read the uploaded file using xlsx library
      const filePath = `public/${req.file.filename}`;
      const xlFile = xlsx.readFile(filePath);
      xlsx.readFile(`public/${req.file.filename}`);
      // Extract the first sheet from the Excel file
      const sheet = xlFile.Sheets[xlFile.SheetNames[0]];
      console.log(sheet);
      // Convert the sheet data to JSON format
      const sheetJSON = xlsx.utils.sheet_to_json(sheet);

      fs.unlinkSync(filePath);

      // If sheetJSON is empty or undefined, respond with an error message
      if (!sheetJSON) {
        return res
          .status(400)
          .json({message: "Failed to convert file to JSON", data: sheetJSON});
      }

      // Respond with the converted JSON data
      return res.status(200).json({
        message: "File uploaded and converted to JSON",
        data: sheetJSON,
      });
    });
  } catch (err) {
    // Handle any errors that might occur during file upload, file reading or JSON conversion
    console.error(err);
    return res.status(500).json({message: "Internal Server Error"});
  }
};

exports.uploadTableToDataBase = (req, res) => {
  const {user_id, name, dataType, tableData} = req.body;

  const newExecl = new Execl({
    name: name,
    execl_dataTypes: dataType,
    execl_structure: tableData,
  });

  newExecl.save().then((execl) => {
    if (!execl) {
      res.status(400).json({message: "Upload Execl Faild!!!"});
    } else {
      User.findById(user_id)
        .then((user) => {
          if (!user) {
            res.status(400).json({message: "User Not Found"});
          } else {
            user.Execl_Array.push(execl);
            user.save().catch((err) => {
              res.status(400).json({message: "Upload Execl To User Faild!!!"});
            });
            res.status(200).json({
              message: "Upload Execl Success!!!",
              execlName: execl.name,
              execlTable: tableData,
              execlDataType: execl.execl_dataTypes,
            });
          }
        })
        .catch((err) => {
          res.status(500).json({message: "Error", err});
        });
    }
  });
};

exports.getAllTable = (req, res) => {
  Execl.findById(req.body.id)
    .then((execl) => {
      if (!execl) {
        res.status(400).json({message: "Execl Not Found"});
      } else {
        res.status(200).json({message: "Execl Found", execlTable: execl});
      }
    })
    .catch((err) => {
      res.status(500).json({message: "Error", err});
    });
};

exports.addRowToTable = (req, res) => {
  Execl.findByIdAndUpdate(req.body.id)
    .then((execl) => {
      if (!execl) {
        res.status(400).json({message: "Execl Not Found"});
      } else {
        execl.execl_structure.push(req.body.newRow);
        execl.save().catch((err) => {
          res.status(500).json({message: "Error", err});
        });

        res.status(200).json({message: "Execl Found", execlTable: execl});
      }
    })
    .catch((err) => {
      res.status(500).json({message: "Error", err});
    });
};

exports.deleteTable = (req, res) => {
  Execl.findByIdAndDelete(req.body.execl_id)
    .then((execl) => {
      if (!execl) {
        res.status(400).json({message: "Execl Not Found"});
      } else {
        User.findById(req.body.user_id)
          .then((user) => {
            if (!user) {
              res.status(400).json({message: "User Not Found"});
            } else {
              res.status(200).json({message: "Execl Delete From User"});
            }
          })
          .catch((err) => {
            res.status(500).json({message: "Error", err});
          });
        res.status(200).json({message: "Success: Execl Delete"});
      }
    })
    .catch((err) => {
      res.status(500).json({message: "Error", err});
    });
};
