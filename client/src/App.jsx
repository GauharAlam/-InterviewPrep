import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ResumeAnalysis from './pages/ResumeAnalysis';
import QuestionGenerator from './pages/QuestionGenerator';
import CodingRound from './pages/CodingRound';
import VoiceInterview from './pages/VoiceInterview';
import InterviewHistory from './pages/InterviewHistory';
import AdminDashboard from './pages/AdminDashboard';
import Leaderboard from './pages/Leaderboard';
import StudyPlan from './pages/StudyPlan';
import CompanyList from './pages/CompanyList';
import CompanyDetail from './pages/CompanyDetail';
import AIPractice from './pages/AIPractice';

function AppContent() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <Router>
      <div className={theme} style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <Navbar theme={theme} toggleTheme={toggleTheme} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/resume" element={<ProtectedRoute><ResumeAnalysis /></ProtectedRoute>} />
          <Route path="/questions" element={<ProtectedRoute><QuestionGenerator /></ProtectedRoute>} />
          <Route path="/coding" element={<ProtectedRoute><CodingRound /></ProtectedRoute>} />
          <Route path="/voice" element={<ProtectedRoute><VoiceInterview /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><InterviewHistory /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/study-plan" element={<ProtectedRoute><StudyPlan /></ProtectedRoute>} />
          <Route path="/companies" element={<ProtectedRoute><CompanyList /></ProtectedRoute>} />
          <Route path="/companies/:id" element={<ProtectedRoute><CompanyDetail /></ProtectedRoute>} />
          <Route path="/ai-practice" element={<ProtectedRoute><AIPractice /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster position="top-right" toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: '12px'
          }
        }} />
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
