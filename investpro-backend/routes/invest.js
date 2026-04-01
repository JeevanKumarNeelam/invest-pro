const express = require('express');
const router = express.Router();
const Investment = require('../models/Investment');
const User = require('../models/User');
const Plan = require('../models/Plan');
const { protect } = require('../middleware/auth');

// User: Buy investment plan
router.post('/buy', protect, async (req, res) => {
    try {
        const { planId } = req.body;
        const user = req.user;

        const plan = await Plan.findById(planId);
        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found'
            });
        }

        if (user.walletBalance < plan.minInvestment) {
            return res.status(400).json({
                success: false,
                message: `Insufficient balance. Need ₹${plan.minInvestment}`
            });
        }

        // Calculate expected returns
        const returnRange = plan.expectedReturns.replace('%', '').split('-');
        const avgReturn = (parseInt(returnRange[0]) + parseInt(returnRange[1])) / 2;
        const expectedReturnAmount = (plan.minInvestment * avgReturn) / 100;

        // Deduct from wallet
        user.walletBalance -= plan.minInvestment;
        user.totalInvested += plan.minInvestment;
        user.totalReturns += expectedReturnAmount;
        await user.save();

        // Create investment record
        await Investment.create({
            userId: user._id,
            userMobile: user.mobile,
            userName: user.fullName,
            planId: plan._id,
            planName: plan.name,
            amount: plan.minInvestment,
            expectedReturns: expectedReturnAmount,
            status: 'active'
        });

        res.json({
            success: true,
            message: `Successfully invested ₹${plan.minInvestment} in ${plan.name}`,
            newBalance: user.walletBalance
        });
    } catch (error) {
        console.error('Investment error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;