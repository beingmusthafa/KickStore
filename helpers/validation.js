const Users = require("../models/usersModel");

const nameValidate = (name) => {
  if (name === (null || "")) {
    return "Enter your full name";
  } else {
    const isValidName = (name) => {
      const regex =
        /^[a-zA-Z-ÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìíîïòóôõöùúûüýÿ ']{2,75}( [a-zA-Z-ÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìíîïòóôõöùúûüýÿ ']{2,75})*$/;

      return regex.test(name);
    };
    if (name.length > 20) {
      return "Input too long!";
    }
    if (!isValidName(name)) {
      return "Only alphabets, space & '-' allowed";
    } else {
      return "";
    }
  }
};

const emailValidate = async (email) => {
  if (email === (null || "")) {
    return "Enter your email";
  } else {
    const emailExists = await Users.findOne({ email }).select({ _id: 1 });
    if (emailExists) {
      return "Email already registered!";
    }
    const isValidEmail = (email) => {
      const regex = /^[a-zA-Z0-9-_.]+@[a-zA-Z0-9-.]+\.[a-zA-Z]{2,6}$/;

      return regex.test(email);
    };
    if (!isValidEmail(email)) {
      return "Enter a valid email";
    } else {
      return "";
    }
  }
};

const phoneValidate = async (phone) => {
  if (phone === (null || "")) {
    return "Enter your phone number";
  } else {
    const phoneExists = await Users.findOne({ phone }).select({ _id: 1 });
    if (phoneExists) {
      return "Phone number already registered!";
    }
    const isValidPhone = (phone) => {
      const regex = /^\d{10}$/;
      return regex.test(phone.toString());
    };
    if (!isValidPhone(phone)) {
      return "Enter a valid number";
    } else {
      return "";
    }
  }
};

const passwordValidate = (password) => {
  if (password === (null || "")) {
    return "Enter your password";
  } else {
    const isValidPassword = (password) => {
      const regex = /^.{7,}\d$/;

      return regex.test(password);
    };
    if (!isValidPassword(password)) {
      return "Needs 7 characters & atleast 1 digit";
    } else {
      return "";
    }
  }
};

const passwordConfirmValidate = (passwordConfirm, password) => {
  if (passwordConfirm === (null || "")) {
    return "Confirm your password";
  } else {
    if (passwordConfirm === password) {
      return "";
    } else {
      return "Passwords dont match";
    }
  }
};

module.exports = {
  nameValidate,
  emailValidate,
  phoneValidate,
  passwordValidate,
  passwordConfirmValidate,
};
