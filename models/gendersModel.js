const mongoose = require("mongoose");

const gendersSchema = new mongoose.Schema({
  image: { type: String, required: true },
  gender: { type: String, unique: true, required: true },
});

module.exports = mongoose.model("Genders", gendersSchema);
