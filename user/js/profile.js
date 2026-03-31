document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    const allUsers = JSON.parse(localStorage.getItem('investpro_users') || '[]');
    const userData = allUsers.find(u => u.mobile === currentUser.mobile) || currentUser;
    
    document.getElementById('profileName').textContent = userData.fullName || currentUser.name || currentUser.mobile;
    document.getElementById('profileMobile').textContent = currentUser.mobile;
    
    const memberDate = userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'March 2025';
    document.getElementById('memberSince').textContent = memberDate;
    
    document.getElementById('totalInvestments').textContent = `₹${(currentUser.totalInvested || 0).toLocaleString()}`;
    document.getElementById('totalReturns').textContent = `₹${(currentUser.totalReturns || 0).toLocaleString()}`;
    document.getElementById('walletBalance').textContent = `₹${(currentUser.walletBalance || 0).toLocaleString()}`;
});

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}