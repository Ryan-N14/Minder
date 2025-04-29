/**
 * mylist.js
 *
 * purpose: load the saved movies and allow user to delete movie
 */

document.addEventListener("DOMContentLoaded", () => {
  fetchSavedMovies();
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
