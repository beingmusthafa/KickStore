const mongoose = require("mongoose");

const returnsSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    reason: { type: String, required: true },
    feedback: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Returns", returnsSchema);
