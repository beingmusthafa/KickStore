const mongoose = require("mongoose");
const verificationSessionsSchema = new mongoose.Schema({
  email: String,
  phone: Number,
  code: { type: Number, required: true },
});
module.exports = mongoose.model(
  "VerificationSessions",
  verificationSessionsSchema
);
