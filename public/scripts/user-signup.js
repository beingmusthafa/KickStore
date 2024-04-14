const name = document.querySelector("input[name='name']");
const email = document.querySelector("input[name='email']");
const phone = document.querySelector("input[name='phone']");
const password = document.querySelector("input[name='password']");
const passwordConfirm = document.querySelector("input[name='passwordConfirm']");

const nameWarning = document.getElementById("name-warning");
const emailWarning = document.getElementById("email-warning");
const phoneWarning = document.getElementById("phone-warning");
const passwordWarning = document.getElementById("password-warning");
const passwordConfirmWarning = document.getElementById(
  "passwordConfirm-warning"
);

//verification
const emailVerify = document.querySelector("input[name='emailVerify']");
const emailVerifyWarning = document.getElementById("emailVerify-warning");

async function sendCode() {
  $("#loading").removeClass("d-none");
  $.ajax({
    type: "POST",
    url: "/verification",
    data: {
      name: name.value,
      email: email.value,
      phone: phone.value,
      password: password.value,
      passwordConfirm: passwordConfirm.value,
    },
    dataType: "json",
    success: function (data) {
      console.log(data);
      if (
        data.name === "" &&
        data.email === "" &&
        data.phone === "" &&
        data.password === "" &&
        data.passwordConfirm === ""
      ) {
        $("#loading").addClass("d-none");
        document
          .getElementById("details-form-container")
          .classList.add("d-none");
        document.getElementById("details-form").classList.add("d-none");
        document.getElementById("details-form-button").classList.add("d-none");
        document
          .getElementById("verify-form-container")
          .classList.remove("d-none");
        document.getElementById("verify-form").classList.remove("d-none");
        document
          .getElementById("verify-form-button")
          .classList.remove("d-none");
      } else {
        $("#loading").addClass("d-none");
        nameWarning.innerText = data.name;
        emailWarning.innerText = data.email;
        phoneWarning.innerText = data.phone;
        passwordWarning.innerText = data.password;
        passwordConfirmWarning.innerText = data.passwordConfirm;
      }
    },
  });
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

function checkCode() {
  $("#loading").removeClass("d-none");
  let link = `/verification/verify`;
  if (emailVerifyValidate()) {
    $.ajax({
      type: "POST",
      url: link,
      data: {
        email: email.value,
        emailVerify: emailVerify.value,
      },
      dataType: "json",
      success: function (data) {
        $("#loading").addClass("d-none");
        if (data.email === false || data.phone === false) {
          if (data.email === false) {
            emailVerifyWarning.innerText = "Wrong code!";
          } else {
            emailVerifyWarning.innerText = "";
          }
          return;
        }
        document.getElementById("details-form").submit();
      },
    });
  }
}
