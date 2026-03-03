const express = require('express');
const { protect } = require('../middlewares/auth');
const { generateStudyPlan } = require('../services/aiService');
const StudyPlan = require('../models/StudyPlan');

const router = express.Router();

// POST /api/study-plan/generate — Generate a new study plan
router.post('/generate', protect, async (req, res) => {
    try {
        const { targetCompany, targetRole, interviewDate, currentSkills, experienceLevel, hoursPerDay } = req.body;

        if (!targetRole || !interviewDate) {
            return res.status(400).json({ message: 'Target role and interview date are required' });
        }

        const interview = new Date(interviewDate);
        if (interview <= new Date()) {
            return res.status(400).json({ message: 'Interview date must be in the future' });
        }

        const plan = await generateStudyPlan({
            targetCompany, targetRole, interviewDate, currentSkills,
            experienceLevel: experienceLevel || 'fresher',
            hoursPerDay: hoursPerDay || 3
        });

        const saved = await StudyPlan.create({
            userId: req.user._id,
            targetCompany: targetCompany || 'General',
            targetRole,
            interviewDate: interview,
            currentSkills: currentSkills || [],
            experienceLevel: experienceLevel || 'fresher',
            hoursPerDay: hoursPerDay || 3,
            plan
        });

        res.json(saved);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/study-plan — Get all plans for current user
router.get('/', protect, async (req, res) => {
    try {
        const plans = await StudyPlan.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/study-plan/:id — Get specific plan
router.get('/:id', protect, async (req, res) => {
    try {
        const plan = await StudyPlan.findOne({ _id: req.params.id, userId: req.user._id });
        if (!plan) return res.status(404).json({ message: 'Plan not found' });
        res.json(plan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/study-plan/:id/progress — Update day completion
router.put('/:id/progress', protect, async (req, res) => {
    try {
        const { dayKey, completed } = req.body;
        const plan = await StudyPlan.findOne({ _id: req.params.id, userId: req.user._id });
        if (!plan) return res.status(404).json({ message: 'Plan not found' });

        plan.progress.set(dayKey, completed);
        await plan.save();
        res.json({ progress: Object.fromEntries(plan.progress) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /api/study-plan/:id
router.delete('/:id', protect, async (req, res) => {
    try {
        await StudyPlan.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        res.json({ message: 'Plan deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
