const express = require('express');
const { protect } = require('../middlewares/auth');
const { generateCompanyProfile } = require('../services/aiService');
const Company = require('../models/Company');
const CompanyQuestion = require('../models/CompanyQuestion');

const router = express.Router();

// Simple in-memory cache to avoid hitting the AI repeatedly for the same company/role
const cache = new Map();

// GET /api/companies
router.get('/', async (req, res) => {
    try {
        const companies = await Company.find().sort({ createdAt: -1 });
        res.json(companies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/companies/:id
router.get('/:id', async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }
        res.json(company);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/companies/:id/questions
router.get('/:id/questions', async (req, res) => {
    try {
        const questions = await CompanyQuestion.find({ companyId: req.params.id });
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/companies/profile — Generate or get company profile
router.post('/profile', protect, async (req, res) => {
    try {
        const { company, role } = req.body;

        if (!company) {
            return res.status(400).json({ message: 'Company name is required' });
        }

        const cacheKey = `${company.toLowerCase()}-${(role || 'Software Engineer').toLowerCase()}`;

        if (cache.has(cacheKey)) {
            return res.json(cache.get(cacheKey));
        }

        const profile = await generateCompanyProfile({ company, role });

        // Cache the result
        cache.set(cacheKey, profile);

        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
