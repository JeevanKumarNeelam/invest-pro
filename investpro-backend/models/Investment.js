const mongoose = require('mongoose');

const InvestmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userMobile: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
        required: true
    },
    planName: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    expectedReturns: {
        type: Number,
        default: 0
    },
    investedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'completed'],
        default: 'active'
    }
});

module.exports = mongoose.model('Investment', InvestmentSchema);