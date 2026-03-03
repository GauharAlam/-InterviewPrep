import { useState, useEffect } from 'react';
import { getCompanyProfile } from '../services/api';
import { HiOfficeBuilding, HiBriefcase, HiCurrencyRupee, HiChatAlt2, HiLightBulb, HiExclamation, HiBookOpen, HiSearch } from 'react-icons/hi';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const POPULAR_COMPANIES = [
    { name: 'Google', logo: 'G', color: '#ea4335' },
    { name: 'Amazon', logo: 'A', color: '#ff9900' },
    { name: 'Microsoft', logo: 'M', color: '#00a4ef' },
    { name: 'Meta', logo: 'M', color: '#1877f2' },
    { name: 'Apple', logo: 'A', color: '#a3aaae' },
    { name: 'Netflix', logo: 'N', color: '#e50914' },
    { name: 'TCS', logo: 'T', color: '#111827' },
    { name: 'Infosys', logo: 'I', color: '#007cc3' },
    { name: 'Wipro', logo: 'W', color: '#ffb500' },
    { name: 'Cognizant', logo: 'C', color: '#000048' },
    { name: 'Accenture', logo: 'A', color: '#a100ff' },
    { name: 'Uber', logo: 'U', color: '#000000' }
];

const ROLES = [
    'Software Engineer', 'Frontend Developer', 'Backend Developer',
    'Full Stack Developer', 'Data Scientist', 'Product Manager',
    'System Design', 'DevOps Engineer'
];

