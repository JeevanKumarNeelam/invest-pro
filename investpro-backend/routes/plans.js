const express = require('express');
const router = express.Router();
const Plan = require('../models/Plan');

// Get all active plans for website
router.get('/', async (req, res) => {
    try {
        const plans = await Plan.find({ isActive: true }).sort({ category: 1, minInvestment: 1 });
        
        const groupedPlans = {
            silver: plans.filter(p => p.category === 'silver'),
            gold: plans.filter(p => p.category === 'gold'),
            platinum: plans.filter(p => p.category === 'platinum')
        };
        
        res.json({
            success: true,
            plans: groupedPlans
        });
    } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Admin routes (you'll add these later)
router.get('/admin', async (req, res) => {
    try {
        const plans = await Plan.find().sort({ category: 1, createdAt: -1 });
        res.json({
            success: true,
            plans
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/admin', async (req, res) => {
    try {
        const { name, category, minInvestment, expectedReturns, duration, risk } = req.body;
        const plan = await Plan.create({ name, category, minInvestment, expectedReturns, duration, risk });
        res.status(201).json({ success: true, message: 'Plan created', plan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/admin/:id', async (req, res) => {
    try {
        const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, message: 'Plan updated', plan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/admin/:id', async (req, res) => {
    try {
        await Plan.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Plan deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;