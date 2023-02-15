const csvtojson = require("csvtojson");
const xlsx = require("xlsx");
const readXlsxFile = require("read-excel-file/node");
const { default: axios } = require("axios");
const multer = require("multer");
const Execl = require("../Models/Execl");
const User = require("../Models/User");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

exports.handleFileUpload = async (req, res) => {
  try {
    // Call upload.single to save the file to disk
    upload.single("uploadFile")(req, res, async (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      // Read the uploaded file using xlsx library
      const xlFile = xlsx.readFile(`public/${req.file.filename}`);

      // Extract the first sheet from the Excel file
      const sheet = xlFile.Sheets[xlFile.SheetNames[0]];

      // Convert the sheet data to JSON format
      const sheetJSON = xlsx.utils.sheet_to_json(sheet);

      // If sheetJSON is empty or undefined, respond with an error message
      if (!sheetJSON) {
        return res
          .status(400)
          .json({ message: "Failed to convert file to JSON", data: sheetJSON });
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
    return res.status(500).json({ message: "Internal Server Error" });
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
            res.status(200).json({message: "Upload Execl Success!!!"});
          }
        })
        .catch((err) => {
          res.status(500).json({message: "Error", err});
        });
    }
  });
};
