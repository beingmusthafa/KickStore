const mongoose = require("mongoose");

const reviewsSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    productId: { type: String, required: true },
    media: String,
    date: Date,
    stars: { type: Number, required: true, min: 1, max: 5 },
    comment: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reviews", reviewsSchema);
