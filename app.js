const API_URL = 'http://localhost:8080/api';
let currentUser = null;
let currentMovie = null;
let allMovies = [];
let cart = [];
let isCheckoutFromCart = false;
let previousPage = 'home';
let currentPage = 'home';
let trendingMovieIds = JSON.parse(localStorage.getItem("trendingMovieIds")) || [];

document.addEventListener("DOMContentLoaded", () => {
    checkLoginState();
    loadMovies();
    navigateTo('home');
    setupStarRating();
});

function setupStarRating() {
    const stars = document.querySelectorAll('.star-rating .star');
    const ratingInput = document.getElementById('reviewRating');
    
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const val = parseInt(star.getAttribute('data-value'));
            ratingInput.value = val;
            
            stars.forEach(s => {
                if (parseInt(s.getAttribute('data-value')) <= val) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });
}

// --- NAVIGATION ---
function navigateTo(pageId) {
    if (currentPage !== pageId) {
        previousPage = currentPage;
    }
    currentPage = pageId;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page'));
    document.getElementById(`page-${pageId}`).classList.add('active-page');
    window.scrollTo(0, 0);
    if (pageId === 'cart') renderCart();
    if (pageId === 'admin') { loadAdminMovies(); loadAdminReviews(); }
}

function goBack() {
    navigateTo(previousPage);
}

// --- MODALS ---
function showModal(id) { document.getElementById(id).style.display = "block"; }
function closeModal(id) { document.getElementById(id).style.display = "none"; }

// --- MEMBER 1: User Account & Authentication ---
// --- AUTH ---
function checkLoginState() {
    const userStr = localStorage.getItem("user");
    if (userStr) {
        currentUser = JSON.parse(userStr);
        document.getElementById("loginBtn").style.display = "none";
        document.getElementById("registerBtn").style.display = "none";
        document.getElementById("logoutBtn").style.display = "inline-block";
        document.getElementById("profileLink").style.display = "inline-block";
        document.getElementById("watchlistLink").style.display = "inline-block";
        document.getElementById("transactionsLink").style.display = "inline-block";
        if (currentUser.role === 'ADMIN') {
            document.getElementById("adminLink").style.display = "inline-block";
        }
    } else {
        document.getElementById("loginBtn").style.display = "inline-block";
        document.getElementById("registerBtn").style.display = "inline-block";
        document.getElementById("logoutBtn").style.display = "none";
        document.getElementById("profileLink").style.display = "none";
        document.getElementById("watchlistLink").style.display = "none";
        document.getElementById("transactionsLink").style.display = "none";
        document.getElementById("adminLink").style.display = "none";
    }
}

async function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const res = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    if (res.ok) {
        const user = await res.json();
        localStorage.setItem("user", JSON.stringify(user));
        closeModal("loginModal");
        checkLoginState();
    } else {
        alert("Login failed. Check credentials.");
    }
}

async function register() {
    const username = document.getElementById("regUsername").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;
    const res = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        body: JSON.stringify({ username, email, password })
    });
    if (res.ok) {
        alert("Registered successfully. Please log in.");
        closeModal("registerModal");
    } else {
        alert("Registration failed");
    }
}

function logout() {
    localStorage.removeItem("user");
    currentUser = null;
    cart = [];
    updateCartCount();
    checkLoginState();
    navigateTo('home');
}

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
        //  OOP Polymorphism icon display simulation
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

// --- MEMBER 3: Rental Transaction Management ---
// --- CART ---
function updateCartCount() {
    document.getElementById("cartLink").innerText = `Cart (${cart.length})`;
}

function addToCart() {
    if (!currentUser) { alert("Please login to add to cart"); showModal('loginModal'); return; }
    if (cart.find(m => m.id === currentMovie.id)) {
        alert("This movie is already in your cart!");
        return;
    }
    cart.push(currentMovie);
    updateCartCount();
    alert(`${currentMovie.title} added to cart!`);
}

