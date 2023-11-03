function login() {
  const email = document.querySelector("input[name='email']").value;
  const password = document.querySelector("input[name='password']").value;
  const emailWarning = document.getElementById("email-warning");
  const passwordWarning = document.getElementById("password-warning");
  if (email === (null || "") || password === (null || "")) {
    if (email === (null || "")) {
      emailWarning.innerText = "Enter your email";
    } else {
      emailWarning.innerText = "";
    }
    if (password === (null || "")) {
      passwordWarning.innerText = "Enter your password";
    } else {
      passwordWarning.innerText = "";
    }
  } else {
    document.querySelector(".login-form").submit();
  }
}
