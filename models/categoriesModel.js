const mongoose = require("mongoose");

const categoriesSchema = new mongoose.Schema({
  image: { type: String, required: true },
  name: { type: String, required: true },
  parent_category: { type: String, default: "" },
});

module.exports = mongoose.model("Categories", categoriesSchema);
