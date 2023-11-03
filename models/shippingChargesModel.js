const mongoose = require("mongoose");

const shippingChargesSchema = new mongoose.Schema({
  country: { type: Number, required: true, unique: true },
  days: { type: Number, required: true },
  charge: { type: Number, required: true },
});

module.exports = mongoose.model("ShippingCharges", shippingChargesSchema);
