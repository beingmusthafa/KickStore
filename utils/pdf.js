const mongoose = require("mongoose");
require("dotenv").config();
mongoose.connect(process.env.DB_LINK);

const puppeteer = require("puppeteer");
const ejs = require("ejs");
const path = require("path");
const fs = require("fs");
const SalesReports = require("../models/salesReportsModel");
const StocksReports = require("../models/stocksReportsModel");
const Products = require("../models/productsModel");

const generateSalesPDF = async (id) => {
  try {
    const report = await SalesReports.findById(id).lean();
    for (const product of report.products) {
      let doc = await Products.findById(product._id);
      product.brand = doc.brand;
      product.name = doc.name;
    }

    const browser = await puppeteer.launch({
      headless: true,
    });

    const page = await browser.newPage();

    const filePath = path.resolve(__dirname, "../templates/salesReport.ejs");
    const template = fs.readFileSync(filePath).toString();
    const html = ejs.render(template, { report });
    await page.setContent(html, {
      waitUntil: "domcontentloaded",
    });

    const pdfBuffer = await page.pdf({
      format: "A3",
    });

    await browser.close();
    return pdfBuffer;
  } catch (error) {
    console.log(error);
  }
};

const generateStocksPDF = async (id) => {
  try {
    const report = await StocksReports.findById(id).lean();
    const browser = await puppeteer.launch({
      headless: true,
    });

    const page = await browser.newPage();

    const filePath = path.resolve(__dirname, "../templates/stocksReport.ejs");
    const template = fs.readFileSync(filePath).toString();
    const html = ejs.render(template, report);
    await page.setContent(html, {
      waitUntil: "domcontentloaded",
    });
    const pdfBuffer = await page.pdf({
      format: "A3",
    });

    await browser.close();
    return pdfBuffer;
  } catch (error) {
    console.log(error);
  }
};

module.exports = { generateSalesPDF, generateStocksPDF };
