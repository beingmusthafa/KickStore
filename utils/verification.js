const VerificationSessions = require("../models/verificationSessionsModel");
const createRecovery = async (email, code) => {
  try {
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
  } catch (error) {
    console.log(error);
  }
};

const createEmail = async (email, code) => {
  try {
    if (await VerificationSessions.findOne({ email })) {
      await VerificationSessions.deleteOne({ email });
    }
    await new VerificationSessions({
      email: email,
      code: code,
    }).save();
  } catch (error) {
    console.log(error);
  }
};

const createPhone = async (phone, code) => {
  try {
    if (await VerificationSessions.findOne({ phone })) {
      await VerificationSessions.deleteOne({ phone });
    }
    await new VerificationSessions({
      phone: phone,
      code: code,
    }).save();
  } catch (error) {
    console.log(error);
  }
};

module.exports = { createRecovery, createEmail, createPhone };
