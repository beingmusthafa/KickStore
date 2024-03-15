require("dotenv").config();
const { randomUUID } = require("crypto");
const Razorpay = require("razorpay");

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API,
  key_secret: process.env.RAZORPAY_SECRET,
});

const createOrder = async (amount) => {
  try {
    let options = {
      amount: amount * 100, // amount in the smallest currency unit
      currency: "INR",
      receipt: `order_${randomUUID().split("-")[0]}`,
    };
    let order;
    await instance.orders.create(options, function (err, response) {
      order = response;
    });
    return order;
  } catch (error) {
    console.log(error);
  }
};

module.exports = { createOrder };
