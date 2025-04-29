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
  } catch (error) {
    console.error("Error fetching movies", error);
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

    movieCard.appendChild(movieDetails); // Put movie-details inside movie-cards
    container.appendChild(movieCard); // Add the whole movie-card into the container
  });
}

/* ------------------------ Navbar functions ----------------------------------- */

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
