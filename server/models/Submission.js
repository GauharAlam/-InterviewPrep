const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true
    },
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        enum: ['javascript', 'python', 'java', 'cpp'],
        required: true
    },
    result: {
        type: String,
        enum: ['pass', 'fail', 'error', 'timeout', 'pending'],
        default: 'pending'
    },
    score: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    executionTime: {
        type: Number,
        default: 0
    },
    memory: {
        type: Number,
        default: 0
    },
    testCaseResults: [{
        input: String,
        expectedOutput: String,
        actualOutput: String,
        passed: Boolean,
        hidden: Boolean
    }],
    aiEvaluation: {
        correctness: String,
        timeComplexity: String,
        spaceComplexity: String,
        codeQuality: String,
        suggestions: [String]
    }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
