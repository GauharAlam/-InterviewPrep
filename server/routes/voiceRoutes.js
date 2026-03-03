const express = require('express');
const { protect } = require('../middlewares/auth');
const { analyzeVoiceAnswer, mockInterviewChat, generateInterviewScorecard } = require('../services/aiService');
const InterviewSession = require('../models/InterviewSession');

const router = express.Router();

// POST /api/voice/analyze
router.post('/analyze', protect, async (req, res) => {
    try {
        const { transcribedText, question } = req.body;

        if (!transcribedText || !question) {
            return res.status(400).json({ message: 'Transcribed text and question are required' });
        }

        const analysis = await analyzeVoiceAnswer(transcribedText, question);

        await InterviewSession.create({
            userId: req.user._id,
            type: 'voice',
            communicationScore: analysis.overallScore,
            overallScore: analysis.overallScore,
            feedback: analysis.feedback,
            details: analysis
        });

        res.json(analysis);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/voice/mock-chat — Smart mock interview with config
router.post('/mock-chat', protect, async (req, res) => {
    try {
        const { messages, role, config } = req.body;
        const response = await mockInterviewChat(
            messages || [],
            role || 'Full Stack Developer',
            config || {}
        );

        const isComplete = response.includes('[INTERVIEW_COMPLETE]');
        const cleanResponse = response.replace('[INTERVIEW_COMPLETE]', '').trim();

        res.json({
            response: cleanResponse,
            isComplete
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/voice/scorecard — Generate final interview scorecard
router.post('/scorecard', protect, async (req, res) => {
    try {
        const { messages, role } = req.body;

        if (!messages || messages.length < 4) {
            return res.status(400).json({ message: 'Need at least a few exchanges to generate a scorecard' });
        }

        const scorecard = await generateInterviewScorecard(messages, role || 'Full Stack Developer');

        // Save as interview session
        await InterviewSession.create({
            userId: req.user._id,
            type: 'mock',
            communicationScore: scorecard.categories?.communication?.score * 10 || 0,
            codingScore: scorecard.categories?.technicalKnowledge?.score * 10 || 0,
            overallScore: scorecard.overallScore,
            feedback: scorecard.overallFeedback,
            improvementPlan: scorecard.topicsToStudy?.map(topic => ({
                area: topic,
                suggestion: `Study and practice ${topic}`,
                priority: 'high'
            })) || [],
            details: scorecard
        });

        res.json(scorecard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/voice/history
router.get('/history', protect, async (req, res) => {
    try {
        const sessions = await InterviewSession.find({
            userId: req.user._id,
            type: { $in: ['voice', 'mock'] }
        }).sort({ createdAt: -1 });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
