const express = require('express');
const router = express.Router();
const Recharge = require('../models/Recharge');
const { protect } = require('../middleware/auth');

// User: Create recharge request
router.post('/request', protect, async (req, res) => {
    try {
        const { amount, giftCardCode, giftCardValue } = req.body;
        const user = req.user;

        if (amount < 100) {
            return res.status(400).json({
                success: false,
                message: 'Minimum recharge amount is ₹100'
            });
        }

        const rechargeRequest = await Recharge.create({
            userId: user._id,
            userMobile: user.mobile,
            userName: user.fullName,
            amount,
            giftCardCode,
            giftCardValue,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: 'Recharge request submitted! Waiting for admin approval.',
            request: rechargeRequest
        });
    } catch (error) {
        console.error('Recharge error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;