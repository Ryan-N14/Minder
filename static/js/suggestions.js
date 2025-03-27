const moviePoster = document.getElementById("movie-poster");
const movieTitle = document.getElementById("movie-title");
const movieGenre = document.getElementById("movie-genre");
const movieYear = document.getElementById("movie-year");
const movieRating = document.getElementById("movie-rating");
const yesBtn = document.getElementById("yes-btn");
const noBtn = document.getElementById("no-btn");

let movies = [];
let currentMovieIndex = 0;

window.addEventListener("DOMContentLoaded", () => {
  main();
});

function main() {
  console.log("Suggestion js");
  fetchMovies();
}

// Fetch 10 random movies from Flask backend
async function fetchMovies() {
  try {
    const response = await fetch("http://127.0.0.1:5000/get_movies", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "cors", // This explicitly sets CORS mode
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    movies = await response.json();

    if (movies.length > 0) {
      console.log("Current movies");
      showMovie();
    } else {
      alert("No movies found.");
    }
  } catch (error) {
    console.error("Error fetching movies:", error);
  }
}

// Display current movie
function showMovie() {
  if (currentMovieIndex >= movies.length) {
    alert("You've rated all available movies!");
    window.location.href = "/home.html"; // Redirect after finishing
    return;
  }

  const movie = movies[currentMovieIndex];
  movieTitle.textContent = movie.title;
  movieGenre.textContent = `Genres: ${movie.genres.join(", ")}`;
  movieYear.textContent = `Year: ${movie.year}`;
  movieRating.innerHTML = `<i class="fa-solid fa-star" style="color: #FFD43B;"></i>${movie.rating}/10`;
} // end of showMovie function

yesBtn.addEventListener("click", () => {
  savePreference(true);
});

noBtn.addEventListener("click", () => {
  savePreference(false);
});

function savePreference(liked) {
  console.log(`User selected: ${liked ? "Yes" : "No"}`); // changed this to update supabase

  currentMovieIndex++;
  showMovie(); // Move to the next movie
}
