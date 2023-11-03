const mongoose = require("mongoose");

const brandsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String, required: true },
  poster: { type: String, required: true },
  description: { type: String, required: true },
});

module.exports = mongoose.model("Brands", brandsSchema);
