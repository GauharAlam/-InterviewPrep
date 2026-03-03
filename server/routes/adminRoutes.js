const express = require('express');
const { protect } = require('../middlewares/auth');
const { adminOnly } = require('../middlewares/admin');
const User = require('../models/User');
const Problem = require('../models/Problem');
const InterviewSession = require('../models/InterviewSession');
const Submission = require('../models/Submission');
const ResumeAnalysis = require('../models/ResumeAnalysis');

const router = express.Router();

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// GET /api/admin/users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/admin/analytics
router.get('/analytics', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalSubmissions = await Submission.countDocuments();
        const totalResumes = await ResumeAnalysis.countDocuments();
        const totalSessions = await InterviewSession.countDocuments();

        const avgScores = await Submission.aggregate([
            { $group: { _id: null, avgScore: { $avg: '$score' } } }
        ]);

        const recentUsers = await User.find()
            .select('name email role createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            totalUsers,
            totalSubmissions,
            totalResumes,
            totalSessions,
            averageCodingScore: avgScores[0]?.avgScore || 0,
            recentUsers
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/admin/problems
router.post('/problems', async (req, res) => {
    try {
        const problem = await Problem.create(req.body);
        res.status(201).json(problem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/admin/problems/:id
router.put('/problems/:id', async (req, res) => {
    try {
        const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!problem) return res.status(404).json({ message: 'Problem not found' });
        res.json(problem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /api/admin/problems/:id
router.delete('/problems/:id', async (req, res) => {
    try {
        await Problem.findByIdAndDelete(req.params.id);
        res.json({ message: 'Problem deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Seed sample problems
router.post('/seed-problems', async (req, res) => {
    try {
        const sampleProblems = [
            {
                title: 'Two Sum',
                description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
                difficulty: 'easy',
                category: 'arrays',
                testCases: [
                    { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', hidden: false },
                    { input: '[3,2,4]\n6', expectedOutput: '[1,2]', hidden: false },
                    { input: '[3,3]\n6', expectedOutput: '[0,1]', hidden: true }
                ],
                starterCode: {
                    javascript: 'function twoSum(nums, target) {\n  // Your code here\n}',
                    python: 'def two_sum(nums, target):\n    # Your code here\n    pass',
                    java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n    }\n}',
                    cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your code here\n    }\n};'
                },
                constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9',
                examples: [
                    { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9' }
                ]
            },
            {
                title: 'Reverse String',
                description: 'Write a function that reverses a string. The input string is given as an array of characters.',
                difficulty: 'easy',
                category: 'strings',
                testCases: [
                    { input: '["h","e","l","l","o"]', expectedOutput: '["o","l","l","e","h"]', hidden: false },
                    { input: '["H","a","n","n","a","h"]', expectedOutput: '["h","a","n","n","a","H"]', hidden: false },
                    { input: '["A"]', expectedOutput: '["A"]', hidden: true }
                ],
                starterCode: {
                    javascript: 'function reverseString(s) {\n  // Your code here\n}',
                    python: 'def reverse_string(s):\n    # Your code here\n    pass',
                    java: 'class Solution {\n    public void reverseString(char[] s) {\n        // Your code here\n    }\n}',
                    cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    void reverseString(vector<char>& s) {\n        // Your code here\n    }\n};'
                },
                constraints: '1 <= s.length <= 10^5',
                examples: [
                    { input: '["h","e","l","l","o"]', output: '["o","l","l","e","h"]', explanation: 'Reversed in-place' }
                ]
            },
            {
                title: 'Valid Parentheses',
                description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
                difficulty: 'easy',
                category: 'strings',
                testCases: [
                    { input: '()', expectedOutput: 'true', hidden: false },
                    { input: '()[]{}', expectedOutput: 'true', hidden: false },
                    { input: '(]', expectedOutput: 'false', hidden: false },
                    { input: '([)]', expectedOutput: 'false', hidden: true }
                ],
                starterCode: {
                    javascript: 'function isValid(s) {\n  // Your code here\n}',
                    python: 'def is_valid(s):\n    # Your code here\n    pass',
                    java: 'class Solution {\n    public boolean isValid(String s) {\n        // Your code here\n    }\n}',
                    cpp: '#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isValid(string s) {\n        // Your code here\n    }\n};'
                },
                constraints: '1 <= s.length <= 10^4',
                examples: [
                    { input: 's = "()"', output: 'true', explanation: 'Simple matching parentheses' }
                ]
            },
            {
                title: 'Maximum Subarray',
                description: 'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
                difficulty: 'medium',
                category: 'dp',
                testCases: [
                    { input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6', hidden: false },
                    { input: '[1]', expectedOutput: '1', hidden: false },
                    { input: '[5,4,-1,7,8]', expectedOutput: '23', hidden: true }
                ],
                starterCode: {
                    javascript: 'function maxSubArray(nums) {\n  // Your code here\n}',
                    python: 'def max_sub_array(nums):\n    # Your code here\n    pass',
                    java: 'class Solution {\n    public int maxSubArray(int[] nums) {\n        // Your code here\n    }\n}',
                    cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        // Your code here\n    }\n};'
                },
                constraints: '1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4',
                examples: [
                    { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' }
                ]
            },
            {
                title: 'Fibonacci Number',
                description: 'The Fibonacci numbers form a sequence such that each number is the sum of the two preceding ones, starting from 0 and 1. Given n, calculate F(n).',
                difficulty: 'easy',
                category: 'dp',
                testCases: [
                    { input: '2', expectedOutput: '1', hidden: false },
                    { input: '3', expectedOutput: '2', hidden: false },
                    { input: '4', expectedOutput: '3', hidden: false },
                    { input: '10', expectedOutput: '55', hidden: true }
                ],
                starterCode: {
                    javascript: 'function fib(n) {\n  // Your code here\n}',
                    python: 'def fib(n):\n    # Your code here\n    pass',
                    java: 'class Solution {\n    public int fib(int n) {\n        // Your code here\n    }\n}',
                    cpp: 'class Solution {\npublic:\n    int fib(int n) {\n        // Your code here\n    }\n};'
                },
                constraints: '0 <= n <= 30',
                examples: [
                    { input: 'n = 4', output: '3', explanation: 'F(4) = F(3) + F(2) = 2 + 1 = 3' }
                ]
            }
        ];

        await Problem.deleteMany({});
        const problems = await Problem.insertMany(sampleProblems);
        res.json({ message: `${problems.length} problems seeded successfully`, problems });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
