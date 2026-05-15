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
