const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a company name'],
        unique: true,
        trim: true,
    },
    logoUrl: {
        type: String,
        default: 'https://via.placeholder.com/150?text=Company',
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    industry: {
        type: String,
        required: [true, 'Please add an industry'],
    },
    difficultyLevel: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium',
    },
    commonRoles: [{
        type: String,
    }],
}, {
    timestamps: true,
});

module.exports = mongoose.model('Company', companySchema);
