// API Configuration
const API_URL = 'https://investpro-api-616i.onrender.com';

let currentUser = null;
let investmentPlans = { silver: [], gold: [], platinum: [] };

// Fetch current user data from API
async function fetchCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        if (data.success) {
            return data.user;
        }
        return null;
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}

// Fetch plans from backend API
async function fetchPlansFromAPI() {
    try {
        const response = await fetch(`${API_URL}/api/plans`);
        const data = await response.json();
        
        if (data.success) {
            investmentPlans = data.plans;
            console.log('Plans loaded:', investmentPlans);
        }
    } catch (error) {
        console.error('Error fetching plans:', error);
    }
}

// Update dashboard display
function updateDashboardDisplay() {
    if (!currentUser) return;
    
    document.getElementById('userName').textContent = currentUser.fullName || currentUser.mobile;
    document.getElementById('totalBalance').textContent = `₹${(currentUser.walletBalance || 0).toLocaleString()}`;
    document.getElementById('investedAmount').textContent = `₹${(currentUser.totalInvested || 0).toLocaleString()}`;
    document.getElementById('returnsAmount').textContent = `₹${(currentUser.totalReturns || 0).toLocaleString()}`;
    
    const gainPercent = currentUser.totalInvested > 0 ? ((currentUser.totalReturns / currentUser.totalInvested) * 100).toFixed(1) : 0;
    const gainElement = document.getElementById('todayGain');
    if (currentUser.totalReturns >= 0) {
        gainElement.innerHTML = `<i class="fas fa-arrow-up"></i> +₹${(currentUser.totalReturns || 0).toLocaleString()} (${gainPercent}%)`;
        gainElement.className = 'portfolio-change positive';
    } else {
        gainElement.innerHTML = `<i class="fas fa-arrow-down"></i> ₹${Math.abs(currentUser.totalReturns || 0).toLocaleString()} (${gainPercent}%)`;
        gainElement.className = 'portfolio-change negative';
    }
}

// Save user data to localStorage (for persistence)
function saveUserToLocalStorage(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

// Initialize dashboard
async function initDashboard() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    
    // Fetch fresh user data from API
    currentUser = await fetchCurrentUser();
    if (!currentUser) {
        // If API fails, fallback to localStorage
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            window.location.href = 'index.html';
            return;
        }
    }
    
    // Save to localStorage for persistence
    saveUserToLocalStorage(currentUser);
    
    // Set current date
    const today = new Date();
    const options = { day: 'numeric', month: 'short' };
    document.getElementById('currentDate').textContent = today.toLocaleDateString('en-US', options);
    
    // Update display
    updateDashboardDisplay();
    
    // Fetch and display plans
    await fetchPlansFromAPI();
    initCategories();
    
    // Telegram Button
    document.getElementById('telegramBtn')?.addEventListener('click', openTelegram);
    
    // Balance Toggle
    let balanceVisible = true;
    document.getElementById('toggleBalance')?.addEventListener('click', function() {
        const balanceEl = document.getElementById('totalBalance');
        if (balanceVisible) {
            balanceEl.textContent = '••••••';
            this.classList.remove('fa-eye');
            this.classList.add('fa-eye-slash');
        } else {
            updateDashboardDisplay();
            this.classList.remove('fa-eye-slash');
            this.classList.add('fa-eye');
        }
        balanceVisible = !balanceVisible;
    });
}

// Refresh user data (call after recharge/invest)
async function refreshUserData() {
    currentUser = await fetchCurrentUser();
    if (currentUser) {
        saveUserToLocalStorage(currentUser);
        updateDashboardDisplay();
    }
}

function initCategories() {
    const categories = ['silver', 'gold', 'platinum'];
    const categoryNames = { silver: 'Silver', gold: 'Gold', platinum: 'Platinum' };
    
    const tabsContainer = document.getElementById('categoryTabs');
    const schemesContainer = document.getElementById('schemesContainer');
    
    if (!tabsContainer || !schemesContainer) return;
    
    // Clear existing content
    tabsContainer.innerHTML = '';
    schemesContainer.innerHTML = '';
    
    categories.forEach((cat, index) => {
        // Create tab
        const tab = document.createElement('button');
        tab.className = `category-tab ${index === 0 ? 'active' : ''}`;
        tab.textContent = categoryNames[cat];
        tab.dataset.category = cat;
        tab.onclick = () => switchCategory(cat);
        tabsContainer.appendChild(tab);
        
        // Create schemes container
        const container = document.createElement('div');
        container.className = `schemes-container ${index === 0 ? 'active' : ''}`;
        container.id = `${cat}Schemes`;
        
        const categoryPlans = investmentPlans[cat] || [];
        
        if (categoryPlans.length === 0) {
            container.innerHTML = `
                <div class="scheme-card" style="text-align: center; padding: 2rem;">
                    <p>No investment plans available in this category yet.</p>
                    <p style="font-size: 0.8rem; color: #64748b;">Check back soon!</p>
                </div>
            `;
        } else {
            categoryPlans.forEach(plan => {
                container.appendChild(createSchemeCard(plan, cat));
            });
        }
        
        schemesContainer.appendChild(container);
    });
}

function createSchemeCard(plan, category) {
    const card = document.createElement('div');
    card.className = 'scheme-card';
    card.innerHTML = `
        <div class="scheme-header">
            <h4>${plan.name}</h4>
            <span class="scheme-badge">${plan.risk}</span>
        </div>
        <div class="scheme-details">
            <div class="scheme-detail-item">
                <span class="detail-label">Min Investment</span>
                <span class="detail-value">₹${plan.minInvestment.toLocaleString()}</span>
            </div>
            <div class="scheme-detail-item">
                <span class="detail-label">Expected Returns</span>
                <span class="detail-value positive">${plan.expectedReturns}</span>
            </div>
            <div class="scheme-detail-item">
                <span class="detail-label">Duration</span>
                <span class="detail-value">${plan.duration}</span>
            </div>
            <div class="scheme-detail-item">
                <span class="detail-label">Category</span>
                <span class="detail-value">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
            </div>
        </div>
        <button class="invest-btn" onclick="processInvestment('${plan._id}', ${plan.minInvestment}, '${plan.name}')">
            Invest Now <i class="fas fa-arrow-right"></i>
        </button>
    `;
    return card;
}

async function processInvestment(planId, minAmount, planName) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login again');
        window.location.href = 'index.html';
        return;
    }
    
    // Check if user has sufficient balance
    if ((currentUser.walletBalance || 0) < minAmount) {
        showToast(`Insufficient balance! Need ₹${minAmount.toLocaleString()}. Please recharge.`);
        return;
    }
    
    // Confirm investment
    if (confirm(`Do you want to invest ₹${minAmount.toLocaleString()} in ${planName}?`)) {
        try {
            const response = await fetch(`${API_URL}/api/invest/buy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ planId })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showToast(result.message);
                // Refresh user data to update wallet balance
                await refreshUserData();
            } else {
                showToast(result.message || 'Investment failed');
            }
        } catch (error) {
            console.error('Investment error:', error);
            showToast('Failed to process investment. Please try again.');
        }
    }
}

function switchCategory(category) {
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.category === category) {
            tab.classList.add('active');
        }
    });
    
    document.querySelectorAll('.schemes-container').forEach(container => {
        container.classList.remove('active');
    });
    document.getElementById(`${category}Schemes`).classList.add('active');
}

function openTelegram() {
    window.open('https://t.me/investpro', '_blank');
    showToast('Opening Telegram channel...');
}

function showToast(message) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Start the dashboard
initDashboard();