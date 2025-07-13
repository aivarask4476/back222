const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Vardas
  email: { type: String, required: true, unique: true }, // El. paštas
  password: { type: String, required: true }, // Hashed slaptažodis
});

module.exports = mongoose.model("User", userSchema);
