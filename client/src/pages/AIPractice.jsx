import { useState, useRef, useEffect } from 'react';
import { getPracticeQuestion, evaluatePracticeAnswer } from '../services/api';
import { HiMicrophone, HiStop, HiVolumeUp, HiLightBulb, HiPlay, HiArrowRight, HiRefresh, HiCheck, HiX } from 'react-icons/hi';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const TOPICS = [
    'Arrays', 'Strings', 'Linked List', 'Trees', 'Dynamic Programming',
    'Binary Search', 'Graphs', 'Stack', 'Backtracking', 'Heap',
    'Sorting', 'Hashing', 'Recursion', 'OOPs', 'DBMS', 'OS',
    'System Design', 'React', 'Node.js', 'JavaScript', 'SQL',
    'Computer Networks', 'Behavioral', 'HR Questions'
];

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const COMPANIES = [
    '', 'Google', 'Amazon', 'Microsoft', 'Meta', 'Apple',
    'Infosys', 'TCS', 'Wipro', 'HCL Technologies', 'Deloitte',
    'Accenture', 'Cognizant', 'Flipkart', 'Uber', 'Samsung',
    'Goldman Sachs', 'Razorpay', 'Swiggy', 'Zomato'
];

export default function AIPractice() {
    // Setup state
    const [topic, setTopic] = useState('Arrays');
    const [difficulty, setDifficulty] = useState('Medium');
    const [company, setCompany] = useState('');
    const [totalQuestions, setTotalQuestions] = useState(5);

    // Session state
    const [sessionActive, setSessionActive] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [questionNumber, setQuestionNumber] = useState(0);
    const [previousQuestions, setPreviousQuestions] = useState([]);
    const [loadingQuestion, setLoadingQuestion] = useState(false);
    const [loadingEval, setLoadingEval] = useState(false);

    // Voice state
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const recognitionRef = useRef(null);

    // Evaluation state
    const [evaluation, setEvaluation] = useState(null);
    const [showHint, setShowHint] = useState(false);

    // Scorecard state
    const [results, setResults] = useState([]);
    const [sessionComplete, setSessionComplete] = useState(false);

    // ─── Speech Synthesis (AI speaks) ───────────────────────────
    const speak = (text) => {
        return new Promise((resolve) => {
            if (!('speechSynthesis' in window)) {
                toast.error('Text-to-Speech is not supported in this browser');
                resolve();
                return;
            }
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.95;
            utterance.pitch = 1;
            utterance.volume = 1;

            // Try to pick a good voice
            const voices = window.speechSynthesis.getVoices();
            const preferred = voices.find(v =>
                v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')
            );
            if (preferred) utterance.voice = preferred;

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => { setIsSpeaking(false); resolve(); };
            utterance.onerror = () => { setIsSpeaking(false); resolve(); };

            window.speechSynthesis.speak(utterance);
        });
    };

    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    };

    // ─── Speech Recognition (Student speaks) ────────────────────
    const startRecording = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error('Speech Recognition is not supported. Use Chrome.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        let finalTranscript = transcript;
        recognition.onresult = (e) => {
            let interim = '';
            for (let i = e.resultIndex; i < e.results.length; i++) {
                if (e.results[i].isFinal) {
                    finalTranscript += e.results[i][0].transcript + ' ';
                } else {
                    interim += e.results[i][0].transcript;
                }
            }
            setTranscript(finalTranscript + interim);
        };

        recognition.onerror = (e) => {
            if (e.error !== 'aborted') toast.error(`Mic error: ${e.error}`);
            setIsRecording(false);
        };

        recognition.onend = () => setIsRecording(false);

        recognitionRef.current = recognition;
        recognition.start();
        setIsRecording(true);
    };

    const stopRecording = () => {
        recognitionRef.current?.stop();
        setIsRecording(false);
    };

    // ─── Session Flow ───────────────────────────────────────────
    const startSession = async () => {
        setSessionActive(true);
        setQuestionNumber(0);
        setPreviousQuestions([]);
        setResults([]);
        setSessionComplete(false);
        await fetchNextQuestion([]);
    };

    const fetchNextQuestion = async (prevQs) => {
        setLoadingQuestion(true);
        setEvaluation(null);
        setTranscript('');
        setShowHint(false);
        try {
            const { data } = await getPracticeQuestion({
                topic, difficulty, company,
                previousQuestions: prevQs
            });
            setCurrentQuestion(data);
            setQuestionNumber(prev => prev + 1);

            // AI speaks the question
            await speak(`Question ${(prevQs?.length || 0) + 1}. ${data.question}`);
        } catch (err) {
            toast.error('Failed to generate question');
        } finally {
            setLoadingQuestion(false);
        }
    };

    const submitAnswer = async () => {
        if (!transcript.trim()) {
            toast.error('Please record your answer first');
            return;
        }
        stopSpeaking();
        setLoadingEval(true);
        try {
            const { data } = await evaluatePracticeAnswer({
                question: currentQuestion.question,
                answer: transcript.trim(),
                topic, difficulty
            });
            setEvaluation(data);

            // Save result
            const result = {
                question: currentQuestion.question,
                answer: transcript.trim(),
                ...data
            };
            setResults(prev => [...prev, result]);

            // AI speaks the feedback
            const feedbackSpeech = `You scored ${data.score} out of 10. ${data.feedback}`;
            await speak(feedbackSpeech);

        } catch (err) {
            toast.error('Failed to evaluate answer');
        } finally {
            setLoadingEval(false);
        }
    };

    const nextQuestion = async () => {
        const updatedPrevious = [...previousQuestions, currentQuestion.question];
        setPreviousQuestions(updatedPrevious);

        if (questionNumber >= totalQuestions) {
            setSessionComplete(true);
            await speak('Great job! Your practice session is complete. Here is your scorecard.');
        } else {
            await fetchNextQuestion(updatedPrevious);
        }
    };

    const resetSession = () => {
        setSessionActive(false);
        setSessionComplete(false);
        setCurrentQuestion(null);
        setEvaluation(null);
        setTranscript('');
        setResults([]);
        setQuestionNumber(0);
        setPreviousQuestions([]);
        stopSpeaking();
    };

    // Load voices
    useEffect(() => {
        window.speechSynthesis?.getVoices();
    }, []);

    // Cleanup
    useEffect(() => {
        return () => {
            window.speechSynthesis?.cancel();
            recognitionRef.current?.stop();
        };
    }, []);

    // ─── Calculate Stats ────────────────────────────────────────
    const avgScore = results.length ? (results.reduce((s, r) => s + (r.score || 0), 0) / results.length).toFixed(1) : 0;
    const avgConfidence = results.length ? (results.reduce((s, r) => s + (r.confidence || 0), 0) / results.length).toFixed(1) : 0;
    const avgClarity = results.length ? (results.reduce((s, r) => s + (r.clarity || 0), 0) / results.length).toFixed(1) : 0;

    const getScoreColor = (score) => {
        if (score >= 8) return '#999';
        if (score >= 5) return '#f59e0b';
        return '#666';
    };

    // ═══════════════════════════════════════════════════════════
    // RENDER: Setup Screen
    // ═══════════════════════════════════════════════════════════
    if (!sessionActive) {
        return (
            <div className="page-container animate-fade-in-up">
                <h1 className="page-title">AI Voice <span className="gradient-text">Practice</span></h1>
                <p className="page-subtitle">AI asks questions vocally, you answer with your voice, and AI evaluates your response in real-time</p>

                <div className="glass-card" style={{ maxWidth: 600, margin: '0 auto', padding: 32 }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>
                        ⚙️ Configure Your Session
                    </h2>

                    {/* Topic */}
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>
                            📚 Topic
                        </label>
                        <select value={topic} onChange={e => setTopic(e.target.value)} className="input-field" style={{ cursor: 'pointer' }}>
                            {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    {/* Difficulty */}
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>
                            🎯 Difficulty
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                            {DIFFICULTIES.map(d => (
                                <button key={d}
                                    className={difficulty === d ? 'btn-primary' : 'btn-secondary'}
                                    onClick={() => setDifficulty(d)}
                                    style={{ padding: '10px 0', justifyContent: 'center', textAlign: 'center', width: '100%' }}
                                >
                                    {d === 'Easy' ? '🟢' : d === 'Medium' ? '🟡' : '🔴'} {d}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Company */}
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>
                            🏢 Company Style (Optional)
                        </label>
                        <select value={company} onChange={e => setCompany(e.target.value)} className="input-field" style={{ cursor: 'pointer' }}>
                            <option value="">General</option>
                            {COMPANIES.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    {/* Total Questions */}
                    <div style={{ marginBottom: 28 }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>
                            📝 Number of Questions
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
                            {[3, 5, 7, 10].map(n => (
                                <button key={n}
                                    className={totalQuestions === n ? 'btn-primary' : 'btn-secondary'}
                                    onClick={() => setTotalQuestions(n)}
                                    style={{ padding: '10px 0', justifyContent: 'center', textAlign: 'center', width: '100%' }}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button className="btn-primary" onClick={startSession} style={{
                        width: '100%', padding: '14px', fontSize: '1rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                    }}>
                        <HiPlay /> Start Voice Practice
                    </button>
                </div>

                {/* How it Works */}
                <div className="how-it-works-grid" style={{ maxWidth: 600, margin: '24px auto 0' }}>
                    {[
                        { icon: '🤖', title: 'AI Asks', desc: 'AI generates & speaks a question' },
                        { icon: '🎤', title: 'You Answer', desc: 'Tap mic and answer vocally' },
                        { icon: '📊', title: 'AI Evaluates', desc: 'Get score, feedback & ideal answer' },
                        { icon: '📋', title: 'Scorecard', desc: 'Final report after all questions' },
                    ].map(s => (
                        <div key={s.title} className="glass-card" style={{ padding: 16, textAlign: 'center' }}>
                            <p style={{ fontSize: '1.5rem', marginBottom: 6 }}>{s.icon}</p>
                            <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{s.title}</p>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════
    // RENDER: Session Complete — Scorecard
    // ═══════════════════════════════════════════════════════════
    if (sessionComplete) {
        return (
            <div className="page-container animate-fade-in-up">
                <h1 className="page-title">Practice <span className="gradient-text">Scorecard</span></h1>

                {/* Summary Stats */}
                <div className="scorecard-grid" style={{ marginBottom: 24 }}>
                    {[
                        { label: 'Avg Score', value: `${avgScore}/10`, color: getScoreColor(avgScore) },
                        { label: 'Confidence', value: `${avgConfidence}/10`, color: getScoreColor(avgConfidence) },
                        { label: 'Clarity', value: `${avgClarity}/10`, color: getScoreColor(avgClarity) },
                        { label: 'Questions', value: results.length, color: 'var(--primary-light)' },
                    ].map(s => (
                        <div key={s.label} className="glass-card" style={{ textAlign: 'center', padding: 20 }}>
                            <p style={{ fontSize: '1.6rem', fontWeight: 700, color: s.color }}>{s.value}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Individual Results */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {results.map((r, i) => (
                        <div key={i} className="glass-card" style={{ padding: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, flex: 1, minWidth: 0 }}>Q{i + 1}: {r.question}</h3>
                                <span style={{
                                    fontSize: '1.2rem', fontWeight: 700, color: getScoreColor(r.score),
                                    background: `${getScoreColor(r.score)}15`, padding: '4px 14px', borderRadius: 8
                                }}>{r.score}/10</span>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                                <strong>Your answer:</strong> {r.answer}
                            </p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--primary-light)', marginBottom: 8 }}>
                                <strong>Ideal answer:</strong> {r.idealAnswer}
                            </p>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <span style={{
                                    fontSize: '0.65rem', padding: '3px 10px', borderRadius: 6,
                                    background: 'rgba(16,185,129,0.1)', color: '#999', fontWeight: 600
                                }}>✓ {r.correctParts?.join(', ')}</span>
                                {r.missingParts?.length > 0 && (
                                    <span style={{
                                        fontSize: '0.65rem', padding: '3px 10px', borderRadius: 6,
                                        background: 'rgba(239,68,68,0.1)', color: '#666', fontWeight: 600
                                    }}>✗ Missing: {r.missingParts?.join(', ')}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ textAlign: 'center', marginTop: 24 }}>
                    <button className="btn-primary" onClick={resetSession} style={{ padding: '14px 32px', fontSize: '1rem' }}>
                        <HiRefresh style={{ marginRight: 6 }} /> New Session
                    </button>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════
    // RENDER: Active Session — Q&A
    // ═══════════════════════════════════════════════════════════
    return (
        <div className="page-container animate-fade-in-up">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: 4 }}>
                        Question <span className="gradient-text">{questionNumber}/{totalQuestions}</span>
                    </h1>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {topic} · {difficulty} {company && `· ${company} style`}
                    </p>
                </div>
                <button className="btn-secondary" onClick={resetSession} style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                    End Session
                </button>
            </div>

            {/* Progress Bar */}
            <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 3, marginBottom: 24, overflow: 'hidden' }}>
                <div style={{
                    height: '100%', borderRadius: 3,
                    background: '#444',
                    width: `${(questionNumber / totalQuestions) * 100}%`,
                    transition: 'width 0.5s ease'
                }} />
            </div>

            {loadingQuestion ? (
                <LoadingSpinner size="lg" text="AI is preparing your question..." />
            ) : currentQuestion ? (
                <>
                    {/* Question Card */}
                    <div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                            {/* AI Avatar */}
                            <div style={{
                                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                                background: isSpeaking
                                    ? 'linear-gradient(135deg, #6366f1, #a855f7)'
                                    : '#333',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 22, color: 'white',
                                animation: isSpeaking ? 'pulse 1.5s ease-in-out infinite' : 'none',
                                boxShadow: isSpeaking ? '0 0 20px rgba(99,102,241,0.4)' : 'none'
                            }}>
                                🤖
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                                    AI Interviewer {isSpeaking && '🔊 Speaking...'}
                                </p>
                                <p style={{ fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.5 }}>
                                    {currentQuestion.question}
                                </p>
                            </div>
                        </div>

                        {/* Replay & Hint buttons */}
                        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                            <button className="btn-secondary" onClick={() => speak(currentQuestion.question)}
                                disabled={isSpeaking}
                                style={{ padding: '6px 14px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <HiVolumeUp /> Replay Question
                            </button>
                            {isSpeaking && (
                                <button className="btn-secondary" onClick={stopSpeaking}
                                    style={{ padding: '6px 14px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <HiStop /> Stop Speaking
                                </button>
                            )}
                            {!evaluation && currentQuestion.hints?.length > 0 && (
                                <button className="btn-secondary" onClick={() => setShowHint(!showHint)}
                                    style={{ padding: '6px 14px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <HiLightBulb /> {showHint ? 'Hide' : 'Show'} Hint
                                </button>
                            )}
                        </div>

                        {showHint && currentQuestion.hints && (
                            <div style={{
                                marginTop: 12, padding: 12, borderRadius: 10,
                                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)'
                            }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b', marginBottom: 4 }}>💡 Hints:</p>
                                {currentQuestion.hints.map((h, i) => (
                                    <p key={i} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 2 }}>• {h}</p>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Student Answer Area */}
                    {!evaluation ? (
                        <div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
                            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16 }}>
                                🎤 Your Answer
                            </p>

                            {/* Mic Button */}
                            <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                <button
                                    onClick={isRecording ? stopRecording : startRecording}
                                    style={{
                                        width: 80, height: 80, borderRadius: '50%',
                                        border: 'none', cursor: 'pointer',
                                        background: isRecording
                                            ? '#555'
                                            : '#333',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 28, color: 'white',
                                        animation: isRecording ? 'pulse 1s ease-in-out infinite' : 'none',
                                        boxShadow: isRecording
                                            ? '0 0 30px rgba(239,68,68,0.4)'
                                            : '0 0 20px rgba(99,102,241,0.3)',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {isRecording ? <HiStop /> : <HiMicrophone />}
                                </button>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 8 }}>
                                    {isRecording ? '🔴 Recording... Tap to stop' : 'Tap to start recording'}
                                </p>
                            </div>

                            {/* Transcript */}
                            {transcript && (
                                <div style={{
                                    padding: 16, borderRadius: 12, marginBottom: 16,
                                    background: 'var(--bg-primary)', border: '1px solid var(--border)',
                                    minHeight: 80, maxHeight: 200, overflowY: 'auto'
                                }}>
                                    <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>{transcript}</p>
                                </div>
                            )}

                            {/* Submit */}
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button className="btn-primary" onClick={submitAnswer}
                                    disabled={!transcript.trim() || loadingEval}
                                    style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                    {loadingEval ? <LoadingSpinner size="sm" /> : <><HiCheck /> Submit Answer</>}
                                </button>
                                {transcript && (
                                    <button className="btn-secondary" onClick={() => setTranscript('')}
                                        style={{ padding: '12px 16px' }}>
                                        <HiX /> Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* ─── Evaluation Results ─── */
                        <div className="glass-card animate-fade-in-up" style={{ padding: 28, marginBottom: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>📊 AI Evaluation</h3>
                                <div style={{
                                    fontSize: '1.5rem', fontWeight: 800, color: getScoreColor(evaluation.score),
                                    background: `${getScoreColor(evaluation.score)}12`, padding: '6px 18px', borderRadius: 10
                                }}>
                                    {evaluation.score}/10
                                </div>
                            </div>

                            {/* Score Bars */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
                                {[
                                    { label: 'Score', val: evaluation.score },
                                    { label: 'Confidence', val: evaluation.confidence },
                                    { label: 'Clarity', val: evaluation.clarity },
                                ].map(b => (
                                    <div key={b.label}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{b.label}</span>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: getScoreColor(b.val) }}>{b.val}/10</span>
                                        </div>
                                        <div style={{ height: 6, background: 'var(--bg-primary)', borderRadius: 3 }}>
                                            <div style={{
                                                height: '100%', borderRadius: 3, width: `${b.val * 10}%`,
                                                background: getScoreColor(b.val), transition: 'width 0.8s ease'
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Verdict */}
                            <p style={{
                                fontSize: '0.85rem', fontWeight: 600, marginBottom: 16,
                                padding: '10px 16px', borderRadius: 10,
                                background: `${getScoreColor(evaluation.score)}10`,
                                color: getScoreColor(evaluation.score)
                            }}>
                                Verdict: {evaluation.verdict}
                            </p>

                            {/* Feedback */}
                            <p style={{ fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 16 }}>
                                {evaluation.feedback}
                            </p>

                            {/* Correct & Missing */}
                            <div className="eval-split" style={{ marginBottom: 16 }}>
                                <div style={{ padding: 12, borderRadius: 10, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                                    <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#999', marginBottom: 6 }}>✓ What you got right:</p>
                                    {evaluation.correctParts?.map((p, i) => (
                                        <p key={i} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 2 }}>• {p}</p>
                                    ))}
                                </div>
                                <div style={{ padding: 12, borderRadius: 10, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                                    <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#666', marginBottom: 6 }}>✗ What you missed:</p>
                                    {evaluation.missingParts?.map((p, i) => (
                                        <p key={i} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 2 }}>• {p}</p>
                                    ))}
                                </div>
                            </div>

                            {/* Ideal Answer */}
                            <div style={{
                                padding: 14, borderRadius: 10,
                                background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
                                marginBottom: 16
                            }}>
                                <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--primary-light)', marginBottom: 6 }}>💎 Ideal Answer:</p>
                                <p style={{ fontSize: '0.8rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>{evaluation.idealAnswer}</p>
                                <button className="btn-secondary" onClick={() => speak(evaluation.idealAnswer)}
                                    style={{ marginTop: 8, padding: '4px 12px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <HiVolumeUp /> Listen to ideal answer
                                </button>
                            </div>

                            {/* Next / Finish */}
                            <button className="btn-primary" onClick={nextQuestion} style={{
                                width: '100%', padding: '14px', fontSize: '0.95rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                            }}>
                                {questionNumber >= totalQuestions ? (
                                    <><HiCheck /> View Scorecard</>
                                ) : (
                                    <><HiArrowRight /> Next Question</>
                                )}
                            </button>
                        </div>
                    )}
                </>
            ) : null}
        </div>
    );
}
