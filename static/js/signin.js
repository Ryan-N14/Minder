window.addEventListener("DOMContentLoaded", main());

function main() {
  document
    .getElementById("signin_form")
    .addEventListener("submit", function (event) {
      event.preventDefault(); // ✅ Prevents form from redirecting
      signIn(); // ✅ Calls the signin function
    });
}

async function signIn() {
  console.log("Inside of sign in function");
  // grabs the email and password from HTML
  const email = document.getElementById("signin_email").value;
  const password = document.getElementById("signin_password").value;

  // calling end point to communicate with backend (POST)
  const response = await fetch("http://127.0.0.1:5000/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }); // end of call

  const data = response.json();

  // Checking if sign in is successful
  if (response.ok) {
    alert("Successful Sign in");
  } else {
    alert("Failed to Sign in");
  }
}
