const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/database');

dotenv.config();

console.log('🔧 Environment Check:');
console.log('PORT:', process.env.PORT || '5000');
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/recharge', require('./routes/recharge'));
app.use('/api/withdraw', require('./routes/withdraw'));
app.use('/api/invest', require('./routes/invest'));

app.get('/', (req, res) => {
    res.json({ message: 'InvestPro API is running...' });
});

app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ 
        success: false, 
        message: err.message || 'Something went wrong!' 
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});