function renderCart() {
    const list = document.getElementById("cartItemsList");
    list.innerHTML = "";
    let total = 0;
    cart.forEach((m, index) => {
        total += m.price;
        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
            <div style="display:flex; align-items:center; gap:15px;">
                <img src="${m.imageUrl}" style="width: 50px; height: 75px; object-fit: cover; border-radius: 4px;">
                <div>
                    <strong>${m.title}</strong><br>
                    <span style="color:#aaa; font-size: 0.9em;">${m.genre}</span>
                </div>
            </div>
            <div style="font-size: 1.2em; font-weight: bold;">
                $${m.price.toFixed(2)}
                <button onclick="removeFromCart(${index})" style="margin-left:20px; background:transparent; border:none; color:#e50914; cursor:pointer; font-size:1.2em;">✖</button>
            </div>
        `;
        list.appendChild(div);
    });
    document.getElementById("cartTotal").innerText = total.toFixed(2);
    document.getElementById("checkoutBtn").style.display = cart.length > 0 ? "inline-block" : "none";
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartCount();
    renderCart();
}

// --- MEMBER 6: Payment & Billing ---
// --- TRANSACTION ---
function goToTransaction(fromCart) {
    if (!currentUser) { alert("Please login to rent movies"); showModal('loginModal'); return; }
    isCheckoutFromCart = fromCart;
    const itemsToCheckout = fromCart ? cart : [currentMovie];
    if (itemsToCheckout.length === 0) return;

    const itemsDiv = document.getElementById("transactionItems");
    let total = 0;
    itemsDiv.innerHTML = "";

    itemsToCheckout.forEach(m => {
        total += m.price;
        itemsDiv.innerHTML += `
            <div style="display:flex; justify-content:space-between; margin-bottom:10px; padding-bottom:10px; border-bottom:1px solid #333; font-size:1.1em;">
                <span>${m.title}</span>
                <span>$${m.price.toFixed(2)}</span>
            </div>`;
    });
    
    document.getElementById("transactionTotal").innerText = total.toFixed(2);
    navigateTo('transaction');
}

async function confirmPayment() {
    const itemsToCheckout = isCheckoutFromCart ? cart : [currentMovie];
    
    for (const movie of itemsToCheckout) {
        await fetch(`${API_URL}/rentals`, {
            method: 'POST',
            body: JSON.stringify({ userId: currentUser.id, movieId: movie.id })
        });
    }
    
    alert("Payment successful! Enjoy your movies.");
    if (isCheckoutFromCart) {
        cart = [];
        updateCartCount();
    }
    navigateTo('home');
}

// --- MEMBER 4: Movie Review & Feedback ---
// --- REVIEWS ---
async function loadReviews(movieId) {
    const res = await fetch(`${API_URL}/reviews`);
    const reviews = await res.json();
    const section = document.getElementById("reviewSection");
    section.innerHTML = "";
    const movieReviews = reviews.filter(r => r.movieId === movieId);
    if(movieReviews.length === 0) {
        section.innerHTML = "<p style='color:#aaa;'>No reviews yet. Be the first to review!</p>";
        return;
    }
    movieReviews.forEach(r => {
        const d = document.createElement("div");
        d.className = "review-item";
        d.style.position = "relative";
        const displayName = r.username ? r.username : `User ${r.userId}`;
        let deleteBtn = "";
        if (currentUser && (currentUser.id === r.userId || currentUser.role === 'ADMIN')) {
            deleteBtn = `<button onclick="deleteReviewUser(${r.id})" class="rent-btn" style="position:absolute; top:10px; right:10px; background:red; padding: 5px 10px; font-size: 0.8rem;">Delete</button>`;
        }
        d.innerHTML = `
            ${deleteBtn}
            <strong>${displayName}</strong> - <span style="color:#f5b50a;">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</span>
            <p style="margin-top:5px; color:#ccc;">${r.comment}</p>
        `;
        section.appendChild(d);
    });
}

async function deleteReviewUser(id) {
    if (!confirm("Are you sure you want to delete this review?")) return;
    const res = await fetch(`${API_URL}/reviews?id=${id}`, {
        method: 'DELETE'
    });
    if (res.ok) {
        alert("Review deleted.");
        loadReviews(currentMovie.id);
    } else {
        alert("Failed to delete review.");
    }
}

async function submitReview() {
    if (!currentUser) { alert("Please login to submit a review"); showModal('loginModal'); return; }
    const rating = parseInt(document.getElementById("reviewRating").value);
    const comment = document.getElementById("reviewComment").value;
    if(rating === 0 || !comment) { alert("Please select a star rating and write a comment!"); return; }
    
    const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ userId: currentUser.id, movieId: currentMovie.id, rating: rating, comment })
    });
    if (res.ok) {
        loadReviews(currentMovie.id);
        document.getElementById("reviewRating").value = "0";
        document.getElementById("reviewComment").value = "";
        document.querySelectorAll('.star-rating .star').forEach(s => s.classList.remove('active'));
    } else {
        alert("Failed to submit review");
    }
}

// --- MEMBER 2: Movie Catalog Management (Admin) ---
// --- ADMIN ---
async function addMovie() {
    if (!currentUser || currentUser.role !== 'ADMIN') return;
    const title = document.getElementById("addTitle").value;
    const genre = document.getElementById("addGenre").value;
    const year = document.getElementById("addYear").value;
    const price = document.getElementById("addPrice").value;
    const imageUrl = document.getElementById("addImage").value;

    const res = await fetch(`${API_URL}/movies`, {
        method: 'POST',
        body: JSON.stringify({ title, genre, year: parseInt(year), price: parseFloat(price), available: true, imageUrl })
    });
    if (res.ok) {
        alert("Movie successfully added to catalog!");
        document.getElementById("addTitle").value = "";
        document.getElementById("addGenre").value = "";
        document.getElementById("addYear").value = "";
        document.getElementById("addPrice").value = "";
        document.getElementById("addImage").value = "";
        await loadMovies();
        loadAdminMovies();
    } else {
        alert("Failed to add movie");
    }
}

function loadAdminMovies() {
    const list = document.getElementById("adminMoviesList");
    list.innerHTML = "";
    allMovies.forEach(m => {
        const isTrending = trendingMovieIds.includes(m.id);
        const trendBtnText = isTrending ? "Remove Trending" : "Make Trending";
        const trendBtnColor = isTrending ? "#555" : "#4CAF50";
        
        list.innerHTML += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #333;">
                <div><strong>${m.title}</strong> (${m.year}) - $${m.price.toFixed(2)}</div>
                <div>
                    <button onclick="toggleTrending(${m.id})" style="background:${trendBtnColor}; color:white; border:none; padding:5px 10px; border-radius:3px; cursor:pointer;">${trendBtnText}</button>
                    <button onclick="editMoviePoster(${m.id}, '${m.imageUrl || ''}')" style="background:#007bff; color:white; border:none; padding:5px 10px; border-radius:3px; cursor:pointer; margin-left:5px;">Edit Poster</button>
                    <button onclick="editMovie(${m.id}, ${m.price})" style="background:#f5b50a; color:black; border:none; padding:5px 10px; border-radius:3px; cursor:pointer; margin-left:5px;">Edit Price</button>
                    <button onclick="deleteMovie(${m.id})" style="background:#e50914; color:white; border:none; padding:5px 10px; border-radius:3px; cursor:pointer; margin-left:5px;">Delete</button>
                </div>
            </div>
        `;
    });
}

