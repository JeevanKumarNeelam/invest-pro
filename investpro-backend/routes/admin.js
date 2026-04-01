const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Plan = require('../models/Plan');
const Recharge = require('../models/Recharge');
const Withdraw = require('../models/Withdraw');

// ============ DASHBOARD STATS ============
router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const pendingRecharge = await Recharge.countDocuments({ status: 'pending' });
        const pendingWithdraw = await Withdraw.countDocuments({ status: 'pending' });
        
        const users = await User.find();
        let totalVolume = 0;
        users.forEach(u => totalVolume += (u.walletBalance || 0));
        
        res.json({
            success: true,
            stats: { totalUsers, totalVolume, pendingRecharge, pendingWithdraw }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============ USER MANAGEMENT ============
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password -withdrawalPassword').sort({ createdAt: -1 });
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.put('/users/:id', async (req, res) => {
    try {
        const { fullName, walletBalance, totalInvested, totalReturns } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { fullName, walletBalance, totalInvested, totalReturns },
            { new: true }
        ).select('-password -withdrawalPassword');
        
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, message: 'User updated', user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.delete('/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============ PLAN MANAGEMENT ============
router.get('/plans', async (req, res) => {
    try {
        const plans = await Plan.find().sort({ category: 1, createdAt: -1 });
        res.json({ success: true, plans });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/plans', async (req, res) => {
    try {
        const { name, category, minInvestment, expectedReturns, duration, risk } = req.body;
        const plan = await Plan.create({ name, category, minInvestment, expectedReturns, duration, risk, isActive: true });
        res.status(201).json({ success: true, message: 'Plan created', plan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/plans/:id', async (req, res) => {
    try {
        const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
        res.json({ success: true, message: 'Plan updated', plan });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.delete('/plans/:id', async (req, res) => {
    try {
        await Plan.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Plan deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============ RECHARGE MANAGEMENT ============
router.get('/recharge', async (req, res) => {
    try {
        const requests = await Recharge.find().sort({ requestedAt: -1 });
        res.json({ success: true, requests });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.put('/recharge/:id/approve', async (req, res) => {
    try {
        const request = await Recharge.findById(req.params.id);
        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
        
        request.status = 'approved';
        request.processedAt = new Date();
        await request.save();
        
        const user = await User.findById(request.userId);
        if (user) {
            user.walletBalance += request.amount;
            await user.save();
        }
        
        res.json({ success: true, message: 'Recharge approved! Amount added to wallet.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.put('/recharge/:id/reject', async (req, res) => {
    try {
        const request = await Recharge.findById(req.params.id);
        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
        
        request.status = 'rejected';
        request.processedAt = new Date();
        await request.save();
        
        res.json({ success: true, message: 'Recharge rejected.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============ WITHDRAW MANAGEMENT ============
router.get('/withdraw', async (req, res) => {
    try {
        const requests = await Withdraw.find().sort({ requestedAt: -1 });
        res.json({ success: true, requests });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.put('/withdraw/:id/approve', async (req, res) => {
    try {
        const request = await Withdraw.findById(req.params.id);
        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
        
        request.status = 'approved';
        request.processedAt = new Date();
        await request.save();
        
        res.json({ success: true, message: 'Withdrawal approved!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.put('/withdraw/:id/reject', async (req, res) => {
    try {
        const request = await Withdraw.findById(req.params.id);
        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
        
        const user = await User.findById(request.userId);
        if (user) {
            user.walletBalance += request.amount;
            await user.save();
        }
        
        request.status = 'rejected';
        request.processedAt = new Date();
        await request.save();
        
        res.json({ success: true, message: 'Withdrawal rejected! Amount refunded.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;