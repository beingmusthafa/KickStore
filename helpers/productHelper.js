const Orders = require("../models/ordersModel");
const Products = require("../models/productsModel");
const Reviews = require("../models/reviewsModel");
const Carts = require("../models/cartsModel");
const Categories = require("../models/categoriesModel");
const Stocks = require("../models/stocksModel");
const Coupons = require("../models/couponsModel");
const Offers = require("../models/offersModel");

const returnFinalPrice = (product) => {
  const finalPrice =
    product.price -
    (product.discountAmount + (product.price / 100) * product.discountPcnt);
  return Math.ceil(finalPrice);
};

module.exports = { returnFinalPrice };
