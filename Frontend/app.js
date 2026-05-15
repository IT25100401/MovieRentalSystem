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

