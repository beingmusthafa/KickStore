const Orders = require("../models/ordersModel");
const Products = require("../models/productsModel");
const Reviews = require("../models/reviewsModel");
const Carts = require("../models/cartsModel");
const Categories = require("../models/categoriesModel");
const Stocks = require("../models/stocksModel");
const Coupons = require("../models/couponsModel");
const Offers = require("../models/offersModel");

async function subCategoriesIntoArray(parentCategory) {
  let categoryArray = [];
  async function findSubCategories(categories) {
    for (category of categories) {
      categoryArray.push(category.name);
      const subCategories = await Categories.find({
        parent_category: category.name,
      });
      await findSubCategories(subCategories);
    }
  }
  await findSubCategories([{ name: parentCategory }]);
  return categoryArray;
}

module.exports = { subCategoriesIntoArray };
