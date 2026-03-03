const mongoose = require('mongoose');

const studyPlanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetCompany: {
        type: String,
        default: 'General'
    },
    targetRole: {
        type: String,
        required: true
    },
    interviewDate: {
        type: Date,
        required: true
    },
    currentSkills: [String],
    experienceLevel: {
        type: String,
        enum: ['fresher', 'junior', 'mid', 'senior'],
        default: 'fresher'
    },
    hoursPerDay: {
        type: Number,
        default: 3,
        min: 1,
        max: 12
    },
    plan: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'archived'],
        default: 'active'
    },
    progress: {
        type: Map,
        of: Boolean,
        default: {}
    }
}, { timestamps: true });

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
