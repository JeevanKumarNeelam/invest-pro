let selectedMethod = 'giftcard';
let currentUser = null;

document.addEventListener('DOMContentLoaded', function() {
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    document.querySelectorAll('.payment-method').forEach(method => {
        method.addEventListener('click', function() {
            document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
            this.classList.add('selected');
            selectedMethod = this.dataset.method;
        });
    });
});

function setAmount(amount) {
    document.getElementById('amount').value = amount;
}

function openRechargeModal() {
    const amount = document.getElementById('amount').value;
    
    if (!amount || amount < 100) {
        alert('Please enter minimum amount ₹100');
        return;
    }
    
    document.getElementById('modalMobile').value = currentUser.mobile;
    document.getElementById('giftCardCode').value = '';
    document.getElementById('giftCardValue').value = '';
    
    document.getElementById('rechargeModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('rechargeModal').style.display = 'none';
}

function closeSuccessPopup() {
    document.getElementById('successPopup').style.display = 'none';
    window.location.href = 'dashboard.html';
}

function submitRechargeRequest() {
    const mobile = document.getElementById('modalMobile').value;
    const giftCardCode = document.getElementById('giftCardCode').value;
    const giftCardValue = document.getElementById('giftCardValue').value;
    const rechargeAmount = document.getElementById('amount').value;
    
    if (!mobile || mobile.length !== 10) {
        alert('Please enter a valid 10-digit mobile number');
        return;
    }
    
    if (!giftCardCode || giftCardCode.trim() === '') {
        alert('Please enter the gift card code');
        return;
    }
    
    if (!giftCardValue || giftCardValue < 100) {
        alert('Please enter a valid gift card value (minimum ₹100)');
        return;
    }
    
    if (parseInt(giftCardValue) < parseInt(rechargeAmount)) {
        alert(`Gift card value (₹${giftCardValue}) is less than recharge amount (₹${rechargeAmount})`);
        return;
    }
    
    // Create recharge request for admin approval
    const rechargeRequest = {
        id: Date.now(),
        userId: currentUser.mobile,
        userName: currentUser.fullName,
        mobile: mobile,
        amount: parseInt(rechargeAmount),
        giftCardCode: giftCardCode,
        giftCardValue: parseInt(giftCardValue),
        status: 'pending',
        requestedAt: new Date().toISOString()
    };
    
    let rechargeRequests = JSON.parse(localStorage.getItem('recharge_requests') || '[]');
    rechargeRequests.push(rechargeRequest);
    localStorage.setItem('recharge_requests', JSON.stringify(rechargeRequests));
    
    closeModal();
    document.getElementById('successPopup').style.display = 'flex';
    
    setTimeout(() => {
        if (document.getElementById('successPopup').style.display === 'flex') {
            closeSuccessPopup();
        }
    }, 5000);
}

window.onclick = function(event) {
    const modal = document.getElementById('rechargeModal');
    const successPopup = document.getElementById('successPopup');
    
    if (event.target === modal) closeModal();
    if (event.target === successPopup) closeSuccessPopup();
}