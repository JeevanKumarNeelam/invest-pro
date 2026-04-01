const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// JWT Secret with fallback
const JWT_SECRET = process.env.JWT_SECRET || 'investpro_super_secret_key_2025';

// Generate JWT Token
const generateToken = (id) => {
    console.log('Generating token for user:', id);
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
};

// Register User
const registerUser = async (req, res) => {
    try {
        const { fullName, mobile, password, withdrawalPassword, invitationCode } = req.body;

        console.log('Registration attempt for:', mobile);

        // Check if user exists
        const userExists = await User.findOne({ mobile });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'Mobile number already registered'
            });
        }

        // Create user
        const user = await User.create({
            fullName,
            mobile,
            password,
            withdrawalPassword,
            invitationCode: invitationCode || null,
            walletBalance: 0,
            totalInvested: 0,
            totalReturns: 0
        });

        console.log('User created successfully:', user._id);

        res.status(201).json({
            success: true,
            message: 'Registration successful! Please login.',
            user: {
                id: user._id,
                fullName: user.fullName,
                mobile: user.mobile,
                walletBalance: user.walletBalance
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
};

// Login User
const loginUser = async (req, res) => {
    try {
        const { mobile, password } = req.body;

        console.log('Login attempt for mobile:', mobile);

        const user = await User.findOne({ mobile });
        if (!user) {
            console.log('User not found:', mobile);
            return res.status(401).json({
                success: false,
                message: 'Invalid mobile number or password'
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Password mismatch for:', mobile);
            return res.status(401).json({
                success: false,
                message: 'Invalid mobile number or password'
            });
        }

        const token = generateToken(user._id);
        console.log('Login successful for:', mobile);

        res.json({
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                id: user._id,
                fullName: user.fullName,
                mobile: user.mobile,
                walletBalance: user.walletBalance,
                totalInvested: user.totalInvested,
                totalReturns: user.totalReturns
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
};

// Get Current User
const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -withdrawalPassword');
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { registerUser, loginUser, getCurrentUser };