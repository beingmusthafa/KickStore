const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const userController = require("../controllers/admin/userController.js");
const productController = require("../controllers/admin/productController.js");
const categoryController = require("../controllers/admin/categoryController.js");
const orderController = require("../controllers/admin/orderController.js");
const offerController = require("../controllers/admin/offerController.js");
const statsController = require("../controllers/admin/statsController.js");
const bannerController = require("../controllers/admin/bannerController.js");
const { checkAuthAdmin } = require("../controllers/authController.js");
const nocache = (req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  next();
};

const router = express();

router.use(nocache);
router.use(checkAuthAdmin);
const upload = require("../middlewares/multer");
router.use(express.urlencoded({ extended: true }));

// dashboard
router.get("/", userController.showAll);

// User routes
router.get("/users", userController.showAll);
router.get("/users/user-details", userController.showDetails);
router.get("/users/search", userController.search);
router.post("/users/user-details/block", userController.block);
router.post("/users/user-details/unblock", userController.unblock);

// Products routes
router.get("/products", productController.showAll);
router.get("/products/category", productController.showInCategory);
router.get("/products/product-details", productController.showDetails);
router.get("/products/search", productController.search);
router.get(
  "/products/product-details/manage-stock",
  productController.showStock
);
router.post(
  "/products/product-details/manage-stock/add",
  productController.addStock
);
router.post(
  "/products/product-details/manage-stock/update",
  productController.updateStock
);
router.get("/products/product-details/edit-product", productController.edit);
router.post(
  "/products/product-details/edit-product",
  upload.array("images", 4),
  productController.saveEdit
);
router.get("/products/product-details/delete", productController.softDelete);
router.get("/products/product-details/restore", productController.restore);
router.get("/products/add-product", productController.add);
router.post(
  "/products/add-product",
  upload.array("images", 4),
  productController.saveAdd
);

//Categories routes
router.get("/products/manage-categories", categoryController.show);
router.get("/products/manage-categories/sub", categoryController.showSub);
router.get(
  "/products/manage-categories/get-category-details",
  categoryController.provideDetails
);
router.put(
  "/products/manage-categories/edit",
  upload.single("image"),
  categoryController.saveEdit
);
router.post(
  "/products/manage-categories/add",
  upload.single("image"),
  categoryController.saveAdd
);

router.post(
  "/products/manage-categories/delete",
  categoryController.deleteCategory
);

//Orders routes
router.get("/orders", orderController.showOrders);
router.post("/orders/update-status", orderController.updateStatus);

// Offers routes
router.get("/offers", offerController.showOffers);
router.post("/offers/add-coupon", offerController.addCoupon);
router.post("/offers/disable-coupon", offerController.disableCoupon);
router.post("/offers/enable-coupon", offerController.enableCoupon);
router.post("/offers/delete-coupon", offerController.deleteCoupon);
router.get("/offers/category-offers", offerController.showCategoryOffers);
router.post(
  "/offers/category-offers/add-offer",
  offerController.addCategoryOffer
);
router.post(
  "/offers/category-offers/delete-offer",
  offerController.deleteCategoryOffer
);
router.get("/offers/product-offers", offerController.showProductOffers);
router.post(
  "/offers/product-offers/add-offer",
  offerController.addProductOffer
);
router.post(
  "/offers/product-offers/delete-offer",
  offerController.deleteProductOffer
);

// Stats routes
router.get("/stats", statsController.showStats);
router.get("/stats/get-category-graph", statsController.sendCategoryGraph);
router.get("/stats/sales-reports", statsController.showSalesReports);
router.get("/stats/stocks-reports", statsController.showStocksReports);
router.get(
  "/stats/sales-reports/get-sales-reports",
  statsController.sendSalesReports
);
router.get(
  "/stats/stocks-reports/get-stocks-reports",
  statsController.sendStocksReports
);
router.get("/stats/download-pdf", statsController.downloadReportPDF);
router.get("/stats/download-excel", statsController.downloadReportExcel);

// Banners routes
router.get("/banners", bannerController.showBanners);
router.post(
  "/banners/upload-banner",
  upload.single("image"),
  bannerController.addBanner
);
router.get("/banners/get-banner-details", bannerController.sendBannerDetails);
router.put("/banners/edit-banner", bannerController.editBanner);
router.patch("/banners/enable-banner", bannerController.enableBanner);
router.patch("/banners/disable-banner", bannerController.disableBanner);
router.post("/banners/delete-banner", bannerController.deleteBanner);
router.put(
  "/banners/update-gender-image",
  upload.single("image"),
  bannerController.updateGenderImage
);

// Handling 404
router.use((req, res) => {
  res.render("error", {
    error:
      "ERROR 404: The requested resource is nowhere to be found. Please check the entered URL",
  });
});
module.exports = router;
