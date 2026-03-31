document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    const mobileInput = document.getElementById('mobile');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.querySelector('button[type="submit"]');

    const toggleIcon = document.querySelector('.toggle-password');
    if (toggleIcon) {
        toggleIcon.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (input) {
                const type = input.type === 'password' ? 'text' : 'password';
                input.type = type;
                this.classList.toggle('fa-eye');
                this.classList.toggle('fa-eye-slash');
            }
        });
    }

    mobileInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '').slice(0, 10);
    });

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const mobile = mobileInput.value;
        const password = passwordInput.value;
        
        if (!mobile || mobile.length !== 10) {
            alert('Please enter a valid 10-digit mobile number');
            return;
        }
        
        if (!password) {
            alert('Please enter your password');
            return;
        }
        
        loginBtn.disabled = true;
        loginBtn.textContent = 'Logging in...';
        
        // Demo credentials
        if (mobile === '9912443052' && password === '123456') {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const demoUser = {
                mobile: '9912443052',
                name: 'Demo User',
                fullName: 'Demo User',
                walletBalance: 0,
                totalInvested: 0,
                totalReturns: 0,
                createdAt: new Date().toISOString()
            };
            
            localStorage.setItem('currentUser', JSON.stringify(demoUser));
            alert('✅ Login Successful! Welcome Demo User!');
            window.location.href = 'dashboard.html';
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
            return;
        }
        
        // Check registered users
        const users = JSON.parse(localStorage.getItem('investpro_users') || '[]');
        const user = users.find(u => u.mobile === mobile && u.password === password);
        
        if (user) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const currentUser = {
                mobile: user.mobile,
                name: user.fullName,
                fullName: user.fullName,
                walletBalance: user.walletBalance || 0,
                totalInvested: user.totalInvested || 0,
                totalReturns: user.totalReturns || 0,
                createdAt: user.createdAt
            };
            
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            alert(`✅ Login Successful! Welcome ${user.fullName}!`);
            window.location.href = 'dashboard.html';
        } else {
            alert('❌ Invalid mobile number or password');
        }
        
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
    });
});