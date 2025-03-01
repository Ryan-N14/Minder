window.addEventListener("DOMContentLoaded", main());

function main() {
  checkPassword();
  document.getElementById("fullName").addEventListener("input", checkForm);
  document.getElementById("email").addEventListener("input", checkForm);

  document
    .getElementById("signup_form")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      signUp();
    });
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
  var submitBtn = document.getElementById("submitBTN");

  if (fullName.value && email.value) {
    submitBtn.disabled = false;
  } else {
    submitBtn.disabled = true;
  }
}

async function signUp() {
  console.log("Inside of sign up function");
  // grabs the email and password from HTML
  const email = document.getElementById("email").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  // calling end point to communicate with backend (POST)
  const response = await fetch("http://127.0.0.1:5000/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, confirmPassword }),
  }); // end of call

  const data = response.json();

  // Checking if sign up is successful
  if (response.ok) {
    alert("Successful Sign Up");
  } else {
    alert("Failed to Sign Up");
  }
}
