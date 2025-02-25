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

document
  .getElementById("signup_form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const confirmPassword = document.getElementById("confirm-password");

    console.log("Before fetch");

    const response = await fetch("http://127.0.0.1:5000/signup", {
      // this is just the temp ip
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, confirmPassword }),
    });

    const res = await response.json();
    console.log(res);
    alert("Success");
  });
