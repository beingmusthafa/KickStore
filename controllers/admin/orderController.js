const Orders = require("../../models/ordersModel");
const Users = require("../../models/usersModel");
const Returns = require("../../models/returnsModel");

const errorHandler = require("../../utils/errorHandler");

const showOrders = async (req, res) => {
  try {
    const orders = await Orders.find().lean().sort({
      createdAt: -1,
    });
    for (const order of orders) {
      order.user = await Users.findById(order.userId).select({ name: 1 });
      if (order.status === "Returned") {
        const returnDetails = await Returns.findOne({
          orderId: String(order._id),
        });
        order.returnReason = returnDetails.reason;
      }
    }
    res.render("admin/orders", {
      page: "Orders",
      admin: req.user,
      orders: orders,
    });
  } catch (error) {
    const statusCode = errorHandler.getStatusCode(error);
    res.status(statusCode).render("error", { error: error });
    console.log(error);
  }
};

const updateStatus = async (req, res) => {
  try {
    await Orders.findByIdAndUpdate(req.body.order, {
      $set: { status: req.body.status },
    });
    res.status(200).json({ message: "success" });
  } catch (error) {
    const statusCode = errorHandler.getStatusCode(error);
    res.status(statusCode).render("error", { error: error });
    console.log(error);
  }
};

module.exports = { showOrders, updateStatus };
