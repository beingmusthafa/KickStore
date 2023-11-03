const Users = require("../models/usersModel");
const Addresses = require("../models/addressesModel");
const Banners = require("../models/bannersModel");
const Orders = require("../models/ordersModel");
const Products = require("../models/productsModel");
const Reviews = require("../models/reviewsModel");
const Carts = require("../models/cartsModel");
const Categories = require("../models/categoriesModel");
const Stocks = require("../models/stocksModel");
const Coupons = require("../models/couponsModel");
const Wallets = require("../models/walletsModel");
const Transactions = require("../models/transactionsModel");

const deductWalletForOrder = async () => {
  await new Transactions({
    userId: req.user._id,
    type: "debit",
    amount: req.session.walletDiscount,
    note: `Payment for order: '${req.session.orderId}'`,
  }).save();
  await Wallets.updateOne(
    { userId: req.user._id },
    { $inc: { balance: -req.session.walletDiscount } }
  );
};

const createOrderAndUpdateStock = async (
  req,
  address,
  carts,
  paymentMethod
) => {
  for (const cart of carts) {
    await new Orders({
      userId: req.user._id,
      orderId: req.body.razorpay_order_id,
      product: cart.product,
      size: cart.size,
      quantity: cart.quantity,
      address: address,
      total: cart.total,
      paymentMethod: paymentMethod,
    }).save();
    await Stocks.updateOne(
      { productId: cart.productId, size: cart.size },
      { $set: { stock: -cart.quantity } }
    );
  }
};

module.exports = {
  deductWalletForOrder,
  createOrderAndUpdateStock,
};
