const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id, mobile) => {
    return jwt.sign(
        { id, mobile },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// @desc    Register User
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { fullName, mobile, password, withdrawalPassword, invitationCode } = req.body;

        // Check if user already exists
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
            invitationCode: invitationCode || null
        });

        if (user) {
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
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid user data'
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Login User
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { mobile, password } = req.body;

        // Find user by mobile
        const user = await User.findOne({ mobile });
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid mobile number or password'
            });
        }

        // Check password
        const isPasswordMatch = await user.comparePassword(password);
        
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid mobile number or password'
            });
        }

        // Generate token
        const token = generateToken(user._id, user.mobile);

        res.json({
            success: true,
            message: 'Login successful',
            token,
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
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get Current User Profile
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -withdrawalPassword');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getCurrentUser
};