const password = document.querySelector("input[name='password']");
const passwordConfirm = document.querySelector("input[name='passwordConfirm']");

const passwordWarning = document.getElementById("password-warning");
const passwordConfirmWarning = document.getElementById(
  "passwordConfirm-warning"
);

const passwordValidate = () => {
  if (password.value === (null || "")) {
    passwordWarning.innerText = "Enter your password";
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
    passwordConfirmWarning.innerText = "Confirm your password";
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
  if (passwordValidate() && passwordConfirmValidate()) {
    document.querySelector(".login-form").submit();
  }
}
