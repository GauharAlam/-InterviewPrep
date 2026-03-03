const express = require('express');
const { protect } = require('../middlewares/auth');
const { generatePracticeQuestion, evaluatePracticeAnswer } = require('../services/aiService');

const router = express.Router();

// POST /api/practice/question — Generate a practice question
router.post('/question', protect, async (req, res) => {
    try {
        const { topic, difficulty, company, previousQuestions } = req.body;
        if (!topic || !difficulty) {
            return res.status(400).json({ message: 'Topic and difficulty are required' });
        }
        const question = await generatePracticeQuestion({ topic, difficulty, company, previousQuestions });
        res.json(question);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/practice/evaluate — Evaluate a student's answer
router.post('/evaluate', protect, async (req, res) => {
    try {
        const { question, answer, topic, difficulty } = req.body;
        if (!question || !answer) {
            return res.status(400).json({ message: 'Question and answer are required' });
        }
        const evaluation = await evaluatePracticeAnswer({ question, answer, topic, difficulty });
        res.json(evaluation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
