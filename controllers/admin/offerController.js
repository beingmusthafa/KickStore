const Products = require("../../models/productsModel");
const Categories = require("../../models/categoriesModel");
const Coupons = require("../../models/couponsModel");
const Offers = require("../../models/offersModel");
const ProductOffers = require("../../models/productOffersModel");
const categoryHelper = require("../../helpers/categoryHelper");
const productHelper = require("../../helpers/productHelper");
const errorHandler = require("../../utils/errorHandler");

const showOffers = async (req, res, next) => {
  try {
    const coupons = await Coupons.find();
    const categories = await Categories.find().select({ name: 1 });
    res.render("admin/offers", {
      page: "Offers",
      admin: req.session.user,
      coupons: coupons,
      categories: categories,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const addCoupon = async (req, res, next) => {
  try {
    const data = req.body;
    if (data.minPrice === "") {
      delete data.minPrice;
    }
    if (data.maxPrice === "") {
      delete data.maxPrice;
    }
    if (data.discountType === "Percentage" && data.discount >= 100) {
      return res.status(200).json({ discount: "Invalid discount percentage!" });
    }
    await new Coupons(data).save();
    res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const disableCoupon = async (req, res, next) => {
  try {
    await Coupons.findByIdAndUpdate(req.body.coupon, {
      $set: { active: false },
    });
    res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const enableCoupon = async (req, res, next) => {
  try {
    await Coupons.findByIdAndUpdate(req.body.coupon, {
      $set: { active: true },
    });
    res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const deleteCoupon = async (req, res, next) => {
  try {
    await Coupons.findByIdAndDelete(req.body.coupon);
    res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const showCategoryOffers = async (req, res, next) => {
  try {
    const categories = await Categories.find()
      .select({ name: 1, image: 1 })
      .lean();
    let categoryOffers = categories.slice();
    for (let i = 0; i < categoryOffers.length; i++) {
      categoryOffers[i].offers = await Offers.find({
        type: "Category",
        eligibility: categoryOffers[i].name,
      });
      if (categoryOffers[i].offers.length === 0) {
        categoryOffers.splice(i, 1);
        i--;
      }
    }
    res.render("admin/category-offers", {
      page: "Offers",
      admin: req.session.user,
      categories,
      categoryOffers,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const addCategoryOffer = async (req, res, next) => {
  try {
    const offer = req.body;
    offer.type = "Category";
    if (offer.minPrice === "") {
      offer.minPrice = 0;
    }
    if (offer.maxPrice === "") {
      offer.maxPrice = Infinity;
    }
    const categoryArray = await categoryHelper.subCategoriesIntoArray(
      offer.eligibility
    );
    await new Offers(offer).save();
    if (offer.discountType === "Amount") {
      await Products.updateMany(
        {
          category: { $in: categoryArray },
          price: { $gte: offer.minPrice, $lte: offer.maxPrice },
        },
        { $inc: { discountAmount: offer.discount } }
      );
    } else {
      await Products.updateMany(
        {
          category: { $in: categoryArray },
          price: { $gte: offer.minPrice, $lte: offer.maxPrice },
        },
        { $inc: { discountPcnt: offer.discount } }
      );
    }
    res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const deleteCategoryOffer = async (req, res, next) => {
  try {
    const offer = await Offers.findById(req.body.offer).lean();
    const categoryArray = await categoryHelper.subCategoriesIntoArray(
      offer.eligibility
    );
    await Offers.deleteOne(offer);
    if (offer.discountType === "Amount") {
      await Products.updateMany(
        {
          category: { $in: categoryArray },
          price: { $gte: offer.minPrice, $lte: offer.maxPrice },
        },
        { $inc: { discountAmount: -offer.discount } }
      );
    } else {
      await Products.updateMany(
        {
          category: { $in: categoryArray },
          price: { $gte: offer.minPrice, $lte: offer.maxPrice },
        },
        { $inc: { discountPcnt: -offer.discount } }
      );
    }
    res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const showProductOffers = async (req, res, next) => {
  try {
    const products = await Products.find({}).lean().select({
      name: 1,
      brand: 1,
      price: 1,
      discountAmount: 1,
      discountPcnt: 1,
      image: 1,
    });
    for (const product of products) {
      product.offer = await ProductOffers.findOne({
        productId: product._id,
      });
      product.finalPrice = productHelper.returnFinalPrice(product);
    }

    res.render("admin/product-offers", {
      page: "Offers",
      admin: req.session.user,
      products: products,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const addProductOffer = async (req, res, next) => {
  try {
    const offer = req.body;
    if (offer.discount) await new ProductOffers(offer).save();
    if (offer.discountType === "Amount") {
      await Products.findByIdAndUpdate(offer.productId, {
        $inc: { discountAmount: offer.discount },
      });
    } else {
      await Products.findByIdAndUpdate(offer.productId, {
        $inc: { discountPcnt: offer.discount },
      });
    }
    res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const deleteProductOffer = async (req, res, next) => {
  res.status(200).json({ message: "success" });
  try {
    const productId = req.body.productId;
    const offer = await ProductOffers.findOne({ productId: productId }).lean();
    await ProductOffers.findOneAndDelete(offer);
    if (offer.discountType === "Amount") {
      await Products.findByIdAndUpdate(offer.productId, {
        $inc: { discountAmount: -offer.discount },
      });
    } else {
      await Products.findByIdAndUpdate(offer.productId, {
        $inc: { discountPcnt: -offer.discount },
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = {
  showOffers,
  addCoupon,
  disableCoupon,
  enableCoupon,
  deleteCoupon,
  showCategoryOffers,
  addCategoryOffer,
  deleteCategoryOffer,
  showProductOffers,
  addProductOffer,
  deleteProductOffer,
};
