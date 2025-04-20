document.addEventListener('DOMContentLoaded', () => {
    const userNameSpan = document.getElementById('userName');
    const favoriteGenreSpan = document.getElementById('favoriteGenre');
    const editProfileBtn = document.getElementById('editProfile');
    const editForm = document.getElementById('editForm');
    const nameInput = document.getElementById('nameInput');
    const genreInput = document.getElementById('genreInput');
    const saveProfileBtn = document.getElementById('saveProfile');
    const cancelEditBtn = document.getElementById('cancelEdit');

    // Load profile from localStorage or set defaults
    let profile = JSON.parse(localStorage.getItem('userProfile')) || {
        name: 'Guest',
        favoriteGenre: 'Not set'
    };

    // Display initial profile info
    userNameSpan.textContent = profile.name;
    favoriteGenreSpan.textContent = profile.favoriteGenre;

    // Show edit form when "Edit Profile" is clicked
    editProfileBtn.addEventListener('click', () => {
        nameInput.value = profile.name === 'Guest' ? '' : profile.name;
        genreInput.value = profile.favoriteGenre === 'Not set' ? '' : profile.favoriteGenre;
        editForm.classList.remove('hidden');
        editProfileBtn.classList.add('hidden');
    });

    // Save profile changes
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        profile.name = nameInput.value.trim() || 'Guest';
        profile.favoriteGenre = genreInput.value.trim() || 'Not set';
        localStorage.setItem('userProfile', JSON.stringify(profile));
        userNameSpan.textContent = profile.name;
        favoriteGenreSpan.textContent = profile.favoriteGenre;
        editForm.classList.add('hidden');
        editProfileBtn.classList.remove('hidden');
    });

    // Cancel editing
    cancelEditBtn.addEventListener('click', () => {
        editForm.classList.add('hidden');
        editProfileBtn.classList.remove('hidden');
    });
});