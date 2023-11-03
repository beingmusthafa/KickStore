const mongoose = require("mongoose");

const bannersSchema = new mongoose.Schema({
  image: { type: String, required: true },
  isActive: { type: Boolean, default: false },
  type: { type: String, required: true },
  order: { type: Number, required: true },
  url: { type: String, required: true },
});

module.exports = mongoose.model("Banners", bannersSchema);
