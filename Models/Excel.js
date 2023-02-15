const mongoose = require("mongoose");

const Excel = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    // unique: true,
  },

  excel_dataTypes: {},

  excel_structure: {
    type: [{}],
  },
});

module.exports = mongoose.model("Excel", Excel);
