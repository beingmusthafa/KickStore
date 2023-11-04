const Transactions = require("../models/transactionsModel");

exports.createPayment = async (userId, amount, orderId) => {
  await new Transactions({
    userId,
    type: "debit",
    amount,
    note: `Payment for order: '${orderId}'`,
  }).save();
};

exports.createReturn = async (order) => {
  await new Transactions({
    userId: order.userId,
    amount: order.total,
    type: "credit",
    note: `Return of product: ${order.product.brand} ${order.product.name} (Quantity: ${order.quantity})`,
  }).save();
};

exports.createCancel = async (order) => {
  await new Transactions({
    userId: order.userId,
    amount: order.total,
    type: "credit",
    note: `Cancellation of product: ${order.product.brand} ${order.product.name} (Quantity: ${order.quantity})`,
  }).save();
};
