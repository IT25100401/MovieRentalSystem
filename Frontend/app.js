/ --- MEMBER 4: Movie Review & Feedback ---
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
