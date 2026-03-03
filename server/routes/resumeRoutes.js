const express = require('express');
const multer = require('multer');
const { PDFParse } = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const { protect } = require('../middlewares/auth');
const { analyzeResume } = require('../services/aiService');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const User = require('../models/User');

const router = express.Router();

// Multer config for PDF uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${req.user._id}-${Date.now()}.pdf`);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// POST /api/resume/upload — Upload & analyze resume
router.post('/upload', protect, upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a PDF file' });
        }

        // Extract text from PDF
        const dataBuffer = fs.readFileSync(req.file.path);
        const parser = new PDFParse({ data: dataBuffer });
        const pdfData = await parser.getText();
        const resumeText = pdfData.text;
        await parser.destroy();

        if (!resumeText || resumeText.trim().length < 50) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'Could not extract enough text from PDF. Try a different resume format.' });
        }

        // Analyze with AI
        const analysis = await analyzeResume(resumeText);

        // Save to database
        const resumeAnalysis = await ResumeAnalysis.create({
            userId: req.user._id,
            resumeText,
            atsScore: analysis.atsScore,
            strengths: analysis.strengths,
            weaknesses: analysis.weaknesses,
            missingSkills: analysis.missingSkills,
            improvements: analysis.improvements,
            technicalQuestions: analysis.technicalQuestions,
            behavioralQuestions: analysis.behavioralQuestions
        });

        // Update user resume URL
        await User.findByIdAndUpdate(req.user._id, { resumeURL: req.file.path });

        // Clean up uploaded file (text already extracted)
        fs.unlinkSync(req.file.path);

        res.status(201).json(resumeAnalysis);
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: error.message });
    }
});

// GET /api/resume/analysis/:id
router.get('/analysis/:id', protect, async (req, res) => {
    try {
        const analysis = await ResumeAnalysis.findOne({
            _id: req.params.id,
            userId: req.user._id
        });
        if (!analysis) return res.status(404).json({ message: 'Analysis not found' });
        res.json(analysis);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/resume/history
router.get('/history', protect, async (req, res) => {
    try {
        const analyses = await ResumeAnalysis.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .select('-resumeText');
        res.json(analyses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
