// API Configuration
const API_URL = 'https://investpro-api-616i.onrender.com';

// Admin Credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'InvestPro@2025';

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

// Check admin session
function checkAdminSession() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (!isLoggedIn && !window.location.href.includes('index.html')) {
        window.location.href = 'index.html';
    }
}

// Admin Login
if (document.getElementById('adminLoginForm')) {
    document.getElementById('adminLoginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            sessionStorage.setItem('adminLoggedIn', 'true');
            sessionStorage.setItem('adminToken', 'admin_token_123');
            window.location.href = 'dashboard.html';
        } else {
            alert('Invalid admin credentials');
        }
    });
}

// Admin Logout
function adminLogout() {
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('adminToken');
    window.location.href = 'index.html';
}

// ============ DASHBOARD PAGE ============
if (document.getElementById('totalUsers')) {
    loadDashboardData();
}

async function loadDashboardData() {
    try {
        const response = await fetch(`${API_URL}/api/admin/users`, {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`
            }
        });
        
        let users = [];
        if (response.ok) {
            const data = await response.json();
            users = data.users || [];
        } else {
            users = JSON.parse(localStorage.getItem('investpro_users') || '[]');
        }
        
        const rechargeRequests = JSON.parse(localStorage.getItem('recharge_requests') || '[]');
        const withdrawRequests = JSON.parse(localStorage.getItem('withdraw_requests') || '[]');
        
        document.getElementById('totalUsers').textContent = users.length;
        document.getElementById('pendingRecharge').textContent = rechargeRequests.filter(r => r.status === 'pending').length;
        document.getElementById('pendingWithdraw').textContent = withdrawRequests.filter(r => r.status === 'pending').length;
        
        let totalVolume = 0;
        users.forEach(u => totalVolume += (u.walletBalance || 0));
        document.getElementById('totalVolume').textContent = `₹${totalVolume.toLocaleString()}`;
    } catch (error) {
        console.error('Error loading dashboard:', error);
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
}

// ============ USERS PAGE ============
if (document.getElementById('usersTableBody')) {
    loadUsersTable();
}

async function loadUsersTable() {
    try {
        const response = await fetch(`${API_URL}/api/admin/users`, {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`
            }
        });
        
        let users = [];
        if (response.ok) {
            const data = await response.json();
            users = data.users || [];
        } else {
            users = JSON.parse(localStorage.getItem('investpro_users') || '[]');
        }
        
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
    } catch (error) {
        console.error('Error loading users:', error);
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

// ============ PLANS PAGE - USING MONGODB API ============

if (document.getElementById('plansGrid')) {
    loadPlansGrid();
}

async function loadPlansGrid() {
    try {
        const response = await fetch(`${API_URL}/api/admin/plans`, {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch plans');
        }
        
        const data = await response.json();
        const allPlans = data.plans || [];
        
        // Group plans by category
        const groupedPlans = {
            silver: allPlans.filter(p => p.category === 'silver'),
            gold: allPlans.filter(p => p.category === 'gold'),
            platinum: allPlans.filter(p => p.category === 'platinum')
        };
        
        const grid = document.getElementById('plansGrid');
        const categories = ['silver', 'gold', 'platinum'];
        const categoryNames = { silver: 'Silver', gold: 'Gold', platinum: 'Platinum' };
        
        grid.innerHTML = categories.map(cat => `
            <div class="plan-card">
                <h4>${categoryNames[cat]}</h4>
                ${groupedPlans[cat].length === 0 ? `
                    <div class="plan-item" style="text-align: center; color: #94a3b8; padding: 1rem;">
                        No plans yet. Click below to add your first plan.
                    </div>
                ` : groupedPlans[cat].map(plan => `
                    <div class="plan-item">
                        <strong>${plan.name}</strong><br>
                        <small>Min: ₹${plan.minInvestment} | Returns: ${plan.expectedReturns}<br>Duration: ${plan.duration} | Risk: ${plan.risk}</small>
                        <div class="plan-actions">
                            <button class="action-btn edit-btn" onclick="openEditPlanModal('${plan._id}')">Edit</button>
                            <button class="action-btn delete-btn" onclick="deletePlan('${plan._id}')">Delete</button>
                        </div>
                    </div>
                `).join('')}
                <button class="add-plan-btn" style="margin-top: 0.5rem; width:100%;" onclick="openAddPlanModal('${cat}')">
                    + Add ${categoryNames[cat]} Plan
                </button>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading plans:', error);
        alert('Failed to load plans. Please refresh the page.');
    }
}

let currentEditPlanId = null;
let currentPlanCategory = null;

function openAddPlanModal(category) {
    currentEditPlanId = null;
    currentPlanCategory = category;
    document.getElementById('planModalTitle').textContent = 'Add New Plan';
    document.getElementById('planName').value = '';
    document.getElementById('planCategory').value = category;
    document.getElementById('planMin').value = '';
    document.getElementById('planReturns').value = '';
    document.getElementById('planDuration').value = '';
    document.getElementById('planRisk').value = 'Low';
    document.getElementById('planModal').style.display = 'flex';
}

async function openEditPlanModal(planId) {
    try {
        const response = await fetch(`${API_URL}/api/admin/plans`, {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`
            }
        });
        
        const data = await response.json();
        const plan = data.plans.find(p => p._id === planId);
        
        if (plan) {
            currentEditPlanId = planId;
            document.getElementById('planModalTitle').textContent = 'Edit Plan';
            document.getElementById('planName').value = plan.name;
            document.getElementById('planCategory').value = plan.category;
            document.getElementById('planMin').value = plan.minInvestment;
            document.getElementById('planReturns').value = plan.expectedReturns;
            document.getElementById('planDuration').value = plan.duration;
            document.getElementById('planRisk').value = plan.risk;
            document.getElementById('planModal').style.display = 'flex';
        }
    } catch (error) {
        console.error('Error fetching plan:', error);
        alert('Failed to load plan details');
    }
}

