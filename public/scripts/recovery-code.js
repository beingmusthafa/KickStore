function submit() {
  const code = document.querySelector("input[name='code']").value;
  const codeWarning = document.getElementById("code-warning");
  if (code === (null || "")) {
    codeWarning.innerText = "Enter verification code!";
  } else {
    document.querySelector(".login-form").submit();
  }
}
