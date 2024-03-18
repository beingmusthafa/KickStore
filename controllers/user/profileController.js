const Users = require("../../models/usersModel");
const Addresses = require("../../models/addressesModel");
const Orders = require("../../models/ordersModel");
const Wallets = require("../../models/walletsModel");
const Transactions = require("../../models/transactionsModel");
const bcrypt = require("bcrypt");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");
require("dotenv").config();

const cloudinary = require("../../utils/cloudinary");
const errorHandler = require("../../utils/errorHandler");

const showProfile = async (req, res, next) => {
  try {
    const user = req.session.user;
    if (user.default_address !== "none") {
      user.address = await Addresses.findById(user.default_address);
    }
    const wallet = await Wallets.findOne({ userId: user._id }).select({
      balance: 1,
    });
    const transactions = await Transactions.find({ userId: user._id }).sort({
      createdAt: -1,
    });
    const addresses = await Addresses.find({ userId: user._id });
    const orders = await Orders.find({ userId: user._id }).sort({
      createdAt: -1,
    });
    for (const order of orders) {
      if (order.status === "Delivered") {
        if (order.createdAt.getTime() + 604800000 < Date.now()) {
          order.isReturnEligible = false;
        } else {
          order.isReturnEligible = true;
        }
      }
    }
    res.render("user/profile", {
      user,
      wallet,
      transactions,
      addresses,
      orders,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const updateImage = async (req, res, next) => {
  if (req.file) {
    const uploadedImage = req.file.path;
    const croppedImage = path.join(
      req.file.destination,
      `image_${req.session.user._id}.jpg`
    );
    sharp(uploadedImage)
      .resize({
        height: 300,
        width: 300,
        fit: "cover",
      })
      .toFile(croppedImage, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          fs.unlink(uploadedImage, (error) => {
            if (error) console.log(error);
          });
        }
      });
    const imageUrl = await cloudinary
      .uploadUser(croppedImage)
      .catch((error) => console.log(error));
    fs.unlink(croppedImage, (error) => {
      if (error) console.log(error);
    });
    const id = req.body.id;
    await Users.findByIdAndUpdate(id, { $set: { image: imageUrl } });
    res.status(200).json({ message: "success" });
  }
};

const editProfile = async (req, res, next) => {
  const newDetails = req.body;
  if (req.file) {
    const file = req.file.path;
    const imageUrl = await cloudinary.uploadUser(file);
    newDetails.image = imageUrl;
    await Users.findByIdAndUpdate(req.session.user._id, { $set: newDetails });
    return res.status(200).redirect("/home/profile");
  }
  await Users.findByIdAndUpdate(req.session.user._id, {
    $set: {
      name: newDetails.name,
      email: newDetails.email,
      phone: newDetails.phone,
    },
  });
  return res.status(200).redirect("/home/profile");
};

const changePassword = async (req, res, next) => {
  try {
    const oldPassword = req.body.oldPassword;
    const password = req.body.password;
    const correctPassword = await bcrypt.compare(
      oldPassword,
      req.session.user.password
    );
    if (correctPassword) {
      const passwordHash = bcrypt.hashSync(password, process.env.BCRYPT_SALT);
      await Users.findByIdAndUpdate(req.session.user._id, {
        $set: { password: passwordHash },
      });
      return res.status(200).json({ valid: true });
    } else {
      return res.status(200).json({ valid: false });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const addAddress = async (req, res, next) => {
  try {
    const address = req.body;
    address.userId = req.session.user._id;
    await new Addresses(address).save();
    res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const showEditAddress = async (req, res, next) => {
  const address = await Addresses.findOne({
    userId: req.session.user._id,
    _id: req.query.address,
  });
  res.render("user/edit-address", { address: address });
};

const editAddress = async (req, res, next) => {
  try {
    const updatedAddress = req.body.data;
    await Addresses.findByIdAndUpdate(req.body.address, {
      $set: updatedAddress,
    });
    res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const deleteAddress = async (req, res, next) => {
  try {
    const addressId = req.body.address;
    const address = await Addresses.findById(addressId);
    if (address.default) {
      await Users.findOneAndUpdate(
        { _id: req.session.user._id },
        { $set: { default_address: "none" } }
      );
    }
    await Addresses.findByIdAndDelete(addressId);
    res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const makeDefaultAddress = async (req, res, next) => {
  try {
    const addressId = req.body.address;
    await Users.findOneAndUpdate(
      { _id: req.session.user._id },
      { $set: { default_address: addressId } }
    );
    await Addresses.findOneAndUpdate(
      { userId: req.session.user._id, isDefault: true },
      { $set: { isDefault: false } }
    );
    await Addresses.findByIdAndUpdate(addressId, { $set: { isDefault: true } });
    res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = {
  showProfile,
  updateImage,
  changePassword,
  editProfile,
  addAddress,
  showEditAddress,
  editAddress,
  deleteAddress,
  makeDefaultAddress,
};
