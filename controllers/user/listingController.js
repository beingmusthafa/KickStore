const Banners = require("../../models/bannersModel");
const Products = require("../../models/productsModel");
const Categories = require("../../models/categoriesModel");
const Stocks = require("../../models/stocksModel");
const Offers = require("../../models/offersModel");
const Coupons = require("../../models/couponsModel");
const GenderImages = require("../../models/gendersModel");
require("dotenv").config();

const errorHandler = require("../../utils/errorHandler");
const productHelper = require("../../helpers/productHelper");

const showHome = async (req, res) => {
  try {
    const genders = await GenderImages.find();
    const categories = await Categories.find({ parent_category: "" });
    const products = await Products.find().lean().limit(10);
    for (const product of products) {
      product.finalPrice = productHelper.returnFinalPrice(product);
    }
    const slides = await Banners.find({ type: "Slide", isActive: true }).sort({
      order: 1,
    });
    const posters = await Banners.find({
      type: "Poster",
      isActive: true,
    })
      .limit(3)
      .sort({ order: 1 });
    res.render("user/home", {
      categories,
      products,
      slides,
      posters,
      genders,
      // brands: brands,
    });
  } catch (error) {
    const statusCode = errorHandler.getStatusCode(error);
    res.status(statusCode).render("error", { error: error });
    console.log(error);
  }
};

const search = async (req, res) => {
  try {
    const search = req.query.search;
    const page = req.query.page ?? 1;
    const result = await Products.paginate(
      {
        $or: [
          {
            name: {
              $regex: new RegExp(search, "i"),
            },
          },
          {
            brand: {
              $regex: new RegExp(search, "i"),
            },
          },
        ],
        isDeleted: false,
      },
      {
        select:
          "_id name brand image price discountAmount discountPcnt isDeleted",
        page: page,
        limit: 15,
      }
    );
    for (const product of result.docs) {
      product.finalPrice = productHelper.returnFinalPrice(product);
    }
    const categories = await Categories.find({}).select({ name: 1 });
    const genders = await GenderImages.find().select({ gender: 1 });
    res.render("user/list-products", {
      result: result,
      categories: categories,
      genders,
    });
  } catch (error) {
    const statusCode = errorHandler.getStatusCode(error);
    res.status(statusCode).render("error", { error: error });
    console.log(error);
  }
};

const filterProducts = async (req, res) => {
  try {
    let { page, search, category, sort, min, max, gender } = req.query;
    search = search || "";
    min = min ? Number(min) : 0;
    max = max ? Number(max) : Infinity;
    const pipeline = [
      {
        $match: {
          category: {
            $regex: new RegExp(category, "i"),
          },
          gender: {
            $regex: new RegExp(gender, "i"),
          },
          $or: [
            {
              name: {
                $regex: new RegExp(search, "i"),
              },
            },
            {
              brand: {
                $regex: new RegExp(search, "i"),
              },
            },
          ],
          isDeleted: false,
          price: { $gte: min, $lte: max },
        },
      },
    ];
    const aggregate = Products.aggregate(pipeline);
    const result = await Products.aggregatePaginate(aggregate, {
      page: 1,
      limit: 15,
    });
    result.docs.forEach((product) => {
      product.finalPrice = productHelper.returnFinalPrice(product);
    });
    if (sort) {
      if (sort === "low") {
        result.docs.sort((a, b) => a.finalPrice - b.finalPrice);
      } else {
        result.docs.sort((a, b) => b.finalPrice - a.finalPrice);
      }
    }
    const categories = await Categories.find().select({ name: 1 });
    const genders = await GenderImages.find().select({ gender: 1 });
    res.render("user/list-products", {
      result,
      categories,
      genders,
    });
  } catch (error) {
    const statusCode = errorHandler.getStatusCode(error);
    res.status(statusCode).render("error", { error });
    console.log(error);
  }
};

const viewProduct = async (req, res) => {
  try {
    const productId = req.query.product;
    const product = await Products.findOne({ _id: productId }).lean();
    product.finalPrice = productHelper.returnFinalPrice(product);
    const stocks = await Stocks.find({
      productId: productId,
      stock: { $gt: 0 },
    });
    const offers = await Offers.find({});
    const coupons = await Coupons.find({});
    if (req.user) {
      for (let i = 0; i < req.user.wishlist.length; i++) {
        if (req.user.wishlist[i] === productId) {
          res.render("user/view-product", {
            product: product,
            stocks: stocks,
            wishlist: true,
          });
          return;
        }
      }
    }
    res.render("user/view-product", {
      product: product,
      stocks: stocks,
      offers,
      coupons,
      wishlist: false,
    });
  } catch (error) {
    const statusCode = errorHandler.getStatusCode(error);
    res.status(statusCode).render("error", { error: error });
    console.log(error);
  }
};

const showCategory = async (req, res) => {
  try {
    const categories = await Categories.find({
      parent_category: req.query.category,
    });
    let catCollection = [];
    categories.forEach((category) => {
      catCollection.push(category.name);
    });
    const products = await Products.find({
      isDeleted: false,
      $or: [
        { category: req.query.category },
        { category: { $in: catCollection } },
      ],
    }).lean();
    for (const product of products) {
      product.finalPrice = productHelper.returnFinalPrice(product);
    }
    res.render("user/categories", {
      category: req.query.category,
      categories: categories,
      products: products,
    });
  } catch (error) {
    const statusCode = errorHandler.getStatusCode(error);
    res.status(statusCode).render("error", { error: error });
    console.log(error);
  }
};

module.exports = {
  showHome,
  search,
  filterProducts,
  viewProduct,
  showCategory,
};
