const Addresses = require("../../models/addressesModel");
const Orders = require("../../models/ordersModel");
const Products = require("../../models/productsModel");
const Carts = require("../../models/cartsModel");
const Stocks = require("../../models/stocksModel");
const Coupons = require("../../models/couponsModel");
const Wallets = require("../../models/walletsModel");
const Returns = require("../../models/returnsModel");
require("dotenv").config();
const cryptoJs = require("crypto-js");
const razorpay = require("../../utils/razorpay");
const productHelper = require("../../helpers/productHelper");
const transactionHelper = require("../../helpers/transactionHelper");
const { randomUUID, Hmac } = require("crypto");
const categoryHelper = require("../../helpers/categoryHelper");
const orderHelper = require("../../helpers/orderHelper");

const showCheckout = async (req, res, next) => {
  try {
    let selectedAddress;
    if (!req.session.address) {
      if (req.user.default_address === "none") {
        selectedAddress = "";
      } else {
        selectedAddress = await Addresses.findById(req.user.default_address);
      }
    } else {
      selectedAddress = await Addresses.findById(req.session.address);
    }
    const addresses = await Addresses.find({ userId: req.user._id });
    const lists = await Carts.find({ userId: req.user._id });
    let totalMrp = 0;
    let totalFinalPrice = 0;
    let cartTotal = 0;
    for (const list of lists) {
      list.product = await Products.findById(list.productId).lean();
      list.product.finalPrice = productHelper.returnFinalPrice(list.product);
      list.totalMrp = list.product.price * list.quantity;
      list.total = list.product.finalPrice * list.quantity;
      cartTotal += list.total;
      totalMrp += list.product.price * list.quantity;
      totalFinalPrice += list.product.finalPrice * list.quantity;
    }
    let discount = totalMrp - totalFinalPrice;
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
      wallet.isApplied = true;
      wallet.discount = cartTotal > wallet.balance ? wallet.balance : cartTotal;
      cartTotal = cartTotal > wallet.balance ? cartTotal - wallet.balance : 0;
      req.session.walletDiscount = wallet.discount;
    }
    const order = await razorpay.createOrder(cartTotal);
    req.session.order = order;
    req.session.orderId = order?.id ?? `order_${randomUUID().split("-")[0]}`;
    res.render("user/checkout", {
      selectedAddress,
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
    console.log(error);
    next(error);
  }
};

const sendOrderToFrontEnd = async (req, res, next) => {
  try {
    res.status(200).json(req.session.order);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const useWallet = async (req, res, next) => {
  try {
    req.session.wallet = true;
    res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const applyCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupons.findOne({ code: req.body.coupon });
    if (!coupon || coupon.isActive === false) {
      return res.status(200).json({ warning: "Invalid coupon code" });
    }
    req.session.coupon = coupon._id;
    res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const removeCoupon = async (req, res, next) => {
  try {
    delete req.session.coupon;
    res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const selectAddress = async (req, res, next) => {
  try {
    req.session.address = req.body.address;
    res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const placeOrder = async (req, res, next) => {
  try {
    if (!req.session.orderId) {
      return res.redirect("back");
    }
    if (req.session.wallet) {
      await orderHelper.deductWalletForOrder(req);
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
    console.log(error);
    next(error);
  }
};

const verifyAndPlaceOrder = async (req, res, next) => {
  try {
    if (req.session.wallet) {
      await orderHelper.deductWalletForOrder(req);
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
    console.log(error);
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
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
      await transactionHelper.createCancel(order);
    }
    res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const returnOrder = async (req, res, next) => {
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
    await transactionHelper.createReturn(order);
    res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//sending order details to user
const getInvoiceData = async (req, res, next) => {
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
