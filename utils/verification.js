const VerificationSessions = require("../models/verificationSessionsModel");
const createRecovery = async (email, code) => {
  if (await VerificationSessions.findOne({ email })) {
    await VerificationSessions.deleteOne({ email });
  }
  await new VerificationSessions({
    email: email,
    code: code,
  }).save();
  setTimeout(async () => {
    await VerificationSessions.deleteOne({ email });
  }, 60000);
};

const createEmail = async (email, code) => {
  if (await VerificationSessions.findOne({ email })) {
    await VerificationSessions.deleteOne({ email });
  }
  await new VerificationSessions({
    email: email,
    code: code,
  }).save();
};

const createPhone = async (phone, code) => {
  if (await VerificationSessions.findOne({ phone })) {
    await VerificationSessions.deleteOne({ phone });
  }
  await new VerificationSessions({
    phone: phone,
    code: code,
  }).save();
};

module.exports = { createRecovery, createEmail, createPhone };
