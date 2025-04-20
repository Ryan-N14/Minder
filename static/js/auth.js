window.addEventListener("DOMContentLoaded", main);

function main() {
  const loginBtn = document.getElementById("loginbtn");
  const signupBtn = document.getElementById("signupBtn");
  document.getElementById("email").addEventListener("input", checkForm);

  checkPassword();

  if (loginBtn) {
    loginBtn.addEventListener("click", function (event) {
      event.preventDefault();
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
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Calling end point
  const response = await fetch("http://127.0.0.1:5000/auth/signup", {
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
  // Email and password from frontend
  const email = document.getElementById("signin_email").value;
  const password = document.getElementById("signin_password").value;

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

  // this section still needs to be coded but will do that later after finishing up the sign up portion
  const res = await response.json();
  console.log(res);

  if (res.redirect) {
    window.location.href = res.redirect;
  } else {
    alert("check login credentials");
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

/*
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
}*/
