const csvtojson = require("csvtojson");
const xlsx = require("xlsx");
const readXlsxFile = require("read-excel-file/node");
const { default: axios } = require("axios");
const multer = require("multer");
const Excel = require("../Models/Excel");
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
      const filePath = `public/${req.file.filename}`;
      const xlFile = xlsx.readFile(filePath);
      xlsx.readFile(`public/${req.file.filename}`);
      // Extract the first sheet from the Excel file
      const sheet = xlFile.Sheets[xlFile.SheetNames[0]];
      // Convert the sheet data to JSON format
      const sheetJSON = xlsx.utils.sheet_to_json(sheet);

      const tempKeys = [];
      sheetJSON.forEach((row) => {
        Object.keys(row).map((key) => {
          if (tempKeys.includes(key) || key.includes("__EMPTY")) {
          } else if (key.length > 0) {
            tempKeys.push(key);
          }
        });
      });

      let filterJSON = sheetJSON.map((row) => {
        const tempRow = {};

        Object.keys(row).forEach((key) => {
          if (!tempKeys.includes(key)) {
          } else if (row[key].toString().length < 1) {
            tempRow[key] = "";
          } else {
            tempRow[key] = row[key];
          }
        });

        Object.values(tempKeys).forEach((key) => {
          if (!Object.keys(tempRow).includes(key)) {
            tempRow[key] = "";
          }
        });

        let isAllRowEmpty = "";

        Object.values(tempRow).map((value) => {
          isAllRowEmpty += value;
        });

        if (isAllRowEmpty.length > 0) {
          return tempRow;
        }
      });

      // console.log(sheetJSON);
      // console.log(filterJSON);

      filterJSON = filterJSON.filter(
        (item) => item != undefined && item != null
      );

      fs.unlinkSync(filePath);

      // If sheetJSON is empty or undefined, respond with an error message
      if (!sheetJSON) {
        return res
          .status(400)
          .json({ message: "Failed to convert file to JSON", data: sheetJSON });
      }

      // Respond with the converted JSON data
      return res.status(200).json({
        message: "File uploaded and converted to JSON",
        data: filterJSON,
        keys: tempKeys,
      });
    });
  } catch (err) {
    // Handle any errors that might occur during file upload, file reading or JSON conversion
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.uploadTableToDataBase = (req, res) => {
  const { user_id, name, dataType, tableData } = req.body;

  const newExcel = new Excel({
    name: name,
    excel_dataTypes: dataType,
    excel_structure: tableData,
  });

  newExcel.save().then((excel) => {
    if (!excel) {
      res.status(400).json({ message: "Upload excel Faild!!!" });
    } else {
      User.findById(user_id)
        .then((user) => {
          if (!user) {
            res.status(400).json({ message: "User Not Found" });
          } else {
            user.excel_Array.push(excel);
            user.save().catch((err) => {
              res.status(400).json({ message: "Upload excel To User Faild!!!" });
            });
            console.log(tableData);
            res.status(200).json({
              message: "Upload excel Success!!!",
              excelName: excel.name,
              excelTable: tableData,
              excelDataType: excel.excel_dataTypes,
              excel: excel
            });
          }
        })
        .catch((err) => {
          res.status(500).json({ message: "Error", err });
        });
    }
  });
};

exports.getAllTable = (req, res) => {
  User.findById(req.body.user_id)
    .then((user) => {
      console.log(user);
      if (!user) {
        res.status(400).json({ message: "User Not Found" });
      } else {
        user
          .populate("excel_Array")
          .then((populatedUser) => {
            res.status(200).json({
              message: "Excels List",
              allTables: populatedUser.excel_Array,
            });
          })
          .catch((err) => {
            res.status(500).json({ message: "Error", err });
          });
      }
    })
    .catch((err) => {
      res.status(500).json({ message: "Error", err });
    });
};

exports.addRowToTable = (req, res) => {
  Excel.findByIdAndUpdate(req.body.id)
    .then((excel) => {
      if (!excel) {
        res.status(400).json({ message: "excel Not Found" });
      } else {
        excel.excel_structure.push(req.body.newRow);
        excel.save().catch((err) => {
          res.status(500).json({ message: "Error", err });
        });

        res.status(200).json({ message: "excel Found", excelTable: excel });
      }
    })
    .catch((err) => {
      res.status(500).json({ message: "Error", err });
    });
};

exports.deleteTable = (req, res) => {
  Excel.findByIdAndDelete(req.body.excel_id)
    .then((excel) => {
      if (!excel) {
        res.status(400).json({ message: "excel Not Found" });
      } else {
        User.findById(req.body.user_id)
          .then((user) => {
            if (!user) {
              res.status(400).json({ message: "User Not Found" });
            } else {
              res.status(200).json({ message: "excel Delete From User" });
            }
          })
          .catch((err) => {
            res.status(500).json({ message: "Error", err });
          });
        // res.status(200).json({ message: "Success: excel Delete" });
      }
    })
    .catch((err) => {
      res.status(500).json({ message: "Error", err });
    });
};
exports.editExcel = (req, res) => {
  const { editValues, excel_id, inputValue } = req.body
  Excel.findOne({ _id: excel_id })
    .then(xl => {
      console.log(excel_id);
      // console.log(xl);
      // console.log(inputValue);
      // console.log(xl.excel_structure[editValues.row]);
      // console.log(xl.excel_structure[editValues.row][editValues.key]);
      xl.excel_structure[editValues.row][editValues.key] = inputValue
      xl.markModified("excel_structure")
      xl.save()
        .then(excl => {
          console.log(excl);
          res.status(200).json({ excel: excl })
        })
        .catch(err => res.status(400).json({ msg: "wrong" }))
    })
    .catch(err => res.status(400).json({ message: "wrong again" }))
}
