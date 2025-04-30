const moviePoster = document.getElementById("movie-poster");
const movieTitle = document.getElementById("movie-title");
const movieGenre = document.getElementById("movie-genre");
const movieYear = document.getElementById("movie-year");
const movieRating = document.getElementById("movie-rating");
const yesBtn = document.getElementById("yes-btn");
const noBtn = document.getElementById("no-btn");

let movies = [];
let currentMovieIndex = 0;
let feedback = [];

window.addEventListener("DOMContentLoaded", async () => {
  await main();
});

async function main() {
  console.log("Suggestion js");
  fetchMovies();
}

// Fetch random movies from Flask backends
async function fetchMovies() {
  try {
    const response = await fetch("http://127.0.0.1:5000/get_movies", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "cors",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    movies = await response.json(); // populating movies

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
    console.log("DOne"); // Redirect after finishing
    return;
  }

  const movie = movies[currentMovieIndex];
  movieTitle.textContent = movie.title;
  movieGenre.textContent = `Genres: ${movie.genres.join(", ")}`;
  movieYear.textContent = `Year: ${movie.year}`;
  movieRating.innerHTML = `<i class="fa-solid fa-star" style="color: #FFD43B;"></i>${movie.rating}/10`;
} // end of showMovie function

function savePreference(like) {
  if (currentMovieIndex >= movies.length) {
    console.warn("No more movies to rate.");
    return;
  }

  const movie = movies[currentMovieIndex]; //grabbing the current movie

  console.log("Save pref " + movie.id);

  //collecting user feedback
  feedback.push({
    movie_id: movie.id,
    liked: like,
  });

  currentMovieIndex++;

  if (currentMovieIndex < movies.length) {
    showMovie();
  } else {
    saveFeedback();
  }
}

yesBtn.addEventListener("click", () => {
  savePreference(true);
});

noBtn.addEventListener("click", () => {
  savePreference(false);
});

async function saveFeedback() {
  try {
    const response = await fetch("http://127.0.0.1:5000/auth/savefeedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "cors",
      credentials: "include",
      body: JSON.stringify({ feedback }),
    });

    console.log(JSON.stringify({ feedback }));

    const res = await response.json();

    if (res.redirect) {
      window.location.href = res.redirect;
    }

    console.log(res);
  } catch (error) {
    console.error(error);
  }
}
