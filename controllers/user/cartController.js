const Users = require("../../models/usersModel");
const Products = require("../../models/productsModel");
const Carts = require("../../models/cartsModel");
const Stocks = require("../../models/stocksModel");

require("dotenv").config();
const productHelper = require("../../helpers/productHelper");

const showCart = async (req, res, next) => {
  try {
    let lists = await Carts.find({ userId: req.user._id }).lean();
    let totalMrp = 0;
    let totalDiscountedPrice = 0;
    let cartTotal = 0;
    for (const list of lists) {
      list.product = await Products.findById(list.productId).lean();
      list.product.finalPrice = productHelper.returnFinalPrice(list.product);
      list.totalMrp = list.product.price * list.quantity;
      list.total = list.product.finalPrice * list.quantity;
      totalMrp += list.product.price * list.quantity;
      totalDiscountedPrice += list.product.finalPrice * list.quantity;
      cartTotal += list.total;
    }
    let discount = totalMrp - totalDiscountedPrice;
    res.render("user/cart", {
      lists: lists,
      totalMrp,
      discount,
      total: cartTotal,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const user = req.user;
    const productId = req.body.product;
    const size = req.body.size;
    const product = await Products.findOne({ _id: productId }).lean().select({
      image: 1,
      name: 1,
      brand: 1,
      price: 1,
      discountAmount: 1,
      discountPcnt: 1,
    });
    product.finalPrice = productHelper.returnFinalPrice(product);
    const stock = await Stocks.findOne({ productId: productId, size: size });
    const cartExists = await Carts.findOne({
      userId: user._id,
      productId,
      size,
    });
    if (cartExists) {
      if (cartExists.quantity === 10) {
        return res.status(200).json({ message: "Reached per order limit!" });
      }
      if (cartExists.quantity === stock.stock) {
        return res.status(200).json({ message: "No more in stock!" });
      }
      await Carts.findOneAndUpdate(cartExists, {
        $inc: { quantity: 1, total: product.price },
      });
      return res.status(200).json({ message: "Added to cart!" });
    }
    await new Carts({
      userId: user._id,
      productId,
      size,
    }).save();

    return res.json({ message: "Added to cart!" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const incCartCount = async (req, res, next) => {
  try {
    const cart = req.body.cart;
    const existing = await Carts.findById(cart).lean();
    existing.product = await Products.findById(existing.productId)
      .lean()
      .select({
        price: 1,
        discountAmount: 1,
        discountPcnt: 1,
      });
    existing.product.finalPrice = productHelper.returnFinalPrice(
      existing.product
    );
    const stock = await Stocks.findOne({
      productId: existing.productId,
      size: existing.size,
    });
    if (existing.quantity === stock.stock) {
      return res.status(200).json({ message: "No more in stock!" });
    }
    let updated;
    if (existing.quantity < 10) {
      updated = await Carts.findByIdAndUpdate(
        cart,
        {
          $inc: {
            quantity: 1,
          },
        },
        { new: true }
      );
    } else {
      updated = existing;
    }
    res.status(200).json({ quantity: updated.quantity });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const decCartCount = async (req, res, next) => {
  try {
    const cart = req.body.cart;
    const existing = await Carts.findById(cart);
    if (existing.quantity === 1) {
      return res.status(200).json({ quantity: existing.quantity });
    }
    const updated = await Carts.findByIdAndUpdate(
      cart,
      {
        $inc: {
          quantity: -1,
        },
      },
      { new: true }
    );
    res.status(200).json({ quantity: updated.quantity });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const deleteFromCart = async (req, res, next) => {
  try {
    const cart = req.body.cart;
    await Carts.findByIdAndDelete(cart);
    return res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const showWishlist = async (req, res, next) => {
  try {
    async function getProductsByIds(productIds) {
      const products = [];
      for (const productId of productIds) {
        const product = await Products.findById(productId).lean();
        products.push(product);
      }
      return products;
    }
    const products = await getProductsByIds(req.user.wishlist);
    for (const product of products) {
      product.finalPrice = productHelper.returnFinalPrice(product);
    }
    res.render("user/wishlist", { products: products });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const addToWishlist = async (req, res, next) => {
  try {
    const product = req.body.product;
    await Users.findOneAndUpdate(
      { _id: req.user._id },
      { $push: { wishlist: product } }
    );
    res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const deleteFromWishlist = async (req, res, next) => {
  try {
    const product = req.body.product;
    await Users.findOneAndUpdate(
      { _id: req.user._id },
      { $pull: { wishlist: product } }
    );
    res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = {
  showCart,
  addToCart,
  incCartCount,
  decCartCount,
  deleteFromCart,
  showWishlist,
  addToWishlist,
  deleteFromWishlist,
};