function toggleTrending(id) {
    if (trendingMovieIds.includes(id)) {
        trendingMovieIds = trendingMovieIds.filter(tId => tId !== id);
    } else {
        trendingMovieIds.push(id);
    }
    localStorage.setItem("trendingMovieIds", JSON.stringify(trendingMovieIds));
    renderMovies();
    if(currentPage === 'admin') loadAdminMovies();
}

async function editMovie(id, currentPrice) {
    const newPrice = prompt("Enter new price for this movie:", currentPrice);
    if (!newPrice || isNaN(newPrice)) return;
    
    const res = await fetch(`${API_URL}/movies?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify({ price: parseFloat(newPrice), available: true })
    });
    if (res.ok) {
        alert("Movie price updated!");
        await loadMovies();
        loadAdminMovies();
    }
}

async function editMoviePoster(id, currentUrl) {
    const newUrl = prompt("Enter new poster image URL:", currentUrl);
    if (!newUrl || newUrl === currentUrl) return;
    
    const res = await fetch(`${API_URL}/movies?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify({ imageUrl: newUrl, price: 0, available: true })
    });
    if (res.ok) {
        alert("Movie poster updated!");
        await loadMovies();
        loadAdminMovies();
    }
}

async function deleteMovie(id) {
    if (!confirm("Are you sure you want to completely delete this movie from the catalog?")) return;
    const res = await fetch(`${API_URL}/movies?id=${id}`, {
        method: 'DELETE'
    });
    if (res.ok) {
        alert("Movie removed!");
        await loadMovies();
        loadAdminMovies();
    }
}

