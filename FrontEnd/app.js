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
