const Categories = require("../../models/categoriesModel");
const Products = require("../../models/productsModel");
const Stocks = require("../../models/stocksModel");
const cloudinary = require("../../utils/cloudinary");
const productHelper = require("../../helpers/productHelper");

// Showing all products
const showAll = async (req, res, next) => {
  try {
    const categories = await Categories.find({}).select({ name: 1 });
    const products = await Products.find({}).lean().select({
      _id: 1,
      name: 1,
      brand: 1,
      image: 1,
      price: 1,
      discountAmount: 1,
      discountPcnt: 1,
      deleted: 1,
    });
    for (const product of products) {
      product.finalPrice = productHelper.returnFinalPrice(product);
    }
    res.render("admin/list-products", {
      admin: req.user,
      page: "Products",
      products: products,
      categories: categories,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const showInCategory = async (req, res, next) => {
  try {
    if (req.query.category === "all") {
      res.redirect("/admin//products");
    } else {
      const products = await Products.find({
        category: req.query.category,
      })
        .lean()
        .select({
          _id: 1,
          name: 1,
          brand: 1,
          image: 1,
          price: 1,
          discountAmount: 1,
          discountPcnt: 1,
          deleted: 1,
        });
      for (const product of products) {
        product.finalPrice = productHelper.returnFinalPrice(product);
      }
      const categories = await Categories.find().select({ name: 1 });
      res.render("admin/productsInCategory", {
        admin: req.user,
        page: "Products",
        products: products,
        categories: categories,
        selected: req.query.category,
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Showing search results
const search = async (req, res, next) => {
  try {
    search = req.query.search;
    const products = await Products.find({
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
    })
      .lean()
      .select({
        _id: 1,
        name: 1,
        brand: 1,
        image: 1,
        price: 1,
        discountAmount: 1,
        discountPcnt: 1,
        deleted: 1,
      });
    for (const product of products) {
      product.finalPrice = productHelper.returnFinalPrice(product);
    }
    const categories = await Categories.find({}).select({ name: 1 });
    res.render("admin/list-products", {
      admin: req.user,
      page: "Products",
      products: products,
      categories: categories,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Showing details of an individual product
const showDetails = async (req, res, next) => {
  try {
    const product = await Products.findById(req.query.id).lean();
    product.finalPrice = productHelper.returnFinalPrice(product);
    res.render("admin/view-product", {
      admin: req.user,
      page: "Products",
      product: product,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Showing stock information
const showStock = async (req, res, next) => {
  try {
    const product = await Products.findById(req.query.id).lean().select({
      _id: 1,
      brand: 1,
      name: 1,
    });
    const stocks = await Stocks.find({ productId: req.query.id });
    res.render("admin/manage-stock", {
      admin: req.user,
      page: "Products",
      product: product,
      stocks: stocks,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Adding new size and stock
const addStock = async (req, res, next) => {
  try {
    await new Stocks(req.body).save();
    res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Updating stock with new quantities
const updateStock = async (req, res, next) => {
  try {
    await Stocks.findByIdAndUpdate(req.body.stockId, {
      $set: { stock: req.body.stock },
    });
    res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const edit = async (req, res, next) => {
  try {
    if (req.query.id) {
      const product = await Products.findById(req.query.id);
      const categories = await Categories.find().select({ name: 1 });
      res.render("admin/edit-product", {
        admin: req.user,
        page: "Products",
        product: product,
        categories: categories,
      });
    } else {
      res.redirect("/admin/products");
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const saveEdit = async (req, res, next) => {
  try {
    const name = req.body.name;
    const brand = req.body.brand;
    const price = req.body.price;
    const description = req.body.description;
    const gender = req.body.gender;

    const nameValidate = () => {
      if (name === (null || "")) {
        return "Enter product name!";
      } else {
        const regex = /[a-zA-Z]+/;

        if (!regex.test(name)) {
          return "Need atleast 1 alphabet!";
        } else {
          return "";
        }
      }
    };

    const brandValidate = () => {
      if (brand === (null || "")) {
        return "Enter a brand";
      } else {
        const regex = /^(?=.*[a-zA-Z0-9]).*$/;
        if (!regex.test(brand)) {
          return "Need atleast 1 alphabet or number!";
        } else {
          return "";
        }
      }
    };

    const priceValidate = () => {
      if (price === (null || "")) {
        return "Enter a price!";
      } else {
        if (!(price > 0)) {
          return "Enter a valid amount!";
        } else {
          return "";
        }
      }
    };

    const descriptionValidate = () => {
      if (description === (null || "")) {
        return "Enter product description";
      } else {
        if (description.length < 40) {
          return "Description too short!";
        } else {
          return "";
        }
      }
    };

    const genderValidate = () => {
      if (gender === "Male" || gender === "Female") {
        return "";
      } else {
        return "Select gender";
      }
    };

    if (
      nameValidate() === "" &&
      brandValidate() === "" &&
      priceValidate() === "" &&
      descriptionValidate() === "" &&
      genderValidate() === ""
    ) {
      if (req.files.length > 0) {
        if (req.files.length === 1) {
          let file = req.files[0];
          let image = await cloudinary.uploadProduct(file.path);

          await Products.findByIdAndUpdate(req.body.product, {
            $set: {
              image: image,
              name: req.body.name,
              brand: req.body.brand,
              price: req.body.price,
              description: req.body.description,
              gender: req.body.gender,
              category: req.body.category,
            },
          });
          res.status(200).json({ message: "success" });
        } else {
          let images = [];
          for (let i = 0; i < req.files.length; i++) {
            let file = req.files[i];
            let url = await cloudinary.uploadProduct(file.path);
            images.push(url);
          }

          await Products.findByIdAndUpdate(req.body.product, {
            $set: {
              image: images[0],
              subImages: [images[1], images[2], images[3]],
              name: req.body.name,
              brand: req.body.brand,
              price: req.body.price,
              description: req.body.description,
              gender: req.body.gender,
              category: req.body.category,
            },
          });
          res.status(200).json({ message: "success" });
        }
      } else {
        await Products.findByIdAndUpdate(req.body.product, {
          $set: {
            name: req.body.name,
            brand: req.body.brand,
            price: req.body.price,
            description: req.body.description,
            gender: req.body.gender,
            category: req.body.category,
          },
        });
        res.status(200).json({ message: "success" });
      }
    } else {
      res.status(200).json({
        name: nameValidate(),
        brand: brandValidate(),
        price: priceValidate(),
        description: descriptionValidate(),
        gender: genderValidate(),
      });
    }
    res.redirect("/admin//products/product-details?id=" + req.query.id);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const softDelete = async (req, res, next) => {
  try {
    await Products.findByIdAndUpdate(req.query.id, { deleted: true });
    res.redirect("/admin/products");
  } catch (error) {
    res.render("error", { error: error });
  }
};

const restore = async (req, res, next) => {
  try {
    await Products.findByIdAndUpdate(req.query.id, { deleted: false });
    res.redirect("/admin/products");
  } catch (error) {
    res.render("error", { error: error });
  }
};

const add = async (req, res, next) => {
  try {
    const categories = await Categories.find().select({ name: 1 });
    res.render("admin/add-product", {
      admin: req.user,
      page: "Products",
      categories: categories,
    });
  } catch (error) {
    res.render("error", { error: error });
  }
};

const saveAdd = async (req, res, next) => {
  try {
    const name = req.body.name;
    const brand = req.body.brand;
    const price = req.body.price;
    const description = req.body.description;
    const gender = req.body.gender;
    const category = req.body.category;

    const imagesValidate = () => {
      if (req.files.length === 4) {
        return "";
      } else {
        return "Select 4 images for product!";
      }
    };

    const nameValidate = () => {
      if (name === (null || "")) {
        return "Enter product name!";
      } else {
        const regex = /[a-zA-Z]+/;

        if (!regex.test(name)) {
          return "Need atleast 1 alphabet!";
        } else {
          return "";
        }
      }
    };

    const brandValidate = () => {
      if (brand === (null || "")) {
        return "Enter a brand";
      } else {
        const regex = /^(?=.*[a-zA-Z0-9]).*$/;
        if (!regex.test(brand)) {
          return "Need atleast 1 alphabet or number!";
        } else {
          return "";
        }
      }
    };

    const priceValidate = () => {
      if (price === (null || "")) {
        return "Enter a price!";
      } else {
        if (!(price > 0)) {
          return "Enter a valid amount!";
        } else {
          return "";
        }
      }
    };

    const descriptionValidate = () => {
      if (description === (null || "")) {
        return "Enter product description";
      } else {
        if (description.length < 40) {
          return "Description too short!";
        } else {
          return "";
        }
      }
    };

    const genderValidate = () => {
      if (gender === "Male" || gender === "Female") {
        return "";
      } else {
        return "Select gender";
      }
    };

    const categoryValidate = () => {
      if (category === (null || "")) {
        return "Select product category";
      } else {
        return "";
      }
    };

    if (
      imagesValidate() === "" &&
      nameValidate() === "" &&
      brandValidate() === "" &&
      priceValidate() === "" &&
      descriptionValidate() === "" &&
      genderValidate() === "" &&
      categoryValidate() === ""
    ) {
      let images = [];
      for (let i = 0; i < 4; i++) {
        let file = req.files[i];
        let url = await cloudinary.uploadProduct(file.path);
        images.push(url);
      }

      await new Products({
        image: images[0],
        subImages: [images[1], images[2], images[3]],
        name: name,
        brand: brand,
        price: price,
        description: description,
        gender: gender,
        category: category,
      }).save();
      res.status(200).json({ message: "success" });
    } else {
      res.status(200).json({
        image: imagesValidate(),
        name: nameValidate(),
        brand: brandValidate(),
        price: priceValidate(),
        description: descriptionValidate(),
        gender: genderValidate(),
        category: categoryValidate(),
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = {
  showAll,
  showInCategory,
  search,
  showDetails,
  showStock,
  addStock,
  updateStock,
  edit,
  saveEdit,
  softDelete,
  restore,
  add,
  saveAdd,
};
