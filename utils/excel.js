const excel = require("excel4node");
const SalesReports = require("../models/salesReportsModel");
const Products = require("../models/productsModel");
require("dotenv").config();
const mongoose = require("mongoose");
const StocksReports = require("../models/stocksReportsModel");
const fs = require("fs");
const util = require("util");
const path = require("path");
mongoose.connect(process.env.DB_LINK);

const createSalesExcel = async (id) => {
  try {
    const doc = await SalesReports.findById(id);
    const workbook = new excel.Workbook();
    const writeFile = util.promisify(fs.writeFile);
    const newFilePath = path.join(
      __dirname,
      `../reports/${doc.type}-sales-${doc.date}.xlsx`
    );
    await writeFile(newFilePath, "");

    const options = {
      "sheetProtection": {
        // same as "Protect Sheet" in Review tab of Excel
        "autoFilter": true, // True means that that user will be unable to modify this setting
        "deleteColumns": true,
        "deleteRows": true,
        "formatCells": true,
        "formatColumns": true,
        "formatRows": true,
        "insertColumns": true,
        "insertHyperlinks": true,
        "insertRows": true,
        "objects": true,
        "pivotTables": true,
        "scenarios": true,
        "selectLockedCells": true,
        "selectUnlockedCells": true,
        "sheet": true,
        "sort": true,
      },
    };
    const worksheet1 = workbook.addWorksheet("Overview");
    const worksheet2 = workbook.addWorksheet("Categories");
    const worksheet3 = workbook.addWorksheet("Brands");
    const worksheet4 = workbook.addWorksheet("Products");
    const worksheet5 = workbook.addWorksheet("Orders");

    const columnHeading = workbook.createStyle({
      font: {
        bold: true,
        size: 12,
      },
    });
    const style = workbook.createStyle({
      font: {
        size: 12,
      },
    });
    worksheet1.column(1).setWidth(20);
    worksheet1.column(2).setWidth(20);
    worksheet1.column(3).setWidth(20);
    worksheet1.cell(1, 1).string("Total orders").style(columnHeading);
    worksheet1.cell(1, 2).number(doc.totalOrders).style(style);
    worksheet1.cell(2, 1).string("Total sales").style(columnHeading);
    worksheet1.cell(2, 2).number(doc.totalSales).style(style);
    worksheet1.cell(3, 1).string("Total revenue").style(columnHeading);
    worksheet1.cell(3, 2).number(doc.totalRevenue).style(style);
    3;

    worksheet1.cell(5, 1).string("Payment Methods").style(columnHeading);
    worksheet1.cell(5, 2).string("No. of orders").style(columnHeading);
    let cellRow = 6;
    for (const method of doc.paymentMethods) {
      worksheet1.cell(cellRow, 1).string(method._id).style(style);
      worksheet1.cell(cellRow, 2).number(method.count).style(style);
      cellRow++;
    }
    worksheet2.column(1).setWidth(20);
    worksheet2.column(2).setWidth(20);
    worksheet2.column(3).setWidth(20);
    worksheet2.column(4).setWidth(20);
    worksheet2.cell(1, 1).string("Category").style(columnHeading);
    worksheet2.cell(1, 2).string("No. of orders").style(columnHeading);
    worksheet2.cell(1, 3).string("Total sales").style(columnHeading);
    worksheet2.cell(1, 4).string("Total revenue").style(columnHeading);
    cellRow = 2;
    for (const category of doc.categories) {
      worksheet2.cell(cellRow, 1).string(category._id).style(style);
      worksheet2.cell(cellRow, 2).number(category.count).style(style);
      worksheet2.cell(cellRow, 3).number(category.sales).style(style);
      worksheet2.cell(cellRow, 4).number(category.revenue).style(style);
      cellRow++;
    }

    worksheet3.column(1).setWidth(20);
    worksheet3.column(2).setWidth(20);
    worksheet3.column(3).setWidth(20);
    worksheet3.column(4).setWidth(20);
    worksheet3.cell(1, 1).string("Brand").style(columnHeading);
    worksheet3.cell(1, 2).string("No. of orders").style(columnHeading);
    worksheet3.cell(1, 3).string("Total sales").style(columnHeading);
    worksheet3.cell(1, 4).string("Total revenue").style(columnHeading);
    cellRow = 2;
    for (const brand of doc.brands) {
      worksheet3.cell(cellRow, 1).string(brand._id).style(style);
      worksheet3.cell(cellRow, 2).number(brand.count).style(style);
      worksheet3.cell(cellRow, 3).number(brand.sales).style(style);
      worksheet3.cell(cellRow, 4).number(brand.revenue).style(style);
      cellRow++;
    }

    worksheet4.column(1).setWidth(50);
    worksheet4.column(2).setWidth(20);
    worksheet4.column(3).setWidth(20);
    worksheet4.column(4).setWidth(20);
    worksheet4.cell(1, 1).string("Product").style(columnHeading);
    worksheet4.cell(1, 2).string("No. of orders").style(columnHeading);
    worksheet4.cell(1, 3).string("Total sales").style(columnHeading);
    worksheet4.cell(1, 4).string("Total revenue").style(columnHeading);
    cellRow = 2;
    for (const productDoc of doc.products) {
      let product = await Products.findById(productDoc._id).select({
        brand: 1,
        name: 1,
        _id: 0,
      });
      worksheet4
        .cell(cellRow, 1)
        .string(`${product.brand} ${product.name}`)
        .style(style);
      worksheet4.cell(cellRow, 2).number(productDoc.count).style(style);
      worksheet4.cell(cellRow, 3).number(productDoc.sales).style(style);
      worksheet4.cell(cellRow, 4).number(productDoc.revenue).style(style);
      cellRow++;
    }

    worksheet5.column(1).setWidth(50);
    worksheet5.column(2).setWidth(20);
    worksheet5.column(3).setWidth(20);
    worksheet5.column(4).setWidth(20);
    worksheet5.cell(1, 1).string("Product").style(columnHeading);
    worksheet5.cell(1, 2).string("Quantity").style(columnHeading);
    worksheet5.cell(1, 3).string("Total").style(columnHeading);
    worksheet5.cell(1, 4).string("Payment method").style(columnHeading);
    cellRow = 2;
    for (const orderDoc of doc.orders) {
      worksheet5
        .cell(cellRow, 1)
        .string(`${orderDoc.product.brand} ${orderDoc.product.name}`)
        .style(style);
      worksheet5.cell(cellRow, 2).number(orderDoc.quantity).style(style);
      worksheet5.cell(cellRow, 3).number(orderDoc.total).style(style);
      worksheet5.cell(cellRow, 4).string(orderDoc.paymentMethod).style(style);
      cellRow++;
    }

    await workbook.write(`reports/${doc.type}-sales-${doc.date}.xlsx`);
    return `reports/${doc.type}-sales-${doc.date}.xlsx`;
  } catch (error) {
    console.log(error);
  }
};

