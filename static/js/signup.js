window.addEventListener("DOMContentLoaded", main());

function main() {
  checkPassword();
  document.getElementById("fullName").addEventListener("input", checkForm);
  document.getElementById("email").addEventListener("input", checkForm);
}

function checkPassword() {
  var password = document.getElementById("password");
  var confirmPassword = document.getElementById("confirm-password");
  var message = document.getElementById("message");

  confirmPassword.addEventListener("keyup", () => {
    if (password.value === confirmPassword.value) {
      message.textContent = "Passwords match";
      message.style.color = "green";
      document.getElementById("submitBTN").disabled = false;
    } else {
      message.textContent = "Passwords do not match";
      message.style.color = "red";
      document.getElementById("submitBTN").disabled = true;
    }
  });
}

function checkForm() {
  var fullName = document.getElementById("fullName");
  var email = document.getElementById("email");
  var confirmPassowrd = document.getElementById("confirm-password");
  var submitBtn = document.getElementById("submitBTN");

  if (fullName.value && email.value && confirmPassowrd.value) {
    submitBtn.disabled = false;
  } else {
    submitBtn.disabled = true;
  }
}
