console.log("✅ profile.js is loaded");

// Function to fetch user profile data
async function fetchUserProfile() {
  try {
    const response = await fetch("http://127.0.0.1:5000/get_profile", {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch profile");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

// Function to update user profile
async function updateUserProfile(firstName, lastName) {
  try {
    const response = await fetch("http://127.0.0.1:5000/update_profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        firstName,
        lastName,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update profile");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating profile:", error);
    return null;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ DOM fully loaded");

  const profileContainer = document.querySelector(".profile-container");
  const editBtn = document.getElementById("editBtn");
  const saveBtn = document.getElementById("saveBtn");
  const discardBtn = document.getElementById("discardBtn");

  const firstNameView = document.getElementById("firstName-view");
  const lastNameView = document.getElementById("lastName-view");
  const emailView = document.getElementById("email-view");
  const sidebarName = document.getElementById("sidebar-name");

  const firstNameInput = document.getElementById("firstName-input");
  const lastNameInput = document.getElementById("lastName-input");
  const emailInput = document.getElementById("email-input");
  const passwordInput = document.getElementById("password-input");
  let loggingOutBtn = document.getElementById("log_out");
  loggingOutBtn.addEventListener("click", loggingOut);

  // Load user data when page loads
  async function loadUserData() {
    const profileData = await fetchUserProfile();
    if (profileData) {
      firstNameView.textContent = profileData.first_name || "";
      lastNameView.textContent = profileData.last_name || "";
      emailView.textContent = profileData.email || "";
    }
  }

  // Call loadUserData when page loads
  loadUserData();

  editBtn.addEventListener("click", () => {
    console.log("Edit button clicked");
    profileContainer.classList.add("edit-state");

    firstNameInput.value = firstNameView.textContent.trim();
    lastNameInput.value = lastNameView.textContent.trim();
    emailInput.value = emailView.textContent.trim();
    passwordInput.value = "";
  });

  discardBtn.addEventListener("click", () => {
    profileContainer.classList.remove("edit-state");
    firstNameInput.value = "";
    lastNameInput.value = "";
    emailInput.value = "";
    passwordInput.value = "";
  });

  saveBtn.addEventListener("click", async () => {
    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();

    if (!firstName || !lastName) {
      alert("First name and last name are required");
      return;
    }

    const result = await updateUserProfile(firstName, lastName);
    if (result) {
      firstNameView.textContent = firstName;
      lastNameView.textContent = lastName;
      profileContainer.classList.remove("edit-state");
      // Update sidebar name using the common function
      updateSidebarName();
    } else {
      alert("Failed to update profile");
    }
  });
});

async function loggingOut() {
  try {
    const res = await fetch("http://127.0.0.1:5000/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    if (res.ok) {
      window.location.href = "/templates/index.html"; //redirects to login screen
    } else {
      alert("Logout failed.");
    }
  } catch (err) {
    console.error("Logout error:", err);
  }
}

// Sidebar functionality
let sidebar = document.querySelector(".sidebar");
let closeBtn = document.querySelector("#btn");
let searchBtn = document.querySelector(".bx-search");

closeBtn.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  menuBtnChange();
});

searchBtn.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  menuBtnChange();
});

function menuBtnChange() {
  if (sidebar.classList.contains("open")) {
    closeBtn.classList.replace("bx-menu", "bx-menu-alt-right");
  } else {
    closeBtn.classList.replace("bx-menu-alt-right", "bx-menu");
  }
}
