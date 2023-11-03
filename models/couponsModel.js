const mongoose = require("mongoose");

const couponsSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  type: { type: String, required: true },
  eligibility: String,
  minPrice: { type: Number, default: 0 },
  maxPrice: { type: Number, default: Infinity },
  discountType: { type: String, required: true },
  discount: { type: Number, required: true },
});

module.exports = mongoose.model("Coupons", couponsSchema);
