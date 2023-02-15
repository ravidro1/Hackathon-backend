const mongoose = require("mongoose");

const Execl = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    // unique: true,
  },

  execl_dataTypes: {

  },

  execl_structure: {
    type: [{}],
  },
});

module.exports = mongoose.model("Execl", Execl);
