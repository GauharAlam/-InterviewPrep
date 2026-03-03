const mongoose = require('mongoose');

const resumeAnalysisSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    resumeText: {
        type: String,
        required: true
    },
    atsScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    strengths: [{
        type: String
    }],
    weaknesses: [{
        type: String
    }],
    missingSkills: [{
        type: String
    }],
    improvements: [{
        type: String
    }],
    technicalQuestions: [{
        question: String,
        category: String
    }],
    behavioralQuestions: [{
        question: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
