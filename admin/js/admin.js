// ============ PASSWORD VISIBILITY TOGGLE FOR ADMIN LOGIN ============
document.addEventListener('DOMContentLoaded', function() {
    const togglePassword = document.querySelector('#togglePassword');
    const passwordInput = document.querySelector('#password');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }
});

// Admin Credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'InvestPro@2025';

// Check admin session
function checkAdminSession() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (!isLoggedIn && !window.location.href.includes('index.html')) {
        window.location.href = 'index.html';
    }
}

// Admin Login
if (document.getElementById('adminLoginForm')) {
    document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            sessionStorage.setItem('adminLoggedIn', 'true');
            window.location.href = 'dashboard.html';
        } else {
            alert('Invalid admin credentials');
        }
    });
}

// Admin Logout
function adminLogout() {
    sessionStorage.removeItem('adminLoggedIn');
    window.location.href = 'index.html';
}

// ============ DASHBOARD PAGE ============
if (document.getElementById('totalUsers')) {
    loadDashboardData();
}

function loadDashboardData() {
    const users = JSON.parse(localStorage.getItem('investpro_users') || '[]');
    const rechargeRequests = JSON.parse(localStorage.getItem('recharge_requests') || '[]');
    const withdrawRequests = JSON.parse(localStorage.getItem('withdraw_requests') || '[]');
    
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('pendingRecharge').textContent = rechargeRequests.filter(r => r.status === 'pending').length;
    document.getElementById('pendingWithdraw').textContent = withdrawRequests.filter(r => r.status === 'pending').length;
    
    let totalVolume = 0;
    users.forEach(u => totalVolume += (u.walletBalance || 0));
    document.getElementById('totalVolume').textContent = `₹${totalVolume.toLocaleString()}`;
}

// ============ USERS PAGE ============
if (document.getElementById('usersTableBody')) {
    loadUsersTable();
}

