<!-- MEMBER 2: Movie Catalog Management -->
    <!-- HOME PAGE -->
    <div id="page-home" class="page active-page">
        <header class="hero">
            <div class="hero-content">
                <h2>Unlimited movies, TV shows, and more.</h2>
                <p>Rent anywhere. Watch anytime.</p>
                <div class="search-container">
                    <input type="search" id="homeSearch" class="search-bar" autocomplete="off" placeholder="Search for movies..." onkeyup="handleSearch('home')">
                </div>
            </div>
        </header>
        <main class="container">
            <h3>Trending Now</h3>
            <div class="movie-row" id="trendingMoviesRow"></div>
        </main>
    </div>
