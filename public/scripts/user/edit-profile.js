const oldEmail = document.querySelector("input[name='email']").value;
const OldPhone = document.querySelector("input[name='phone']").value;

const name = document.querySelector("input[name='name']");
const email = document.querySelector("input[name='email']");
const phone = document.querySelector("input[name='phone']");

const nameWarning = document.getElementById("name-warning");
const emailWarning = document.getElementById("email-warning");
const phoneWarning = document.getElementById("phone-warning");

//verification
const emailVerify = document.querySelector("input[name='emailVerify']");
const phoneVerify = document.querySelector("input[name='phoneVerify']");

const emailVerifyWarning = document.getElementById("emailVerify-warning");
const phoneVerifyWarning = document.getElementById("phoneVerify-warning");

const nameValidate = () => {
  if (name.value === (null || "")) {
    nameWarning.innerText = "Enter your full name";
    return false;
  } else {
    const isValidName = (name) => {
      const regex =
        /^[a-zA-Z-ÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìíîïòóôõöùúûüýÿ ']{2,75}( [a-zA-Z-ÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìíîïòóôõöùúûüýÿ ']{2,75})*$/;

      return regex.test(name);
    };
    if (name.value.length > 20) {
      nameWarning.innerText = "Input too long!";
      return false;
    }
    if (!isValidName(name.value)) {
      nameWarning.innerText = "Only alphabets, space & '-' allowed";
      return false;
    } else {
      nameWarning.innerText = "";
      return true;
    }
  }
};

const emailValidate = () => {
  if (email.value === (null || "")) {
    emailWarning.innerText = "Enter your email";
    return false;
  } else {
    const isValidEmail = (email) => {
      const regex = /^[a-zA-Z0-9-_.]+@[a-zA-Z0-9-.]+\.[a-zA-Z]{2,6}$/;

      return regex.test(email);
    };
    if (!isValidEmail(email.value)) {
      emailWarning.innerText = "Enter a valid email";
      return false;
    } else {
      emailWarning.innerText = "";
      return true;
    }
  }
};

const phoneValidate = () => {
  if (phone.value === (null || "")) {
    phoneWarning.innerText = "Enter your phone number";
    return false;
  } else {
    const isValidPhone = (phone) => {
      const regex = /^\d{10}$/;
      return regex.test(phone.toString());
    };
    if (!isValidPhone(phone.value)) {
      phoneWarning.innerText = "Enter a valid number";
      return false;
    } else {
      phoneWarning.innerText = "";
      return true;
    }
  }
};

async function sendCode() {
  if (nameValidate() && emailValidate() && phoneValidate()) {
    if (email.value === oldEmail && phone.value === OldPhone) {
      document.getElementById("details-form").submit();
      return;
    }
    const form = document.getElementById("details-form");
    $.ajax({
      type: "POST",
      url: "/profile/edit-profile-verification",
      data: {
        oldEmail: oldEmail,
        OldPhone: OldPhone,
        email: email.value,
        phone: phone.value,
      },
      dataType: "json",
      success: function (data) {
        if (data.email === false || data.phone === false) {
          if (data.email === false) {
            emailWarning.innerText = "Email already taken!";
          } else {
            emailWarning.innerText = "";
          }
          if (data.phone === false) {
            phoneWarning.innerText = "Phone number already taken!";
          } else {
            phoneWarning.innerText = "";
          }
          return;
        }
        document.getElementById("details-form").classList.add("d-none");
        document.getElementById("details-form-button").classList.add("d-none");
        document.getElementById("verify-form").classList.remove("d-none");
        document
          .getElementById("verify-form-button")
          .classList.remove("d-none");
      },
    });
  }
}

const emailVerifyValidate = () => {
  if (emailVerify.value === (null || "")) {
    emailVerifyWarning.innerText = "Enter verification code!";
    return false;
  } else {
    emailVerifyWarning.innerText = "";
    return true;
  }
};
const phoneVerifyValidate = () => {
  if (phoneVerify.value === (null || "")) {
    phoneVerifyWarning.innerText = "Enter verification code!";
    return false;
  } else {
    phoneVerifyWarning.innerText = "";
    return true;
  }
};

function checkCode() {
  let link = `/profile/edit-profile-verfication/verify`;

  $.ajax({
    type: "POST",
    url: link,
    data: {
      phone: phone.value,
      email: email.value,
      emailVerify: emailVerify.value,
      phoneVerify: phoneVerify.value,
    },
    dataType: "json",
    success: function (data) {
      if (data.email === false || data.phone === false) {
        if (data.email === false) {
          emailVerifyWarning.innerText = "Wrong code!";
        } else {
          emailVerifyWarning.innerText = "";
        }
        if (data.phone === false) {
          phoneVerifyWarning.innerText = "Wrong code!";
        } else {
          phoneVerifyWarning.innerText = "";
        }
        return;
      }
      document.getElementById("details-form").submit();
    },
  });
}
