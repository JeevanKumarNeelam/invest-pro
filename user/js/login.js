// API Configuration
const API_URL = 'https://investpro-api-616i.onrender.com';

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
        
        // Demo credentials (for testing)
        if (mobile === '9912443052' && password === '123456') {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const demoUser = {
                _id: 'demo123',
                fullName: 'Demo User',
                mobile: '9912443052',
                walletBalance: 12500,
                totalInvested: 10000,
                totalReturns: 2500
            };
            
            localStorage.setItem('token', 'demo_token');
            localStorage.setItem('user', JSON.stringify(demoUser));
            localStorage.setItem('currentUser', JSON.stringify(demoUser));
            
            alert('✅ Login Successful! Welcome Demo User!');
            window.location.href = 'dashboard.html';
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
            return;
        }
        
        try {
            // Send login request to Render API
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ mobile, password })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Store token and user data
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                localStorage.setItem('currentUser', JSON.stringify(result.user));
                
                alert(`✅ Login Successful! Welcome ${result.user.fullName || result.user.mobile}!`);
                window.location.href = 'dashboard.html';
            } else {
                alert(result.message || '❌ Invalid mobile number or password');
            }
            
        } catch (error) {
            console.error('Error:', error);
            alert('Connection error. Please check your internet and try again.');
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
        }
    });
});