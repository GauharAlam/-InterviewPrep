const express = require('express');
const { protect } = require('../middlewares/auth');
const User = require('../models/User');
const Submission = require('../models/Submission');
const InterviewSession = require('../models/InterviewSession');
const ResumeAnalysis = require('../models/ResumeAnalysis');

const router = express.Router();

// ─── Helper: Calculate user XP and stats ─────────────────────
const calculateUserStats = async (userId) => {
    const [submissions, sessions, resumes] = await Promise.all([
        Submission.find({ userId }),
        InterviewSession.find({ userId }),
        ResumeAnalysis.find({ userId })
    ]);

    // XP calculation
    let xp = 0;
    let totalScore = 0;
    let activities = 0;

    // Coding XP: 10 base + score bonus
    submissions.forEach(s => {
        xp += 10 + Math.round((s.score || 0) / 10);
        totalScore += s.score || 0;
        activities++;
    });

    // Interview XP: 15 base + score bonus
    sessions.forEach(s => {
        xp += 15 + Math.round((s.overallScore || 0) / 10);
        totalScore += s.overallScore || 0;
        activities++;
    });

    // Resume XP: 20 base + score bonus
    resumes.forEach(r => {
        xp += 20 + Math.round((r.atsScore || 0) / 10);
        totalScore += r.atsScore || 0;
        activities++;
    });

    const avgScore = activities > 0 ? Math.round(totalScore / activities) : 0;

    // Streak: consecutive days with activity
    const allDates = [
        ...submissions.map(s => s.createdAt),
        ...sessions.map(s => s.createdAt),
        ...resumes.map(r => r.createdAt)
    ].sort((a, b) => new Date(b) - new Date(a));

    let streak = 0;
    if (allDates.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let checkDate = new Date(today);

        // Check if active today or yesterday
        const lastActive = new Date(allDates[0]);
        lastActive.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
        if (diffDays > 1) {
            streak = 0;
        } else {
            if (diffDays === 1) checkDate.setDate(checkDate.getDate() - 1);
            streak = 1;
            const uniqueDays = [...new Set(allDates.map(d => {
                const dt = new Date(d);
                dt.setHours(0, 0, 0, 0);
                return dt.getTime();
            }))].sort((a, b) => b - a);

            for (let i = 1; i < uniqueDays.length; i++) {
                const diff = (uniqueDays[i - 1] - uniqueDays[i]) / (1000 * 60 * 60 * 24);
                if (diff === 1) streak++;
                else break;
            }
        }
    }

    // Badges
    const badges = [];
    if (activities >= 1) badges.push({ id: 'first_step', name: 'First Step', icon: '🎯', desc: 'Complete your first activity' });
    if (submissions.length >= 5) badges.push({ id: 'coder', name: 'Code Warrior', icon: '⚔️', desc: 'Submit 5 coding solutions' });
    if (submissions.length >= 20) badges.push({ id: 'code_master', name: 'Code Master', icon: '🏆', desc: 'Submit 20 coding solutions' });
    if (sessions.length >= 3) badges.push({ id: 'interviewer', name: 'Interview Ready', icon: '🎤', desc: 'Complete 3 interview sessions' });
    if (sessions.length >= 10) badges.push({ id: 'interview_pro', name: 'Interview Pro', icon: '⭐', desc: 'Complete 10 interview sessions' });
    if (resumes.length >= 1) badges.push({ id: 'resume_builder', name: 'Resume Builder', icon: '📄', desc: 'Analyze your first resume' });
    if (streak >= 3) badges.push({ id: 'streak_3', name: 'On Fire', icon: '🔥', desc: '3-day practice streak' });
    if (streak >= 7) badges.push({ id: 'streak_7', name: 'Unstoppable', icon: '💪', desc: '7-day practice streak' });
    if (streak >= 30) badges.push({ id: 'streak_30', name: 'Legend', icon: '👑', desc: '30-day practice streak' });
    if (avgScore >= 80) badges.push({ id: 'high_scorer', name: 'High Scorer', icon: '💎', desc: 'Average score above 80' });
    if (submissions.some(s => s.score === 100)) badges.push({ id: 'perfect', name: 'Perfect Score', icon: '🌟', desc: 'Get a perfect 100 on coding' });

    // Level calculation
    const level = Math.floor(xp / 100) + 1;
    const xpInLevel = xp % 100;

    return {
        xp,
        level,
        xpInLevel,
        xpToNext: 100,
        streak,
        badges,
        avgScore,
        totalActivities: activities,
        codingCount: submissions.length,
        interviewCount: sessions.length,
        resumeCount: resumes.length,
        bestCodingScore: submissions.length > 0 ? Math.max(...submissions.map(s => s.score || 0)) : 0,
        bestInterviewScore: sessions.length > 0 ? Math.max(...sessions.map(s => s.overallScore || 0)) : 0,
    };
};

// GET /api/leaderboard — Public leaderboard
router.get('/', protect, async (req, res) => {
    try {
        const users = await User.find({ role: 'student' }).select('name email avatar createdAt');
        const leaderboard = [];

        for (const user of users) {
            const stats = await calculateUserStats(user._id);
            leaderboard.push({
                _id: user._id,
                name: user.name,
                avatar: user.avatar,
                joinedAt: user.createdAt,
                ...stats
            });
        }

        // Sort by XP descending
        leaderboard.sort((a, b) => b.xp - a.xp);

        // Add rank
        leaderboard.forEach((entry, i) => {
            entry.rank = i + 1;
        });

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/leaderboard/my-stats — Current user stats
router.get('/my-stats', protect, async (req, res) => {
    try {
        const stats = await calculateUserStats(req.user._id);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
