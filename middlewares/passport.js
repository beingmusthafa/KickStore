const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const Users = require("../models/usersModel");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
require("dotenv").config();

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const user = await Users.findOne({ email });
        if (!user) {
          req.flash("message", "Email not registered!");
          return done(null, false);
        } else {
          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) {
            req.flash("message", "Wrong password");
            return done(null, false);
          }
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Users.findById(id);
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
});

module.exports = passport;
