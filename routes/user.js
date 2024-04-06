const express = require("express");
const mongoose = require("mongoose");
const profileController = require("../controllers/user/profileController");
const cartController = require("../controllers/user/cartController");
const checkoutController = require("../controllers/user/checkoutController");
const listingController = require("../controllers/user/listingController");
const authController = require("../controllers/authController");
const nocache = (req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  next();
};

require("dotenv").config();

const router = express();
const upload = require("../middlewares/multer");
router.use(express.urlencoded({ extended: true }));
router.use(nocache);

//Listing routes
router.get("/", listingController.showHome);
router.get("/search", listingController.search);
router.get("/products/filters", listingController.filterProducts);
router.get("/products/view-product", listingController.viewProduct);
router.get("/categories", listingController.showCategory);

//Profile routes

router.get("/profile", authController.checkAuth, profileController.showProfile);
router.post(
  "/profile/update-image",
  authController.checkAuth,
  upload.single("image"),
  profileController.updateImage
);
router.get("/profile/edit-profile", (req, res) => {
  res.render("user/edit-profile", {
    user: req.user,
    emailWarning: "",
    phoneWarning: "",
  });
});
router.get(
  "/profile/edit-profile-verification",
  authController.checkAuth,
  authController.sendEditVerificationCode
);
router.get(
  "/profile/edit-profile-verification/verify",
  authController.checkAuth,
  authController.checkVerificationCode
);
router.post(
  "/profile/edit-profile",
  authController.checkAuth,
  upload.single("image"),
  profileController.editProfile
);
router.get("/profile/change-password", authController.checkAuth, (req, res) => {
  res.render("user/change-password");
});
router.post(
  "/profile/change-password",
  authController.checkAuth,
  profileController.changePassword
);
router.get("/profile/add-address", authController.checkAuth, (req, res) => {
  res.render("user/add-address");
});
router.get(
  "/profile/add-address-checkout",
  authController.checkAuth,
  (req, res) => {
    res.render("user/add-address-checkout");
  }
);
router.post(
  "/profile/add-address",
  authController.checkAuth,
  profileController.addAddress
);

router.get(
  "/profile/edit-address",
  authController.checkAuth,
  profileController.showEditAddress
);
router.post(
  "/profile/edit-address",
  authController.checkAuth,
  profileController.editAddress
);
router.post(
  "/profile/delete-address",
  authController.checkAuth,
  profileController.deleteAddress
);
router.post(
  "/profile/make-default-address",
  authController.checkAuth,
  profileController.makeDefaultAddress
);

///Cart routes
router.get("/wishlist", authController.checkAuth, cartController.showWishlist);
router.post(
  "/add-wishlist",
  authController.sendLoginStatus,
  authController.checkAuth,
  cartController.addToWishlist
);
router.post(
  "/delete-wishlist",
  authController.checkAuth,
  cartController.deleteFromWishlist
);
router.get("/cart", authController.checkAuth, cartController.showCart);
router.post(
  "/add-to-cart",
  authController.sendLoginStatus,
  authController.checkAuth,
  cartController.addToCart
);
router.post(
  "/cart/inc-cart",
  authController.checkAuth,
  cartController.incCartCount
);
router.post(
  "/cart/dec-cart",
  authController.checkAuth,
  cartController.decCartCount
);
router.post(
  "/cart/delete-cart",
  authController.checkAuth,
  cartController.deleteFromCart
);

//Order routes
router.get(
  "/checkout",
  authController.checkAuth,
  checkoutController.showCheckout
);
router.get(
  "/checkout/get-order",
  authController.checkAuth,
  checkoutController.sendOrderToFrontEnd
);
router.post(
  "/checkout/apply-coupon",
  authController.checkAuth,
  checkoutController.applyCoupon
);
router.get(
  "/checkout/remove-coupon",
  authController.checkAuth,
  checkoutController.removeCoupon
);
router.get(
  "/checkout/use-wallet",
  authController.checkAuth,
  checkoutController.useWallet
);
router.get("/checkout/add-address", authController.checkAuth, (req, res) => {
  res.render("user/add-address-checkout");
});
router.post(
  "/checkout/add-address",
  authController.checkAuth,
  profileController.addAddress
);

router.get(
  "/checkout/place-order",
  authController.checkAuth,
  checkoutController.placeOrder
);

router.post(
  "/checkout/verify-payment",
  authController.checkAuth,
  checkoutController.verifyAndPlaceOrder
);

router.post(
  "/checkout/select-address",
  authController.checkAuth,
  checkoutController.selectAddress
);

router.post(
  "/cancel-order",
  authController.checkAuth,
  checkoutController.cancelOrder
);

router.post(
  "/return-order",
  authController.checkAuth,
  checkoutController.returnOrder
);

router.get(
  "/get-invoice-data",
  authController.checkAuth,
  checkoutController.getInvoiceData
);

router.use((req, res) => {
  res.render("error", {
    error:
      "ERROR 404: The requested resource is nowhere to be found. Please check the entered URL",
  });
});

module.exports = router;
