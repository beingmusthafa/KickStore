const mongoose = require("mongoose");

const productOffersSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  discountType: { type: String, required: true },
  discount: { type: Number, required: true },
});

module.exports = mongoose.model("ProductOffers", productOffersSchema);
