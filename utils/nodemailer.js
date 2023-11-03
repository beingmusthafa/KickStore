const nodemailer = require("nodemailer");

const config = {
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL,
    pass: process.env.GMAIL_PASS,
  },
};
const transporter = nodemailer.createTransport(config);
const sendRecoveryMail = async (email, code) => {
  const mail = {
    from: process.env.GMAIL,
    to: email,
    subject: "Password recovery of KickStore Account",
    text: `Hello,\nYou have requested a password recovery for your account with the email '${email}'. Your recovery code is ${code}.THIS CODE IS ONLY VALID FOR 1 MINUTE! Dont worry, kindly ignore this mail if you didnt initiate this request. Happy shopping.\n Team KickStore`,
  };
  await transporter.sendMail(mail, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      return info.response;
    }
  });
};

const sendVerificationMail = async (email, code) => {
  const mail = {
    from: process.env.GMAIL,
    to: email,
    subject: "Signup verification for KickStore Account",
    text: `Hello,\nYour verification code to register the email '${email}' is ${code}. Dont worry, kindly ignore this mail if you didnt initiate this request. Happy shopping.\n Team KickStore`,
  };
  await transporter.sendMail(mail, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      return info.response;
    }
  });
};

module.exports = { sendRecoveryMail, sendVerificationMail };
