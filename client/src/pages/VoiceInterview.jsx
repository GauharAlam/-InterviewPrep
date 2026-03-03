import { useState, useRef, useEffect } from 'react';
import { analyzeVoice, mockChat, getInterviewScorecard } from '../services/api';
import { HiMicrophone, HiStop, HiPaperAirplane, HiRefresh, HiClock, HiChartBar, HiCheckCircle, HiXCircle, HiArrowRight, HiDownload } from 'react-icons/hi';
import LoadingSpinner from '../components/LoadingSpinner';
import { generateScorecardReport } from '../utils/pdfReport';

const INTERVIEW_QUESTIONS = [
    "Tell me about yourself and your technical background.",
    "Describe a challenging project you've worked on. What was the hardest part?",
    "How do you approach debugging a complex problem?",
    "Explain the difference between SQL and NoSQL databases. When would you choose one over the other?",
    "What is your experience with version control systems?",
    "Describe your approach to writing clean, maintainable code.",
    "Tell me about a time you had to learn a new technology quickly.",
    "How do you handle disagreements with team members about technical decisions?",
];

const ROLES = [
    'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
    'MERN Stack Developer', 'React Developer', 'Node.js Developer',
    'Python Developer', 'Data Structures & Algorithms', 'System Design'
];

const INTERVIEW_TYPES = [
    { value: 'technical', label: '💻 Technical' },
    { value: 'behavioral', label: '🧠 Behavioral' },
    { value: 'mixed', label: '🎯 Mixed (Recommended)' },
];

const DIFFICULTIES = [
    { value: 'easy', label: '🟢 Easy (Fresher)' },
    { value: 'mixed', label: '🟡 Mixed (Recommended)' },
    { value: 'hard', label: '🔴 Hard (Senior)' },
];

