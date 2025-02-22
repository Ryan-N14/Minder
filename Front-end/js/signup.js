window.addEventListener("DOMContentLoaded", main());

function main() {
  checkPassword();
}

function checkPassword() {
  var password = document.getElementById("password");
  var confirmPassword = document.getElementById("confirm-password");
  var message = document.getElementById("message");

  confirmPassword.addEventListener("keyup", () => {
    if (password.value === confirmPassword.value) {
      message.textContent = "Passwords match";
      message.style.color = "green";
    } else {
      message.textContent = "Passwords do not match";
      message.style.color = "red";
    }
  });
  console.log(password.value);
}
