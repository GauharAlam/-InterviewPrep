import { useState } from 'react';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useSelector } from 'react-redux';
import { uploadResume, getResumeHistory } from '../services/api';
import { HiCloudUpload, HiDocumentText, HiCheckCircle, HiExclamationCircle, HiLightBulb, HiStar, HiDownload } from 'react-icons/hi';
import LoadingSpinner from '../components/LoadingSpinner';
import { generateResumeReport } from '../utils/pdfReport';

export default function ResumeAnalysis() {
    const { user } = useSelector(state => state.auth);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;
        if (file.type !== 'application/pdf') {
            setError('Please upload a PDF file');
            return;
        }

        setLoading(true);
        setError('');
        setAnalysis(null);

        const formData = new FormData();
        formData.append('resume', file);

        try {
            const { data } = await uploadResume(formData);
            setAnalysis(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to analyze resume');
        } finally {
            setLoading(false);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
        maxSize: 5 * 1024 * 1024
    });

    const loadHistory = async () => {
        try {
            const { data } = await getResumeHistory();
            setHistory(data);
            setShowHistory(true);
        } catch (err) {
            console.error(err);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return '#10b981';
        if (score >= 60) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div className="page-container animate-fade-in-up">
            <h1 className="page-title">Resume <span className="gradient-text">Analysis</span></h1>
            <p className="page-subtitle">Upload your resume to get AI-powered ATS scoring and improvement suggestions</p>

            {/* Upload Zone */}
            {!analysis && !loading && (
                <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`} style={{ marginBottom: 24 }}>
                    <input {...getInputProps()} />
                    <HiCloudUpload style={{ fontSize: 48, color: 'var(--primary-light)', marginBottom: 16 }} />
                    <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>
                        {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume PDF'}
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>or click to browse (PDF, max 5MB)</p>
                </div>
            )}

            {error && (
                <div style={{
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: 12, padding: '14px 18px', marginBottom: 20, color: '#ef4444'
                }}>{error}</div>
            )}

            {loading && (
                <div className="glass-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
                    <div className="spinner spinner-lg" style={{ margin: '0 auto 20px' }} />
                    <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Analyzing your resume...</p>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Our AI is evaluating your resume against ATS standards</p>
                </div>
            )}

            {/* Analysis Results */}
            {analysis && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* ATS Score */}
                    <div className="glass-card" style={{ textAlign: 'center' }}>
                        <h3 style={{ marginBottom: 20, fontSize: '1.1rem', fontWeight: 600 }}>ATS Score</h3>
                        <div style={{ position: 'relative', width: 160, height: 160, margin: '0 auto' }}>
                            <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
                                <circle cx="80" cy="80" r="70" fill="none" stroke="var(--border)" strokeWidth="10" />
                                <circle cx="80" cy="80" r="70" fill="none"
                                    stroke={getScoreColor(analysis.atsScore)}
                                    strokeWidth="10"
                                    strokeDasharray={`${(analysis.atsScore / 100) * 440} 440`}
                                    strokeLinecap="round"
                                    style={{ transition: 'stroke-dasharray 1s ease' }}
                                />
                            </svg>
                            <div style={{
                                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                textAlign: 'center'
                            }}>
                                <span style={{ fontSize: '2.5rem', fontWeight: 700, color: getScoreColor(analysis.atsScore) }}>{analysis.atsScore}</span>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>out of 100</p>
                            </div>
                        </div>
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                        <div className="glass-card">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1rem', fontWeight: 600, marginBottom: 14, color: '#10b981' }}>
                                <HiCheckCircle /> Strengths
                            </h3>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {analysis.strengths?.map((s, i) => (
                                    <li key={i} style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.08)', borderRadius: 10, fontSize: '0.9rem', lineHeight: 1.5 }}>
                                        ✅ {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="glass-card">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1rem', fontWeight: 600, marginBottom: 14, color: '#ef4444' }}>
                                <HiExclamationCircle /> Weaknesses
                            </h3>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {analysis.weaknesses?.map((w, i) => (
                                    <li key={i} style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', borderRadius: 10, fontSize: '0.9rem', lineHeight: 1.5 }}>
                                        ⚠️ {w}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Missing Skills */}
                    <div className="glass-card">
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 14 }}>
                            <HiStar style={{ display: 'inline', marginRight: 8, color: 'var(--warning)' }} />
                            Missing Skills
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {analysis.missingSkills?.map((skill, i) => (
                                <span key={i} className="chip chip-medium">{skill}</span>
                            ))}
                        </div>
                    </div>

                    {/* Improvements */}
                    <div className="glass-card">
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 14 }}>
                            <HiLightBulb style={{ display: 'inline', marginRight: 8, color: 'var(--accent)' }} />
                            Suggested Improvements
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {analysis.improvements?.map((imp, i) => (
                                <div key={i} style={{ padding: '12px 16px', background: 'var(--bg-primary)', borderRadius: 10, fontSize: '0.9rem', lineHeight: 1.5 }}>
                                    💡 {imp}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Suggested Questions */}
                    <div className="glass-card">
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 14 }}>
                            <HiDocumentText style={{ display: 'inline', marginRight: 8, color: 'var(--primary-light)' }} />
                            Suggested Interview Questions
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {analysis.technicalQuestions?.map((q, i) => (
                                <div key={i} style={{
                                    padding: '12px 16px', background: 'var(--bg-primary)', borderRadius: 10,
                                    display: 'flex', gap: 10, alignItems: 'flex-start'
                                }}>
                                    <span style={{ color: 'var(--primary-light)', fontWeight: 700, flexShrink: 0 }}>Q{i + 1}.</span>
                                    <div>
                                        <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{q.question}</p>
                                        {q.category && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Category: {q.category}</span>}
                                    </div>
                                </div>
                            ))}
                            <h4 style={{ marginTop: 8, fontSize: '0.95rem', fontWeight: 600, color: 'var(--accent)' }}>Behavioral Questions</h4>
                            {analysis.behavioralQuestions?.map((q, i) => (
                                <div key={i} style={{ padding: '12px 16px', background: 'var(--bg-primary)', borderRadius: 10, fontSize: '0.9rem', lineHeight: 1.5 }}>
                                    🗣️ {q.question}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <button className="btn-primary" onClick={() => setAnalysis(null)}>
                            <HiCloudUpload /> Upload Another Resume
                        </button>
                        <button className="btn-secondary" onClick={() => generateResumeReport(analysis, user)}>
                            <HiDownload /> Download PDF Report
                        </button>
                    </div>
                </div>
            )}

            {/* History Button */}
            {!loading && (
                <div style={{ marginTop: 24 }}>
                    <button className="btn-secondary" onClick={loadHistory}>View Analysis History</button>
                    {showHistory && history.length > 0 && (
                        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {history.map((h, i) => (
                                <div key={i} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px' }}>
                                    <div>
                                        <p style={{ fontWeight: 600 }}>Analysis #{history.length - i}</p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(h.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <span style={{
                                        fontSize: '1.3rem', fontWeight: 700,
                                        color: getScoreColor(h.atsScore)
                                    }}>{h.atsScore}/100</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {showHistory && history.length === 0 && (
                        <p style={{ marginTop: 12, color: 'var(--text-secondary)' }}>No previous analyses found.</p>
                    )}
                </div>
            )}
        </div>
    );
}
