const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Debug environment
console.log('🔧 Environment Check:');
console.log('PORT:', process.env.PORT || '5000');
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length || 'using fallback');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/plans', require('./routes/plans'));

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'InvestPro API is running...' });
});

// Error handler
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
    console.log(`📍 http://localhost:${PORT}`);
});