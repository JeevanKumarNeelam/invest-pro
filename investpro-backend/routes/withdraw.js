const express = require('express');
const router = express.Router();
const Withdraw = require('../models/Withdraw');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// User: Create withdraw request
router.post('/request', protect, async (req, res) => {
    try {
        const { amount, upiId } = req.body;
        const user = req.user;

        if (amount < 100) {
            return res.status(400).json({
                success: false,
                message: 'Minimum withdrawal amount is ₹100'
            });
        }

        if (user.walletBalance < amount) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance'
            });
        }

        // Deduct immediately
        user.walletBalance -= amount;
        await user.save();

        const withdrawRequest = await Withdraw.create({
            userId: user._id,
            userMobile: user.mobile,
            userName: user.fullName,
            amount,
            upiId,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: 'Withdrawal request submitted! Waiting for admin approval.',
            request: withdrawRequest,
            newBalance: user.walletBalance
        });
    } catch (error) {
        console.error('Withdraw error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;