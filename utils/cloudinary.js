const cloudinary = require("cloudinary");
// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const uploadProduct = async (file) => {
  const upload = await cloudinary.uploader.upload(file, { folder: "Products" });
  return upload.url;
};
const uploadUser = async (file) => {
  const upload = await cloudinary.uploader.upload(file, { folder: "Users" });
  return upload.url;
};
const uploadCategory = async (file) => {
  const upload = await cloudinary.uploader.upload(file, {
    folder: "Categories",
  });
  return upload.url;
};
const uploadBanner = async (file) => {
  const upload = await cloudinary.uploader.upload(file, { folder: "Banners" });
  return upload.url;
};

module.exports = { uploadProduct, uploadUser, uploadCategory, uploadBanner };
