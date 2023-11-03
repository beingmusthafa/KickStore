function submit() {
  const email = document.querySelector("input[name='email']").value;
  const emailWarning = document.getElementById("email-warning");
  if (email === (null || "")) {
    emailWarning.innerText = "Enter your account email";
  } else {
    document.querySelector(".login-form").submit();
  }
}
