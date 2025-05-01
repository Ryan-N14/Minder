// Function to fetch user profile data
async function fetchUserProfile() {
    try {
        const response = await fetch("http://127.0.0.1:5000/get_profile", {
            credentials: "include"
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

// Function to update sidebar name
async function updateSidebarName() {
    const sidebarName = document.getElementById("sidebar-name");
    if (!sidebarName) return;

    const profileData = await fetchUserProfile();
    if (profileData) {
        const fullName = `${profileData.first_name || ""} ${profileData.last_name || ""}`.trim();
        sidebarName.textContent = fullName || "Loading...";
    }
}

// Call updateSidebarName when the DOM is loaded
document.addEventListener("DOMContentLoaded", updateSidebarName); 