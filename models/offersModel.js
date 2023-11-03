const mongoose = require("mongoose");

const offersSchema = new mongoose.Schema({
  isActive: { type: Boolean, default: true },
  type: { type: String, required: true },
  eligibility: { type: String, required: true },
  minPrice: { type: Number, default: 0 },
  maxPrice: { type: Number, default: Infinity },
  discountType: { type: String, required: true },
  discount: { type: Number, required: true },
});

module.exports = mongoose.model("Offers", offersSchema);
