const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const productsSchema = new mongoose.Schema({
  image: { type: String, required: true },
  subImages: {
    type: [String],
    required: true,
    validate: {
      validator: function (arr) {
        return arr.length <= 3;
      },
      message: "Only 3 subImages can be inserted",
    },
  },
  name: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, default: "" },
  gender: { type: String, required: true },
  avgRating: { type: Number },
  description: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },
  discountAmount: { type: Number, default: 0 },
  discountPcnt: { type: Number, default: 0 },
});
productsSchema.plugin(paginate);
productsSchema.plugin(aggregatePaginate);

module.exports = mongoose.model("Products", productsSchema);