const createStocksExcel = async (id) => {
  try {
    const doc = await StocksReports.findById(id);
    const workbook = new excel.Workbook();
    const writeFile = util.promisify(fs.writeFile);
    const newFilePath = path.join(
      __dirname,
      `../reports/${doc.type}-stocks-${doc.date}.xlsx`
    );
    await writeFile(newFilePath, "");

    const options = {
      "sheetProtection": {
        // same as "Protect Sheet" in Review tab of Excel
        "autoFilter": true, // True means that that user will be unable to modify this setting
        "deleteColumns": true,
        "deleteRows": true,
        "formatCells": true,
        "formatColumns": true,
        "formatRows": true,
        "insertColumns": true,
        "insertHyperlinks": true,
        "insertRows": true,
        "objects": true,
        "pivotTables": true,
        "scenarios": true,
        "selectLockedCells": true,
        "selectUnlockedCells": true,
        "sheet": true,
        "sort": true,
      },
    };
    const worksheet = workbook.addWorksheet("Overview");

    const columnHeading = workbook.createStyle({
      font: {
        bold: true,
        size: 12,
      },
    });
    const style = workbook.createStyle({
      font: {
        size: 12,
      },
    });
    worksheet.column(1).setWidth(50);
    worksheet.column(2).setWidth(20);
    worksheet.column(3).setWidth(20);
    worksheet.column(4).setWidth(20);
    worksheet.column(4).setWidth(20);
    worksheet.cell(1, 1).string("Product name").style(columnHeading);
    worksheet.cell(1, 2).string("Initial stock").style(columnHeading);
    worksheet.cell(1, 3).string("Sales").style(columnHeading);
    worksheet.cell(1, 4).string("Return/Cancellation").style(columnHeading);
    worksheet.cell(1, 5).string("Stock Balance").style(columnHeading);
    let cellRow = 2;
    for (const product of doc.products) {
      worksheet.cell(cellRow, 1).string(product.name).style(style);
      worksheet.cell(cellRow, 2).number(product.total).style(style);
      worksheet.cell(cellRow, 3).number(product.sales).style(style);
      worksheet.cell(cellRow, 4).number(product.cancels).style(style);
      worksheet.cell(cellRow, 5).number(product.balance).style(style);
      cellRow++;
    }
    workbook.write(`reports/${doc.type}-stocks-${doc.date}.xlsx`);
    return `reports/${doc.type}-stocks-${doc.date}.xlsx`;
  } catch (error) {
    console.log(error);
  }
};

module.exports = { createSalesExcel, createStocksExcel };
