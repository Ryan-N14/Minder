/* ----------------- navbar -------------------- */
let sidebar = document.querySelector(".sidebar");
let closeBtn = document.querySelector("#btn");
let searchBtn = document.querySelector(".bx-search");
closeBtn.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  menuBtnChange(); //calling the function(optional)
});
searchBtn.addEventListener("click", () => {
  // Sidebar open when you click on the search iocn
  sidebar.classList.toggle("open");
  menuBtnChange(); //calling the function(optional)
});
// following are the code to change sidebar button(optional)
function menuBtnChange() {
  if (sidebar.classList.contains("open")) {
    closeBtn.classList.replace("bx-menu", "bx-menu-alt-right"); //replacing the iocns class
  } else {
    closeBtn.classList.replace("bx-menu-alt-right", "bx-menu"); //replacing the iocns class
  }
}

// Profile view/edit mode handling
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Content Loaded");
  const editBtn = document.getElementById("editBtn");
  const discardBtn = document.getElementById("discardBtn");
  const saveBtn = document.getElementById("saveBtn");
  const profileContainer = document.querySelector(".profile-container");

  console.log("Edit button:", editBtn);
  console.log("Profile container:", profileContainer);

  // Load user data
  loadUserData();

  // Edit button click handler
  editBtn.addEventListener("click", () => {
    console.log("Edit button clicked");
    profileContainer.classList.add("edit-state");
    console.log("Profile container classes:", profileContainer.classList);
    // Store current values in case of discard
    storeCurrentValues();
    // Populate input fields with current values
    document.getElementById("firstName-input").value =
      document.getElementById("firstName-view").textContent;
    document.getElementById("lastName-input").value =
      document.getElementById("lastName-view").textContent;
    document.getElementById("email-input").value =
      document.getElementById("email-view").textContent;
  });

  // Discard button click handler
  discardBtn.addEventListener("click", () => {
    profileContainer.classList.remove("edit-state");
    // Restore original values
    restoreOriginalValues();
  });

  // Save button click handler
  saveBtn.addEventListener("click", async () => {
    try {
      const updatedData = {
        firstName: document.getElementById("firstName-input").value,
        lastName: document.getElementById("lastName-input").value,
        email: document.getElementById("email-input").value,
        password: document.getElementById("password-input").value,
      };

      // Call API to update user data
      const response = await fetch("/api/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        // Update view mode with new values
        updateViewMode(updatedData);
        profileContainer.classList.remove("edit-state");
        alert("Profile updated successfully!");
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  });
});

// Store current values before editing
function storeCurrentValues() {
  const originalValues = {
    firstName: document.getElementById("firstName-view").textContent,
    lastName: document.getElementById("lastName-view").textContent,
    email: document.getElementById("email-view").textContent,
  };
  sessionStorage.setItem("originalValues", JSON.stringify(originalValues));
}

// Restore original values when discarding changes
function restoreOriginalValues() {
  const originalValues = JSON.parse(sessionStorage.getItem("originalValues"));
  if (originalValues) {
    document.getElementById("firstName-input").value = originalValues.firstName;
    document.getElementById("lastName-input").value = originalValues.lastName;
    document.getElementById("email-input").value = originalValues.email;
    document.getElementById("password-input").value = "";
  }
}

// Update view mode with new values
function updateViewMode(data) {
  document.getElementById("firstName-view").textContent = data.firstName;
  document.getElementById("lastName-view").textContent = data.lastName;
  document.getElementById("email-view").textContent = data.email;
}

// Load user data from API
async function loadUserData() {
  try {
    // For now, use placeholder data
    const userData = {
      firstName: "Ryan",
      lastName: "Nguyen",
      email: "ryan.nguyen@example.com",
    };

    // Update the view with the placeholder data
    document.getElementById("firstName-view").textContent = userData.firstName;
    document.getElementById("lastName-view").textContent = userData.lastName;
    document.getElementById("email-view").textContent = userData.email;

    // Store the data for later use
    sessionStorage.setItem("userData", JSON.stringify(userData));
  } catch (error) {
    console.error("Error loading user data:", error);
    alert("Failed to load user data. Please try again.");
  }
}
