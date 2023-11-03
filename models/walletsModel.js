const mongoose = require("mongoose");

const walletsSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  balance: { type: Number, default: 0 },
  isBlocked: { type: Boolean, default: false },
});

module.exports = mongoose.model("Wallets", walletsSchema);
