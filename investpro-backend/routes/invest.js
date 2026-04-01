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

        console.log('Investment request - User:', user.mobile, 'Plan:', planId);

        // Find the plan
        const plan = await Plan.findById(planId);
        if (!plan) {
            console.log('Plan not found:', planId);
            return res.status(404).json({
                success: false,
                message: 'Plan not found'
            });
        }

        console.log('Plan found:', plan.name, 'Min Investment:', plan.minInvestment);
        console.log('User wallet balance:', user.walletBalance);

        // Check balance
        if ((user.walletBalance || 0) < plan.minInvestment) {
            return res.status(400).json({
                success: false,
                message: `Insufficient balance. Need ₹${plan.minInvestment}. Your balance: ₹${user.walletBalance || 0}`
            });
        }

        // Calculate expected returns (average of range)
        let expectedReturnAmount = 0;
        if (plan.expectedReturns) {
            const returnRange = plan.expectedReturns.replace('%', '').split('-');
            if (returnRange.length === 2) {
                const avgReturn = (parseInt(returnRange[0]) + parseInt(returnRange[1])) / 2;
                expectedReturnAmount = (plan.minInvestment * avgReturn) / 100;
            } else {
                const singleReturn = parseInt(plan.expectedReturns.replace('%', ''));
                expectedReturnAmount = (plan.minInvestment * singleReturn) / 100;
            }
        }

        console.log('Expected returns:', expectedReturnAmount);

        // Deduct from wallet and update totals
        user.walletBalance -= plan.minInvestment;
        user.totalInvested = (user.totalInvested || 0) + plan.minInvestment;
        user.totalReturns = (user.totalReturns || 0) + expectedReturnAmount;
        await user.save();

        console.log('User updated - New balance:', user.walletBalance);

        // Create investment record
        const investment = await Investment.create({
            userId: user._id,
            userMobile: user.mobile,
            userName: user.fullName,
            planId: plan._id,
            planName: plan.name,
            amount: plan.minInvestment,
            expectedReturns: expectedReturnAmount,
            status: 'active'
        });

        console.log('Investment created:', investment._id);

        res.json({
            success: true,
            message: `Successfully invested ₹${plan.minInvestment.toLocaleString()} in ${plan.name}`,
            investment,
            newBalance: user.walletBalance
        });

    } catch (error) {
        console.error('Investment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
});

// User: Get my investments
router.get('/my-investments', protect, async (req, res) => {
    try {
        const investments = await Investment.find({ userId: req.user._id }).sort({ investedAt: -1 });
        res.json({
            success: true,
            investments
        });
    } catch (error) {
        console.error('Error fetching investments:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;