const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    category: {
        type: String,
        enum: ['arrays', 'strings', 'linked-lists', 'trees', 'graphs', 'dp', 'sorting', 'searching', 'math', 'other'],
        default: 'other'
    },
    testCases: [{
        input: String,
        expectedOutput: String,
        hidden: {
            type: Boolean,
            default: false
        }
    }],
    starterCode: {
        javascript: { type: String, default: '' },
        python: { type: String, default: '' },
        java: { type: String, default: '' },
        cpp: { type: String, default: '' }
    },
    constraints: {
        type: String,
        default: ''
    },
    examples: [{
        input: String,
        output: String,
        explanation: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('Problem', problemSchema);
