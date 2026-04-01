const express = require('express');
const router = express.Router();
const Plan = require('../models/Plan');

// Public: Get all active plans for website
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

module.exports = router;