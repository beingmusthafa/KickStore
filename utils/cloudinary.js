const cloudinary = require("cloudinary");
// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const uploadProduct = async (file) => {
  try {
    const upload = await cloudinary.uploader.upload(file, {
      folder: "Products",
    });
    return upload.url;
  } catch (error) {
    console.log(error);
  }
};
const uploadUser = async (file) => {
  try {
    const upload = await cloudinary.uploader.upload(file, { folder: "Users" });
    return upload.url;
  } catch (error) {
    console.log(error);
  }
};
const uploadCategory = async (file) => {
  try {
    const upload = await cloudinary.uploader.upload(file, {
      folder: "Categories",
    });
    return upload.url;
  } catch (error) {
    console.log(error);
  }
};
const uploadBanner = async (file) => {
  try {
    const upload = await cloudinary.uploader.upload(file, {
      folder: "Banners",
    });
    return upload.url;
  } catch (error) {
    console.log(error);
  }
};

module.exports = { uploadProduct, uploadUser, uploadCategory, uploadBanner };
