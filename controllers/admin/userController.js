const Users = require("../../models/usersModel");
const Addresses = require("../../models/addressesModel");

const errorHandler = require("../../utils/errorHandler");

const showAll = async (req, res, next) => {
  try {
    const users = await Users.find().select({ _id: 1, name: 1, image: 1 });
    res.render("admin/list-users", {
      admin: req.user,
      page: "Users",
      users,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const search = async (req, res, next) => {
  try {
    const users = await Users.find({
      name: {
        $regex: new RegExp(req.query.search, "i"),
      },
    }).select({ _id: 1, name: 1, image: 1 });
    res.render("admin/list-users", {
      page: "Users",
      admin: req.user,
      users: users,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const showDetails = async (req, res, next) => {
  try {
    const user = await Users.findById(req.query.id).select({
      _id: 1,
      name: 1,
      image: 1,
      email: 1,
      phone: 1,
      isBlocked: 1,
    });
    if (user.default_address !== "none") {
      user.address = await Addresses.findById(user.default_address);
    }
    res.render("admin/view-user", {
      admin: req.user,
      page: "Users",
      user: user,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const block = async (req, res, next) => {
  try {
    await Users.findByIdAndUpdate(req.body.id, {
      $set: { isBlocked: true },
    }).then(() => {
      res.status(200).json({ message: "success" });
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const unblock = async (req, res, next) => {
  try {
    await Users.findByIdAndUpdate(req.body.id, {
      $set: { isBlocked: false },
    }).then(() => {
      res.status(200).json({ message: "success" });
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = {
  showAll,
  block,
  showDetails,
  unblock,
  search,
};
