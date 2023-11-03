const oldPassword = document.querySelector("input[name='oldPassword']");
const password = document.querySelector("input[name='password']");
const passwordConfirm = document.querySelector("input[name='passwordConfirm']");

const oldPasswordWarning = document.getElementById("oldPassword-warning");
const passwordWarning = document.getElementById("password-warning");
const passwordConfirmWarning = document.getElementById(
  "passwordConfirm-warning"
);

const oldPasswordValidate = () => {
  if (oldPassword.value === (null || "")) {
    oldPasswordWarning.innerText = "Enter your old password";
    return false;
  } else {
    oldPasswordWarning.innerText = "";
    return true;
  }
};

const passwordValidate = () => {
  if (password.value === (null || "")) {
    passwordWarning.innerText = "Enter your new password";
    return false;
  } else {
    const isValidPassword = (password) => {
      const regex = /^.{7,}\d$/;

      return regex.test(password);
    };
    if (!isValidPassword(password.value)) {
      passwordWarning.innerText = "Needs 7 characters & atleast 1 digit";
      return false;
    } else {
      passwordWarning.innerText = "";
      return true;
    }
  }
};

const passwordConfirmValidate = () => {
  if (passwordConfirm.value === (null || "")) {
    passwordConfirmWarning.innerText = "Confirm your new password";
  } else {
    if (passwordConfirm.value === password.value) {
      passwordConfirmWarning.innerText = "";
      return true;
    } else {
      passwordConfirmWarning.innerText = "Passwords dont match";
      return false;
    }
  }
};

function submit() {
  if (
    oldPasswordValidate() &&
    passwordValidate() &&
    passwordConfirmValidate()
  ) {
    $.ajax({
      type: "POST",
      url: "/profile/change-password",
      data: {
        oldPassword: oldPassword.value,
        password: password.value,
      },
      dataType: "json",
      success: function (data) {
        console.log(data);
        if (data.valid) {
          window.location.href = "/profile";
          return;
        } else {
          oldPasswordWarning.innerText = "Wrong password";
          return;
        }
      },
    });
  }
}
function back() {
  window.history.back();
}
