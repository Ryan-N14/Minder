document.addEventListener('DOMContentLoaded', async () => {
    const suggestedMovies = document.getElementById('suggestedMovies');
    let myList = JSON.parse(localStorage.getItem('myMovieList')) || [];

    // Fetch suggested movies from backend (placeholder)
    try {
        const response = await fetch('http://your-backend-api/suggested');
        const movies = await response.json();

        movies.forEach(movie => {
            const item = document.createElement('div');
            item.className = 'movie-item';
            const title = document.createElement('span');
            title.textContent = movie;
            const addBtn = document.createElement('button');
            addBtn.className = 'add-btn';
            addBtn.textContent = '+';
            addBtn.addEventListener('click', () => {
                if (!myList.includes(movie)) {
                    myList.push(movie);
                    localStorage.setItem('myMovieList', JSON.stringify(myList));
                    alert(`${movie} added to your list!`);
                } else {
                    alert(`${movie} is already in your list!`);
                }
            });
            item.appendChild(title);
            item.appendChild(addBtn);
            suggestedMovies.appendChild(item);
        });
    } catch (error) {
        console.error('Error fetching suggested movies:', error);
        suggestedMovies.innerHTML = '<p>Error loading suggestions.</p>';
    }
});