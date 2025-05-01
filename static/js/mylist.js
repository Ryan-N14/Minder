/**
 * mylist.js
 *
 * purpose: load the saved movies and allow user to delete movie
 */

document.addEventListener("DOMContentLoaded", () => {
  fetchSavedMovies();

  // Search listener
  const searchInput = document.getElementById("movieSearchInput");
  searchInput.addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase();
    const movieCards = document.querySelectorAll(".movie-details");

    movieCards.forEach((card) => {
      const title = card.querySelector("p").textContent.toLowerCase();
      if (title.includes(searchTerm)) {
        card.parentElement.style.display = "block";
      } else {
        card.parentElement.style.display = "none";
      }
    });
  });
});

async function fetchSavedMovies() {
  try {
    const response = await fetch("http://127.0.0.1:5000/fetch_movies", {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    const movies = await response.json();

    displaySavedMovies(movies);
    // Make sure to show the container after loading
    document.getElementById("savedMoviesContainer").style.display = "flex";
    document.getElementById("loadingMessage").style.display = "none";
  } catch (error) {
    console.error("Error fetching movies", error);
    document.getElementById("loadingMessage").style.display = "none";
    document.getElementById("savedMoviesContainer").style.display = "flex";
    document.getElementById("savedMoviesContainer").innerHTML =
      "<p>Error loading movies. Please try again.</p>";
  }
}

function displaySavedMovies(movies) {
  const container = document.getElementById("savedMoviesContainer");
  container.innerHTML = ""; // Clear loading text

  if (movies.length === 0) {
    container.innerHTML = "<p>No saved movies yet.</p>";
    return;
  }

  movies.forEach((movie) => {
    // Create one .movie-cards for each movie
    const movieCard = document.createElement("div");
    movieCard.className = "movie-cards";

    const movieDetails = document.createElement("div");
    movieDetails.className = "movie-details";

    movieDetails.innerHTML = `
      <img src="${movie.poster_url}" alt="Poster of ${movie.title}" class="movie-poster">
      <p>${movie.title}</p>
    `;

    // Add click event to show modal
    movieCard.addEventListener("click", () => showMovieModal(movie));

    movieCard.appendChild(movieDetails); // Put movie-details inside movie-cards
    container.appendChild(movieCard); // Add the whole movie-card into the container
  });
}

let loggingOutBtn = document.getElementById("log_out");
loggingOutBtn.addEventListener("click", loggingOut);

async function loggingOut() {
  try {
    const res = await fetch("http://127.0.0.1:5000/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    if (res.ok) {
      window.location.href = "/templates/index.html"; //redriects to login screen
    } else {
      alert("Logout failed.");
    }
  } catch (err) {
    console.error("Logout error:", err);
  }
}

// Function to show movie modal
function showMovieModal(movie) {
  const modal = document.getElementById("movieModal");
  const modalPoster = document.getElementById("modalPoster");
  const modalTitle = document.getElementById("modalTitle");
  const modalGenres = document.getElementById("modalGenres");
  const modalYear = document.getElementById("modalYear");
  const modalRating = document.getElementById("modalRating");
  const deleteBtn = document.getElementById("deleteMovieBtn");

  // Set modal content
  modalPoster.src = movie.poster_url;
  modalTitle.textContent = movie.title;
  modalGenres.textContent = `${movie.genres}`;
  modalYear.textContent = `${movie.year}`;
  modalRating.innerHTML = `<i class='bx bxs-star'></i>${
    movie.rating || "N/A"
  }/10`;

  // Show modal
  modal.style.display = "block";

  // Close modal when clicking the X
  document.getElementById("modalClose").onclick = function () {
    modal.style.display = "none";
  };

  // Close modal when clicking outside
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  // Handle delete button click
  deleteBtn.onclick = async function () {
    const movieId = movie.id;
    console.log("Attempting to delete movie with ID:", movieId);

    try {
      const response = await fetch("http://127.0.0.1:5000/delete_movie", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ movie_id: movie.id }),
        mode: "cors",
      });

      if (response.ok) {
        modal.style.display = "none";
        // Show loading message before refreshing
        document.getElementById("loadingMessage").style.display = "flex";
        document.getElementById("savedMoviesContainer").style.display = "none";
        fetchSavedMovies(); // Refresh the list
      } else {
        const errorData = await response.json();
        console.error("Failed to delete movie:", errorData.error);
        alert("Failed to delete movie. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting movie:", error);
      alert("An error occurred while deleting the movie. Please try again.");
    }
  };
}

/* ------------------------ Navbar functions ----------------------------------- */
let logoutBtn = document.getElementById("log_out");
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
