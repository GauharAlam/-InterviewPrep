const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Company = require('../models/Company');
const CompanyQuestion = require('../models/CompanyQuestion');

dotenv.config();

const companies = [
    // ─── FAANG / Big Tech ───────────────────────────────────
    {
        name: 'Google',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg',
        description: 'Alphabet Inc is the parent company of Google, the world\'s largest search engine. Known for its rigorous interview process focusing on algorithms, system design, and Googleyness.',
        industry: 'Technology',
        difficultyLevel: 'Hard',
        commonRoles: ['Software Engineer', 'Product Manager', 'Data Scientist', 'SRE'],
        questions: [
            { type: 'technical', question: 'Design a distributed cache system', role: 'Software Engineer', frequency: 'High' },
            { type: 'technical', question: 'Implement LRU Cache from scratch', role: 'Software Engineer', frequency: 'High' },
            { type: 'technical', question: 'Find the longest increasing subsequence', role: 'Software Engineer', frequency: 'Medium' },
            { type: 'behavioral', question: 'Tell me about a time you solved a complex problem', role: 'Software Engineer', frequency: 'High' },
            { type: 'behavioral', question: 'Describe a time you had to deal with ambiguity', role: 'Product Manager', frequency: 'High' },
            { type: 'system_design', question: 'Design Google Search autocomplete', role: 'Software Engineer', frequency: 'Medium' },
            { type: 'system_design', question: 'Design YouTube video streaming service', role: 'Software Engineer', frequency: 'High' },
        ]
    },
    {
        name: 'Amazon',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
        description: 'Amazon focuses on e-commerce, cloud computing (AWS), digital streaming, and AI. Interviews heavily emphasize Leadership Principles.',
        industry: 'E-commerce & Cloud Computing',
        difficultyLevel: 'Hard',
        commonRoles: ['Software Development Engineer', 'Cloud Architect', 'Data Engineer', 'Solutions Architect'],
        questions: [
            { type: 'behavioral', question: 'Tell me about a time you took ownership of a project (Ownership)', role: 'Software Development Engineer', frequency: 'High' },
            { type: 'behavioral', question: 'Describe a time when you had to deliver results under tight deadlines (Deliver Results)', role: 'Software Development Engineer', frequency: 'High' },
            { type: 'behavioral', question: 'Give an example of when you dived deep into a problem (Dive Deep)', role: 'Software Development Engineer', frequency: 'High' },
            { type: 'technical', question: 'Find the number of islands in a 2D matrix', role: 'Software Development Engineer', frequency: 'High' },
            { type: 'technical', question: 'Implement a min heap / priority queue', role: 'Software Development Engineer', frequency: 'Medium' },
            { type: 'system_design', question: 'Design Amazon\'s checkout system', role: 'Software Development Engineer', frequency: 'High' },
            { type: 'system_design', question: 'Design a URL shortener like bit.ly', role: 'Software Development Engineer', frequency: 'Medium' },
        ]
    },
    {
        name: 'Microsoft',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
        description: 'Microsoft produces software, consumer electronics, and cloud services (Azure). Interviews focus on problem solving, coding, and system design.',
        industry: 'Technology',
        difficultyLevel: 'Medium',
        commonRoles: ['Software Engineer', 'Program Manager', 'Cloud Solution Architect'],
        questions: [
            { type: 'technical', question: 'Reverse a Linked List', role: 'Software Engineer', frequency: 'High' },
            { type: 'technical', question: 'Validate a Binary Search Tree', role: 'Software Engineer', frequency: 'High' },
            { type: 'technical', question: 'Implement a trie data structure', role: 'Software Engineer', frequency: 'Medium' },
            { type: 'behavioral', question: 'Tell me about a time you failed and what you learned', role: 'Software Engineer', frequency: 'High' },
            { type: 'system_design', question: 'Design a file storage service like OneDrive', role: 'Software Engineer', frequency: 'Medium' },
        ]
    },
    {
        name: 'Meta',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg',
        description: 'Meta Platforms (formerly Facebook) builds technologies for social connection. Interviews focus on coding speed, system design, and behavioral questions.',
        industry: 'Social Media & Technology',
        difficultyLevel: 'Hard',
        commonRoles: ['Software Engineer', 'Production Engineer', 'Data Engineer', 'ML Engineer'],
        questions: [
            { type: 'technical', question: 'Flatten a nested list iterator', role: 'Software Engineer', frequency: 'High' },
            { type: 'technical', question: 'Find all permutations of a string', role: 'Software Engineer', frequency: 'Medium' },
            { type: 'behavioral', question: 'How do you handle disagreements with your team?', role: 'Software Engineer', frequency: 'High' },
            { type: 'system_design', question: 'Design Facebook News Feed', role: 'Software Engineer', frequency: 'High' },
            { type: 'system_design', question: 'Design Instagram Stories', role: 'Software Engineer', frequency: 'Medium' },
        ]
    },
    {
        name: 'Apple',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
        description: 'Apple designs consumer electronics, software, and services. Interviews focus on coding, system design, and cultural fit with Apple\'s design philosophy.',
        industry: 'Consumer Electronics & Technology',
        difficultyLevel: 'Hard',
        commonRoles: ['Software Engineer', 'Hardware Engineer', 'ML Engineer'],
        questions: [
            { type: 'technical', question: 'Implement a thread-safe singleton pattern', role: 'Software Engineer', frequency: 'Medium' },
            { type: 'technical', question: 'Design a memory-efficient data structure for a phone contacts app', role: 'Software Engineer', frequency: 'High' },
            { type: 'behavioral', question: 'Why Apple? What Apple product inspires you and why?', role: 'Software Engineer', frequency: 'High' },
            { type: 'system_design', question: 'Design iCloud sync architecture', role: 'Software Engineer', frequency: 'Medium' },
        ]
    },

    // ─── Indian IT / Service Companies ──────────────────────
    {
        name: 'Infosys',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg',
        description: 'Infosys is an Indian multinational IT services and consulting company. Interviews focus on aptitude, basic DSA, DBMS, OOPs, and HR rounds.',
        industry: 'IT Services & Consulting',
        difficultyLevel: 'Easy',
        commonRoles: ['Systems Engineer', 'Software Engineer', 'Technology Analyst', 'Power Programmer'],
        questions: [
            { type: 'technical', question: 'Explain the difference between stack and queue', role: 'Systems Engineer', frequency: 'High' },
            { type: 'technical', question: 'Write a program to check if a string is a palindrome', role: 'Systems Engineer', frequency: 'High' },
            { type: 'technical', question: 'What is DBMS normalization? Explain 1NF, 2NF, 3NF', role: 'Systems Engineer', frequency: 'High' },
            { type: 'technical', question: 'Explain OOPs concepts with real-world examples', role: 'Systems Engineer', frequency: 'High' },
            { type: 'behavioral', question: 'Why do you want to join Infosys?', role: 'Systems Engineer', frequency: 'High' },
            { type: 'behavioral', question: 'Are you willing to relocate anywhere in India?', role: 'Systems Engineer', frequency: 'High' },
        ]
    },
    {
        name: 'TCS',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg',
        description: 'Tata Consultancy Services is India\'s largest IT company. The TCS NQT test covers aptitude, reasoning, and basic programming. Interviews are generally straightforward.',
        industry: 'IT Services & Consulting',
        difficultyLevel: 'Easy',
        commonRoles: ['Software Developer', 'Systems Engineer', 'Digital Analyst'],
        questions: [
            { type: 'technical', question: 'Write a program to reverse a number', role: 'Software Developer', frequency: 'High' },
            { type: 'technical', question: 'What is the difference between abstract class and interface?', role: 'Software Developer', frequency: 'High' },
            { type: 'technical', question: 'Explain SQL joins with examples', role: 'Software Developer', frequency: 'High' },
            { type: 'behavioral', question: 'Tell me about yourself', role: 'Software Developer', frequency: 'High' },
            { type: 'behavioral', question: 'Where do you see yourself in 5 years?', role: 'Software Developer', frequency: 'High' },
        ]
    },
    {
        name: 'Wipro',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Primary_Logo_Color_RGB.svg',
        description: 'Wipro is a leading global IT, consulting, and business process services company. The Wipro NLTH assessment tests coding, aptitude, and communication.',
        industry: 'IT Services & Consulting',
        difficultyLevel: 'Easy',
        commonRoles: ['Project Engineer', 'Software Developer', 'Cloud Engineer'],
        questions: [
            { type: 'technical', question: 'Write a program to find factorial of a number using recursion', role: 'Project Engineer', frequency: 'High' },
            { type: 'technical', question: 'Difference between process and thread', role: 'Project Engineer', frequency: 'Medium' },
            { type: 'technical', question: 'What is polymorphism? Give an example', role: 'Project Engineer', frequency: 'High' },
            { type: 'behavioral', question: 'How do you handle pressure and tight deadlines?', role: 'Project Engineer', frequency: 'High' },
        ]
    },
    {
        name: 'HCL Technologies',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/HCL_Technologies_logo.svg',
        description: 'HCLTech is a global technology company focused on digital, engineering, and cloud services. HCL interviews include aptitude tests and technical rounds.',
        industry: 'IT Services & Consulting',
        difficultyLevel: 'Easy',
        commonRoles: ['Software Engineer', 'Graduate Engineer Trainee', 'DevOps Engineer'],
        questions: [
            { type: 'technical', question: 'What is the difference between HashMap and HashTable?', role: 'Software Engineer', frequency: 'High' },
            { type: 'technical', question: 'Write a program to sort an array using bubble sort', role: 'Software Engineer', frequency: 'Medium' },
            { type: 'technical', question: 'Explain the concept of CRUD operations', role: 'Software Engineer', frequency: 'High' },
            { type: 'behavioral', question: 'Tell me about a time you worked in a team', role: 'Software Engineer', frequency: 'High' },
        ]
    },
    {
        name: 'Deloitte',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/56/Deloitte.svg',
        description: 'Deloitte is one of the Big Four professional services firms, offering audit, consulting, tax, and advisory services. Interviews include case studies, technical, and behavioral rounds.',
        industry: 'Consulting & Professional Services',
        difficultyLevel: 'Medium',
        commonRoles: ['Analyst', 'Consultant', 'Software Engineer', 'Data Analyst'],
        questions: [
            { type: 'technical', question: 'Explain REST API and its methods', role: 'Software Engineer', frequency: 'High' },
            { type: 'technical', question: 'Write a SQL query to find the 2nd highest salary', role: 'Analyst', frequency: 'High' },
            { type: 'technical', question: 'What is Agile methodology? How does Scrum work?', role: 'Consultant', frequency: 'Medium' },
            { type: 'behavioral', question: 'Describe a project where you drove innovation', role: 'Consultant', frequency: 'High' },
            { type: 'behavioral', question: 'How do you prioritize multiple client deliverables?', role: 'Analyst', frequency: 'Medium' },
        ]
    },
    {
        name: 'Accenture',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg',
        description: 'Accenture is a global professional services company providing consulting, digital, technology, and operations services. Interviews include cognitive, technical, and communication assessments.',
        industry: 'Consulting & IT Services',
        difficultyLevel: 'Easy',
        commonRoles: ['Associate Software Engineer', 'Application Developer', 'Full Stack Developer'],
        questions: [
            { type: 'technical', question: 'Difference between compiler and interpreter', role: 'Associate Software Engineer', frequency: 'High' },
            { type: 'technical', question: 'What is a linked list? Types of linked list?', role: 'Associate Software Engineer', frequency: 'High' },
            { type: 'technical', question: 'What is the difference between TCP and UDP?', role: 'Application Developer', frequency: 'Medium' },
            { type: 'behavioral', question: 'Why do you want to work at Accenture?', role: 'Associate Software Engineer', frequency: 'High' },
        ]
    },
    {
        name: 'Cognizant',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Cognizant%27s_logo.svg',
        description: 'Cognizant is a multinational IT company providing digital, consulting, and technology services. The GenC hiring process tests aptitude and basic coding skills.',
        industry: 'IT Services & Consulting',
        difficultyLevel: 'Easy',
        commonRoles: ['Programmer Analyst', 'GenC Developer', 'Full Stack Developer'],
        questions: [
            { type: 'technical', question: 'What is the difference between overloading and overriding?', role: 'Programmer Analyst', frequency: 'High' },
            { type: 'technical', question: 'Write code to find the GCD of two numbers', role: 'Programmer Analyst', frequency: 'Medium' },
            { type: 'behavioral', question: 'Tell me about a challenging academic project', role: 'Programmer Analyst', frequency: 'High' },
        ]
    },

    // ─── Product Companies & Startups ───────────────────────
    {
        name: 'Flipkart',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Flipkart_logo_2023.svg',
        description: 'Flipkart is India\'s largest e-commerce company (Walmart subsidiary). Interviews are competitive with focus on DS/Algo, system design, and machine coding rounds.',
        industry: 'E-commerce',
        difficultyLevel: 'Hard',
        commonRoles: ['Software Development Engineer', 'Data Scientist', 'Product Manager'],
        questions: [
            { type: 'technical', question: 'Design and implement a LRU Cache', role: 'Software Development Engineer', frequency: 'High' },
            { type: 'technical', question: 'Find the median of two sorted arrays', role: 'Software Development Engineer', frequency: 'High' },
            { type: 'technical', question: 'Implement a rate limiter', role: 'Software Development Engineer', frequency: 'Medium' },
            { type: 'system_design', question: 'Design Flipkart\'s product recommendation engine', role: 'Software Development Engineer', frequency: 'High' },
            { type: 'behavioral', question: 'Tell me about a time you made a trade-off between quality and speed', role: 'Software Development Engineer', frequency: 'Medium' },
        ]
    },
    {
        name: 'Uber',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png',
        description: 'Uber is a ride-sharing and delivery platform. Interviews focus heavily on algorithms, system design, and real-time systems.',
        industry: 'Transportation & Technology',
        difficultyLevel: 'Hard',
        commonRoles: ['Software Engineer', 'Backend Engineer', 'ML Engineer'],
        questions: [
            { type: 'technical', question: 'Find the shortest path in a weighted graph', role: 'Software Engineer', frequency: 'High' },
            { type: 'technical', question: 'Design an efficient algorithm for matching drivers to riders', role: 'Software Engineer', frequency: 'High' },
            { type: 'system_design', question: 'Design Uber\'s ride matching service', role: 'Software Engineer', frequency: 'High' },
            { type: 'system_design', question: 'Design a real-time location tracking system', role: 'Backend Engineer', frequency: 'Medium' },
        ]
    },
    {
        name: 'Razorpay',
        logoUrl: '',
        description: 'Razorpay is India\'s leading fintech company for payment solutions. Interviews include coding rounds focused on real-world problem solving and system design.',
        industry: 'Fintech',
        difficultyLevel: 'Medium',
        commonRoles: ['Software Engineer', 'Backend Engineer', 'DevOps Engineer'],
        questions: [
            { type: 'technical', question: 'Design a payment transaction system ensuring idempotency', role: 'Software Engineer', frequency: 'High' },
            { type: 'technical', question: 'Implement a concurrent-safe queue', role: 'Backend Engineer', frequency: 'Medium' },
            { type: 'system_design', question: 'Design a payment gateway like Razorpay', role: 'Software Engineer', frequency: 'High' },
            { type: 'behavioral', question: 'Why fintech? What excites you about payments?', role: 'Software Engineer', frequency: 'Medium' },
        ]
    },
    {
        name: 'Swiggy',
        logoUrl: '',
        description: 'Swiggy is India\'s largest food & grocery delivery platform. Interviews focus on algorithms, system design for real-time delivery, and machine coding.',
        industry: 'Food Delivery & Technology',
        difficultyLevel: 'Medium',
        commonRoles: ['Software Development Engineer', 'Backend Engineer', 'Data Scientist'],
        questions: [
            { type: 'technical', question: 'Find the nearest delivery partner using geolocation data', role: 'Software Development Engineer', frequency: 'High' },
            { type: 'technical', question: 'Implement an order management state machine', role: 'Backend Engineer', frequency: 'Medium' },
            { type: 'system_design', question: 'Design Swiggy\'s food delivery dispatch system', role: 'Software Development Engineer', frequency: 'High' },
        ]
    },
    {
        name: 'Zomato',
        logoUrl: '',
        description: 'Zomato is an Indian restaurant aggregator and food delivery company. Interviews involve DSA, system design, and machine coding rounds.',
        industry: 'Food Delivery & Technology',
        difficultyLevel: 'Medium',
        commonRoles: ['Software Engineer', 'Backend Engineer', 'Data Analyst'],
        questions: [
            { type: 'technical', question: 'Design a restaurant search and ranking algorithm', role: 'Software Engineer', frequency: 'High' },
            { type: 'technical', question: 'Implement a priority queue for order scheduling', role: 'Backend Engineer', frequency: 'Medium' },
            { type: 'system_design', question: 'Design a real-time order tracking system', role: 'Software Engineer', frequency: 'High' },
        ]
    },
    {
        name: 'Goldman Sachs',
        logoUrl: '',
        description: 'Goldman Sachs is a leading global investment banking and financial services firm. Interviews test strong DSA skills, mathematical reasoning, and system design.',
        industry: 'Investment Banking & Finance',
        difficultyLevel: 'Hard',
        commonRoles: ['Software Engineer', 'Quantitative Analyst', 'Technology Analyst'],
        questions: [
            { type: 'technical', question: 'Find all pairs in an array that sum to a target', role: 'Technology Analyst', frequency: 'High' },
            { type: 'technical', question: 'Implement a stock price tracker with O(1) min/max', role: 'Software Engineer', frequency: 'High' },
            { type: 'technical', question: 'Print the matrix in spiral order', role: 'Technology Analyst', frequency: 'Medium' },
            { type: 'system_design', question: 'Design a stock trading platform', role: 'Software Engineer', frequency: 'High' },
            { type: 'behavioral', question: 'Why investment banking? What is your understanding of derivatives?', role: 'Technology Analyst', frequency: 'High' },
        ]
    },
    {
        name: 'Samsung',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg',
        description: 'Samsung R&D India conducts SWC (Samsung Coding Test) for recruitment. Interviews focus on advanced DSA — especially graph and DP problems — solved within time limits.',
        industry: 'Electronics & Technology',
        difficultyLevel: 'Hard',
        commonRoles: ['Software Engineer', 'R&D Engineer', 'Embedded Systems Engineer'],
        questions: [
            { type: 'technical', question: 'Solve a graph problem using BFS/DFS within 3 hours (SWC style)', role: 'Software Engineer', frequency: 'High' },
            { type: 'technical', question: 'Implement Dijkstra\'s shortest path algorithm', role: 'Software Engineer', frequency: 'High' },
            { type: 'technical', question: 'Solve a DP problem on grid traversal with obstacles', role: 'R&D Engineer', frequency: 'Medium' },
            { type: 'behavioral', question: 'Describe a complex project and your contribution', role: 'Software Engineer', frequency: 'Medium' },
        ]
    },
];

const seedCompanies = async () => {
    try {
        await connectDB();
        console.log('MongoDB Connected...');

        await Company.deleteMany();
        await CompanyQuestion.deleteMany();
        console.log('Existing Company data cleared...');

        for (const data of companies) {
            const company = await Company.create({
                name: data.name,
                logoUrl: data.logoUrl,
                description: data.description,
                industry: data.industry,
                difficultyLevel: data.difficultyLevel,
                commonRoles: data.commonRoles,
            });

            console.log(`✅ Created Company: ${company.name}`);

            const companyQuestions = data.questions.map(q => ({
                ...q,
                companyId: company._id,
            }));

            await CompanyQuestion.insertMany(companyQuestions);
            console.log(`   → ${companyQuestions.length} questions added`);
        }

        console.log(`\n🎉 Seeded ${companies.length} companies successfully!`);
        process.exit();
    } catch (error) {
        console.error('Error seeding companies:', error);
        process.exit(1);
    }
};

seedCompanies();
