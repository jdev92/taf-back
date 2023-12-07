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
      if (!validator.isEmail(v)) {
        throw new Error("Email non valide !");
      }
    },
  },
  avatar: Object,
  createdAt: {
    type: Date,
    default: () => new Date(),
  },
  status: {
    type: String,
    enum: ["Cours", "Entreprise"],
    default: "Entreprise",
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
