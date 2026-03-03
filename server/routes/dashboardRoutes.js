const express = require('express');
const { protect } = require('../middlewares/auth');
const { generateImprovementPlan } = require('../services/aiService');
const InterviewSession = require('../models/InterviewSession');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const Submission = require('../models/Submission');

const router = express.Router();

// GET /api/dashboard/stats
router.get('/stats', protect, async (req, res) => {
    try {
        // Get latest resume score
        const latestResume = await ResumeAnalysis.findOne({ userId: req.user._id })
            .sort({ createdAt: -1 });

        // Get average coding score
        const submissions = await Submission.find({ userId: req.user._id });
        const avgCodingScore = submissions.length > 0
            ? Math.round(submissions.reduce((sum, s) => sum + s.score, 0) / submissions.length)
            : 0;

        // Get average communication score
        const voiceSessions = await InterviewSession.find({
            userId: req.user._id,
            type: 'voice'
        });
        const avgCommScore = voiceSessions.length > 0
            ? Math.round(voiceSessions.reduce((sum, s) => sum + s.communicationScore, 0) / voiceSessions.length)
            : 0;

        // Calculate overall
        const resumeScore = latestResume?.atsScore || 0;
        const overallScore = Math.round((resumeScore + avgCodingScore + avgCommScore) / 3);

        // Get recent sessions for chart
        const recentSessions = await InterviewSession.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            resumeScore,
            codingScore: avgCodingScore,
            communicationScore: avgCommScore,
            overallScore,
            totalInterviews: submissions.length + voiceSessions.length,
            totalSubmissions: submissions.length,
            totalVoiceSessions: voiceSessions.length,
            recentSessions,
            history: {
                submissions: submissions.slice(-10).map(s => ({
                    date: s.createdAt,
                    score: s.score,
                    type: 'coding'
                })),
                voiceSessions: voiceSessions.slice(-10).map(s => ({
                    date: s.createdAt,
                    score: s.communicationScore,
                    type: 'voice'
                }))
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/dashboard/improvement-plan
router.post('/improvement-plan', protect, async (req, res) => {
    try {
        const { resumeScore, codingScore, communicationScore, overallScore } = req.body;
        const plan = await generateImprovementPlan({
            resumeScore: resumeScore || 0,
            codingScore: codingScore || 0,
            communicationScore: communicationScore || 0,
            overallScore: overallScore || 0
        });
        res.json(plan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
