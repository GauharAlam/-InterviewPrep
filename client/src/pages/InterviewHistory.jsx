import { useState, useEffect } from 'react';
import { getResumeHistory, getVoiceHistory } from '../services/api';
import { HiDocumentText, HiCode, HiMicrophone, HiClock } from 'react-icons/hi';
import LoadingSpinner from '../components/LoadingSpinner';

export default function InterviewHistory() {
    const [activeTab, setActiveTab] = useState('all');
    const [resumes, setResumes] = useState([]);
    const [voiceSessions, setVoiceSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            const [r, v] = await Promise.all([
                getResumeHistory().catch(() => ({ data: [] })),
                getVoiceHistory().catch(() => ({ data: [] }))
            ]);
            setResumes(r.data);
            setVoiceSessions(v.data);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner size="lg" text="Loading history..." />;

    const allItems = [
        ...resumes.map(r => ({ ...r, itemType: 'resume', score: r.atsScore, date: r.createdAt })),
        ...voiceSessions.map(v => ({ ...v, itemType: 'voice', score: v.communicationScore, date: v.createdAt }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    const filtered = activeTab === 'all' ? allItems : allItems.filter(i => i.itemType === activeTab);

    const getIcon = (type) => {
        if (type === 'resume') return <HiDocumentText style={{ color: '#6366f1' }} />;
        if (type === 'coding') return <HiCode style={{ color: '#06b6d4' }} />;
        return <HiMicrophone style={{ color: '#10b981' }} />;
    };

    const getLabel = (type) => {
        if (type === 'resume') return 'Resume Analysis';
        if (type === 'coding') return 'Coding Submission';
        return 'Voice Interview';
    };

    const getScoreColor = (score) => {
        if (score >= 70) return '#10b981';
        if (score >= 40) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div className="page-container animate-fade-in-up">
            <h1 className="page-title">Interview <span className="gradient-text">History</span></h1>
            <p className="page-subtitle">Track all your past interview activities and scores</p>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                {[
                    { key: 'all', label: 'All', count: allItems.length },
                    { key: 'resume', label: 'Resume', count: resumes.length },
                    { key: 'voice', label: 'Voice', count: voiceSessions.length },
                ].map(tab => (
                    <button key={tab.key} className={`chip ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}>
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                    <p style={{ fontSize: '1.1rem', marginBottom: 8 }}>No history yet</p>
                    <p style={{ color: 'var(--text-secondary)' }}>Start practicing to see your progress here!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {filtered.map((item, i) => (
                        <div key={i} className="glass-card" style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '16px 20px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{
                                    width: 42, height: 42, borderRadius: 10,
                                    background: 'var(--bg-primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 18
                                }}>
                                    {getIcon(item.itemType)}
                                </div>
                                <div>
                                    <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                                        {item.title || getLabel(item.itemType)}
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}>
                                            <HiClock /> {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {item.language && <span className="chip" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>{item.language}</span>}
                                        {item.result && <span className={`chip ${item.result === 'pass' ? 'chip-easy' : 'chip-hard'}`} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>{item.result}</span>}
                                    </div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '1.4rem', fontWeight: 700, color: getScoreColor(item.score) }}>
                                    {item.score}
                                </span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>/100</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