export default function CompanyPrep() {
    const [company, setCompany] = useState('');
    const [role, setRole] = useState('Software Engineer');
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview'); // overview | technical | behavioral

    const fetchProfile = async (companyName, event) => {
        if (event) event.preventDefault();
        const searchCompany = companyName || company;
        if (!searchCompany.trim()) return toast.error('Please enter a company name');

        setCompany(searchCompany);
        setLoading(true);
        setActiveTab('overview');
        try {
            const { data } = await getCompanyProfile({ company: searchCompany, role });
            setProfile(data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load company profile');
        } finally {
            setLoading(false);
        }
    };

    const getDifficultyColor = (diff) => {
        if (diff?.toLowerCase().includes('easy')) return '#10b981';
        if (diff?.toLowerCase().includes('medium')) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div className="page-container animate-fade-in-up">
            <h1 className="page-title">Company Profile & <span className="gradient-text">Prep Hub</span></h1>
            <p className="page-subtitle">Get detailed interview processes, question patterns, and tips for top tech companies</p>

            {/* Search Bar */}
            <div className="glass-card" style={{ marginBottom: 32, padding: '24px' }}>
                <form onSubmit={(e) => fetchProfile('', e)} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', background: 'var(--bg-primary)', padding: '0 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
                        <HiSearch style={{ color: 'var(--text-secondary)', fontSize: 20 }} />
                        <input
                            type="text"
                            placeholder="Search any company (e.g. Google, Stripe, TCS)..."
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            style={{ width: '100%', background: 'transparent', border: 'none', padding: '14px', color: 'var(--text-primary)', outline: 'none' }}
                        />
                    </div>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="input-field"
                        style={{ width: 220, margin: 0 }}
                    >
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '0 32px' }}>
                        {loading ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Search'}
                    </button>
                </form>
            </div>

            {loading ? (
                <LoadingSpinner size="lg" text={`Analyzing ${company || 'company'} interview patterns...`} />
            ) : !profile ? (
                /* Popular Companies Grid */
                <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>🎯 Popular Companies</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
                        {POPULAR_COMPANIES.map(comp => (
                            <button key={comp.name} onClick={() => fetchProfile(comp.name)} className="glass-card hover-glow" style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '24px',
                                border: '1px solid var(--border)', background: 'var(--bg-glass)', cursor: 'pointer', transition: 'all 0.2s',
                                textAlign: 'center'
                            }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: 12, background: comp.color, display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: 'white'
                                }}>
                                    {comp.logo}
                                </div>
                                <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{comp.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                /* Profile View */
                <div className="animate-fade-in-up">
                    {/* Header */}
                    <div className="glass-card" style={{ marginBottom: 24, padding: '32px 24px', display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <div style={{
                            width: 80, height: 80, borderRadius: 20, background: '#333',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, color: 'white'
                        }}>
                            {profile.company.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 280 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>{profile.company}</h2>
                                <span className="chip" style={{ background: 'rgba(168,85,247,0.15)', color: 'var(--primary-light)' }}>{role}</span>
                                <span className="chip" style={{ border: `1px solid ${getDifficultyColor(profile.difficulty)}`, color: getDifficultyColor(profile.difficulty), background: 'transparent' }}>
                                    {profile.difficulty} Difficulty
                                </span>
                            </div>
                            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>{profile.overview}</p>

                            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    <HiBriefcase style={{ fontSize: '1.2rem', color: 'var(--primary-light)' }} /> {profile.interviewProcess?.numberOfRounds} Rounds
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    <HiCurrencyRupee style={{ fontSize: '1.2rem', color: '#10b981' }} /> {profile.avgSalary} Avg Salary
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    <HiChatAlt2 style={{ fontSize: '1.2rem', color: '#fbbf24' }} /> {profile.interviewProcess?.totalDuration} Process
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
                        {[
                            { id: 'overview', label: 'Overview & Rounds', icon: <HiOfficeBuilding /> },
                            { id: 'technical', label: 'Technical Questions', icon: <HiBriefcase /> },
                            { id: 'behavioral', label: 'Behavioral & HR', icon: <HiChatAlt2 /> }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}
                                style={{ padding: '10px 20px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8 }}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content: Overview */}
                    {activeTab === 'overview' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                            {/* Left Col */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                {/* Interview Rounds */}
                                <div className="glass-card">
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <HiChatAlt2 style={{ color: 'var(--primary)' }} /> Interview Rounds
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        {profile.interviewRounds?.map((round, i) => (
                                            <div key={i} style={{
                                                padding: '16px', background: 'var(--bg-primary)', borderRadius: 12, borderLeft: '4px solid var(--primary)',
                                                position: 'relative'
                                            }}>
                                                <div style={{ position: 'absolute', top: -10, left: -12, width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{i + 1}</div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, paddingLeft: 8 }}>
                                                    <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>{round.name}</h4>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-card)', padding: '2px 8px', borderRadius: 999 }}>{round.duration}</span>
                                                </div>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12, paddingLeft: 8 }}>{round.description}</p>
                                                {round.tips?.length > 0 && (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 8 }}>
                                                        {round.tips.map((tip, ti) => (
                                                            <div key={ti} style={{ fontSize: '0.75rem', color: 'var(--primary-light)' }}>• {tip}</div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Common Mistakes */}
                                <div className="glass-card" style={{ background: 'rgba(244,63,94,0.05)', borderColor: 'rgba(244,63,94,0.2)' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16, color: '#f43f5e', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <HiExclamation /> Common Pitfalls
                                    </h3>
                                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {profile.commonMistakes?.map((mistake, i) => (
                                            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                                <span style={{ color: '#f43f5e', marginTop: 2 }}>✕</span> {mistake}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Right Col */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                {/* Key Topics */}
                                <div className="glass-card">
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <HiBookOpen style={{ color: 'var(--accent)' }} /> Focus Areas
                                    </h3>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {profile.keyTopics?.map((topic, i) => (
                                            <span key={i} className="chip" style={{ background: 'rgba(236,72,153,0.1)', color: 'var(--accent)', border: '1px solid rgba(236,72,153,0.2)' }}>
                                                {topic}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Pro Tips */}
                                <div className="glass-card" style={{ background: 'rgba(34,211,238,0.05)', borderColor: 'rgba(34,211,238,0.2)' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16, color: '#22d3ee', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <HiLightBulb /> Insider Tips
                                    </h3>
                                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {profile.interviewTips?.map((tip, i) => (
                                            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                                <span style={{ color: '#22d3ee', marginTop: 2 }}>⚡</span> {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Company Values */}
                                <div className="glass-card" style={{ background: 'rgba(251,191,36,0.05)', borderColor: 'rgba(251,191,36,0.2)' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12, color: '#fbbf24' }}>Company Values</h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 12 }}>Mention these in your behavioral rounds to stand out.</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {profile.companyValues?.map((val, i) => (
                                            <span key={i} style={{ padding: '6px 12px', background: 'var(--bg-primary)', borderRadius: 20, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                ★ {val}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab Content: Technical */}
                    {activeTab === 'technical' && (
                        <div className="glass-card">
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Technical Question Bank</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 24 }}>High-frequency questions asked at {profile.company} for {role}</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {profile.questions?.technical?.map((q, i) => (
                                    <div key={i} style={{ padding: '16px 20px', background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                        <div style={{ fontSize: '1.2rem', color: 'var(--primary)', marginTop: 2, fontWeight: 700 }}>Q{i + 1}.</div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: 500, fontSize: '0.95rem', marginBottom: 8, lineHeight: 1.5 }}>{q.question}</p>
                                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                <span className={`chip chip-${q.difficulty}`} style={{ fontSize: '0.7rem' }}>{q.difficulty}</span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Topic: {q.topic}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tab Content: Behavioral */}
                    {activeTab === 'behavioral' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            {/* Behavioral */}
                            <div className="glass-card">
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Behavioral Questions</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20 }}>Use the STAR method (Situation, Task, Action, Result) to answer these.</p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {profile.questions?.behavioral?.map((q, i) => (
                                        <div key={i} style={{ padding: '16px 20px', background: 'var(--bg-primary)', borderRadius: 12 }}>
                                            <p style={{ fontWeight: 500, fontSize: '0.95rem', marginBottom: 8 }}>🗣️ {q.question}</p>
                                            <div style={{ fontSize: '0.8rem', color: '#22d3ee', background: 'rgba(34,211,238,0.1)', padding: '8px 12px', borderRadius: 8 }}>
                                                <strong>Pro Tip:</strong> {q.tip}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* HR */}
                            <div className="glass-card">
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 20 }}>Standard HR Questions</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {profile.questions?.hr?.map((q, i) => (
                                        <div key={i} style={{ padding: '16px 20px', background: 'var(--bg-primary)', borderRadius: 12 }}>
                                            <p style={{ fontWeight: 500, fontSize: '0.95rem', marginBottom: 8 }}>🤝 {q.question}</p>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tip: {q.tip}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
