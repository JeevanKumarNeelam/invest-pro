const express = require('express');
const router = express.Router();
const Plan = require('../models/Plan');

// ============ PUBLIC ROUTES (For Website) ============

// @desc    Get all active plans for website
// @route   GET /api/plans
// @access  Public
router.get('/', async (req, res) => {
    try {
        const plans = await Plan.find({ isActive: true }).sort({ category: 1, minInvestment: 1 });
        
        // Group plans by category for easy display on website
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
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ============ ADMIN ROUTES (For Admin Panel) ============

// @desc    Get all plans for admin
// @route   GET /api/admin/plans
// @access  Admin
router.get('/admin', async (req, res) => {
    try {
        const plans = await Plan.find().sort({ category: 1, createdAt: -1 });
        res.json({
            success: true,
            plans
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Create new plan
// @route   POST /api/admin/plans
// @access  Admin
router.post('/admin', async (req, res) => {
    try {
        const { name, category, minInvestment, expectedReturns, duration, risk } = req.body;
        
        const plan = await Plan.create({
            name,
            category,
            minInvestment,
            expectedReturns,
            duration,
            risk
        });
        
        res.status(201).json({
            success: true,
            message: 'Plan created successfully',
            plan
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

// @desc    Update plan
// @route   PUT /api/admin/plans/:id
// @access  Admin
router.put('/admin/:id', async (req, res) => {
    try {
        const { name, category, minInvestment, expectedReturns, duration, risk, isActive } = req.body;
        
        const plan = await Plan.findById(req.params.id);
        
        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found'
            });
        }
        
        plan.name = name || plan.name;
        plan.category = category || plan.category;
        plan.minInvestment = minInvestment || plan.minInvestment;
        plan.expectedReturns = expectedReturns || plan.expectedReturns;
        plan.duration = duration || plan.duration;
        plan.risk = risk || plan.risk;
        plan.isActive = isActive !== undefined ? isActive : plan.isActive;
        
        await plan.save();
        
        res.json({
            success: true,
            message: 'Plan updated successfully',
            plan
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Delete plan
// @route   DELETE /api/admin/plans/:id
// @access  Admin
router.delete('/admin/:id', async (req, res) => {
    try {
        const plan = await Plan.findById(req.params.id);
        
        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found'
            });
        }
        
        await plan.deleteOne();
        
        res.json({
            success: true,
            message: 'Plan deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;