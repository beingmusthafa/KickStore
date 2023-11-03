const Users = require("../models/usersModel");
const Wallets = require("../models/walletsModel");
const VerificationSessions = require("../models/verificationSessionsModel");
const bcrypt = require("bcrypt");
const cloudinary = require("../utils/cloudinary");
const mongoose = require("mongoose");
const passport = require("../middlewares/passport");
const mailer = require("../utils/nodemailer");
const twilio = require("../utils/twilio");
const verification = require("../utils/verification");
const ObjectId = require("mongodb").ObjectId;

require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const BCRYPT_SALT = process.env.BCRYPT_SALT;

mongoose.connect(process.env.DB_LINK);
var RETURN_TO;
const sendLoginStatus = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(403).json({ message: "not authenticated" });
  }
};

const checkAuth = (req, res, next) => {
  try {
    if (req.isAuthenticated()) {
      if (req.user.isBlocked) {
        req.logout(() => {
          res
            .status(403)
            .render("error", { error: "Your account is currently blocked!" });
        });
      } else {
        next();
      }
    } else {
      RETURN_TO = req.originalUrl;
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error);
    res.render("error", { error: error });
  }
};

const returnToPage = (req, res, next) => {
  try {
    if (RETURN_TO) {
      const returnPage = RETURN_TO;
      RETURN_TO = null;
      res.redirect(returnPage);
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.render("error", { error: error });
  }
};

const checkAuthAdmin = (req, res, next) => {
  try {
    if (req.isAuthenticated()) {
      if (!req.user.isAdmin) {
        req.logout(() => {
          res.status(403).render("error", {
            error: "You are not authorized to access this page!",
          });
        });
      } else {
        const returnPage = RETURN_TO ? RETURN_TO : null;
        RETURN_TO = null;
        if (returnPage) {
          res.redirect(returnPage);
        } else {
          next();
        }
      }
    } else {
      RETURN_TO = req.originalUrl;
      res.redirect("/admin-login");
    }
  } catch (error) {
    console.log(error);
    res.render("error", { error: error });
  }
};

const sendVerificationCode = async (req, res) => {
  const { name, email, phone, password, passwordConfirm } = req.body;

  const nameValidate = () => {
    if (name === (null || "")) {
      return "Enter your full name";
    } else {
      const isValidName = (name) => {
        const regex =
          /^[a-zA-Z-ÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìíîïòóôõöùúûüýÿ ']{2,75}( [a-zA-Z-ÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìíîïòóôõöùúûüýÿ ']{2,75})*$/;

        return regex.test(name);
      };
      if (name.length > 20) {
        return "Input too long!";
      }
      if (!isValidName(name)) {
        return "Only alphabets, space & '-' allowed";
      } else {
        return "";
      }
    }
  };

  const emailValidate = async () => {
    if (email === (null || "")) {
      return "Enter your email";
    } else {
      const emailExists = await Users.findOne({ email }).select({ _id: 1 });
      if (emailExists) {
        return "Email already registered!";
      }
      const isValidEmail = (email) => {
        const regex = /^[a-zA-Z0-9-_.]+@[a-zA-Z0-9-.]+\.[a-zA-Z]{2,6}$/;

        return regex.test(email);
      };
      if (!isValidEmail(email)) {
        return "Enter a valid email";
      } else {
        return "";
      }
    }
  };

  const phoneValidate = async () => {
    if (phone === (null || "")) {
      return "Enter your phone number";
    } else {
      const phoneExists = await Users.findOne({ phone }).select({ _id: 1 });
      if (phoneExists) {
        return "Phone number already registered!";
      }
      const isValidPhone = (phone) => {
        const regex = /^\d{10}$/;
        return regex.test(phone.toString());
      };
      if (!isValidPhone(phone)) {
        return "Enter a valid number";
      } else {
        return "";
      }
    }
  };

  const passwordValidate = () => {
    if (password === (null || "")) {
      return "Enter your password";
    } else {
      const isValidPassword = (password) => {
        const regex = /^.{7,}\d$/;

        return regex.test(password);
      };
      if (!isValidPassword(password)) {
        return "Needs 7 characters & atleast 1 digit";
      } else {
        return "";
      }
    }
  };

  const passwordConfirmValidate = () => {
    if (passwordConfirm === (null || "")) {
      return "Confirm your password";
    } else {
      if (passwordConfirm === password) {
        return "";
      } else {
        return "Passwords dont match";
      }
    }
  };

  if (
    nameValidate() === "" &&
    (await emailValidate()) === "" &&
    (await phoneValidate()) === "" &&
    passwordValidate() === "" &&
    passwordConfirmValidate() === ""
  ) {
    const emailCode = Math.floor(Math.random() * (999999 - 100000) + 100000);
    const phoneCode = Math.floor(Math.random() * (999999 - 100000) + 100000);
    await mailer.sendVerificationMail(email, emailCode);
    await verification.createEmail(email, emailCode);

    await twilio.sendVerificationSMS(phone, phoneCode);
    await verification.createPhone(phone, phoneCode);
  }
  const response = {
    name: nameValidate(),
    email: await emailValidate(),
    phone: await phoneValidate(),
    password: passwordValidate(),
    passwordConfirm: passwordConfirmValidate(),
  };
  res.status(200).json(response);
};

