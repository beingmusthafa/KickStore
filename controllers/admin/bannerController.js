const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const Banners = require("../../models/bannersModel");
const cloudinary = require("../../utils/cloudinary");
const errorHandler = require("../../utils/errorHandler");
const Genders = require("../../models/gendersModel");

const showBanners = async (req, res) => {
  try {
    const genders = await Genders.find();
    const slides = await Banners.find({ type: "Slide" });
    const posters = await Banners.find({ type: "Poster" });
    res.render("admin/banners", {
      admin: req.user,
      page: "Banners",
      genders,
      slides,
      posters,
    });
  } catch (error) {
    const statusCode = errorHandler.getStatusCode(error);
    res.status(statusCode).render("error", { error: error });
    console.log(error);
  }
};

const addBanner = async (req, res) => {
  try {
    const { type, order, url } = req.body;
    const uploadedBanner = req.file.path;
    const croppedBanner = path.join(
      req.file.destination,
      `banner_${new Date().getTime()}.jpg`
    );
    const options =
      type === "Slide"
        ? {
            height: 450,
            width: 1200,
            fit: "cover",
          }
        : {
            height: 600,
            width: 600,
            fit: "cover",
          };
    await sharp(uploadedBanner).resize(options).toFile(croppedBanner);
    const imageUrl = await cloudinary
      .uploadBanner(croppedBanner)
      .catch((error) => console.log(error));
    await new Banners({
      image: imageUrl,
      type: type,
      order: order,
      url: url,
    }).save();
    res.status(200).json({ message: "success" });

    fs.unlink(uploadedBanner, (error) => {
      if (error) console.log(error);
    });
    fs.unlink(croppedBanner, (error) => {
      if (error) console.log(error);
    });
  } catch (error) {
    const statusCode = errorHandler.getStatusCode(error);
    res.status(statusCode).render("error", { error: error });
    console.log(error);
  }
};

const sendBannerDetails = async (req, res) => {
  try {
    const banner = await Banners.findById(req.query.id);
    res.status(200).json(banner);
  } catch (error) {
    const statusCode = errorHandler.getStatusCode(error);
    res.status(statusCode).render("error", { error: error });
    console.log(error);
  }
};

const editBanner = async (req, res) => {
  try {
    console.log(req.body);
    const { id, order, url } = req.body;
    await Banners.findByIdAndUpdate(id, {
      $set: { order: order, url: url },
    });
    res.status(200).json({ message: "success" });
  } catch (error) {
    const statusCode = errorHandler.getStatusCode(error);
    res.status(statusCode).render("error", { error: error });
    console.log(error);
  }
};

const enableBanner = async (req, res) => {
  try {
    const banner = req.body.banner;
    await Banners.findByIdAndUpdate(banner, {
      $set: { isActive: true },
    });
    res.status(200).json({ message: "success" });
  } catch (error) {
    const statusCode = errorHandler.getStatusCode(error);
    res.status(statusCode).render("error", { error: error });
    console.log(error);
  }
};

const disableBanner = async (req, res) => {
  try {
    const banner = req.body.banner;
    await Banners.findByIdAndUpdate(banner, {
      $set: { isActive: false },
    });
    res.status(200).json({ message: "success" });
  } catch (error) {
    const statusCode = errorHandler.getStatusCode(error);
    res.status(statusCode).render("error", { error: error });
    console.log(error);
  }
};

const deleteBanner = async (req, res) => {
  try {
    const banner = req.body.banner;
    await Banners.findByIdAndDelete(banner);
    res.status(200).json({ message: "success" });
  } catch (error) {
    const statusCode = errorHandler.getStatusCode(error);
    res.status(statusCode).render("error", { error: error });
    console.log(error);
  }
};

const updateGenderImage = async (req, res) => {
  try {
    const { gender } = req.body;
    const uploadedImage = req.file.path;
    const croppedImage = path.join(req.file.destination, `image_${gender}.jpg`);
    const options = {
      height: 200,
      width: 300,
      fit: "cover",
    };
    await sharp(uploadedImage).resize(options).toFile(croppedImage);
    const imageUrl = await cloudinary
      .uploadBanner(croppedImage)
      .catch((error) => console.log(error));
    await Genders.findOneAndUpdate({ gender }, { $set: { image: imageUrl } });
    res.status(200).json({ message: "success" });

    fs.unlink(uploadedImage, (error) => {
      if (error) console.log(error);
    });
    fs.unlink(croppedImage, (error) => {
      if (error) console.log(error);
    });
    res.status(200).json({ message: "success" });
  } catch (error) {
    const statusCode = errorHandler.getStatusCode(error);
    res.status(statusCode).render("error", { error: error });
    console.log(error);
  }
};

module.exports = {
  showBanners,
  sendBannerDetails,
  editBanner,
  addBanner,
  enableBanner,
  disableBanner,
  deleteBanner,
  updateGenderImage,
};
