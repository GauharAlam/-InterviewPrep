const express = require('express');
const { protect } = require('../middlewares/auth');
const { generateQuestions } = require('../services/aiService');

const router = express.Router();

// POST /api/questions/generate
router.post('/generate', protect, async (req, res) => {
    try {
        const { role, level, skills } = req.body;

        if (!role || !level) {
            return res.status(400).json({ message: 'Role and experience level are required' });
        }

        const questions = await generateQuestions({ role, level, skills });
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
