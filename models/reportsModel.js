const mongoose = require("mongoose");

const reportsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  division: { type: String, required: true },
  type: { type: String, required: true },
  data: { type: Object, required: true },
});

module.exports = mongoose.model("Reports", reportsSchema);
