const Categories = require("../../models/categoriesModel");
const Products = require("../../models/productsModel");
const Orders = require("../../models/ordersModel");
const Users = require("../../models/usersModel");
const SalesReports = require("../../models/salesReportsModel");
const StocksReports = require("../../models/stocksReportsModel");
const excel = require("../../utils/excel");
const pdf = require("../../utils/pdf");
const categoryHelper = require("../../helpers/categoryHelper");
const fs = require("fs");

const showStats = async (req, res, next) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    let pipeline = [
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          status: { $nin: ["Returned", "Cancelled"] },
        },
      },
      {
        $group: { _id: null, count: { $sum: 1 }, totalSum: { $sum: "$total" } },
      },
    ];
    const ordersTotal = await Orders.aggregate(pipeline);
    const totalRevenue = ordersTotal[0]?.totalSum;
    const orderCount = ordersTotal[0]?.count;
    const userCount = await Users.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });
    pipeline = [
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          status: { $nin: ["Returned", "Cancelled"] },
        },
      },
      {
        $group: { _id: "$product._id", orderedCount: { $sum: 1 } },
      },
      {
        $sort: { orderedCount: -1 },
      },
      {
        $limit: 10,
      },
    ];
    let products = await Orders.aggregate(pipeline);
    for (let product of products) {
      let result = await Products.findById(product._id)
        .select({
          _id: 0,
          description: 0,
          avgRating: 0,
          subImages: 0,
        })
        .lean();
      product = Object.assign(product, result);
    }

    res.render("admin/stats", {
      page: "Sales & stats",
      admin: req.user,
      totalRevenue: totalRevenue ?? 0,
      orderCount: orderCount ?? 0,
      userCount: userCount ?? 0,
      products: products,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const sendCategoryGraph = async (req, res, next) => {
  try {
    let mainCategories = await Categories.find({ parent_category: "" })
      .select({ _id: 0, name: 1 })
      .lean();
    for (let category of mainCategories) {
      category.subCategories = await categoryHelper.subCategoriesIntoArray(
        category.name
      );
      category.orderCount = await Orders.countDocuments({
        "product.category": { $in: category.subCategories },
        status: { $nin: ["Returned", "Cancelled"] },
        createdAt: { $gte: new Date() - 7 * 24 * 60 * 60 * 1000 },
      });
      delete category.subCategories;
    }
    res.status(200).json({ categories: mainCategories });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const showSalesReports = async (req, res, next) => {
  try {
    res.render("admin/sales-reports", {
      page: "Sales & stats",
      admin: req.user,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const showStocksReports = async (req, res, next) => {
  try {
    res.render("admin/stocks-reports", {
      page: "Sales & stats",
      admin: req.user,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const sendSalesReports = async (req, res, next) => {
  try {
    const type = req.query.type;
    const reports = await SalesReports.find({ type: type }).select({ date: 1 });
    res.status(200).json({ reports });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const sendStocksReports = async (req, res, next) => {
  try {
    const type = req.query.type;
    const reports = await StocksReports.find({ type: type }).select({
      date: 1,
    });
    res.status(200).json({ reports });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const downloadReportExcel = async (req, res, next) => {
  try {
    const report = req.query.report;
    const id = req.query.id;
    let path;

    if (report === "sales") {
      path = await excel.createSalesExcel(id);
    } else if (report === "stocks") {
      path = await excel.createStocksExcel(id);
    }
    res.download(path, (err) => {
      if (err) {
        console.log(err);
      } else {
        fs.unlink(path, (err) => {
          if (err) console.log(err);
          else console.log(`Delete file : ${path}`);
        });
      }
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const downloadReportPDF = async (req, res, next) => {
  try {
    const report = req.query.report;
    const id = req.query.id;
    let buffer;
    if (report === "sales") {
      buffer = await pdf.generateSalesPDF(id);
    } else if (report === "stocks") {
      buffer = await pdf.generateStocksPDF(id);
    }
    if (!buffer)
      return res.status(500).json({ message: "Something went wrong" });
    const bufferString = buffer.toString("base64");
    res.status(200).json({ buffer: bufferString });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// const searchSalesReports = async (req, res, next) => {
//   const data = req.query;
//   if (data.type === "Weekly") {
//     const search = data.date.split("-");
//     const date = `${search[2]}-${search[1]}-${search[0]}-`;
//     const reports = await
//   }
// };
module.exports = {
  showStats,
  sendCategoryGraph,
  showSalesReports,
  showStocksReports,
  sendSalesReports,
  sendStocksReports,
  downloadReportExcel,
  downloadReportPDF,
};
