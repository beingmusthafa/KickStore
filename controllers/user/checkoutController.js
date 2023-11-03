const Addresses = require("../../models/addressesModel");
const Orders = require("../../models/ordersModel");
const Products = require("../../models/productsModel");
const Carts = require("../../models/cartsModel");
const Stocks = require("../../models/stocksModel");
const Coupons = require("../../models/couponsModel");
const Wallets = require("../../models/walletsModel");
const Transactions = require("../../models/transactionsModel");
const Returns = require("../../models/returnsModel");
const bcrypt = require("bcrypt");
require("dotenv").config();
const cryptoJs = require("crypto-js");
const razorpay = require("../../utils/razorpay");
const errorHandler = require("../../utils/errorHandler");
const productHelper = require("../../helpers/productHelper");
const { randomUUID, Hmac } = require("crypto");
const categoryHelper = require("../../helpers/categoryHelper");
const orderHelper = require("../../helpers/orderHelper");

const showCheckout = async (req, res) => {
  try {
    let selectedAddress;
    if (!req.session.address) {
      if (req.user.default_address === "none") {
        selectedAddress = "none";
      } else {
        selectedAddress = await Addresses.findById(req.user.default_address);
      }
    } else {
      selectedAddress = await Addresses.findById(req.session.address);
    }
    const addresses = await Addresses.find({ userId: req.user._id });
    const lists = await Carts.find({ userId: req.user._id });
    let totalMrp = 0;
    let totalDiscountedPrice = 0;
    let cartTotal = 0;
    for (const list of lists) {
      list.product = await Products.findById(list.productId).lean();
      list.product.finalPrice = productHelper.returnFinalPrice(list.product);
      list.totalMrp = list.product.price * list.quantity;
      list.total = list.product.finalPrice * list.quantity;
      cartTotal += list.total;
      totalMrp += list.product.price * list.quantity;
      totalDiscountedPrice += list.product.finalPrice * list.quantity;
    }
    let discount = totalMrp - totalDiscountedPrice;
    let coupon;
    let couponDiscount = 0;
    if (req.session.coupon) {
      coupon = await Coupons.findById(req.session.coupon).lean();
      if (coupon.type === "General") {
        if (coupon.discountType === "Amount") {
          couponDiscount = coupon.discount;
          cartTotal -= coupon.discount;
        } else {
          couponDiscount = (cartTotal / 100) * coupon.discount;
          cartTotal -= couponDiscount;
        }
      } else if (coupon.type === "Category") {
        let categoryArray = await categoryHelper.subCategoriesIntoArray(
          coupon.eligibility
        );
        let eligibleTotal = 0;
        for (const list of lists) {
          if (
            categoryArray.includes(list.product.category) &&
            cartTotal >= coupon.minPrice &&
            cartTotal <= coupon.maxPrice
          ) {
            if (coupon.discountType === "Amount") {
              couponDiscount = coupon.discount;
              break;
            } else {
              eligibleTotal += list.product.finalPrice * list.quantity;
            }
          }
        }
        if (!eligibleTotal) {
          delete req.session.coupon;
        }
        couponDiscount = (eligibleTotal / 100) * coupon.discount;
        cartTotal -= couponDiscount;
      }
    } else {
      coupon = false;
    }
    const wallet = await Wallets.findOne({ userId: req.user._id })
      .select({
        balance: 1,
      })
      .lean();
    if (req.session.wallet) {
      wallet.discount = cartTotal > wallet.balance ? wallet.balance : cartTotal;
      cartTotal = cartTotal > wallet.balance ? cartTotal - wallet.balance : 0;
      req.session.walletDiscount = wallet.discount;
    }
    const order = await razorpay.createOrder(cartTotal);
    req.session.order = order;
    req.session.orderId = order?.id ?? `order_${randomUUID().split("-")[0]}`;
    res.render("user/checkout", {
      selectedAddress: selectedAddress,
      addresses: addresses,
      lists: lists,
      totalMrp,
      discount,
      coupon,
      wallet,
      order,
      couponDiscount,
      total: cartTotal,
    });
  } catch (error) {
    const statusCode = errorHandler.getStatusCode(error);
    res.status(statusCode).render("error", { error: error });
    console.log(error);
  }
};

const sendOrderToFrontEnd = async (req, res) => {
  res.status(200).json(req.session.order);
};

const useWallet = async (req, res) => {
  req.session.wallet = true;
  res.status(200).json({ message: "success" });
};

const applyCoupon = async (req, res) => {
  const coupon = await Coupons.findOne({ code: req.body.coupon });
  if (!coupon || coupon.isActive === false) {
    return res.status(200).json({ warning: "Invalid coupon code" });
  }
  req.session.coupon = coupon._id;
  res.status(200).json({ message: "success" });
};

const removeCoupon = async (req, res) => {
  delete req.session.coupon;
  res.status(200).json({ message: "success" });
};

const selectAddress = async (req, res) => {
  req.session.address = req.body.address;
  res.status(200).json({ message: "success" });
};

