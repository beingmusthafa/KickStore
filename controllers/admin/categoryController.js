const Categories = require("../../models/categoriesModel");
const Products = require("../../models/productsModel");
const cloudinary = require("../../utils/cloudinary");
const multer = require("multer");
const productHelper = require("../../helpers/productHelper");

// Showing all categories
const show = async (req, res, next) => {
  try {
    const categories = await Categories.find({ parent_category: "" });
    const products = await Products.find({ deleted: false }).lean();
    for (const product of products) {
      product.finalPrice = productHelper.returnFinalPrice(product);
    }
    res.render("admin/categories", {
      admin: req.user,
      page: "Products",
      category: "",
      categories: categories,
      products: products,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Showing sub categories
const showSub = async (req, res, next) => {
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
    res.render("admin/categories", {
      admin: req.user,
      page: "Categories",
      category: req.query.category,
      categories: categories,
      products: products,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Showing edit form
const provideDetails = async (req, res, next) => {
  try {
    let category;
    if (req.query.category !== "") {
      category = await Categories.findOne({ name: req.query.category });
    } else {
      category = {
        name: "",
      };
    }
    const categories = await Categories.find({
      name: { $ne: req.query.category },
    }).select({ name: 1 });
    res.status(200).json({ currentCategory: category, categories: categories });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Saving edits
const saveEdit = async (req, res, next) => {
  try {
    if (await Categories.exists({ name: req.body.name })) {
      return res.json({ message: "Category already exists!" });
    }
    const isValidName = (name) => {
      const regex = /(?=.*[a-zA-Z].*[a-zA-Z])/;

      return regex.test(name);
    };
    if (!isValidName(req.body.name)) {
      return res.json({ message: "Enter a valid name!" });
    }
    if (req.body.parent_category === "none") req.body.parent_category = "";
    if (req.file) {
      const image = await cloudinary.uploadCategory(req.file.path);
      await Categories.findOneAndUpdate(
        { name: req.body.category },
        {
          $set: {
            name: req.body.name,
            image: image,
            parent_category: req.body.parent_category,
          },
        }
      );
      res.status(200).json({ message: "success" });
    } else {
      await Categories.findOneAndUpdate(
        { name: req.body.category },
        {
          $set: {
            name: req.body.name,
            parent_category: req.body.parent_category,
          },
        }
      );
    }
    res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Saving new category
const saveAdd = async (req, res, next) => {
  try {
    if (await Categories.exists({ name: req.body.name })) {
      return res.json({ message: "Category already exists!" });
    }
    const isValidName = (name) => {
      const regex = /(?=.*[a-zA-Z].*[a-zA-Z])/;

      return regex.test(name);
    };
    if (!isValidName(req.body.name)) {
      return res.json({ message: "Enter a valid name!" });
    }
    if (!req.file) {
      return res.json({ message: "Give an image to the category!" });
    }
    const image = await cloudinary.uploadCategory(req.file.path);
    await new Categories({
      image: image,
      name: req.body.name,
      parent_category: req.body.category,
    }).save();
    res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Deleting category
const deleteCategory = async (req, res, next) => {
  try {
    const currentCategory = await Categories.findOne({
      name: req.body.category,
    });
    await Categories.findOneAndDelete(currentCategory);
    await Categories.updateMany(
      { parent_category: req.body.category },
      { $set: { parent_category: currentCategory.parent_category } }
    );
    await Products.updateMany(
      { category: req.body.category },
      { $set: { category: currentCategory.parent_category } }
    );
    return res.status(200).json({ success: "message" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = {
  show,
  showSub,
  provideDetails,
  saveEdit,
  saveAdd,
  deleteCategory,
};
