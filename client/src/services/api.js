import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    withCredentials: true
});

// Add auth token to every request
API.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
});

// Handle 401 responses
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth
export const signup = (data) => API.post('/auth/signup', data);
export const login = (data) => API.post('/auth/login', data);
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (data) => API.put('/auth/profile', data);
export const logout = () => API.post('/auth/logout');

// Resume
export const uploadResume = (formData) => API.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const getResumeAnalysis = (id) => API.get(`/resume/analysis/${id}`);
export const getResumeHistory = () => API.get('/resume/history');

// Questions
export const generateQuestions = (data) => API.post('/questions/generate', data);

// Coding — Curated Problem Hub
export const getCodingProblems = (params) => API.get('/coding/problems', { params });
export const getCodingTopics = () => API.get('/coding/topics');
export const getCodingCompanies = () => API.get('/coding/companies');

// Voice
export const analyzeVoice = (data) => API.post('/voice/analyze', data);
export const mockChat = (data) => API.post('/voice/mock-chat', data);
export const getInterviewScorecard = (data) => API.post('/voice/scorecard', data);
export const getVoiceHistory = () => API.get('/voice/history');

// Dashboard
export const getDashboardStats = () => API.get('/dashboard/stats');
export const getImprovementPlan = (data) => API.post('/dashboard/improvement-plan', data);

// Leaderboard
export const getLeaderboard = () => API.get('/leaderboard');
export const getMyStats = () => API.get('/leaderboard/my-stats');

// Study Plan
export const generateStudyPlan = (data) => API.post('/study-plan/generate', data);
export const getStudyPlans = () => API.get('/study-plan');
export const getStudyPlan = (id) => API.get(`/study-plan/${id}`);
export const updatePlanProgress = (id, data) => API.put(`/study-plan/${id}/progress`, data);
export const deleteStudyPlan = (id) => API.delete(`/study-plan/${id}`);

// Company Prep
export const getCompanies = () => API.get('/companies');
export const getCompany = (id) => API.get(`/companies/${id}`);
export const getCompanyQuestions = (id) => API.get(`/companies/${id}/questions`);
export const getCompanyProfile = (data) => API.post('/companies/profile', data);

// AI Practice
export const getPracticeQuestion = (data) => API.post('/practice/question', data);
export const evaluatePracticeAnswer = (data) => API.post('/practice/evaluate', data);

// Admin
export const getUsers = () => API.get('/admin/users');
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);
export const getAnalytics = () => API.get('/admin/analytics');
export const addProblem = (data) => API.post('/admin/problems', data);
export const seedProblems = () => API.post('/admin/seed-problems');

export default API;
