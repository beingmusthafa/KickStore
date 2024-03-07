require("dotenv").config();

const twilio = require("twilio")(
  process.env.TWILIO_SID,
  process.env.TWILIO_TOKEN
);

const sendVerificationSMS = async (phone, code) => {
  await twilio.messages
    .create({
      body: `Your KickStore verification code is ${code}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${phone}`,
    })
    .then((message) => console.log(message.sid));
};

module.exports = { sendVerificationSMS };
