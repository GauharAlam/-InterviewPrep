const mongoose = require('mongoose');

const interviewSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['resume', 'coding', 'voice', 'mock', 'full'],
        required: true
    },
    resumeScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    codingScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    communicationScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    overallScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    feedback: {
        type: String,
        default: ''
    },
    improvementPlan: [{
        area: String,
        suggestion: String,
        priority: {
            type: String,
            enum: ['high', 'medium', 'low'],
            default: 'medium'
        }
    }],
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, { timestamps: true });

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
