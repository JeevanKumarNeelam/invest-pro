// API Configuration
const API_URL = 'https://investpro-api-616i.onrender.com';

let currentUser = null;
let investmentPlans = { silver: [], gold: [], platinum: [] };

// Fetch plans from backend API
async function fetchPlansFromAPI() {
    try {
        const response = await fetch(`${API_URL}/api/plans`);
        const data = await response.json();
        
        if (data.success) {
            investmentPlans = data.plans;
            console.log('Plans loaded:', investmentPlans);
        } else {
            console.error('Failed to fetch plans');
        }
    } catch (error) {
        console.error('Error fetching plans:', error);
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is logged in
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // Fetch plans from API first
    await fetchPlansFromAPI();
    
    // Set user name
    document.getElementById('userName').textContent = currentUser.fullName || currentUser.name || currentUser.mobile;
    
    // Set current date
    const today = new Date();
    const options = { day: 'numeric', month: 'short' };
    document.getElementById('currentDate').textContent = today.toLocaleDateString('en-US', options);
    
    // Update portfolio display
    updatePortfolioDisplay();
    
    // Initialize investment categories with fetched plans
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
            updatePortfolioDisplay();
            this.classList.remove('fa-eye-slash');
            this.classList.add('fa-eye');
        }
        balanceVisible = !balanceVisible;
    });
});

function updatePortfolioDisplay() {
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

function saveUserData() {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Also update in users array
    const allUsers = JSON.parse(localStorage.getItem('investpro_users') || '[]');
    const userIndex = allUsers.findIndex(u => u.mobile === currentUser.mobile);
    if (userIndex !== -1) {
        allUsers[userIndex].walletBalance = currentUser.walletBalance;
        allUsers[userIndex].totalInvested = currentUser.totalInvested;
        allUsers[userIndex].totalReturns = currentUser.totalReturns;
        localStorage.setItem('investpro_users', JSON.stringify(allUsers));
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
        <button class="invest-btn" onclick="processInvestment('${plan.name}', ${plan.minInvestment})">
            Invest Now <i class="fas fa-arrow-right"></i>
        </button>
    `;
    return card;
}

function processInvestment(schemeName, minAmount) {
    // Check if user has sufficient balance
    if ((currentUser.walletBalance || 0) < minAmount) {
        showToast(`Insufficient balance! Need ₹${minAmount.toLocaleString()}. Please recharge.`);
        return;
    }
    
    // Confirm investment
    if (confirm(`Do you want to invest ₹${minAmount.toLocaleString()} in ${schemeName}?`)) {
        // Deduct from wallet
        currentUser.walletBalance = (currentUser.walletBalance || 0) - minAmount;
        currentUser.totalInvested = (currentUser.totalInvested || 0) + minAmount;
        
        // Calculate expected returns
        const scheme = findScheme(schemeName);
        if (scheme) {
            const returnRange = scheme.expectedReturns.replace('%', '').split('-');
            const avgReturn = (parseInt(returnRange[0]) + parseInt(returnRange[1])) / 2;
            const expectedReturn = (minAmount * avgReturn) / 100;
            currentUser.totalReturns = (currentUser.totalReturns || 0) + expectedReturn;
        }
        
        // Save updated data
        saveUserData();
        
        // Update display
        updatePortfolioDisplay();
        
        // Create investment record
        const investmentRecord = {
            id: Date.now(),
            userId: currentUser.mobile,
            userName: currentUser.fullName,
            schemeName: schemeName,
            amount: minAmount,
            investedAt: new Date().toISOString(),
            status: 'active'
        };
        
        let investments = JSON.parse(localStorage.getItem('investments') || '[]');
        investments.push(investmentRecord);
        localStorage.setItem('investments', JSON.stringify(investments));
        
        showToast(`✅ Successfully invested ₹${minAmount.toLocaleString()} in ${schemeName}`);
    }
}

function findScheme(schemeName) {
    for (const category in investmentPlans) {
        const found = investmentPlans[category].find(p => p.name === schemeName);
        if (found) return found;
    }
    return null;
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