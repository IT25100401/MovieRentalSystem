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
