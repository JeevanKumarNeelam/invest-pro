const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['silver', 'gold', 'platinum'],
        default: 'silver'
    },
    minInvestment: {
        type: Number,
        required: true,
        min: 100
    },
    expectedReturns: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    risk: {
        type: String,
        required: true,
        enum: ['Low', 'Medium', 'High'],
        default: 'Low'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Plan', PlanSchema);    