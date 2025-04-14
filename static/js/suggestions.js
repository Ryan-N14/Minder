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

// Fetch 10 random movies from Flask backends
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

/*
async function getSupabaseConfig() {
  try {
    const response = await fetch("http://127.0.0.1:5000/auth/get-config");
    const data = await response.json();
    return data.supabase_url;
  } catch (error) {
    console.error("Error fetching Supabase config:", error);
  }
}

// Initialize Supabase in the frontend
async function initializeSupabase() {
  const supabaseUrl = await getSupabaseConfig();

  console.log("supabse_url: " + supabaseUrl);
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvbXBzcmVndGhqbHpzamp2c2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyNDIyMDIsImV4cCI6MjA1NTgxODIwMn0.Z6oY7FQUgfyRzqY7o3p4NQEEOZWLYFoA2vybucfaws0"; // Store securely, or get from backend (if needed)

  if (!supabaseUrl) {
    console.error("Supabase URL not found");
    return;
  }

  supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
  console.log("Supabase initialized:", supabase);

  // Example: Get logged-in user
  const user = await supabase.auth.getUser();
  console.log("Current User:", user);
}

async function savePreference(liked) {
  console.log(`User selected: ${liked ? "Yes" : "No"}`); // changed this to update supabase

  const { data: session, error } = await supabase.auth.getSession();

  if (error || !session || !session.user) {
    console.error("User not authenticated.");
    return;
  }

  const user_id = session.user.id;
  const movie = movies[currentMovieIndex];
  const movie_id = movie.id;

  console.log("User ID: " + user_id);

  currentMovieIndex++;
  showMovie(); // Move to the next movie
}*/
