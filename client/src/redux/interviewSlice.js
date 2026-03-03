import { createSlice } from '@reduxjs/toolkit';

const interviewSlice = createSlice({
    name: 'interview',
    initialState: {
        currentSession: null,
        resumeAnalysis: null,
        questions: null,
        voiceResults: null,
        dashboardStats: null
    },
    reducers: {
        setResumeAnalysis: (state, action) => { state.resumeAnalysis = action.payload; },
        setQuestions: (state, action) => { state.questions = action.payload; },
        setVoiceResults: (state, action) => { state.voiceResults = action.payload; },
        setDashboardStats: (state, action) => { state.dashboardStats = action.payload; },
        setCurrentSession: (state, action) => { state.currentSession = action.payload; },
        clearInterview: (state) => {
            state.currentSession = null;
            state.resumeAnalysis = null;
            state.questions = null;
            state.voiceResults = null;
        }
    }
});

export const {
    setResumeAnalysis,
    setQuestions,
    setVoiceResults,
    setDashboardStats,
    setCurrentSession,
    clearInterview
} = interviewSlice.actions;
export default interviewSlice.reducer;
