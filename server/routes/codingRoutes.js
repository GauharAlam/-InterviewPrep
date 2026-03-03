const express = require('express');
const { protect } = require('../middlewares/auth');
const CodingProblem = require('../models/CodingProblem');

const router = express.Router();

// GET /api/coding/problems — List all curated problems with optional filters
router.get('/problems', protect, async (req, res) => {
    try {
        const { difficulty, topic, company, platform, search } = req.query;
        const filter = {};

        if (difficulty) filter.difficulty = difficulty;
        if (topic) filter.topic = topic;
        if (platform) filter.platform = platform;
        if (company) filter.companyTags = { $in: [company] };
        if (search) filter.title = { $regex: search, $options: 'i' };

        const problems = await CodingProblem.find(filter).sort({ difficulty: 1, topic: 1 });
        res.json(problems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/coding/topics — Get distinct topics for filter dropdown
router.get('/topics', protect, async (req, res) => {
    try {
        const topics = await CodingProblem.distinct('topic');
        res.json(topics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/coding/companies — Get distinct company tags for filter dropdown
router.get('/companies', protect, async (req, res) => {
    try {
        const companies = await CodingProblem.distinct('companyTags');
        res.json(companies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
