let currentUser = null;
let userBalance = 0;

document.addEventListener('DOMContentLoaded', function() {
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    userBalance = currentUser.walletBalance || 0;
    document.getElementById('availableBalance').textContent = `₹${userBalance.toLocaleString()}`;
    
    const savedUPI = localStorage.getItem('userUPI') || '';
    if (savedUPI) {
        document.getElementById('upiId').value = savedUPI;
        document.getElementById('savedUPIDisplay').innerHTML = `<i class="fas fa-check-circle"></i> Saved UPI: ${savedUPI}`;
    }
});

function setAmount(amount) {
    document.getElementById('withdrawAmount').value = amount;
}

function saveUPI() {
    const upiId = document.getElementById('upiId').value.trim();
    
    if (!upiId) {
        alert('Please enter a valid UPI ID');
        return;
    }
    
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
    if (!upiRegex.test(upiId)) {
        alert('Please enter a valid UPI ID (e.g., name@okhdfcbank)');
        return;
    }
    
    localStorage.setItem('userUPI', upiId);
    document.getElementById('savedUPIDisplay').innerHTML = `<i class="fas fa-check-circle"></i> Saved UPI: ${upiId}`;
    alert('UPI ID saved successfully!');
}

function closeSuccessPopup() {
    document.getElementById('successPopup').style.display = 'none';
    window.location.href = 'dashboard.html';
}

function processWithdraw() {
    const amount = parseInt(document.getElementById('withdrawAmount').value);
    const upiId = document.getElementById('upiId').value.trim();
    
    if (!amount || amount < 100) {
        alert('Please enter minimum amount ₹100');
        return;
    }
    
    if (amount > userBalance) {
        alert(`Insufficient balance. Your balance is ₹${userBalance.toLocaleString()}`);
        return;
    }
    
    if (!upiId) {
        alert('Please enter and save your UPI ID first');
        return;
    }
    
    const savedUPI = localStorage.getItem('userUPI');
    if (!savedUPI || savedUPI !== upiId) {
        alert('Please save your UPI ID before requesting withdrawal');
        return;
    }
    
    // INSTANTLY DEDUCT FROM WALLET
    currentUser.walletBalance = userBalance - amount;
    
    // Save updated user data
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update in users array
    const allUsers = JSON.parse(localStorage.getItem('investpro_users') || '[]');
    const userIndex = allUsers.findIndex(u => u.mobile === currentUser.mobile);
    if (userIndex !== -1) {
        allUsers[userIndex].walletBalance = currentUser.walletBalance;
        localStorage.setItem('investpro_users', JSON.stringify(allUsers));
    }
    
    // Create withdrawal request for admin
    const withdrawRequest = {
        id: Date.now(),
        userId: currentUser.mobile,
        userName: currentUser.fullName,
        amount: amount,
        upiId: upiId,
        status: 'pending',
        requestedAt: new Date().toISOString()
    };
    
    let withdrawRequests = JSON.parse(localStorage.getItem('withdraw_requests') || '[]');
    withdrawRequests.push(withdrawRequest);
    localStorage.setItem('withdraw_requests', JSON.stringify(withdrawRequests));
    
    document.getElementById('successPopup').style.display = 'flex';
    
    setTimeout(() => {
        if (document.getElementById('successPopup').style.display === 'flex') {
            closeSuccessPopup();
        }
    }, 5000);
}

window.onclick = function(event) {
    const successPopup = document.getElementById('successPopup');
    if (event.target === successPopup) {
        closeSuccessPopup();
    }
}