// --- WATCHLIST (MEMBER 5) ---
function openMovieById(id) {
    const movie = allMovies.find(m => m.id === id);
    if (movie) openMovieDetails(movie);
}

async function loadWatchlist() {
    if (!currentUser) return;
    const res = await fetch(`${API_URL}/watchlist?userId=${currentUser.id}`);
    if (res.ok) {
        const watchlistItems = await res.json();
        const grid = document.getElementById("watchlistGrid");
        grid.innerHTML = "";
        
        for (let item of watchlistItems) {
            const movie = allMovies.find(m => m.id === item.movieId);
            if (movie) {
                grid.innerHTML += `
                    <div class="movie-card">
                        <img src="${movie.imageUrl}" onclick="openMovieById(${movie.id})" style="cursor: pointer;">
                        <div style="padding: 10px;">
                            <h4 style="margin: 0 0 10px 0; cursor: pointer; color: #e50914;" onclick="openMovieById(${movie.id})">${movie.title}</h4>
                            <button onclick="removeFromWatchlist(${item.id})" class="rent-btn" style="width:100%; background:red;">Remove</button>
                        </div>
                    </div>
                `;
            }
        }
    }
    navigateTo('watchlist');
}

async function checkWatchlistStatus(movieId) {
    const btn = document.getElementById("watchlistBtn");
    btn.innerText = "Add to Watchlist";
    btn.disabled = false;
    btn.style.opacity = "1";
    btn.style.background = "#f5b50a";
    btn.style.color = "black";
    btn.onclick = addToWatchlist;
    
    if (!currentUser) return;
    
    const res = await fetch(`${API_URL}/watchlist?userId=${currentUser.id}`);
    if (res.ok) {
        const watchlistItems = await res.json();
        const watchItem = watchlistItems.find(item => item.movieId === movieId);
        if (watchItem) {
            btn.innerText = "Remove from Watchlist";
            btn.style.background = "#e50914";
            btn.style.color = "white";
            btn.onclick = () => removeMovieFromDetails(watchItem.id);
        }
    }
}

async function removeMovieFromDetails(id) {
    const res = await fetch(`${API_URL}/watchlist?id=${id}`, {
        method: 'DELETE'
    });
    if (res.ok) {
        alert("Removed from watchlist!");
        checkWatchlistStatus(currentMovie.id);
    } else {
        alert("Failed to remove from watchlist.");
    }
}

async function addToWatchlist() {
    if (!currentUser) {
        alert("Please login first.");
        return;
    }
    if (!currentMovie) return;
    
    const res = await fetch(`${API_URL}/watchlist`, {
        method: 'POST',
        body: JSON.stringify({ userId: currentUser.id, movieId: currentMovie.id })
    });
    if (res.ok) {
        alert("Added to watchlist!");
        checkWatchlistStatus(currentMovie.id);
    } else {
        alert("Failed to add to watchlist. It may already be in your watchlist.");
    }
}

async function removeFromWatchlist(id) {
    const res = await fetch(`${API_URL}/watchlist?id=${id}`, {
        method: 'DELETE'
    });
    if (res.ok) {
        loadWatchlist();
    } else {
        alert("Failed to remove from watchlist.");
    }
}
