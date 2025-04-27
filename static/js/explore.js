/**
 *  Explore.js
 *
 *  Purpose: This file is for the explore.html, it allows to iterate through movies and gather user inputs as they continue to iterate through the list
 */

// Getting all of the elements from our DOM to manipulate
const movieTitle = document.getElementById("movie-title");
const movieGenre = document.getElementById("movie-genre");
const movieYear = document.getElementById("movie-year");
const movieRating = document.getElementById("movie-rating");
const yesBtn = document.getElementById("yes-btn");
const noBtn = document.getElementById("no-btn");

let movies = [];
let currentMovieIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
  fetchMovies();
});

async function fetchMovies() {
  console.log("Grabbing explore page fetching movies");
  try {
    const response = await fetch("http://127.0.0.1:5000/get_movies", {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log("before movie grab");
    movies = await response.json();
    console.log("Movies request granted");
    currentMovieIndex = 0;

    console.log(movies);

    if (movies.length > 0) {
      showMovie();
    } else {
      alert("No movies available right now. Try again later!");
    }
  } catch (error) {
    console.error("Error fetching movies", error);
  }
}

// Display the current movie
function showMovie() {
  if (currentMovieIndex >= movies.length) {
    console.log("All movies swiped. Fetching new batch...");
    fetchMovies();
    return;
  }

  const movie = movies[currentMovieIndex];

  console.log("showMovie before exploreContainer");
  const exploreContainer = document.getElementById("exploreContainer");
  const loadingMessage = document.getElementById("loadingMessage");

  loadingMessage.style.display = "none";
  exploreContainer.style.display = "flex"; // Set it back to flex

  movieTitle.textContent = movie.title || "Unknown Title";
  movieGenre.textContent = `Genres: ${
    movie.genres ? movie.genres.join(", ") : "Unknown"
  }`;
  movieYear.textContent = `Year: ${movie.year || "Unknown"}`;
  movieRating.innerHTML = `<b>Rating:</b> ${movie.rating || "N/A"}/10`;
}

// Save the user's like or dislike to backend
async function savePreference(liked) {
  const movie = movies[currentMovieIndex];

  try {
    movieTitle.textContent = "Saving...";
    movieGenre.textContent = "";
    movieYear.textContent = "";
    movieRating.innerHTML = "";

    await fetch("http://127.0.0.1:5000/feedback", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        movie_id: movie.id,
        liked: liked,
      }),
    });

    console.log(`Feedback saved for: ${movie.title}, Liked: ${liked}`);
  } catch (error) {
    console.error("Error sending feedback:", error);
  }

  currentMovieIndex++;

  setTimeout(() => {
    showMovie();
  }, 500);
}

// Button event listeners
yesBtn.addEventListener("click", () => {
  savePreference(true);
});

noBtn.addEventListener("click", () => {
  savePreference(false);
});
