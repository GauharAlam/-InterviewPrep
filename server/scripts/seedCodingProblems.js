const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const CodingProblem = require('../models/CodingProblem');

dotenv.config();

const problems = [
    // ═══════════════════════════════════════════════════════════
    // ARRAYS
    // ═══════════════════════════════════════════════════════════
    { title: 'Two Sum', platform: 'LeetCode', difficulty: 'Easy', topic: 'Arrays', companyTags: ['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Infosys', 'TCS', 'Accenture'], link: 'https://leetcode.com/problems/two-sum/', problemNumber: 1 },
    { title: 'Best Time to Buy and Sell Stock', platform: 'LeetCode', difficulty: 'Easy', topic: 'Arrays', companyTags: ['Amazon', 'Microsoft', 'Meta', 'Goldman Sachs', 'Infosys'], link: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', problemNumber: 121 },
    { title: 'Contains Duplicate', platform: 'LeetCode', difficulty: 'Easy', topic: 'Arrays', companyTags: ['Amazon', 'Apple', 'Adobe', 'Infosys', 'Wipro'], link: 'https://leetcode.com/problems/contains-duplicate/', problemNumber: 217 },
    { title: 'Move Zeroes', platform: 'LeetCode', difficulty: 'Easy', topic: 'Arrays', companyTags: ['Meta', 'Amazon', 'Infosys', 'TCS', 'HCL Technologies'], link: 'https://leetcode.com/problems/move-zeroes/', problemNumber: 283 },
    { title: 'Missing Number', platform: 'LeetCode', difficulty: 'Easy', topic: 'Arrays', companyTags: ['Amazon', 'Microsoft', 'Infosys', 'Cognizant', 'Wipro'], link: 'https://leetcode.com/problems/missing-number/', problemNumber: 268 },
    { title: 'Maximum Subarray', platform: 'LeetCode', difficulty: 'Medium', topic: 'Arrays', companyTags: ['Amazon', 'Microsoft', 'Google', 'Apple', 'Goldman Sachs'], link: 'https://leetcode.com/problems/maximum-subarray/', problemNumber: 53 },
    { title: 'Product of Array Except Self', platform: 'LeetCode', difficulty: 'Medium', topic: 'Arrays', companyTags: ['Amazon', 'Meta', 'Microsoft', 'Apple', 'Flipkart'], link: 'https://leetcode.com/problems/product-of-array-except-self/', problemNumber: 238 },
    { title: '3Sum', platform: 'LeetCode', difficulty: 'Medium', topic: 'Arrays', companyTags: ['Amazon', 'Meta', 'Google', 'Microsoft', 'Uber'], link: 'https://leetcode.com/problems/3sum/', problemNumber: 15 },
    { title: 'Container With Most Water', platform: 'LeetCode', difficulty: 'Medium', topic: 'Arrays', companyTags: ['Amazon', 'Google', 'Meta', 'Goldman Sachs'], link: 'https://leetcode.com/problems/container-with-most-water/', problemNumber: 11 },
    { title: 'Next Permutation', platform: 'LeetCode', difficulty: 'Medium', topic: 'Arrays', companyTags: ['Google', 'Amazon', 'Microsoft', 'Flipkart', 'Samsung'], link: 'https://leetcode.com/problems/next-permutation/', problemNumber: 31 },
    { title: 'Sort Colors (Dutch National Flag)', platform: 'LeetCode', difficulty: 'Medium', topic: 'Arrays', companyTags: ['Amazon', 'Microsoft', 'Infosys', 'Samsung', 'Flipkart'], link: 'https://leetcode.com/problems/sort-colors/', problemNumber: 75 },
    { title: 'Trapping Rain Water', platform: 'LeetCode', difficulty: 'Hard', topic: 'Arrays', companyTags: ['Google', 'Amazon', 'Microsoft', 'Goldman Sachs', 'Flipkart'], link: 'https://leetcode.com/problems/trapping-rain-water/', problemNumber: 42 },
    { title: 'Kadane\'s Algorithm', platform: 'GeeksforGeeks', difficulty: 'Medium', topic: 'Arrays', companyTags: ['Amazon', 'Microsoft', 'Flipkart', 'Samsung', 'Infosys', 'TCS'], link: 'https://www.geeksforgeeks.org/problems/kadanes-algorithm-1587115620/1' },
    { title: 'Leaders in an Array', platform: 'GeeksforGeeks', difficulty: 'Easy', topic: 'Arrays', companyTags: ['Infosys', 'TCS', 'Wipro', 'Accenture', 'Cognizant'], link: 'https://www.geeksforgeeks.org/problems/leaders-in-an-array-1587115620/1' },

    // ═══════════════════════════════════════════════════════════
    // STRINGS
    // ═══════════════════════════════════════════════════════════
    { title: 'Valid Anagram', platform: 'LeetCode', difficulty: 'Easy', topic: 'Strings', companyTags: ['Amazon', 'Microsoft', 'Google', 'Infosys', 'HCL Technologies'], link: 'https://leetcode.com/problems/valid-anagram/', problemNumber: 242 },
    { title: 'Valid Palindrome', platform: 'LeetCode', difficulty: 'Easy', topic: 'Strings', companyTags: ['Meta', 'Microsoft', 'TCS', 'Wipro'], link: 'https://leetcode.com/problems/valid-palindrome/', problemNumber: 125 },
    { title: 'Reverse String', platform: 'LeetCode', difficulty: 'Easy', topic: 'Strings', companyTags: ['Infosys', 'TCS', 'Wipro', 'HCL Technologies', 'Cognizant', 'Accenture'], link: 'https://leetcode.com/problems/reverse-string/', problemNumber: 344 },
    { title: 'Longest Substring Without Repeating Characters', platform: 'LeetCode', difficulty: 'Medium', topic: 'Strings', companyTags: ['Amazon', 'Google', 'Microsoft', 'Meta', 'Flipkart', 'Uber'], link: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', problemNumber: 3 },
    { title: 'Longest Palindromic Substring', platform: 'LeetCode', difficulty: 'Medium', topic: 'Strings', companyTags: ['Amazon', 'Microsoft', 'Google', 'Goldman Sachs'], link: 'https://leetcode.com/problems/longest-palindromic-substring/', problemNumber: 5 },
    { title: 'Group Anagrams', platform: 'LeetCode', difficulty: 'Medium', topic: 'Strings', companyTags: ['Amazon', 'Meta', 'Google', 'Apple', 'Uber'], link: 'https://leetcode.com/problems/group-anagrams/', problemNumber: 49 },
    { title: 'Implement strStr / Find Index of First Occurrence', platform: 'LeetCode', difficulty: 'Easy', topic: 'Strings', companyTags: ['Infosys', 'TCS', 'Cognizant', 'Accenture', 'Microsoft'], link: 'https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/', problemNumber: 28 },

    // ═══════════════════════════════════════════════════════════
    // LINKED LIST
    // ═══════════════════════════════════════════════════════════
    { title: 'Reverse Linked List', platform: 'LeetCode', difficulty: 'Easy', topic: 'Linked List', companyTags: ['Amazon', 'Microsoft', 'Apple', 'Infosys', 'TCS', 'Wipro'], link: 'https://leetcode.com/problems/reverse-linked-list/', problemNumber: 206 },
    { title: 'Merge Two Sorted Lists', platform: 'LeetCode', difficulty: 'Easy', topic: 'Linked List', companyTags: ['Amazon', 'Microsoft', 'Google', 'Infosys', 'Cognizant'], link: 'https://leetcode.com/problems/merge-two-sorted-lists/', problemNumber: 21 },
    { title: 'Linked List Cycle', platform: 'LeetCode', difficulty: 'Easy', topic: 'Linked List', companyTags: ['Amazon', 'Microsoft', 'Google', 'Accenture'], link: 'https://leetcode.com/problems/linked-list-cycle/', problemNumber: 141 },
    { title: 'Middle of the Linked List', platform: 'LeetCode', difficulty: 'Easy', topic: 'Linked List', companyTags: ['Amazon', 'Infosys', 'TCS', 'Wipro', 'HCL Technologies'], link: 'https://leetcode.com/problems/middle-of-the-linked-list/', problemNumber: 876 },
    { title: 'Remove Nth Node From End of List', platform: 'LeetCode', difficulty: 'Medium', topic: 'Linked List', companyTags: ['Amazon', 'Meta', 'Google', 'Flipkart'], link: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/', problemNumber: 19 },
    { title: 'Merge K Sorted Lists', platform: 'LeetCode', difficulty: 'Hard', topic: 'Linked List', companyTags: ['Amazon', 'Google', 'Meta', 'Microsoft', 'Uber', 'Flipkart'], link: 'https://leetcode.com/problems/merge-k-sorted-lists/', problemNumber: 23 },

    // ═══════════════════════════════════════════════════════════
    // TREES
    // ═══════════════════════════════════════════════════════════
    { title: 'Maximum Depth of Binary Tree', platform: 'LeetCode', difficulty: 'Easy', topic: 'Trees', companyTags: ['Amazon', 'Microsoft', 'Google', 'Infosys'], link: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', problemNumber: 104 },
    { title: 'Invert Binary Tree', platform: 'LeetCode', difficulty: 'Easy', topic: 'Trees', companyTags: ['Google', 'Amazon', 'TCS'], link: 'https://leetcode.com/problems/invert-binary-tree/', problemNumber: 226 },
    { title: 'Symmetric Tree', platform: 'LeetCode', difficulty: 'Easy', topic: 'Trees', companyTags: ['Amazon', 'Microsoft', 'Infosys', 'Wipro'], link: 'https://leetcode.com/problems/symmetric-tree/', problemNumber: 101 },
    { title: 'Validate Binary Search Tree', platform: 'LeetCode', difficulty: 'Medium', topic: 'Trees', companyTags: ['Amazon', 'Meta', 'Microsoft', 'Google', 'Flipkart'], link: 'https://leetcode.com/problems/validate-binary-search-tree/', problemNumber: 98 },
    { title: 'Binary Tree Level Order Traversal', platform: 'LeetCode', difficulty: 'Medium', topic: 'Trees', companyTags: ['Amazon', 'Microsoft', 'Meta', 'Samsung'], link: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', problemNumber: 102 },
    { title: 'Lowest Common Ancestor of a BST', platform: 'LeetCode', difficulty: 'Medium', topic: 'Trees', companyTags: ['Amazon', 'Meta', 'Google', 'Microsoft'], link: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/', problemNumber: 235 },
    { title: 'Diameter of Binary Tree', platform: 'LeetCode', difficulty: 'Easy', topic: 'Trees', companyTags: ['Amazon', 'Meta', 'Google', 'Flipkart'], link: 'https://leetcode.com/problems/diameter-of-binary-tree/', problemNumber: 543 },

    // ═══════════════════════════════════════════════════════════
    // DYNAMIC PROGRAMMING
    // ═══════════════════════════════════════════════════════════
    { title: 'Climbing Stairs', platform: 'LeetCode', difficulty: 'Easy', topic: 'Dynamic Programming', companyTags: ['Amazon', 'Google', 'Apple', 'Infosys', 'TCS'], link: 'https://leetcode.com/problems/climbing-stairs/', problemNumber: 70 },
    { title: 'Fibonacci Number', platform: 'LeetCode', difficulty: 'Easy', topic: 'Dynamic Programming', companyTags: ['Infosys', 'TCS', 'Wipro', 'HCL Technologies', 'Cognizant', 'Accenture'], link: 'https://leetcode.com/problems/fibonacci-number/', problemNumber: 509 },
    { title: 'House Robber', platform: 'LeetCode', difficulty: 'Medium', topic: 'Dynamic Programming', companyTags: ['Amazon', 'Google', 'Microsoft', 'Flipkart'], link: 'https://leetcode.com/problems/house-robber/', problemNumber: 198 },
    { title: 'Coin Change', platform: 'LeetCode', difficulty: 'Medium', topic: 'Dynamic Programming', companyTags: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Goldman Sachs'], link: 'https://leetcode.com/problems/coin-change/', problemNumber: 322 },
    { title: 'Longest Increasing Subsequence', platform: 'LeetCode', difficulty: 'Medium', topic: 'Dynamic Programming', companyTags: ['Amazon', 'Google', 'Meta', 'Samsung'], link: 'https://leetcode.com/problems/longest-increasing-subsequence/', problemNumber: 300 },
    { title: 'Longest Common Subsequence', platform: 'LeetCode', difficulty: 'Medium', topic: 'Dynamic Programming', companyTags: ['Amazon', 'Google', 'Microsoft', 'Samsung'], link: 'https://leetcode.com/problems/longest-common-subsequence/', problemNumber: 1143 },
    { title: 'Edit Distance', platform: 'LeetCode', difficulty: 'Medium', topic: 'Dynamic Programming', companyTags: ['Google', 'Amazon', 'Goldman Sachs'], link: 'https://leetcode.com/problems/edit-distance/', problemNumber: 72 },
    { title: '0-1 Knapsack Problem', platform: 'GeeksforGeeks', difficulty: 'Medium', topic: 'Dynamic Programming', companyTags: ['Amazon', 'Microsoft', 'Flipkart', 'Samsung', 'Infosys', 'TCS'], link: 'https://www.geeksforgeeks.org/problems/0-1-knapsack-problem0945/1' },
    { title: 'Minimum Path Sum', platform: 'LeetCode', difficulty: 'Medium', topic: 'Dynamic Programming', companyTags: ['Amazon', 'Google', 'Goldman Sachs', 'Samsung'], link: 'https://leetcode.com/problems/minimum-path-sum/', problemNumber: 64 },

    // ═══════════════════════════════════════════════════════════
    // BINARY SEARCH
    // ═══════════════════════════════════════════════════════════
    { title: 'Binary Search', platform: 'LeetCode', difficulty: 'Easy', topic: 'Binary Search', companyTags: ['Amazon', 'Microsoft', 'Infosys', 'TCS', 'Wipro'], link: 'https://leetcode.com/problems/binary-search/', problemNumber: 704 },
    { title: 'First Bad Version', platform: 'LeetCode', difficulty: 'Easy', topic: 'Binary Search', companyTags: ['Meta', 'Google', 'Infosys', 'Cognizant'], link: 'https://leetcode.com/problems/first-bad-version/', problemNumber: 278 },
    { title: 'Search in Rotated Sorted Array', platform: 'LeetCode', difficulty: 'Medium', topic: 'Binary Search', companyTags: ['Amazon', 'Meta', 'Google', 'Microsoft', 'Flipkart', 'Samsung'], link: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', problemNumber: 33 },
    { title: 'Find Minimum in Rotated Sorted Array', platform: 'LeetCode', difficulty: 'Medium', topic: 'Binary Search', companyTags: ['Amazon', 'Google', 'Microsoft', 'Goldman Sachs'], link: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/', problemNumber: 153 },
    { title: 'Median of Two Sorted Arrays', platform: 'LeetCode', difficulty: 'Hard', topic: 'Binary Search', companyTags: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Goldman Sachs', 'Flipkart'], link: 'https://leetcode.com/problems/median-of-two-sorted-arrays/', problemNumber: 4 },

    // ═══════════════════════════════════════════════════════════
    // STACK & QUEUE
    // ═══════════════════════════════════════════════════════════
    { title: 'Valid Parentheses', platform: 'LeetCode', difficulty: 'Easy', topic: 'Stack', companyTags: ['Amazon', 'Google', 'Meta', 'Microsoft', 'Infosys', 'TCS', 'Wipro'], link: 'https://leetcode.com/problems/valid-parentheses/', problemNumber: 20 },
    { title: 'Min Stack', platform: 'LeetCode', difficulty: 'Medium', topic: 'Stack', companyTags: ['Amazon', 'Microsoft', 'Google', 'Goldman Sachs'], link: 'https://leetcode.com/problems/min-stack/', problemNumber: 155 },
    { title: 'Implement Queue using Stacks', platform: 'LeetCode', difficulty: 'Easy', topic: 'Stack', companyTags: ['Amazon', 'Microsoft', 'Infosys', 'TCS', 'Accenture'], link: 'https://leetcode.com/problems/implement-queue-using-stacks/', problemNumber: 232 },
    { title: 'Next Greater Element', platform: 'GeeksforGeeks', difficulty: 'Medium', topic: 'Stack', companyTags: ['Amazon', 'Flipkart', 'Samsung', 'Infosys', 'Deloitte'], link: 'https://www.geeksforgeeks.org/problems/next-larger-element-1587115620/1' },

    // ═══════════════════════════════════════════════════════════
    // GRAPHS
    // ═══════════════════════════════════════════════════════════
    { title: 'Number of Islands', platform: 'LeetCode', difficulty: 'Medium', topic: 'Graphs', companyTags: ['Amazon', 'Google', 'Meta', 'Microsoft', 'Samsung'], link: 'https://leetcode.com/problems/number-of-islands/', problemNumber: 200 },
    { title: 'Clone Graph', platform: 'LeetCode', difficulty: 'Medium', topic: 'Graphs', companyTags: ['Amazon', 'Google', 'Meta', 'Uber'], link: 'https://leetcode.com/problems/clone-graph/', problemNumber: 133 },
    { title: 'Course Schedule', platform: 'LeetCode', difficulty: 'Medium', topic: 'Graphs', companyTags: ['Amazon', 'Google', 'Microsoft', 'Flipkart'], link: 'https://leetcode.com/problems/course-schedule/', problemNumber: 207 },
    { title: 'Word Ladder', platform: 'LeetCode', difficulty: 'Hard', topic: 'Graphs', companyTags: ['Amazon', 'Google', 'Meta', 'Flipkart'], link: 'https://leetcode.com/problems/word-ladder/', problemNumber: 127 },
    { title: 'Detect Cycle in Directed Graph', platform: 'GeeksforGeeks', difficulty: 'Medium', topic: 'Graphs', companyTags: ['Amazon', 'Samsung', 'Flipkart', 'Infosys', 'TCS'], link: 'https://www.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1' },
    { title: 'BFS of Graph', platform: 'GeeksforGeeks', difficulty: 'Easy', topic: 'Graphs', companyTags: ['Infosys', 'TCS', 'Wipro', 'Samsung', 'HCL Technologies'], link: 'https://www.geeksforgeeks.org/problems/bfs-traversal-of-graph/1' },
    { title: 'DFS of Graph', platform: 'GeeksforGeeks', difficulty: 'Easy', topic: 'Graphs', companyTags: ['Infosys', 'TCS', 'Wipro', 'Samsung', 'Cognizant'], link: 'https://www.geeksforgeeks.org/problems/depth-first-traversal-for-a-graph/1' },

    // ═══════════════════════════════════════════════════════════
    // BACKTRACKING
    // ═══════════════════════════════════════════════════════════
    { title: 'Permutations', platform: 'LeetCode', difficulty: 'Medium', topic: 'Backtracking', companyTags: ['Amazon', 'Microsoft', 'Meta', 'Flipkart'], link: 'https://leetcode.com/problems/permutations/', problemNumber: 46 },
    { title: 'Combination Sum', platform: 'LeetCode', difficulty: 'Medium', topic: 'Backtracking', companyTags: ['Amazon', 'Google', 'Meta', 'Uber'], link: 'https://leetcode.com/problems/combination-sum/', problemNumber: 39 },
    { title: 'Subsets', platform: 'LeetCode', difficulty: 'Medium', topic: 'Backtracking', companyTags: ['Amazon', 'Meta', 'Google', 'Uber'], link: 'https://leetcode.com/problems/subsets/', problemNumber: 78 },
    { title: 'N-Queens', platform: 'LeetCode', difficulty: 'Hard', topic: 'Backtracking', companyTags: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Samsung'], link: 'https://leetcode.com/problems/n-queens/', problemNumber: 51 },
    { title: 'Rat in a Maze', platform: 'GeeksforGeeks', difficulty: 'Medium', topic: 'Backtracking', companyTags: ['Amazon', 'Samsung', 'Flipkart', 'Infosys'], link: 'https://www.geeksforgeeks.org/problems/rat-in-a-maze-problem/1' },

    // ═══════════════════════════════════════════════════════════
    // HEAP / PRIORITY QUEUE
    // ═══════════════════════════════════════════════════════════
    { title: 'Kth Largest Element in an Array', platform: 'LeetCode', difficulty: 'Medium', topic: 'Heap', companyTags: ['Amazon', 'Meta', 'Google', 'Microsoft', 'Goldman Sachs'], link: 'https://leetcode.com/problems/kth-largest-element-in-an-array/', problemNumber: 215 },
    { title: 'Top K Frequent Elements', platform: 'LeetCode', difficulty: 'Medium', topic: 'Heap', companyTags: ['Amazon', 'Google', 'Meta', 'Uber'], link: 'https://leetcode.com/problems/top-k-frequent-elements/', problemNumber: 347 },
    { title: 'Find Median from Data Stream', platform: 'LeetCode', difficulty: 'Hard', topic: 'Heap', companyTags: ['Amazon', 'Google', 'Microsoft', 'Goldman Sachs'], link: 'https://leetcode.com/problems/find-median-from-data-stream/', problemNumber: 295 },

    // ═══════════════════════════════════════════════════════════
    // MATRIX
    // ═══════════════════════════════════════════════════════════
    { title: 'Set Matrix Zeroes', platform: 'LeetCode', difficulty: 'Medium', topic: 'Matrix', companyTags: ['Amazon', 'Microsoft', 'Meta', 'Goldman Sachs'], link: 'https://leetcode.com/problems/set-matrix-zeroes/', problemNumber: 73 },
    { title: 'Spiral Matrix', platform: 'LeetCode', difficulty: 'Medium', topic: 'Matrix', companyTags: ['Amazon', 'Microsoft', 'Google', 'Apple', 'Goldman Sachs'], link: 'https://leetcode.com/problems/spiral-matrix/', problemNumber: 54 },
    { title: 'Rotate Image', platform: 'LeetCode', difficulty: 'Medium', topic: 'Matrix', companyTags: ['Amazon', 'Microsoft', 'Google', 'Apple', 'Samsung'], link: 'https://leetcode.com/problems/rotate-image/', problemNumber: 48 },
    { title: 'Search a 2D Matrix', platform: 'LeetCode', difficulty: 'Medium', topic: 'Matrix', companyTags: ['Amazon', 'Microsoft', 'Flipkart', 'Samsung', 'Deloitte'], link: 'https://leetcode.com/problems/search-a-2d-matrix/', problemNumber: 74 },

    // ═══════════════════════════════════════════════════════════
    // GREEDY
    // ═══════════════════════════════════════════════════════════
    { title: 'Jump Game', platform: 'LeetCode', difficulty: 'Medium', topic: 'Greedy', companyTags: ['Amazon', 'Microsoft', 'Google', 'Flipkart'], link: 'https://leetcode.com/problems/jump-game/', problemNumber: 55 },
    { title: 'Assign Cookies', platform: 'LeetCode', difficulty: 'Easy', topic: 'Greedy', companyTags: ['Amazon', 'Microsoft', 'Infosys', 'TCS'], link: 'https://leetcode.com/problems/assign-cookies/', problemNumber: 455 },
    { title: 'Activity Selection', platform: 'GeeksforGeeks', difficulty: 'Easy', topic: 'Greedy', companyTags: ['Amazon', 'Flipkart', 'Microsoft', 'Infosys', 'TCS'], link: 'https://www.geeksforgeeks.org/problems/activity-selection-1587115620/1' },
    { title: 'Fractional Knapsack', platform: 'GeeksforGeeks', difficulty: 'Medium', topic: 'Greedy', companyTags: ['Amazon', 'Flipkart', 'Samsung', 'Infosys', 'Deloitte'], link: 'https://www.geeksforgeeks.org/problems/fractional-knapsack-1587115620/1' },

    // ═══════════════════════════════════════════════════════════
    // BIT MANIPULATION
    // ═══════════════════════════════════════════════════════════
    { title: 'Single Number', platform: 'LeetCode', difficulty: 'Easy', topic: 'Bit Manipulation', companyTags: ['Amazon', 'Google', 'Apple', 'Infosys', 'TCS'], link: 'https://leetcode.com/problems/single-number/', problemNumber: 136 },
    { title: 'Number of 1 Bits', platform: 'LeetCode', difficulty: 'Easy', topic: 'Bit Manipulation', companyTags: ['Amazon', 'Microsoft', 'Apple', 'Wipro', 'HCL Technologies'], link: 'https://leetcode.com/problems/number-of-1-bits/', problemNumber: 191 },
    { title: 'Counting Bits', platform: 'LeetCode', difficulty: 'Easy', topic: 'Bit Manipulation', companyTags: ['Amazon', 'Google', 'Infosys', 'Cognizant'], link: 'https://leetcode.com/problems/counting-bits/', problemNumber: 338 },

    // ═══════════════════════════════════════════════════════════
    // SORTING & SEARCHING (Basics — important for service companies)
    // ═══════════════════════════════════════════════════════════
    { title: 'Merge Sorted Array', platform: 'LeetCode', difficulty: 'Easy', topic: 'Sorting', companyTags: ['Amazon', 'Microsoft', 'Infosys', 'TCS', 'Wipro', 'HCL Technologies', 'Accenture'], link: 'https://leetcode.com/problems/merge-sorted-array/', problemNumber: 88 },
    { title: 'Sort an Array (Merge Sort)', platform: 'LeetCode', difficulty: 'Medium', topic: 'Sorting', companyTags: ['Amazon', 'Microsoft', 'Google', 'Samsung', 'Infosys'], link: 'https://leetcode.com/problems/sort-an-array/', problemNumber: 912 },
    { title: 'Kth Smallest Element', platform: 'GeeksforGeeks', difficulty: 'Medium', topic: 'Sorting', companyTags: ['Amazon', 'Flipkart', 'Samsung', 'Infosys', 'TCS', 'Wipro'], link: 'https://www.geeksforgeeks.org/problems/kth-smallest-element5635/1' },

    // ═══════════════════════════════════════════════════════════
    // HASHING
    // ═══════════════════════════════════════════════════════════
    { title: 'First Unique Character in a String', platform: 'LeetCode', difficulty: 'Easy', topic: 'Hashing', companyTags: ['Amazon', 'Google', 'Infosys', 'TCS', 'Wipro', 'HCL Technologies'], link: 'https://leetcode.com/problems/first-unique-character-in-a-string/', problemNumber: 387 },
    { title: 'Intersection of Two Arrays II', platform: 'LeetCode', difficulty: 'Easy', topic: 'Hashing', companyTags: ['Amazon', 'Meta', 'Infosys', 'TCS', 'Cognizant'], link: 'https://leetcode.com/problems/intersection-of-two-arrays-ii/', problemNumber: 350 },
    { title: 'Subarray Sum Equals K', platform: 'LeetCode', difficulty: 'Medium', topic: 'Hashing', companyTags: ['Amazon', 'Google', 'Meta', 'Goldman Sachs', 'Flipkart'], link: 'https://leetcode.com/problems/subarray-sum-equals-k/', problemNumber: 560 },

    // ═══════════════════════════════════════════════════════════
    // RECURSION (Service company favorites)
    // ═══════════════════════════════════════════════════════════
    { title: 'Power of Two', platform: 'LeetCode', difficulty: 'Easy', topic: 'Recursion', companyTags: ['Infosys', 'TCS', 'Wipro', 'HCL Technologies', 'Cognizant', 'Accenture'], link: 'https://leetcode.com/problems/power-of-two/', problemNumber: 231 },
    { title: 'Tower of Hanoi', platform: 'GeeksforGeeks', difficulty: 'Medium', topic: 'Recursion', companyTags: ['Infosys', 'TCS', 'Wipro', 'Samsung', 'Accenture'], link: 'https://www.geeksforgeeks.org/problems/tower-of-hanoi-1587115621/1' },
];

const seedCodingProblems = async () => {
    try {
        await connectDB();
        console.log('MongoDB Connected...');

        await CodingProblem.deleteMany();
        console.log('Existing coding problems cleared...');

        await CodingProblem.insertMany(problems);
        console.log(`✅ Seeded ${problems.length} curated coding problems!`);

        // Print summary
        const easy = problems.filter(p => p.difficulty === 'Easy').length;
        const medium = problems.filter(p => p.difficulty === 'Medium').length;
        const hard = problems.filter(p => p.difficulty === 'Hard').length;
        const topics = [...new Set(problems.map(p => p.topic))];
        console.log(`   Easy: ${easy} | Medium: ${medium} | Hard: ${hard}`);
        console.log(`   Topics: ${topics.join(', ')}`);

        process.exit();
    } catch (error) {
        console.error('Error seeding coding problems:', error);
        process.exit(1);
    }
};

seedCodingProblems();
