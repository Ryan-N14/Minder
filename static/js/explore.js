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
const moviePoster = document.getElementById("exploreMovieImg");
const yesBtn = document.getElementById("yes-btn");
const noBtn = document.getElementById("no-btn");
const saveBtn = document.getElementById("save-btn");
let loggingOutBtn = document.getElementById("log_out");
loggingOutBtn.addEventListener("click", loggingOut);

let movies = [];
let currentMovieIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
  fetchMovies();
});

// Async function to fetchMovies from backend
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
  const exploreContainer = document.getElementById("explore-container");
  const loadingMessage = document.getElementById("loadingMessage");

  loadingMessage.style.display = "none";
  exploreContainer.style.display = "flex"; // Set it back to flex

  movieTitle.textContent = movie.title || "Unknown Title";
  moviePoster.src = movie.poster_url;
  moviePoster.onerror = function () {
    this.onerror = null;
    this.src = "/static/images/No_Image_Available.jpg";
  };
  movieGenre.textContent = `Genres: ${
    movie.genres ? movie.genres.join(", ") : "Unknown"
  }`;
  movieYear.textContent = `${movie.year || "Unknown"}`;
  movieRating.innerHTML = `<i class='bx bxs-star'></i>${
    movie.rating || "N/A"
  }/10`;
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

// Save movie to watch list
async function saveMovie() {
  const movie = movies[currentMovieIndex];

  try {
    const response = await fetch("http://127.0.0.1:5000/save_movie", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        movie_id: movie.id,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const res = await response.json();

    if (res.message) {
      alert("Success, Movie has been saved!");
    } else {
      alert("Movie has failed to saved :(");
    }
  } catch (error) {
    console.error("error saving movie", error);
  }
}

// Button event listeners
yesBtn.addEventListener("click", () => {
  savePreference(true);
});

noBtn.addEventListener("click", () => {
  savePreference(false);
});

saveBtn.addEventListener("click", () => {
  saveMovie();
});

//navbar
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

async function loggingOut() {
  try {
    const res = await fetch("http://127.0.0.1:5000/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    if (res.ok) {
      window.location.href = "/templates/index.html"; //redirects to login screen
    } else {
      alert("Logout failed.");
    }
  } catch (err) {
    console.error("Logout error:", err);
  }
}
