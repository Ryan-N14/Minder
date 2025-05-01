/* ----------------- navbar -------------------- */
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

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");
  const loadingMessage = document.getElementById("loadingMessage");
  const movieModal = document.getElementById("movieModal");
  const modalClose = document.getElementById("modalClose");
  const saveMovieBtn = document.getElementById("saveMovieBtn");
  let loggingOutBtn = document.getElementById("log_out");
  loggingOutBtn.addEventListener("click", loggingOut);

  let currentMovie = null;
  let debounceTimer;

  // Search input handler with debouncing
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim();

    // Clear previous timer
    clearTimeout(debounceTimer);

    // Show loading message
    loadingMessage.style.display = "flex";
    searchResults.innerHTML = "";

    // Set new timer
    debounceTimer = setTimeout(() => {
      if (query.length >= 2) {
        searchMovies(query);
      } else {
        loadingMessage.style.display = "none";
        searchResults.innerHTML = "";
      }
    }, 300);
  });

  // Search movies function
  async function searchMovies(query) {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/search_movies?query=${encodeURIComponent(
          query
        )}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      displayResults(data.movies);
    } catch (error) {
      console.error("Search error:", error);
      searchResults.innerHTML =
        '<div class="search-page-no-results">Error searching movies. Please try again.</div>';
    } finally {
      loadingMessage.style.display = "none";
    }
  }

  // Display search results
  function displayResults(movies) {
    searchResults.innerHTML = "";

    if (movies.length === 0) {
      searchResults.innerHTML =
        '<div class="search-page-no-results">No movies found. Try a different search term.</div>';
      return;
    }

    searchResults.innerHTML = movies
      .map(
        (movie) => `
      <div class="search-page-movie-card" data-movie-id="${movie.movie_id}">
        <img src="${movie.poster_url}" 
             alt="${movie.title}" 
             class="search-page-movie-poster"
             onerror="this.onerror=null; this.src='/static/images/No_Image_Available.jpg'">
        <div class="search-page-movie-info">
          <div class="search-page-movie-title">${movie.title}</div>
          <div class="search-page-movie-details">
            ${movie.year} • ${movie.genres.join(", ")}<br>
            Rating: ${movie.rating}
          </div>
        </div>
      </div>
    `
      )
      .join("");

    // Add click handlers to movie cards
    document.querySelectorAll(".search-page-movie-card").forEach((card) => {
      card.addEventListener("click", () => {
        const movieId = card.dataset.movieId;
        const movie = movies.find((m) => m.movie_id === movieId);
        if (movie) {
          showMovieModal(movie);
        }
      });
    });
  }

  // Show movie modal
  function showMovieModal(movie) {
    currentMovie = movie;
    const modalPoster = document.getElementById("modalPoster");
    modalPoster.src = movie.poster_url;
    modalPoster.onerror = function () {
      this.onerror = null;
      this.src = "/static/images/No_Image_Available.jpg";
    };
    document.getElementById("modalTitle").textContent = movie.title;
    document.getElementById(
      "modalGenres"
    ).textContent = `Genres: ${movie.genres.join(", ")}`;
    document.getElementById("modalYear").textContent = `Year: ${movie.year}`;
    document.getElementById(
      "modalRating"
    ).textContent = `Rating: ${movie.rating}`;

    // Check if movie is already saved
    fetch(
      `http://127.0.0.1:5000/check_saved_movie?movie_id=${movie.movie_id}`,
      {
        credentials: "include",
      }
    )
      .then((response) => response.json())
      .then((data) => {
        saveMovieBtn.disabled = data.is_saved;
        saveMovieBtn.innerHTML = data.is_saved
          ? '<i class="bx bx-check"></i>Already Saved'
          : '<i class="bx bx-heart"></i>Save Movie';
      });

    movieModal.style.display = "block";
  }

  // Close modal
  modalClose.addEventListener("click", () => {
    movieModal.style.display = "none";
  });

  // Save movie
  saveMovieBtn.addEventListener("click", async () => {
    if (!currentMovie) return;

    try {
      const response = await fetch("http://127.0.0.1:5000/save_movie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          movie_id: currentMovie.movie_id,
          title: currentMovie.title,
          poster: currentMovie.poster_url,
          genres: currentMovie.genres,
          year: currentMovie.year,
          rating: currentMovie.rating,
        }),
      });

      if (response.ok) {
        saveMovieBtn.disabled = true;
        saveMovieBtn.innerHTML = '<i class="bx bx-check"></i>Saved';
      } else {
        throw new Error("Failed to save movie");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save movie. Please try again.");
    }
  });

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === movieModal) {
      movieModal.style.display = "none";
    }
  });
});

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
