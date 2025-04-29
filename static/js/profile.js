document.addEventListener("DOMContentLoaded", () => {
  const editButton = document.querySelector(".profile-edit");
  const emailInfo = document.getElementById("email-info");
  const passwordInfo = document.getElementById("password-info");

  let isEditing = false;

  editButton.addEventListener("click", () => {
    if (!isEditing) {
      enableEditMode();
    } else {
      saveProfileChanges();
    }
  });

  function enableEditMode() {
    isEditing = true;
    editButton.textContent = "Save";

    const currentEmail = emailInfo.textContent;
    const currentPassword = passwordInfo.textContent;

    emailInfo.innerHTML = `<input type="email" id="edit-email" value="${currentEmail}" required>`;
    passwordInfo.innerHTML = `<input type="password" id="edit-password" value="${currentPassword}" required>`;
  }

  async function saveProfileChanges() {
    const newEmail = document.getElementById("edit-email").value;
    const newPassword = document.getElementById("edit-password").value;

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/auth/update_profile",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: newEmail,
            password: newPassword,
          }),
        }
      );

      const res = await response.json();
      console.log(res);

      if (res.success) {
        // Update frontend with new data
        emailInfo.innerHTML = newEmail;
        passwordInfo.innerHTML = "********"; // Always hide real password

        editButton.textContent = "Edit";
        isEditing = false;
      } else {
        alert(res.error || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Network error. Please try again.");
    }
  }
});
