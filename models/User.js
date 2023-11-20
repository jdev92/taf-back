const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  lastName: {
    type: String,
  },
  firstName: {
    type: String,
  },
  email: {
    unique: true,
    type: String,
    validate(v) {
      if (!validator.isEmail(v)) throw new Error("Email non valide !");
    },
  },
  avatar: Object,
});

const User = mongoose.model("User", userSchema);

module.exports = User;
