const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register User
const registerUser = async (req, res) => {
    try {
        const { fullName, mobile, password, withdrawalPassword, invitationCode } = req.body;

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

        const user = await User.findOne({ mobile });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid mobile number or password'
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid mobile number or password'
            });
        }

        res.json({
            success: true,
            message: 'Login successful',
            token: generateToken(user._id),
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