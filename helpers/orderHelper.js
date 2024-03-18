const Orders = require("../models/ordersModel");
const Stocks = require("../models/stocksModel");
const Wallets = require("../models/walletsModel");
const transactionHelper = require("./transactionHelper");

const deductWalletForOrder = async (req) => {
  await transactionHelper.createPayment(
    req.user._id,
    req.session.walletDiscount,
    req.session.orderId
  );
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
