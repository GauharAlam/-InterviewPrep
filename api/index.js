const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('../server/config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', require('../server/routes/authRoutes'));
app.use('/api/resume', require('../server/routes/resumeRoutes'));
app.use('/api/questions', require('../server/routes/questionRoutes'));
app.use('/api/coding', require('../server/routes/codingRoutes'));
app.use('/api/voice', require('../server/routes/voiceRoutes'));
app.use('/api/dashboard', require('../server/routes/dashboardRoutes'));
app.use('/api/admin', require('../server/routes/adminRoutes'));
app.use('/api/leaderboard', require('../server/routes/leaderboardRoutes'));
app.use('/api/study-plan', require('../server/routes/studyPlanRoutes'));
app.use('/api/companies', require('../server/routes/companyRoutes'));
app.use('/api/practice', require('../server/routes/practiceRoutes'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;
