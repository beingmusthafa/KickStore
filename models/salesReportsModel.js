const mongoose = require("mongoose");

const salesReportsSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    type: { type: String, required: true },
    totalOrders: { type: Number, required: true },
    totalSales: { type: Number, required: true },
    totalRevenue: { type: Number, required: true },
    paymentMethods: { type: [{ _id: String, count: Number }], required: true },
    categories: {
      type: [{ _id: String, sales: Number, count: Number, revenue: Number }],
      required: true,
    },
    brands: {
      type: [{ _id: String, sales: Number, count: Number, revenue: Number }],
      required: true,
    },
    products: {
      type: [
        {
          _id: String,
          sales: Number,
          count: Number,
          revenue: Number,
        },
      ],
      required: true,
    },
    orders: {
      type: [
        {
          _id: String,
          product: Object,
          quantity: Number,
          total: Number,
          paymentMethod: String,
        },
      ],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SalesReports", salesReportsSchema);
