const mongoose = require('mongoose');

const companyQuestionSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Company',
        required: true,
    },
    type: {
        type: String,
        enum: ['technical', 'behavioral', 'system_design'],
        required: [true, 'Please select a question type'],
    },
    question: {
        type: String,
        required: [true, 'Please add the question text'],
    },
    frequency: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        default: 'Medium',
    },
    role: {
        type: String,
        default: 'Software Engineer', // e.g., Frontend, Backend, ML
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('CompanyQuestion', companyQuestionSchema);