function loadUsersTable() {
    const users = JSON.parse(localStorage.getItem('investpro_users') || '[]');
    const tbody = document.getElementById('usersTableBody');
    
    tbody.innerHTML = users.map((user, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${user.fullName || 'N/A'}</td>
            <td>${user.mobile}</td>
            <td>₹${(user.walletBalance || 0).toLocaleString()}</td>
            <td>₹${(user.totalInvested || 0).toLocaleString()}</td>
            <td>${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
            <td>
                <button class="action-btn edit-btn" onclick="openEditUserModal(${index})">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteUser(${index})">Delete</button>
            </td>
        </tr>
    `).join('');
}

let currentEditIndex = null;

function openEditUserModal(index) {
    const users = JSON.parse(localStorage.getItem('investpro_users') || '[]');
    const user = users[index];
    currentEditIndex = index;
    
    document.getElementById('editUserId').value = index;
    document.getElementById('editFullName').value = user.fullName || '';
    document.getElementById('editMobile').value = user.mobile;
    document.getElementById('editWalletBalance').value = user.walletBalance || 0;
    document.getElementById('editTotalInvested').value = user.totalInvested || 0;
    document.getElementById('editTotalReturns').value = user.totalReturns || 0;
    
    document.getElementById('editUserModal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('editUserModal').style.display = 'none';
    currentEditIndex = null;
}

function saveUserEdit() {
    const users = JSON.parse(localStorage.getItem('investpro_users') || '[]');
    if (currentEditIndex !== null) {
        users[currentEditIndex].fullName = document.getElementById('editFullName').value;
        users[currentEditIndex].walletBalance = parseFloat(document.getElementById('editWalletBalance').value);
        users[currentEditIndex].totalInvested = parseFloat(document.getElementById('editTotalInvested').value);
        users[currentEditIndex].totalReturns = parseFloat(document.getElementById('editTotalReturns').value);
        
        localStorage.setItem('investpro_users', JSON.stringify(users));
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.mobile === users[currentEditIndex].mobile) {
            currentUser.walletBalance = users[currentEditIndex].walletBalance;
            currentUser.totalInvested = users[currentEditIndex].totalInvested;
            currentUser.totalReturns = users[currentEditIndex].totalReturns;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        
        alert('User updated successfully!');
        closeEditModal();
        loadUsersTable();
    }
}

function deleteUser(index) {
    if (confirm('Are you sure you want to delete this user?')) {
        const users = JSON.parse(localStorage.getItem('investpro_users') || '[]');
        users.splice(index, 1);
        localStorage.setItem('investpro_users', JSON.stringify(users));
        loadUsersTable();
        alert('User deleted successfully!');
    }
}

// ============ RECHARGE PAGE ============
if (document.getElementById('rechargeTableBody')) {
    loadRechargeTable();
}

function loadRechargeTable() {
    const requests = JSON.parse(localStorage.getItem('recharge_requests') || '[]');
    const tbody = document.getElementById('rechargeTableBody');
    
    tbody.innerHTML = requests.map((req, index) => `
        <tr>
            <td>${req.id}</td>
            <td>${req.userName}</td>
            <td>${req.mobile}</td>
            <td>₹${req.amount}</td>
            <td>${req.giftCardCode}</td>
            <td>${new Date(req.requestedAt).toLocaleString()}</td>
            <td><span class="status-badge status-${req.status}">${req.status}</span></td>
            <td>
                ${req.status === 'pending' ? `
                    <button class="action-btn approve-btn" onclick="approveRecharge(${index})">Approve</button>
                    <button class="action-btn reject-btn" onclick="rejectRecharge(${index})">Reject</button>
                ` : '-'}
            </td>
        </tr>
    `).join('');
}

function approveRecharge(index) {
    const requests = JSON.parse(localStorage.getItem('recharge_requests') || '[]');
    const req = requests[index];
    
    if (confirm(`Approve ₹${req.amount} recharge for ${req.userName}?`)) {
        requests[index].status = 'approved';
        localStorage.setItem('recharge_requests', JSON.stringify(requests));
        
        const users = JSON.parse(localStorage.getItem('investpro_users') || '[]');
        const userIndex = users.findIndex(u => u.mobile === req.userId);
        if (userIndex !== -1) {
            users[userIndex].walletBalance = (users[userIndex].walletBalance || 0) + req.amount;
            localStorage.setItem('investpro_users', JSON.stringify(users));
            
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser && currentUser.mobile === req.userId) {
                currentUser.walletBalance = users[userIndex].walletBalance;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
        }
        
        alert('Recharge approved! Amount added to user wallet.');
        loadRechargeTable();
        if (typeof loadDashboardData === 'function') loadDashboardData();
    }
}

function rejectRecharge(index) {
    if (confirm('Reject this recharge request?')) {
        const requests = JSON.parse(localStorage.getItem('recharge_requests') || '[]');
        requests[index].status = 'rejected';
        localStorage.setItem('recharge_requests', JSON.stringify(requests));
        alert('Recharge rejected!');
        loadRechargeTable();
    }
}

// ============ WITHDRAW PAGE ============
if (document.getElementById('withdrawTableBody')) {
    loadWithdrawTable();
}

function loadWithdrawTable() {
    const requests = JSON.parse(localStorage.getItem('withdraw_requests') || '[]');
    const tbody = document.getElementById('withdrawTableBody');
    
    tbody.innerHTML = requests.map((req, index) => `
        <tr>
            <td>${req.id}</td>
            <td>${req.userName}</td>
            <td>${req.userId}</td>
            <td>₹${req.amount}</td>
            <td>${req.upiId}</td>
            <td>${new Date(req.requestedAt).toLocaleString()}</td>
            <td><span class="status-badge status-${req.status}">${req.status}</span></td>
            <td>
                ${req.status === 'pending' ? `
                    <button class="action-btn approve-btn" onclick="approveWithdraw(${index})">Approve</button>
                    <button class="action-btn reject-btn" onclick="rejectWithdraw(${index})">Reject</button>
                ` : '-'}
            </td>
        </tr>
    `).join('');
}

function approveWithdraw(index) {
    if (confirm('Confirm withdrawal approval? Amount will be processed.')) {
        const requests = JSON.parse(localStorage.getItem('withdraw_requests') || '[]');
        requests[index].status = 'approved';
        localStorage.setItem('withdraw_requests', JSON.stringify(requests));
        alert('Withdrawal approved!');
        loadWithdrawTable();
        if (typeof loadDashboardData === 'function') loadDashboardData();
    }
}

function rejectWithdraw(index) {
    if (confirm('Reject this withdrawal request? Amount will be refunded.')) {
        const requests = JSON.parse(localStorage.getItem('withdraw_requests') || '[]');
        const req = requests[index];
        
        const users = JSON.parse(localStorage.getItem('investpro_users') || '[]');
        const userIndex = users.findIndex(u => u.mobile === req.userId);
        if (userIndex !== -1) {
            users[userIndex].walletBalance = (users[userIndex].walletBalance || 0) + req.amount;
            localStorage.setItem('investpro_users', JSON.stringify(users));
        }
        
        requests[index].status = 'rejected';
        localStorage.setItem('withdraw_requests', JSON.stringify(requests));
        alert('Withdrawal rejected! Amount refunded.');
        loadWithdrawTable();
    }
}

// ============ PLANS PAGE ============
let plans = {
    silver: [
        { name: 'Silver Saver', min: 1000, returns: '8-10%', duration: '30 days', risk: 'Low' },
        { name: 'Silver Plus', min: 5000, returns: '10-12%', duration: '45 days', risk: 'Low' }
    ],
    gold: [
        { name: 'Gold Growth', min: 10000, returns: '12-15%', duration: '60 days', risk: 'Medium' },
        { name: 'Gold Max', min: 25000, returns: '15-18%', duration: '90 days', risk: 'Medium' }
    ],
    platinum: [
        { name: 'Platinum Elite', min: 50000, returns: '18-22%', duration: '120 days', risk: 'High' },
        { name: 'Platinum Pro', min: 100000, returns: '22-25%', duration: '180 days', risk: 'High' }
    ]
};

if (document.getElementById('plansGrid')) {
    loadPlansGrid();
}

function loadPlansGrid() {
    const savedPlans = localStorage.getItem('investment_plans');
    if (savedPlans) {
        Object.assign(plans, JSON.parse(savedPlans));
    }
    
    const grid = document.getElementById('plansGrid');
    const categories = ['silver', 'gold', 'platinum'];
    const categoryNames = { silver: 'Silver', gold: 'Gold', platinum: 'Platinum' };
    
    grid.innerHTML = categories.map(cat => `
        <div class="plan-card">
            <h4>${categoryNames[cat]}</h4>
            ${plans[cat].map((plan, idx) => `
                <div class="plan-item">
                    <strong>${plan.name}</strong><br>
                    <small>Min: ₹${plan.min} | Returns: ${plan.returns}<br>Duration: ${plan.duration} | Risk: ${plan.risk}</small>
                    <div class="plan-actions">
                        <button class="action-btn edit-btn" onclick="editPlan('${cat}', ${idx})">Edit</button>
                        <button class="action-btn delete-btn" onclick="deletePlan('${cat}', ${idx})">Delete</button>
                    </div>
                </div>
            `).join('')}
            <button class="add-plan-btn" style="margin-top: 0.5rem; width:100%;" onclick="openAddPlanModal('${cat}')">+ Add to ${categoryNames[cat]}</button>
        </div>
    `).join('');
}

let currentPlanCategory = null;
let currentPlanIndex = null;

function openAddPlanModal(category) {
    currentPlanCategory = category;
    currentPlanIndex = null;
    document.getElementById('planModalTitle').textContent = 'Add New Plan';
    document.getElementById('planName').value = '';
    document.getElementById('planCategory').value = category;
    document.getElementById('planMin').value = '';
    document.getElementById('planReturns').value = '';
    document.getElementById('planDuration').value = '';
    document.getElementById('planRisk').value = 'Low';
    document.getElementById('planModal').style.display = 'flex';
}

function editPlan(category, index) {
    currentPlanCategory = category;
    currentPlanIndex = index;
    const plan = plans[category][index];
    
    document.getElementById('planModalTitle').textContent = 'Edit Plan';
    document.getElementById('planName').value = plan.name;
    document.getElementById('planCategory').value = category;
    document.getElementById('planMin').value = plan.min;
    document.getElementById('planReturns').value = plan.returns;
    document.getElementById('planDuration').value = plan.duration;
    document.getElementById('planRisk').value = plan.risk;
    document.getElementById('planModal').style.display = 'flex';
}

function closePlanModal() {
    document.getElementById('planModal').style.display = 'none';
    currentPlanCategory = null;
    currentPlanIndex = null;
}

function savePlan() {
    const planData = {
        name: document.getElementById('planName').value,
        min: parseFloat(document.getElementById('planMin').value),
        returns: document.getElementById('planReturns').value,
        duration: document.getElementById('planDuration').value,
        risk: document.getElementById('planRisk').value
    };
    
    const category = document.getElementById('planCategory').value;
    
    if (currentPlanIndex !== null) {
        plans[category][currentPlanIndex] = planData;
    } else {
        plans[category].push(planData);
    }
    
    localStorage.setItem('investment_plans', JSON.stringify(plans));
    alert('Plan saved successfully!');
    closePlanModal();
    loadPlansGrid();
}

function deletePlan(category, index) {
    if (confirm('Delete this plan?')) {
        plans[category].splice(index, 1);
        localStorage.setItem('investment_plans', JSON.stringify(plans));
        loadPlansGrid();
        alert('Plan deleted!');
    }
}

// ============ SETTINGS PAGE ============
if (document.getElementById('adminUsername')) {
    loadSettings();
}

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('admin_settings') || '{}');
    document.getElementById('adminUsername').value = settings.adminUsername || 'admin';
    document.getElementById('adminPassword').value = settings.adminPassword || 'InvestPro@2025';
    document.getElementById('companyName').value = settings.companyName || 'InvestPro';
    document.getElementById('contactEmail').value = settings.contactEmail || 'support@investpro.com';
    document.getElementById('telegramLink').value = settings.telegramLink || 'https://t.me/investpro';
    document.getElementById('minWithdrawal').value = settings.minWithdrawal || 100;
    document.getElementById('processingTime').value = settings.processingTime || 48;
}

function saveAdminCredentials() {
    const settings = JSON.parse(localStorage.getItem('admin_settings') || '{}');
    settings.adminUsername = document.getElementById('adminUsername').value;
    settings.adminPassword = document.getElementById('adminPassword').value;
    localStorage.setItem('admin_settings', JSON.stringify(settings));
    alert('Admin credentials saved!');
}

function saveCompanyInfo() {
    const settings = JSON.parse(localStorage.getItem('admin_settings') || '{}');
    settings.companyName = document.getElementById('companyName').value;
    settings.contactEmail = document.getElementById('contactEmail').value;
    settings.telegramLink = document.getElementById('telegramLink').value;
    localStorage.setItem('admin_settings', JSON.stringify(settings));
    alert('Company info saved!');
}

function saveWithdrawalSettings() {
    const settings = JSON.parse(localStorage.getItem('admin_settings') || '{}');
    settings.minWithdrawal = parseFloat(document.getElementById('minWithdrawal').value);
    settings.processingTime = parseFloat(document.getElementById('processingTime').value);
    localStorage.setItem('admin_settings', JSON.stringify(settings));
    alert('Withdrawal settings saved!');
}

// Run session check on all admin pages
checkAdminSession();