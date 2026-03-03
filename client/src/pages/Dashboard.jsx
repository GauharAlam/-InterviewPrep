import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getDashboardStats, getImprovementPlan } from '../services/api';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HiDocumentText, HiCode, HiMicrophone, HiLightningBolt, HiTrendingUp, HiClipboardList, HiDownload } from 'react-icons/hi';
import LoadingSpinner from '../components/LoadingSpinner';
import { generateDashboardReport } from '../utils/pdfReport';

export default function Dashboard() {
    const { user } = useSelector(state => state.auth);
    const [stats, setStats] = useState(null);
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [planLoading, setPlanLoading] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data } = await getDashboardStats();
            setStats(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPlan = async () => {
        if (!stats) return;
        setPlanLoading(true);
        try {
            const { data } = await getImprovementPlan({
                resumeScore: stats.resumeScore,
                codingScore: stats.codingScore,
                communicationScore: stats.communicationScore,
                overallScore: stats.overallScore
            });
            setPlan(data);
        } catch (err) {
            console.error(err);
        } finally {
            setPlanLoading(false);
        }
    };

    if (loading) return <LoadingSpinner size="lg" text="Loading dashboard..." />;

    const radarData = [
        { subject: 'Resume', score: stats?.resumeScore || 0 },
        { subject: 'Coding', score: stats?.codingScore || 0 },
        { subject: 'Communication', score: stats?.communicationScore || 0 },
    ];

    const historyData = [
        ...(stats?.history?.submissions || []),
        ...(stats?.history?.voiceSessions || [])
    ].sort((a, b) => new Date(a.date) - new Date(b.date)).map((item, i) => ({
        name: `#${i + 1}`,
        score: item.score,
        type: item.type
    }));

    const scoreCards = [
        { label: 'Resume Score', value: stats?.resumeScore || 0, icon: <HiDocumentText />, color: '#a855f7', link: '/resume' },
        { label: 'Coding Score', value: stats?.codingScore || 0, icon: <HiCode />, color: '#ec4899', link: '/coding' },
        { label: 'Communication', value: stats?.communicationScore || 0, icon: <HiMicrophone />, color: '#22d3ee', link: '/voice' },
        { label: 'Overall Score', value: stats?.overallScore || 0, icon: <HiLightningBolt />, color: '#fbbf24', link: '#' },
    ];

    return (
        <div className="page-container animate-fade-in-up">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 className="page-title">Welcome back, <span className="gradient-text">{user?.name}</span> 👋</h1>
                    <p className="page-subtitle" style={{ marginBottom: 0 }}>Track your interview preparation progress</p>
                </div>
                <button className="btn-secondary" onClick={() => generateDashboardReport(stats, user)} style={{ flexShrink: 0 }}>
                    <HiDownload /> Download Report
                </button>
            </div>

            {/* Score Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 32 }}>
                {scoreCards.map((card, i) => (
                    <Link key={i} to={card.link} style={{ textDecoration: 'none' }}>
                        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 16, animationDelay: `${i * 0.1}s` }}>
                            <div style={{
                                width: 48, height: 48, borderRadius: 12,
                                background: `${card.color}20`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 22, color: card.color
                            }}>{card.icon}</div>
                            <div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{card.label}</p>
                                <p style={{ fontSize: '1.8rem', fontWeight: 700, color: card.color }}>{card.value}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 32 }}>
                {/* Radar Chart */}
                <div className="glass-card">
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Skill Breakdown</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <RadarChart data={radarData}>
                            <PolarGrid stroke="var(--border)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                            <PolarRadiusAxis domain={[0, 100]} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                            <Radar name="Score" dataKey="score" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} strokeWidth={2} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                {/* Line Chart */}
                <div className="glass-card">
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Progress Over Time</h3>
                    {historyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={historyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                                <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                                <Line type="monotone" dataKey="score" stroke="#ec4899" strokeWidth={2} dot={{ fill: '#ec4899' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                            <p>Complete some interviews to see your progress</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card" style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Quick Actions</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    <Link to="/resume" className="btn-primary" style={{ textDecoration: 'none' }}>
                        <HiDocumentText /> Analyze Resume
                    </Link>
                    <Link to="/questions" className="btn-secondary" style={{ textDecoration: 'none' }}>
                        <HiClipboardList /> Generate Questions
                    </Link>
                    <Link to="/coding" className="btn-secondary" style={{ textDecoration: 'none' }}>
                        <HiCode /> Practice Coding
                    </Link>
                    <Link to="/voice" className="btn-secondary" style={{ textDecoration: 'none' }}>
                        <HiMicrophone /> Voice Interview
                    </Link>
                </div>
            </div>

            {/* AI Improvement Plan */}
            <div className="glass-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                        <HiTrendingUp style={{ display: 'inline', marginRight: 8, color: 'var(--primary-light)' }} />
                        AI Improvement Plan
                    </h3>
                    <button className="btn-primary" onClick={fetchPlan} disabled={planLoading} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                        {planLoading ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Generate Plan'}
                    </button>
                </div>
                {plan ? (
                    <div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>{plan.summary}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {plan.plan?.map((item, i) => (
                                <div key={i} style={{
                                    display: 'flex', gap: 12, padding: '12px 16px',
                                    background: 'var(--bg-primary)', borderRadius: 12, alignItems: 'flex-start'
                                }}>
                                    <span style={{
                                        padding: '2px 8px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600, flexShrink: 0,
                                        background: item.priority === 'high' ? 'rgba(239,68,68,0.15)' : item.priority === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                                        color: item.priority === 'high' ? '#ef4444' : item.priority === 'medium' ? '#f59e0b' : '#10b981'
                                    }}>{item.priority}</span>
                                    <div>
                                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.area}</p>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 2 }}>{item.suggestion}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p style={{ color: 'var(--text-secondary)' }}>Click "Generate Plan" to get an AI-powered improvement plan based on your scores.</p>
                )}
            </div>

            {/* Stats Footer */}
            <div style={{ display: 'flex', gap: 16, marginTop: 20, flexWrap: 'wrap' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    📝 {stats?.totalSubmissions || 0} coding submissions
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    🎤 {stats?.totalVoiceSessions || 0} voice sessions
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    📊 {stats?.totalInterviews || 0} total interviews
                </div>
            </div>
        </div>
    );
}
