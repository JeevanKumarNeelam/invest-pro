document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const form = document.getElementById('registerForm');
    const nameInput = document.getElementById('fullName');
    const mobileInput = document.getElementById('mobile');
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');
    const withdrawalInput = document.getElementById('withdrawalPassword');
    const registerBtn = document.querySelector('button[type="submit"]');

    // Error elements
    const nameError = document.getElementById('nameError');
    const mobileError = document.getElementById('mobileError');
    const passwordError = document.getElementById('passwordError');
    const confirmError = document.getElementById('confirmError');
    const withdrawalError = document.getElementById('withdrawalError');

    // Password visibility toggle
    const toggleIcons = document.querySelectorAll('.toggle-password');
    toggleIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (input) {
                const type = input.type === 'password' ? 'text' : 'password';
                input.type = type;
                this.classList.toggle('fa-eye');
                this.classList.toggle('fa-eye-slash');
            }
        });
    });

    // Name validation
    function validateName() {
        const name = nameInput.value.trim();
        if (name.length === 0) {
            nameError.textContent = '';
            nameInput.classList.remove('error', 'success');
            return false;
        }
        if (name.length < 2) {
            nameError.textContent = 'Name must be at least 2 characters';
            nameInput.classList.add('error');
            nameInput.classList.remove('success');
            return false;
        }
        nameError.textContent = '';
        nameInput.classList.remove('error');
        nameInput.classList.add('success');
        return true;
    }

    nameInput.addEventListener('input', validateName);
    nameInput.addEventListener('blur', validateName);

    // Mobile number validation
    mobileInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '').slice(0, 10);
        validateMobile();
    });
    mobileInput.addEventListener('blur', validateMobile);

    function validateMobile() {
        const mobile = mobileInput.value;
        if (mobile.length === 0) {
            mobileError.textContent = '';
            mobileInput.classList.remove('error', 'success');
            return false;
        }
        if (mobile.length !== 10) {
            mobileError.textContent = 'Mobile number must be exactly 10 digits';
            mobileInput.classList.add('error');
            mobileInput.classList.remove('success');
            return false;
        }
        mobileError.textContent = '';
        mobileInput.classList.remove('error');
        mobileInput.classList.add('success');
        return true;
    }

    // Password validation
    passwordInput.addEventListener('input', validatePassword);
    passwordInput.addEventListener('blur', validatePassword);

    function validatePassword() {
        const password = passwordInput.value;
        if (password.length === 0) {
            passwordError.textContent = '';
            passwordInput.classList.remove('error', 'success');
            return false;
        }
        if (password.length < 6) {
            passwordError.textContent = 'Password must be at least 6 characters';
            passwordInput.classList.add('error');
            passwordInput.classList.remove('success');
            return false;
        }
        passwordError.textContent = '';
        passwordInput.classList.remove('error');
        passwordInput.classList.add('success');
        
        if (confirmInput.value) validateConfirm();
        return true;
    }

    // Confirm password validation
    confirmInput.addEventListener('input', validateConfirm);
    confirmInput.addEventListener('blur', validateConfirm);

    function validateConfirm() {
        const password = passwordInput.value;
        const confirm = confirmInput.value;
        
        if (confirm.length === 0) {
            confirmError.textContent = '';
            confirmInput.classList.remove('error', 'success');
            return false;
        }
        if (password !== confirm) {
            confirmError.textContent = 'Passwords do not match';
            confirmInput.classList.add('error');
            confirmInput.classList.remove('success');
            return false;
        }
        confirmError.textContent = '';
        confirmInput.classList.remove('error');
        confirmInput.classList.add('success');
        return true;
    }

    // Withdrawal password validation
    withdrawalInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '').slice(0, 6);
        validateWithdrawal();
    });
    withdrawalInput.addEventListener('blur', validateWithdrawal);

    function validateWithdrawal() {
        const withdrawal = withdrawalInput.value;
        if (withdrawal.length === 0) {
            withdrawalError.textContent = '';
            withdrawalInput.classList.remove('error', 'success');
            return false;
        }
        if (withdrawal.length < 4) {
            withdrawalError.textContent = 'Withdrawal password must be at least 4 digits';
            withdrawalInput.classList.add('error');
            withdrawalInput.classList.remove('success');
            return false;
        }
        withdrawalError.textContent = '';
        withdrawalInput.classList.remove('error');
        withdrawalInput.classList.add('success');
        return true;
    }

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const isNameValid = validateName();
        const isMobileValid = validateMobile();
        const isPasswordValid = validatePassword();
        const isConfirmValid = validateConfirm();
        const isWithdrawalValid = validateWithdrawal();
        
        if (!isNameValid) {
            nameInput.focus();
            alert('Please enter your full name');
            return;
        }
        
        if (!isMobileValid) {
            mobileInput.focus();
            alert('Please enter a valid 10-digit mobile number');
            return;
        }
        
        if (!isPasswordValid) {
            passwordInput.focus();
            alert('Password must be at least 6 characters');
            return;
        }
        
        if (!isConfirmValid) {
            confirmInput.focus();
            alert('Passwords do not match');
            return;
        }
        
        if (!isWithdrawalValid) {
            withdrawalInput.focus();
            alert('Withdrawal password must be at least 4 digits');
            return;
        }
        
        // Prepare user data for MongoDB
        const userData = {
            fullName: nameInput.value.trim(),
            mobile: mobileInput.value,
            password: passwordInput.value, // Will be hashed in backend
            withdrawalPassword: withdrawalInput.value, // Will be hashed in backend
            invitationCode: document.getElementById('invitationCode').value || null,
            walletBalance: 0,
            totalInvested: 0,
            totalReturns: 0,
            createdAt: new Date().toISOString()
        };
        
        registerBtn.disabled = true;
        registerBtn.textContent = 'Creating Account...';
        
        try {
            // Store user data in localStorage for now (will connect to MongoDB later)
            // This is temporary - backend will handle this
            const existingUsers = JSON.parse(localStorage.getItem('investpro_users') || '[]');
            
            // Check if mobile already exists
            if (existingUsers.some(u => u.mobile === userData.mobile)) {
                alert('Mobile number already registered. Please login.');
                window.location.href = 'index.html';
                return;
            }
            
            existingUsers.push(userData);
            localStorage.setItem('investpro_users', JSON.stringify(existingUsers));
            
            // Store current user session
            localStorage.setItem('currentUser', JSON.stringify({
                mobile: userData.mobile,
                name: userData.fullName,
                walletBalance: 0
            }));
            
            alert(`✅ Registration Successful!\n\nWelcome ${userData.fullName}!\n\nRedirecting to login...`);
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } catch (error) {
            alert('Registration failed. Please try again.');
            console.error('Error:', error);
        } finally {
            registerBtn.disabled = false;
            registerBtn.textContent = 'Register';
        }
    });
});