const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      default:
        "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541",
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: true },
    password: { type: String, required: true },
    isBlocked: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    default_address: { type: String, default: "none" },
    wishlist: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", usersSchema);
