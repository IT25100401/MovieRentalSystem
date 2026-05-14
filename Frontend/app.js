// --- MEMBER 2: Movie Catalog Management ---
// --- MOVIES ---
async function loadMovies() {
    const res = await fetch(`${API_URL}/movies`);
    allMovies = await res.json();
    renderMovies('home');
    renderMovies('movies');
}

function handleSearch(page) {
    const query = document.getElementById(`${page}Search`).value.toLowerCase();
    const filtered = allMovies.filter(m => m.title.toLowerCase().includes(query) || m.genre.toLowerCase().includes(query));
    renderMovies(page, filtered);
}

function renderMovies(page, customList = null) {
    let moviesToRender = customList || allMovies;
    const container = page === 'home' ? document.getElementById("trendingMoviesRow") : document.getElementById("allMoviesGrid");
    if (!container) return;
    
    // If we are rendering the home page and not actively searching, show Trending
    const searchInput = document.getElementById(`${page}Search`);
    if (page === 'home' && (!searchInput || !searchInput.value)) {
        moviesToRender = allMovies.filter(m => trendingMovieIds.includes(m.id));
        if (moviesToRender.length === 0) {
            moviesToRender = allMovies.filter(m => m.available).slice(0, 5); // Fallback
        }
    }

    container.innerHTML = "";
    moviesToRender.forEach(m => {
        const div = document.createElement("div");
        div.className = "movie-card";
        div.style.backgroundImage = `url('${m.imageUrl || 'https://via.placeholder.com/200x300'}')`;
        //Polymorphism icon display simulation
        let icon = m.genre.toLowerCase().includes('action') ? '💥' : (m.genre.toLowerCase().includes('comedy') ? '😂' : '🎬');
        div.innerHTML = `<div class="movie-info"><h4>${icon} ${m.title}</h4><p>$${m.price.toFixed(2)}</p></div>`;
        div.onclick = () => openMovieDetails(m);
        container.appendChild(div);
    });
}

function openMovieDetails(movie) {
    currentMovie = movie;
    document.getElementById("detailTitle").innerText = movie.title;
    document.getElementById("detailGenre").innerText = movie.genre;
    document.getElementById("detailYear").innerText = movie.year;
    document.getElementById("detailPrice").innerText = movie.price.toFixed(2);
    document.getElementById("detailImage").src = movie.imageUrl || 'https://via.placeholder.com/300x450';
    
    navigateTo('details');
    loadReviews(movie.id);
    checkWatchlistStatus(movie.id);
}
