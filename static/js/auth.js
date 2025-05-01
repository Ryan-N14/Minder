window.addEventListener("DOMContentLoaded", main);

function main() {
  const loginBtn = document.getElementById("signin_form");
  const signupBtn = document.getElementById("signupBtn");

  if (loginBtn) {
    loginBtn.addEventListener("submit", function (event) {
      event.preventDefault();
      console.log("logging in...");
      login();
    });
  }

  if (signupBtn) {
    signupBtn.addEventListener("click", function (event) {
      event.preventDefault();
      signup();
    });
  }
}

/**
 * Async function to sign up new users, calls end point and backend
 */

async function signup() {
  // Email and password from frontend
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Calling end point
  const response = await fetch("http://127.0.0.1:5000/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    mode: "cors",
    body: JSON.stringify({
      firstName,
      lastName,
      email,
      password,
    }),
  });

  const res = await response.json();

  if (res.redirect) {
    console.log("Sucess" + res.redirect);
    window.location.href = res.redirect;
  } else {
    alert("signup unsucessful...");
  }
}

/**
 * Async function to login
 */

async function login() {
  console.log("log in function");
  // Email and password from frontend
  const email = document.getElementById("signin_email").value;
  const password = document.getElementById("signin_password").value;
  const loginError = document.getElementById("loginError");

  // calling end point
  const response = await fetch("http://127.0.0.1:5000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    mode: "cors",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const res = await response.json();
  console.log(res);

  if (res.redirect) {
    window.location.href = res.redirect;
  } else {
    loginError.textContent = "Invalid Password or email";
  }
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
  var signupBtn = document.getElementById("signupBtn");

  if (fullName.value && email.value) {
    signupBtn.disabled = false;
  } else {
    signupBtn.disabled = true;
  }
}
