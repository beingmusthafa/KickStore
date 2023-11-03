const mongoose = require("mongoose");

const addressesSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  line1: { type: String, required: true },
  line2: { type: String, required: true },
  pin: { type: Number, required: true },
  phone: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

module.exports = mongoose.model("Addresses", addressesSchema);