// --- MEMBER 1: User Account & Authentication ---
// --- PROFILE (MEMBER 1 CRUD) ---
async function loadProfile() {
    if (!currentUser) return;
    
    if (!currentUser.id) {
        alert("Your session is outdated. Please log out and log back in to access your profile.");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/users?id=${currentUser.id}`);
        if (res.ok) {
            const data = await res.json();
            const profile = data.profile;
            const history = data.history;
            
            document.getElementById("profUsername").innerText = profile.username;
            document.getElementById("profRole").innerText = profile.role;
            document.getElementById("profEmailTxt").innerText = profile.email;
            document.getElementById("editEmail").value = profile.email;
            
            const historyList = document.getElementById("rentalHistoryList");
            historyList.innerHTML = "";
            
            // --- MEMBER 3: Rental Transaction Management (History) ---
            if (history.length === 0) {
                historyList.innerHTML = "<p style='color:#ccc;'>No rentals found.</p>";
            } else {
                history.forEach(r => {
                    const movie = allMovies.find(m => m.id === r.movieId);
                    const title = movie ? movie.title : `Movie ID: ${r.movieId}`;
                    
                    let statusText = "";
                    let actionButton = "";

                    if (r.returned) {
                        const safeDateStr = r.dueDate.replace(' ', 'T');
                        const retDate = new Date(safeDateStr);
                        statusText = `<span style="color: #4CAF50;">Removed on: ${retDate.toLocaleDateString()}</span>`;
                    } else {
                        if (r.dueDate) {
                            const safeDateStr = r.dueDate.replace(' ', 'T');
                            const due = new Date(safeDateStr);
                            statusText = `<span style="color: #f5b50a;">Removing day: ${due.toLocaleDateString()}</span>`;
                        }
                        actionButton = `<button onclick="removeRental(${r.id})" style="background:#e50914; color:white; border:none; padding:5px 10px; border-radius:3px; cursor:pointer;">Remove</button>`;
                    }

                    historyList.innerHTML += `<div style="padding:10px 0; border-bottom:1px solid #333; display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <strong>${title}</strong> - Rented on: ${r.rentalDate} <br>
                            ${statusText}
                        </div>
                        ${actionButton}
                    </div>`;
                });
            }
            navigateTo('profile');
        } else {
            alert("Could not load profile from server. Please make sure the Java backend is running.");
        }
    } catch (err) {
        alert("Server error when loading profile.");
        console.error(err);
    }
}

async function removeRental(id) {
    if (!confirm("Are you sure you want to remove this movie from your rental history?")) return;
    const res = await fetch(`${API_URL}/rentals?id=${id}`, {
        method: 'PUT'
    });
    if (res.ok) {
        alert("Rental removed successfully.");
        loadProfile();
    } else {
        alert("Failed to remove rental.");
    }
}

async function updateProfile() {
    const newEmail = document.getElementById("editEmail").value;
    let newPassword = document.getElementById("editPassword").value;
    let confirmPassword = document.getElementById("editPasswordConfirm").value;
    
    if (!newEmail) { alert("Email cannot be empty"); return; }
    
    if (newPassword !== confirmPassword) {
        alert("Passwords do not match! Please check your entries.");
        return;
    }
    
    // If password is blank, we can send their current password to avoid breaking things.
    if (!newPassword) {
        newPassword = currentUser.password || "user123"; // fallback just in case
    }
    
    const res = await fetch(`${API_URL}/users?id=${currentUser.id}`, {
        method: 'PUT',
        body: JSON.stringify({ email: newEmail, password: newPassword })
    });
    
    if (res.ok) {
        alert("Profile details updated successfully!");
        currentUser.email = newEmail;
        if(document.getElementById("editPassword").value) {
            currentUser.password = newPassword;
        }
        localStorage.setItem("user", JSON.stringify(currentUser));
        document.getElementById("profEmailTxt").innerText = newEmail;
        document.getElementById("editPassword").value = "";
        document.getElementById("editPasswordConfirm").value = "";
    } else {
        alert("Failed to update profile.");
    }
}

async function deleteAccount() {
    if (!confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) return;
    
    const res = await fetch(`${API_URL}/users?id=${currentUser.id}`, {
        method: 'DELETE'
    });
    
    if (res.ok) {
        alert("Account removed successfully.");
        logout();
    } else {
        alert("Failed to delete account.");
    }
}

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

// --- TRANSACTIONS (MEMBER 6) ---
async function loadTransactions() {
    if (!currentUser) return;
    const res = await fetch(`${API_URL}/invoices?userId=${currentUser.id}`);
    if (res.ok) {
        const invoices = await res.json();
        const list = document.getElementById("transactionHistoryList");
        list.innerHTML = "";
        
        if (invoices.length === 0) {
            list.innerHTML = "<p>No transaction history found.</p>";
        } else {
            for (let inv of invoices) {
                list.innerHTML += `
                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 5px; margin-bottom: 10px; border: 1px solid #333;">
                        <p style="margin:0;"><strong>Invoice #${inv.invoiceId}</strong></p>
                        <p style="margin:5px 0;">Movie: ${inv.movieTitle}</p>
                        <p style="margin:5px 0;">Date: ${inv.date}</p>
                        <p style="margin:0; color:#e50914;">Amount: $${inv.amount.toFixed(2)} - Status: <strong>${inv.status}</strong></p>
                    </div>
                `;
            }
        }
    }
    navigateTo('transactions');
}

// --- ADMIN REVIEWS ---
async function loadAdminReviews() {
    const res = await fetch(`${API_URL}/reviews`);
    if (res.ok) {
        const reviews = await res.json();
        const list = document.getElementById("adminReviewsList");
        list.innerHTML = "";
        
        if (reviews.length === 0) {
            list.innerHTML = "<p>No reviews found.</p>";
        } else {
            for (let rev of reviews) {
                const movie = allMovies.find(m => m.id === rev.movieId);
                const title = movie ? movie.title : `Movie ID ${rev.movieId}`;
                list.innerHTML += `
                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 5px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <p style="margin:0;"><strong>${title}</strong></p>
                            <p style="margin:5px 0;">User: ${rev.username} | Rating: ${rev.rating}★</p>
                            <p style="margin:0; font-style: italic;">"${rev.comment}"</p>
                        </div>
                        <button onclick="deleteReviewAdmin(${rev.id})" class="rent-btn" style="background:red; padding: 10px;">Delete</button>
                    </div>
                `;
            }
        }
    }
}

async function deleteReviewAdmin(id) {
    if (!confirm("Are you sure you want to delete this review?")) return;
    const res = await fetch(`${API_URL}/reviews?id=${id}`, {
        method: 'DELETE'
    });
    if (res.ok) {
        alert("Review deleted.");
        loadAdminReviews();
    } else {
        alert("Failed to delete review.");
    }
}