const sendEditVerificationCode = async (req, res) => {
  const { email, phone, oldEmail, oldPhone } = req.body;
  const phoneExists = await Users.exists({
    phone,
    _id: { $ne: new ObjectId(req.user._id) },
  });
  const emailExists = await Users.exists({
    email,
    _id: { $ne: new ObjectId(req.user._id) },
  });
  if (phoneExists && emailExists && phone !== oldPhone && email !== oldEmail) {
    res.json({ email: false, phone: false });
    return;
  } else if (!phoneExists && emailExists && email !== oldEmail) {
    res.json({ email: false, phone: true });
    return;
  } else if (phoneExists && phone !== oldPhone && !emailExists) {
    res.json({ email: true, phone: false });
    return;
  }
  res.json({ email: true, phone: true });
  const emailCode = Math.floor(Math.random() * (999999 - 100000) + 100000);
  const phoneCode = Math.floor(Math.random() * (999999 - 100000) + 100000);
  await mailer.sendVerificationMail(email, emailCode);
  await verification.createEmail(email, emailCode);

  await twilio.sendVerificationSMS(phone, phoneCode);
  await verification.createPhone(phone, phoneCode);
};

const checkVerificationCode = async (req, res) => {
  const { email, phone, emailVerify, phoneVerify } = req.body;
  const phoneExists = await VerificationSessions.findOne({
    phone: phone,
    code: phoneVerify,
  });
  const emailExists = await VerificationSessions.findOne({
    email: email,
    code: emailVerify,
  });
  res.json({ phone: Boolean(phoneExists), email: Boolean(emailExists) });
};

const signup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    await VerificationSessions.deleteOne({
      phone,
    });
    await VerificationSessions.deleteOne({
      email,
    });
    const passwordHash = bcrypt.hashSync(password, BCRYPT_SALT);

    const user = await new Users({
      name,
      email,
      phone,
      password: passwordHash,
    }).save();
    await new Wallets({
      userId: user._id,
    }).save();
    res.redirect("/login");
  } catch (error) {
    console.log(error);
    res.render("error", { error: error });
    console.log(error);
  }
};

const logout = (req, res) => {
  req.logout(() => {
    try {
      res.redirect("/login");
    } catch (error) {
      console.log(error);
      res.render("error", { error: error });
      console.log(error);
    }
  });
};

const sendRecoveryCode = async (req, res) => {
  try {
    const email = req.body.email;
    const emailExists = await Users.exists({ email });
    if (emailExists) {
      const code = Math.floor(Math.random() * (999999 - 100000) + 100000);
      await verification.createRecovery(email, code);
      await mailer.sendRecoveryMail(email, code);
      res.render("recovery-code", { email: email, codeWarning: "" });
    } else {
      res.render("recovery-email", {
        emailWarning: "Email is not registered!",
      });
    }
  } catch (error) {
    console.log(error);
    res.render("error", { error: error });
  }
};

const checkRecoveryCode = async (req, res) => {
  try {
    const email = req.query.email;
    const code = req.body.code;
    const codeCorrect = await VerificationSessions.exists({
      email: email,
      code: code,
    });
    if (codeCorrect) {
      res.render("new-password", { email: email });
    } else {
      res.render("recovery-code", {
        email: email,
        codeWarning: "Entered code is wrong!",
      });
    }
  } catch (error) {
    console.log(error);
    res.render("error", { error: error });
  }
};

const changePassword = async (req, res) => {
  try {
    const email = req.query.email;
    const password = req.body.password;
    const passwordHash = bcrypt.hashSync(password, BCRYPT_SALT);
    await Users.findOneAndUpdate(
      { email },
      { $set: { password: passwordHash } }
    );
    res.redirect("/login");
  } catch (error) {
    console.log(error);
    res.render("error", { error: error });
  }
};

module.exports = {
  sendLoginStatus,
  returnToPage,
  checkAuth,
  checkAuthAdmin,
  sendVerificationCode,
  sendEditVerificationCode,
  checkVerificationCode,
  signup,
  logout,
  sendRecoveryCode,
  checkRecoveryCode,
  changePassword,
  RETURN_TO,
};