function closePlanModal() {
    document.getElementById('planModal').style.display = 'none';
    currentEditPlanId = null;
    currentPlanCategory = null;
}

async function savePlan() {
    const planName = document.getElementById('planName').value.trim();
    const planMin = document.getElementById('planMin').value;
    const planReturns = document.getElementById('planReturns').value.trim();
    const planDuration = document.getElementById('planDuration').value.trim();
    const planRisk = document.getElementById('planRisk').value;
    const category = document.getElementById('planCategory').value;
    
    if (!planName) {
        alert('Please enter plan name');
        return;
    }
    if (!planMin || planMin < 100) {
        alert('Minimum investment must be at least ₹100');
        return;
    }
    if (!planReturns) {
        alert('Please enter expected returns');
        return;
    }
    if (!planDuration) {
        alert('Please enter duration');
        return;
    }
    
    const planData = {
        name: planName,
        category: category,
        minInvestment: parseFloat(planMin),
        expectedReturns: planReturns,
        duration: planDuration,
        risk: planRisk
    };
    
    try {
        let response;
        
        if (currentEditPlanId) {
            // Update existing plan
            response = await fetch(`${API_URL}/api/admin/plans/${currentEditPlanId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`
                },
                body: JSON.stringify(planData)
            });
        } else {
            // Create new plan
            response = await fetch(`${API_URL}/api/admin/plans`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`
                },
                body: JSON.stringify(planData)
            });
        }
        
        const result = await response.json();
        
        if (result.success) {
            alert(result.message);
            closePlanModal();
            loadPlansGrid();
        } else {
            alert(result.message || 'Failed to save plan');
        }
    } catch (error) {
        console.error('Error saving plan:', error);
        alert('Failed to save plan. Please try again.');
    }
}

async function deletePlan(planId) {
    if (confirm('Are you sure you want to delete this plan?')) {
        try {
            const response = await fetch(`${API_URL}/api/admin/plans/${planId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('Plan deleted successfully!');
                loadPlansGrid();
            } else {
                alert(result.message || 'Failed to delete plan');
            }
        } catch (error) {
            console.error('Error deleting plan:', error);
            alert('Failed to delete plan. Please try again.');
        }
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