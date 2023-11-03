const mongoose = require("mongoose");

const stocksSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  size: { type: String, required: true },
  stock: { type: Number, required: true },
});

module.exports = mongoose.model("Stocks", stocksSchema);
