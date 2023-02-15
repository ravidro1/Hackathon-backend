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

  Execl_Array: [{type: mongoose.Types.ObjectId, ref: "Execl"}],
});

module.exports = mongoose.model("User", User);
