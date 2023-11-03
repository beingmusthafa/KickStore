const mongoose = require("mongoose");

function date() {
  const date = new Date();
  return date.toDateString("en-US");
}
function deliveryDate() {
  const date5day = new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000);
  return date5day.toDateString("en-US");
}

const ordersSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    orderId: { type: String, required: true },
    product: { type: Object, required: true },
    size: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    date: {
      type: String,
      default: date(),
    },
    address: { type: Object, required: true },
    total: { type: Number, required: true },
    paymentMethod: String,
    status: { type: String, default: "Placed" },
    delivery: {
      type: String,
      default: deliveryDate(),
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Orders", ordersSchema);
