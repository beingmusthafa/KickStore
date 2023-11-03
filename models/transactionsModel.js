const mongoose = require("mongoose");

const transactionsSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, required: true },
    note: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transactions", transactionsSchema);
