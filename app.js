const express = require("express");
const helmet = require("helmet");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("./middlewares/passport");
const cron = require("./utils/cron");
require("dotenv").config();

const app = express();

const nocache = (req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  next();
};
cron.scheduleTasks();
// Authentication controller
const authController = require("./controllers/authController");
const cartController = require("./controllers/user/cartController");
// Routers
const adminRouter = require("./routes/admin");
const userRouter = require("./routes/user");

// ENV
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000, httpOnly: true },
  })
);

// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: [
//         "'self'",
//         "'unsafe-inline'",
//         "https://cdn.jsdelivr.net/npm/bootstrap@5.0/dist/js/bootstrap.bundle.min.js",
//         "https://unpkg.com/boxicons@2.1.4/dist/boxicons.js",
//         "https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js",
//       ],
//       styleSrc: ["'self'", "'unsafe-inline'", "*"],
//       imgSrc: ["'self'", "data:", "*"],
//     },
//   })
// );
app.use(nocache);
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

const upload = require("./middlewares/multer");
app.use("/", express.static(path.join(__dirname, "public")));
app.use("/admin", adminRouter);
app.set("view engine", "ejs");

app.get("/login", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  const message = req.flash("message");
  if (message) {
    return res.render("user-login", { message: message });
  }
  res.render("user-login", { message: "" });
});
app.get("/admin-login", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/admin");
  }
  const message = req.flash("message");
  if (message) {
    return res.render("admin-login", { message: message });
  }
  res.render("admin-login", { message: "" });
});
app.get("/signup", (req, res) => {
  res.render("user-signup", { emailWarning: "", phoneWarning: "" });
});
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);
app.post(
  "/admin-login",
  passport.authenticate("local", {
    successReturnToOrRedirect: "/admin",
    failureRedirect: "/admin-login",
    failureFlash: true,
  })
);
app.post("/verification", authController.sendVerificationCode);
app.post("/verification/verify", authController.checkVerificationCode);
app.post("/signup", authController.signup);
app.get("/logout", authController.logout);

app.get("/forgot-password", (req, res) => {
  res.render("recovery-email", { emailWarning: "" });
});
app.post("/forgot-password", authController.sendRecoveryCode);
app.post("/forgot-password/recovery-code", authController.checkRecoveryCode);
app.post(
  "/forgot-password/recovery-code/new-password",
  authController.changePassword
);

app.use("/", userRouter);

app.use((req, res) => {
  res.render("error", {
    error:
      "ERROR 404: The requested resource is nowhere to be found. Please check the entered URL",
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
