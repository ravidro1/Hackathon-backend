const mongoose = require("mongoose");

const User = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },

  phoneNumber: {type: Number, required: true, unique: true},

  email: {type: String, required: true, unique: true},

  excel_Array: [{type: mongoose.Types.ObjectId, ref: "Excel"}],
});

module.exports = mongoose.model("User", User);
