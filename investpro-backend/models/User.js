const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 10,
        maxlength: 10
    },
    password: {
        type: String,
        required: true
    },
    withdrawalPassword: {
        type: String,
        required: true
    },
    invitationCode: {
        type: String,
        default: null
    },
    walletBalance: {
        type: Number,
        default: 0
    },
    totalInvested: {
        type: Number,
        default: 0
    },
    totalReturns: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Hash withdrawal password before saving
UserSchema.pre('save', async function(next) {
    if (!this.isModified('withdrawalPassword')) return next();
    
    const salt = await bcrypt.genSalt(10);
    this.withdrawalPassword = await bcrypt.hash(this.withdrawalPassword, salt);
    next();
});

// Compare password method
UserSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);