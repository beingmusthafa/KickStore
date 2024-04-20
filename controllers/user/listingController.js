const Banners = require("../../models/bannersModel");
const Products = require("../../models/productsModel");
const Categories = require("../../models/categoriesModel");
const Stocks = require("../../models/stocksModel");
const Offers = require("../../models/offersModel");
const Coupons = require("../../models/couponsModel");
const GenderImages = require("../../models/gendersModel");
require("dotenv").config();
const productHelper = require("../../helpers/productHelper");

const showHome = async (req, res, next) => {
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
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const search = async (req, res, next) => {
  try {
    const search = req.query.search;
    const page = !isNaN(req.query.page) ? Number(req.query.page) : 1;
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
    console.log(error);
    next(error);
  }
};

const filterProducts = async (req, res, next) => {
  try {
    let { page, search, category, sort, min, max, gender } = req.query;
    search = search || "";
    min = min ? Number(min) : 0;
    max = max ? Number(max) : Infinity;
    const pipeline = [
      {
        $addFields: {
          finalPrice: {
            $ceil: {
              $subtract: [
                {
                  $subtract: ["$price", "$discountAmount"],
                },
                {
                  $multiply: [{ $divide: ["$price", 100] }, "$discountPcnt"],
                },
              ],
            },
          },
        },
      },
      {
        $match: {
          category: {
            $regex: new RegExp(category, "i"),
          },
          gender: gender,
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
          finalPrice: { $gte: min, $lte: max },
        },
      },
      {
        $sort: {
          finalPrice: sort === "high" ? -1 : 1,
        },
      },
    ];

    const aggregate = Products.aggregate(pipeline);
    const result = await Products.aggregatePaginate(aggregate, {
      page: !isNaN(page) ? Number(page) : 1,
      limit: 15,
    });
    const categories = await Categories.find().select({ name: 1 });
    const genders = await GenderImages.find().select({ gender: 1 });
    res.render("user/list-products", {
      result,
      categories,
      genders,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const viewProduct = async (req, res, next) => {
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
    console.log(error);
    next(error);
  }
};

const showCategory = async (req, res, next) => {
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
    console.log(error);
    next(error);
  }
};

module.exports = {
  showHome,
  search,
  filterProducts,
  viewProduct,
  showCategory,
};
