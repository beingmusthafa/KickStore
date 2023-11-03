const mongoose = require("mongoose");

const stocksReportsSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    type: { type: String, required: true },
    products: {
      type: [
        {
          name: String,
          total: Number,
          sales: Number,
          cancels: Number,
          balance: Number,
        },
      ],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StocksReports", stocksReportsSchema);