const placeOrder = async (req, res) => {
  try {
    if (!req.session.orderId) {
      return res.redirect("back");
    }
    if (req.session.wallet) {
      await orderHelper.deductWalletForOrder();
    }
    const address = await Addresses.findById(
      req.session.address || req.user.default_address
    );
    const carts = await Carts.find({ userId: req.user._id }).lean();
    for (const cart of carts) {
      cart.product = await Products.findById(cart.productId)
        .lean()
        .select({ avgRating: 0, stocks: 0 });
      cart.product.finalPrice = productHelper.returnFinalPrice(cart.product);
      cart.total = cart.product.finalPrice * cart.quantity;
    }
    await orderHelper.createOrderAndUpdateStock(req, address, carts, "cod");
    delete req.session.wallet;
    delete req.session.walletDiscount;
    delete req.session.address;
    delete req.session.coupon;
    delete req.session.orderId;
    await Carts.deleteMany({ userId: req.user._id });
    res.render("user/payment-success");
  } catch (error) {
    const statusCode = errorHandler.getStatusCode(error);
    res.status(statusCode).render("error", { error: error });
    console.log(error);
  }
};

const verifyAndPlaceOrder = async (req, res) => {
  try {
    if (req.session.wallet) {
      await orderHelper.deductWalletForOrder();
    }
    const paymentId = req.body.razorpay_payment_id;
    const signature = req.body.razorpay_signature;
    const generated_signature = cryptoJs
      .HmacSHA256(
        req.session.orderId + "|" + paymentId,
        process.env.RAZORPAY_SECRET
      )
      .toString();
    if (generated_signature == signature) {
      const address = await Addresses.findById(
        req.session.address || req.user.default_address
      );
      const carts = await Carts.find({ userId: req.user._id }).lean();
      for (const cart of carts) {
        cart.product = await Products.findById(cart.productId)
          .lean()
          .select({ avgRating: 0, stocks: 0 });
        cart.product.finalPrice = productHelper.returnFinalPrice(cart.product);
        cart.total = cart.product.finalPrice * cart.quantity;
      }
      await orderHelper.createOrderAndUpdateStock(
        req,
        address,
        carts,
        "online"
      );
      delete req.session.wallet;
      delete req.session.walletDiscount;
      delete req.session.address;
      delete req.session.coupon;
      delete req.session.orderId;
      await Carts.deleteMany({ userId: req.user._id });
      res.render("user/payment-success");
    }
  } catch (error) {
    const statusCode = errorHandler.getStatusCode(error);
    res.status(statusCode).render("error", { error: error });
    console.log(error);
  }
};

const cancelOrder = async (req, res) => {
  try {
    //changing order status
    const order = await Orders.findByIdAndUpdate(req.body.order, {
      $set: { status: "Cancelled" },
    });
    await Stocks.updateOne(
      { productId: order.productId, size: order.size },
      { $set: { stock: order.quantity } }
    );

    //checking payment method
    if (order.paymentMethod === "online" || order.paymentMethod === "wallet") {
      //updating wallet
      await Wallets.findOneAndUpdate(
        { userId: order.userId },
        { $inc: { balance: order.total } }
      );
      //creating new transaction log
      await new Transactions({
        userId: order.userId,
        amount: order.total,
        type: "credit",
        note: `Cancellation of product: ${order.product.brand} ${order.product.name} (Quantity: ${order.quantity})`,
      }).save();
    }
    res.status(200).json({ message: "success" });
  } catch (error) {
    const statusCode = errorHandler.getStatusCode(error);
    res.status(statusCode).render("error", { error: error });
    console.log(error);
  }
};

const returnOrder = async (req, res) => {
  try {
    const order = await Orders.findById(req.body.order);
    if (order.createdAt.getTime() + 604800000 < Date.now()) {
      return res.status(200).json({ warning: "Order cannot be returned" });
    }
    await new Returns({
      orderId: order._id,
      reason: req.body.reason,
      feedback: req.body.feedback === "" ? "None" : req.body.feedback,
    }).save();
    order.status = "Returned";
    await order.save();
    await Stocks.updateOne(
      { productId: order.productId, size: order.size },
      { $set: { stock: order.quantity } }
    );
    //updating wallet
    await Wallets.findOneAndUpdate(
      { userId: order.userId },
      { $inc: { balance: order.total } }
    );
    //creating new transaction log
    await new Transactions({
      userId: order.userId,
      amount: order.total,
      type: "credit",
      note: `Return of product: ${order.product.brand} ${order.product.name} (Quantity: ${order.quantity})`,
    }).save();
    res.status(200).json({ message: "success" });
  } catch (error) {
    const statusCode = errorHandler.getStatusCode(error);
    res.status(statusCode).render("error", { error: error });
    console.log(error);
  }
};

//sending order details to user
const getInvoiceData = async (req, res) => {
  const orders = await Orders.find({ orderId: req.query.order }).lean();
  res.status(200).json({ user: req.user, orders });
};

module.exports = {
  showCheckout,
  sendOrderToFrontEnd,
  applyCoupon,
  removeCoupon,
  selectAddress,
  useWallet,
  placeOrder,
  verifyAndPlaceOrder,
  cancelOrder,
  returnOrder,
  getInvoiceData,
};
