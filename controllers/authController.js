const Users = require("../models/usersModel");
const Wallets = require("../models/walletsModel");
const VerificationSessions = require("../models/verificationSessionsModel");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const mailer = require("../utils/nodemailer");
const twilio = require("../utils/twilio");
const verification = require("../utils/verification");
const ObjectId = require("mongodb").ObjectId;
const {
  nameValidate,
  emailValidate,
  passwordConfirmValidate,
  passwordValidate,
  phoneValidate,
} = require("../helpers/validation");

require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const BCRYPT_SALT = process.env.BCRYPT_SALT;

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
      req.session.redirect = req.originalUrl;
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// const returnToPage = (req, res, next) => {
//   try {
//     return next();
//     if (req.session.redirect) {
//       const returnPage = req.session.redirect;
//       req.session.redirect = null;
//       res.redirect(returnPage);
//     } else {
//     }
//   } catch (error) {
//     console.log(error);
//     next(error);
//   }
// };

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
        const returnPage = req.session.redirect ? req.session.redirect : null;
        req.session.redirect = null;
        if (returnPage) {
          res.redirect(returnPage);
        } else {
          next();
        }
      }
    } else {
      req.session.redirect = req.originalUrl;
      res.redirect("/admin-login");
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const sendVerificationCode = async (req, res, next) => {
  try {
    const { name, email, phone, password, passwordConfirm } = req.body;
    if (
      nameValidate(name) === "" &&
      (await emailValidate(email)) === "" &&
      (await phoneValidate(phone)) === "" &&
      passwordValidate(password) === "" &&
      passwordConfirmValidate(passwordConfirm, password) === ""
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
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const sendEditVerificationCode = async (req, res, next) => {
  try {
    const { email, phone, oldEmail, oldPhone } = req.body;
    const phoneExists = await Users.exists({
      phone,
      _id: { $ne: new ObjectId(req.user._id) },
    });
    const emailExists = await Users.exists({
      email,
      _id: { $ne: new ObjectId(req.user._id) },
    });
    if (
      phoneExists &&
      emailExists &&
      phone !== oldPhone &&
      email !== oldEmail
    ) {
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
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const checkVerificationCode = async (req, res, next) => {
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

const signup = async (req, res, next) => {
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
    next(error);
  }
};

const logout = (req, res) => {
  req.logout(() => {
    try {
      res.redirect("/login");
    } catch (error) {
      console.log(error);
      next(error);
    }
  });
};

const sendRecoveryCode = async (req, res, next) => {
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
    next(error);
  }
};

const checkRecoveryCode = async (req, res, next) => {
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
    next(error);
  }
};

const changePassword = async (req, res, next) => {
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
    next(error);
  }
};

module.exports = {
  sendLoginStatus,
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
};
