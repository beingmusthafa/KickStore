const Orders = require("../models/ordersModel");
const Products = require("../models/productsModel");
const SalesReports = require("../models/salesReportsModel");
const Stocks = require("../models/stocksModel");
const Returns = require("../models/returnsModel");
const excel = require("excel4node");
require("dotenv").config();
const mongoose = require("mongoose");
const StocksReports = require("../models/stocksReportsModel");
mongoose.connect(process.env.DB_LINK);

const generateSales = async (currentDate, startingDate, date, type) => {
  try {
    const result = await Orders.aggregate([
      { $match: { createdAt: { $gt: startingDate, $lt: currentDate } } },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$total" },
          count: { $sum: 1 },
          revenue: { $sum: "$total" },
          sales: { $sum: "$quantity" },
        },
      },
    ]);
    const totalOrders = result[0]?.count;
    const totalRevenue = result[0]?.revenue;
    const totalSales = result[0]?.sales;
    const paymentMethods = await Orders.aggregate([
      { $match: { createdAt: { $gt: startingDate, $lt: currentDate } } },
      { $group: { _id: "$paymentMethod", count: { $sum: 1 } } },
    ]);
    const categories = await Orders.aggregate([
      { $match: { createdAt: { $gt: startingDate, $lt: currentDate } } },
      {
        $group: {
          _id: "$product.category",
          sales: { $sum: "$quantity" },
          count: { $sum: 1 },
          revenue: { $sum: "$total" },
        },
      },
    ]);
    const brands = await Orders.aggregate([
      { $match: { createdAt: { $gt: startingDate, $lt: currentDate } } },
      {
        $group: {
          _id: "$product.brand",
          sales: { $sum: "$quantity" },
          count: { $sum: 1 },
          revenue: { $sum: "$total" },
        },
      },
    ]);
    const products = await Orders.aggregate([
      { $match: { createdAt: { $gt: startingDate, $lt: currentDate } } },
      {
        $group: {
          _id: "$product._id",
          sales: { $sum: "$quantity" },
          count: { $sum: 1 },
          revenue: { $sum: "$total" },
        },
      },
    ]);

    const orders = await Orders.find({
      createdAt: { $gt: startingDate, $lt: currentDate },
      status: { $nin: ["Returned", "Cancelled"] },
    }).select({ product: 1, quantity: 1, total: 1, paymentMethod: 1 });

    await new SalesReports({
      date: date,
      type: type,
      totalOrders: totalOrders,
      totalSales: totalSales,
      totalRevenue: totalRevenue,
      paymentMethods: paymentMethods,
      categories: categories,
      brands: brands,
      products: products,
      orders: orders,
    }).save();
    console.log("success");
  } catch (error) {
    console.log(error);
  }
};

const generateStocks = async (currentDate, startingDate, date, type) => {
  try {
    const products = await Stocks.aggregate([
      { $group: { _id: "$productId", balance: { $sum: "$stock" } } },
    ]);
    const sales = await Orders.aggregate([
      {
        $match: {
          createdAt: { $gt: startingDate, $lt: currentDate },
        },
      },
      { $group: { _id: "$product._id", count: { $sum: "$quantity" } } },
    ]);

    const cancels = await Orders.aggregate([
      {
        $match: {
          createdAt: { $gt: startingDate, $lt: currentDate },
          status: { $in: ["Returned", "Cancelled"] },
        },
      },
      { $group: { _id: "$product._id", count: { $sum: "$quantity" } } },
    ]);
    for (const product of products) {
      let flag = 0;
      for (const sale of sales) {
        if (sale._id.toString() === product._id) {
          product.sales = sale.count;
          flag = 1;
          break;
        }
      }
      product.sales = flag === 0 ? 0 : product.sales;
      flag = 0;
      for (const cancel of cancels) {
        if (cancel?._id.toString() === product._id) {
          product.cancels = cancel?.count ?? 0;
          flag = 1;
          break;
        }
      }
      product.cancels = flag === 0 ? 0 : product.cancels;
      let doc = await Products.findById(product._id).select({
        brand: 1,
        name: 1,
      });
      product.name = `${doc.brand} ${doc.name}`;
      product.total = product.balance + product.sales;
    }
    await new StocksReports({
      date: date,
      type: type,
      products: products,
    }).save();
    console.log("stock success");
  } catch (error) {
    console.log(error);
  }
};

const generateCancel = async () => {};

module.exports = {
  generateSales,
  generateStocks,
  generateCancel,
};