export default function VoiceInterview() {
    const [mode, setMode] = useState('select'); // 'select' | 'practice' | 'mock' | 'scorecard'
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [supported, setSupported] = useState(true);
    const recognitionRef = useRef(null);

    // Mock interview state
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [chatRole, setChatRole] = useState('Full Stack Developer');
    const [interviewType, setInterviewType] = useState('mixed');
    const [difficulty, setDifficulty] = useState('mixed');
    const [totalQuestions, setTotalQuestions] = useState(8);
    const [interviewComplete, setInterviewComplete] = useState(false);
    const [scorecard, setScorecard] = useState(null);
    const [scorecardLoading, setScorecardLoading] = useState(false);
    const [interviewTimer, setInterviewTimer] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setSupported(false);
        }
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    useEffect(() => {
        let interval;
        if (timerActive) {
            interval = setInterval(() => setInterviewTimer(t => t + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timerActive]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // ──── Voice Practice Functions ─────────────────────────────
    const startRecording = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        let finalTranscript = '';
        recognition.onresult = (event) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript + ' ';
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            setTranscript(finalTranscript + interimTranscript);
        };
        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);
        recognitionRef.current = recognition;
        recognition.start();
        setIsRecording(true);
        setTranscript('');
        setAnalysis(null);
    };

    const stopRecording = () => {
        if (recognitionRef.current) recognitionRef.current.stop();
        setIsRecording(false);
    };

    const submitAnswer = async () => {
        if (!transcript.trim()) return;
        setAnalyzing(true);
        try {
            const { data } = await analyzeVoice({ transcribedText: transcript, question: INTERVIEW_QUESTIONS[currentQuestion] });
            setAnalysis(data);
        } catch (err) { console.error(err); }
        finally { setAnalyzing(false); }
    };

    const nextQuestion = () => {
        setCurrentQuestion(prev => (prev + 1) % INTERVIEW_QUESTIONS.length);
        setTranscript('');
        setAnalysis(null);
    };

    // ──── Mock Interview Functions ─────────────────────────────
    const startMockInterview = async () => {
        setMode('mock');
        setChatMessages([]);
        setInterviewComplete(false);
        setScorecard(null);
        setInterviewTimer(0);
        setTimerActive(true);
        setChatLoading(true);
        try {
            const { data } = await mockChat({
                messages: [],
                role: chatRole,
                config: { totalQuestions, difficulty, interviewType }
            });
            setChatMessages([{ role: 'interviewer', content: data.response }]);
            if (data.isComplete) setInterviewComplete(true);
        } catch (err) { console.error(err); }
        finally { setChatLoading(false); }
    };

    const sendChatMessage = async () => {
        if (!chatInput.trim() || chatLoading) return;
        const newMessages = [...chatMessages, { role: 'candidate', content: chatInput }];
        setChatMessages(newMessages);
        setChatInput('');
        setChatLoading(true);
        try {
            const { data } = await mockChat({
                messages: newMessages,
                role: chatRole,
                config: { totalQuestions, difficulty, interviewType }
            });
            const updated = [...newMessages, { role: 'interviewer', content: data.response }];
            setChatMessages(updated);
            if (data.isComplete) {
                setInterviewComplete(true);
                setTimerActive(false);
            }
        } catch (err) { console.error(err); }
        finally { setChatLoading(false); }
    };

    const requestScorecard = async () => {
        setScorecardLoading(true);
        try {
            const { data } = await getInterviewScorecard({ messages: chatMessages, role: chatRole });
            setScorecard(data);
            setMode('scorecard');
        } catch (err) { console.error(err); }
        finally { setScorecardLoading(false); }
    };

    const endInterviewEarly = () => {
        setInterviewComplete(true);
        setTimerActive(false);
    };

    const resetInterview = () => {
        setMode('select');
        setChatMessages([]);
        setInterviewComplete(false);
        setScorecard(null);
        setInterviewTimer(0);
        setTimerActive(false);
    };

    const getScoreColor = (score, max = 10) => {
        const pct = (score / max) * 100;
        if (pct >= 70) return '#22d3ee';
        if (pct >= 40) return '#fbbf24';
        return '#f43f5e';
    };

    const getVerdictColor = (verdict) => {
        if (verdict?.includes('Strong Hire')) return '#22d3ee';
        if (verdict?.includes('Hire') && !verdict?.includes('No')) return '#22d3ee';
        if (verdict?.includes('Lean Hire')) return '#fbbf24';
        if (verdict?.includes('Lean No')) return '#f59e0b';
        return '#f43f5e';
    };

    const getQualityIcon = (quality) => {
        if (quality === 'strong') return <HiCheckCircle style={{ color: '#22d3ee' }} />;
        if (quality === 'adequate') return <HiCheckCircle style={{ color: '#fbbf24' }} />;
        if (quality === 'weak') return <HiXCircle style={{ color: '#f59e0b' }} />;
        return <HiXCircle style={{ color: '#f43f5e' }} />;
    };

    // ════════════════════════════════════════════════════════════
    // RENDER: Mode Selection
    // ════════════════════════════════════════════════════════════
    if (mode === 'select') {
        return (
            <div className="page-container animate-fade-in-up">
                <h1 className="page-title">AI Mock <span className="gradient-text">Interview</span></h1>
                <p className="page-subtitle">Practice with an AI interviewer that adapts to your answers and pushes you to improve</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 32 }}>
                    {/* Smart Mock Interview Card */}
                    <div className="glass-card" style={{ cursor: 'default' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                            <span style={{ fontSize: '1.5rem' }}>🤖</span>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Smart Mock Interview</h3>
                            <span style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', padding: '2px 10px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600 }}>AI-Powered</span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
                            An AI interviewer that asks follow-up questions when your answers are vague, probes weak areas, adjusts difficulty, and gives you a detailed scorecard at the end.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Target Role</label>
                                <select value={chatRole} onChange={e => setChatRole(e.target.value)} className="input-field" style={{ cursor: 'pointer' }}>
                                    {ROLES.map(r => <option key={r}>{r}</option>)}
                                </select>
                            </div>
                            <div className="eval-split" style={{ gap: 10 }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Interview Type</label>
                                    <select value={interviewType} onChange={e => setInterviewType(e.target.value)} className="input-field" style={{ cursor: 'pointer' }}>
                                        {INTERVIEW_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Difficulty</label>
                                    <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="input-field" style={{ cursor: 'pointer' }}>
                                        {DIFFICULTIES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Number of Questions: {totalQuestions}</label>
                                <input type="range" min={4} max={15} value={totalQuestions} onChange={e => setTotalQuestions(+e.target.value)}
                                    style={{ width: '100%', accentColor: 'var(--primary)' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                    <span>Quick (4)</span><span>Standard (8)</span><span>Deep (15)</span>
                                </div>
                            </div>
                        </div>

                        <button className="btn-primary" onClick={startMockInterview} style={{ width: '100%', justifyContent: 'center', padding: 14 }}>
                            🚀 Start Smart Interview
                        </button>
                    </div>

                    {/* Voice Practice Card */}
                    <div className="glass-card" style={{ cursor: 'default' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                            <span style={{ fontSize: '1.5rem' }}>🎤</span>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Voice Practice</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
                            Practice answering common interview questions using your voice. Get AI feedback on confidence, clarity, filler words, and content quality.
                        </p>

                        {!supported && (
                            <div style={{ background: 'rgba(251,191,36,0.1)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: '#fbbf24', fontSize: '0.85rem' }}>
                                ⚠️ Speech recognition not supported. Use Chrome or Edge.
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                            {['Communication & body language feedback', 'Filler word detection', 'Sentiment analysis', 'Individual question scoring'].map((f, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    <span style={{ color: 'var(--primary-light)' }}>✓</span> {f}
                                </div>
                            ))}
                        </div>

                        <button className="btn-secondary" onClick={() => setMode('practice')} disabled={!supported} style={{ width: '100%', justifyContent: 'center', padding: 14 }}>
                            🎤 Start Voice Practice
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ════════════════════════════════════════════════════════════
    // RENDER: Voice Practice Mode
    // ════════════════════════════════════════════════════════════
    if (mode === 'practice') {
        return (
            <div className="page-container animate-fade-in-up">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <button className="btn-secondary" onClick={() => setMode('select')} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>← Back</button>
                    <h1 className="page-title" style={{ marginBottom: 0 }}>Voice <span className="gradient-text">Practice</span></h1>
                </div>

                <div className="glass-card" style={{ marginBottom: 20, textAlign: 'center', padding: '32px 24px' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                        Question {currentQuestion + 1} of {INTERVIEW_QUESTIONS.length}
                    </p>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 600, lineHeight: 1.5 }}>
                        {INTERVIEW_QUESTIONS[currentQuestion]}
                    </h2>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
                    {!isRecording ? (
                        <button className="btn-primary" onClick={startRecording} style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: 16 }}>
                            <HiMicrophone /> Start Recording
                        </button>
                    ) : (
                        <button className="btn-danger" onClick={stopRecording}
                            style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: 16, animation: 'pulse-glow 1.5s infinite' }}>
                            <HiStop /> Stop Recording
                        </button>
                    )}
                </div>

                {(transcript || isRecording) && (
                    <div className="glass-card" style={{ marginBottom: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Your Answer</h3>
                            {isRecording && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f43f5e', animation: 'pulse-glow 1s infinite' }} />}
                        </div>
                        <p style={{ fontSize: '0.95rem', lineHeight: 1.7, color: transcript ? 'var(--text-primary)' : 'var(--text-secondary)', minHeight: 60 }}>
                            {transcript || 'Listening... Start speaking.'}
                        </p>
                        {!isRecording && transcript && (
                            <button className="btn-primary" onClick={submitAnswer} disabled={analyzing} style={{ marginTop: 12 }}>
                                {analyzing ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Analyze My Answer'}
                            </button>
                        )}
                    </div>
                )}

                {analyzing && <LoadingSpinner text="AI is analyzing your answer..." />}

                {analysis && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="scorecard-grid">
                            {[
                                { label: 'Confidence', value: analysis.confidenceLevel, max: 10 },
                                { label: 'Clarity', value: analysis.clarity, max: 10 },
                                { label: 'Communication', value: analysis.communicationSkills, max: 10 },
                                { label: 'Relevance', value: analysis.relevance, max: 10 },
                                { label: 'Overall', value: analysis.overallScore, max: 100 },
                            ].map((item, i) => (
                                <div key={i} className="glass-card" style={{ textAlign: 'center', padding: '16px' }}>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 4 }}>{item.label}</p>
                                    <p style={{ fontSize: '1.8rem', fontWeight: 700, color: getScoreColor(item.value, item.max) }}>
                                        {item.value}<span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>/{item.max}</span>
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="glass-card">
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 10 }}>Feedback</h4>
                            <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>{analysis.feedback}</p>
                        </div>
                        {analysis.suggestions?.length > 0 && (
                            <div className="glass-card">
                                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 10 }}>Suggestions</h4>
                                {analysis.suggestions.map((s, i) => (
                                    <div key={i} style={{ padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: 8, marginBottom: 6, fontSize: '0.85rem' }}>💡 {s}</div>
                                ))}
                            </div>
                        )}
                        <button className="btn-primary" onClick={nextQuestion} style={{ alignSelf: 'flex-start' }}>
                            <HiRefresh /> Next Question
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // ════════════════════════════════════════════════════════════
    // RENDER: Smart Mock Interview
    // ════════════════════════════════════════════════════════════
    if (mode === 'mock') {
        return (
            <div style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
                {/* Top Bar */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 20px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)',
                    flexWrap: 'wrap', gap: 8
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button className="btn-secondary" onClick={resetInterview} style={{ padding: '6px 14px', fontSize: '0.8rem' }}>← Exit</button>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                            <span className="gradient-text">AI Interview</span> — {chatRole}
                        </h3>
                        <span className={`chip chip-${difficulty === 'easy' ? 'easy' : difficulty === 'hard' ? 'hard' : 'medium'}`} style={{ fontSize: '0.65rem' }}>
                            {difficulty}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            <HiClock /> {formatTime(interviewTimer)}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            Q{Math.ceil(chatMessages.filter(m => m.role === 'interviewer').length)}/{totalQuestions}
                        </div>
                        {!interviewComplete && chatMessages.length >= 4 && (
                            <button className="btn-danger" onClick={endInterviewEarly} style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                                End Interview
                            </button>
                        )}
                        {interviewComplete && (
                            <button className="btn-primary" onClick={requestScorecard} disabled={scorecardLoading}
                                style={{ padding: '8px 18px', fontSize: '0.85rem', animation: 'pulse-glow 2s infinite' }}>
                                {scorecardLoading ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <><HiChartBar /> Get Scorecard</>}
                            </button>
                        )}
                    </div>
                </div>

                {/* Interview Progress Bar */}
                <div style={{ height: 3, background: 'var(--border)' }}>
                    <div style={{
                        height: '100%',
                        width: `${Math.min((chatMessages.filter(m => m.role === 'interviewer').length / totalQuestions) * 100, 100)}%`,
                        background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                        transition: 'width 0.5s ease',
                        borderRadius: 3
                    }} />
                </div>

                {/* Chat Area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {chatMessages.map((msg, i) => (
                        <div key={i} className="animate-fade-in-up" style={{
                            display: 'flex', justifyContent: msg.role === 'candidate' ? 'flex-end' : 'flex-start',
                            animationDelay: `${i * 0.05}s`
                        }}>
                            <div style={{ display: 'flex', gap: 10, maxWidth: '75%', alignItems: 'flex-start' }}>
                                {msg.role === 'interviewer' && (
                                    <div style={{
                                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0, marginTop: 4,
                                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 14, color: 'white'
                                    }}>🤖</div>
                                )}
                                <div style={{
                                    padding: '14px 18px', borderRadius: 16,
                                    background: msg.role === 'candidate'
                                        ? 'linear-gradient(135deg, var(--primary), var(--accent-dark))'
                                        : 'var(--bg-card)',
                                    color: msg.role === 'candidate' ? 'white' : 'var(--text-primary)',
                                    border: msg.role === 'interviewer' ? '1px solid var(--border)' : 'none',
                                    fontSize: '0.9rem', lineHeight: 1.7, whiteSpace: 'pre-wrap'
                                }}>
                                    {msg.content}
                                </div>
                                {msg.role === 'candidate' && (
                                    <div style={{
                                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0, marginTop: 4,
                                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 14
                                    }}>👤</div>
                                )}
                            </div>
                        </div>
                    ))}

                    {chatLoading && (
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 14, color: 'white'
                            }}>🤖</div>
                            <div style={{ padding: '14px 18px', background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', gap: 4 }}>
                                    {[0, 1, 2].map(i => (
                                        <div key={i} style={{
                                            width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)',
                                            animation: `pulse-glow 1s infinite ${i * 0.2}s`, opacity: 0.6
                                        }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {interviewComplete && !scorecardLoading && (
                        <div className="glass-card animate-fade-in-up" style={{ textAlign: 'center', padding: '24px', background: 'rgba(168,85,247,0.1)', borderColor: 'rgba(168,85,247,0.3)' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>🎉 Interview Complete!</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
                                Great job! Click the button below to get your detailed AI scorecard with category scores, per-question feedback, and study recommendations.
                            </p>
                            <button className="btn-primary" onClick={requestScorecard} disabled={scorecardLoading} style={{ padding: '14px 28px' }}>
                                {scorecardLoading ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <><HiChartBar /> Generate My Scorecard</>}
                            </button>
                        </div>
                    )}

                    {scorecardLoading && <LoadingSpinner text="AI is evaluating your entire interview performance..." />}

                    <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                {!interviewComplete && (
                    <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', gap: 10 }}>
                        <input className="input-field" placeholder="Type your answer..." style={{ flex: 1 }}
                            value={chatInput} onChange={e => setChatInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChatMessage()}
                            disabled={chatLoading} />
                        <button className="btn-primary" onClick={sendChatMessage} disabled={chatLoading || !chatInput.trim()}
                            style={{ padding: '10px 18px', flexShrink: 0 }}>
                            <HiPaperAirplane />
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // ════════════════════════════════════════════════════════════
    // RENDER: Scorecard
    // ════════════════════════════════════════════════════════════
    if (mode === 'scorecard' && scorecard) {
        return (
            <div className="page-container animate-fade-in-up">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                    <div>
                        <h1 className="page-title">Interview <span className="gradient-text">Scorecard</span></h1>
                        <p className="page-subtitle">{chatRole} • {formatTime(interviewTimer)} duration • {totalQuestions} questions</p>
                    </div>
                    <button className="btn-primary" onClick={resetInterview}>
                        <HiRefresh /> New Interview
                    </button>
                </div>

                {/* Verdict Banner */}
                <div className="glass-card" style={{
                    textAlign: 'center', marginBottom: 24, padding: '32px',
                    background: `linear-gradient(135deg, ${getVerdictColor(scorecard.verdict)}15, transparent)`,
                    borderColor: `${getVerdictColor(scorecard.verdict)}40`
                }}>
                    <p style={{ fontSize: '3rem', fontWeight: 800, color: getVerdictColor(scorecard.verdict), marginBottom: 4 }}>
                        {scorecard.overallScore}<span style={{ fontSize: '1.2rem' }}>/100</span>
                    </p>
                    <p style={{
                        fontSize: '1.4rem', fontWeight: 700, color: getVerdictColor(scorecard.verdict),
                        textTransform: 'uppercase', letterSpacing: 2
                    }}>
                        {scorecard.verdict}
                    </p>
                </div>

                {/* Category Scores */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
                    {scorecard.categories && Object.entries(scorecard.categories).map(([key, cat], i) => (
                        <div key={i} className="glass-card" style={{ padding: '20px' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 4, textTransform: 'capitalize' }}>
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            <p style={{ fontSize: '2rem', fontWeight: 700, color: getScoreColor(cat.score), marginBottom: 6 }}>
                                {cat.score}<span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>/10</span>
                            </p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{cat.feedback}</p>
                        </div>
                    ))}
                </div>

                {/* Question-by-Question Analysis */}
                <div className="glass-card" style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>📝 Question-by-Question Analysis</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {scorecard.questionAnalysis?.map((qa, i) => (
                            <div key={i} style={{
                                display: 'flex', gap: 12, padding: '14px 16px',
                                background: 'var(--bg-primary)', borderRadius: 12, alignItems: 'flex-start'
                            }}>
                                <div style={{ marginTop: 2, flexShrink: 0, fontSize: 18 }}>{getQualityIcon(qa.answerQuality)}</div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{qa.question}</p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{qa.feedback}</p>
                                </div>
                                <span className={`chip chip-${qa.answerQuality === 'strong' ? 'easy' : qa.answerQuality === 'adequate' ? 'medium' : 'hard'}`}
                                    style={{ fontSize: '0.65rem', flexShrink: 0 }}>
                                    {qa.answerQuality}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="eval-split" style={{ marginBottom: 24 }}>
                    <div className="glass-card">
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 12, color: '#22d3ee' }}>💪 Strengths</h4>
                        {scorecard.strengths?.map((s, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', fontSize: '0.85rem' }}>
                                <span style={{ color: '#22d3ee' }}>✓</span> {s}
                            </div>
                        ))}
                    </div>
                    <div className="glass-card">
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 12, color: '#f43f5e' }}>⚠️ Areas to Improve</h4>
                        {scorecard.weaknesses?.map((w, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', fontSize: '0.85rem' }}>
                                <span style={{ color: '#f43f5e' }}>→</span> {w}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Overall Feedback */}
                <div className="glass-card" style={{ marginBottom: 24 }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 10 }}>📋 Overall Feedback</h4>
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>{scorecard.overallFeedback}</p>
                </div>

                {/* Interviewer Notes */}
                {scorecard.interviewerNotes && (
                    <div className="glass-card" style={{ marginBottom: 24, background: 'rgba(168,85,247,0.05)', borderColor: 'rgba(168,85,247,0.2)' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 10, color: 'var(--primary-light)' }}>🔒 Interviewer's Private Notes</h4>
                        <p style={{ fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            "{scorecard.interviewerNotes}"
                        </p>
                    </div>
                )}

                {/* Topics to Study */}
                <div className="glass-card" style={{ marginBottom: 24 }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 12 }}>📚 Recommended Study Topics</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {scorecard.topicsToStudy?.map((topic, i) => (
                            <span key={i} className="chip" style={{
                                background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(236,72,153,0.15))',
                                borderColor: 'rgba(168,85,247,0.3)', color: 'var(--primary-light)', padding: '8px 16px'
                            }}>
                                📖 {topic}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <button className="btn-primary" onClick={resetInterview}>
                        <HiRefresh /> Take Another Interview
                    </button>
                    <button className="btn-secondary" onClick={() => generateScorecardReport(scorecard, { role: chatRole, duration: formatTime(interviewTimer), totalQuestions })}>
                        <HiDownload /> Download PDF
                    </button>
                    <button className="btn-secondary" onClick={() => setMode('mock')}>
                        💬 Review Transcript
                    </button>
                </div>
            </div>
        );
    }

    return null;
}
