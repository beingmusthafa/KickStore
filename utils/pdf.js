const mongoose = require("mongoose");
require("dotenv").config();
mongoose.connect(process.env.DB_LINK);

const pdf = require("html-pdf");
const ejs = require("ejs");
const path = require("path");
const fs = require("fs");
const SalesReports = require("../models/salesReportsModel");
const StocksReports = require("../models/stocksReportsModel");
const Products = require("../models/productsModel");

const generateSalesPDF = async (id) => {
  const report = await SalesReports.findById(id).lean();
  for (const product of report.products) {
    let doc = await Products.findById(product._id);
    product.brand = doc.brand;
    product.name = doc.name;
  }
  const filePath = path.resolve(__dirname, "../templates/salesReport.ejs");
  const template = fs.readFileSync(filePath).toString();
  const ejsData = ejs.render(template, { report });
  let options = {
    format: "A3",
    border: "10mm",
  };
  pdf
    .create(ejsData, options)
    .toFile(`reports/${report.type}-sales-${report.date}.pdf`, (error, res) => {
      if (error) return console.log("error");
      console.log("success pdf");
    });
  return `reports/${report.type}-sales-${report.date}.pdf`;
};

const generateStocksPDF = async (id) => {
  const report = await StocksReports.findById(id).lean();
  const filePath = path.resolve(__dirname, "../templates/stocksReport.ejs");
  const template = fs.readFileSync(filePath).toString();
  const ejsData = ejs.render(template, report);
  let options = {
    format: "A3",
    border: "10mm",
  };
  pdf
    .create(ejsData, options)
    .toFile(
      `reports/${report.type}-stocks-${report.date}.pdf`,
      (error, res) => {
        console.log("success pdf");
      }
    );
  return `reports/${report.type}-stocks-${report.date}.pdf`;
};

module.exports = { generateSalesPDF, generateStocksPDF };
