const mongoose = require('mongoose');

const codingProblemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    platform: {
        type: String,
        enum: ['LeetCode', 'GeeksforGeeks'],
        required: true,
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        required: true,
    },
    topic: {
        type: String,
        required: true,
    },
    companyTags: [{
        type: String,
    }],
    link: {
        type: String,
        required: true,
    },
    problemNumber: {
        type: Number,
        default: null,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('CodingProblem', codingProblemSchema);
