const mongoose = require("mongoose");

const cartsSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  productId: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  size: { type: String, required: true },
});

module.exports = mongoose.model("Carts", cartsSchema);
