import { useState } from 'react';
import { generateQuestions } from '../services/api';
import { HiLightningBolt, HiAcademicCap, HiUserGroup } from 'react-icons/hi';
import LoadingSpinner from '../components/LoadingSpinner';

const ROLES = ['Frontend Developer', 'Backend Developer', 'MERN Stack', 'Full Stack', 'DSA', 'DevOps', 'React Developer', 'Node.js Developer', 'Python Developer', 'Java Developer'];
const LEVELS = ['Fresher', 'Junior (1-2 yrs)', 'Mid (3-5 yrs)', 'Senior (5+ yrs)'];

export default function QuestionGenerator() {
    const [role, setRole] = useState('');
    const [level, setLevel] = useState('');
    const [skills, setSkills] = useState('');
    const [questions, setQuestions] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('technical');

    const handleGenerate = async () => {
        if (!role || !level) return;
        setLoading(true);
        try {
            const { data } = await generateQuestions({ role, level, skills });
            setQuestions(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getDifficultyChip = (diff) => {
        const d = diff?.toLowerCase();
        if (d === 'easy') return 'chip-easy';
        if (d === 'medium') return 'chip-medium';
        if (d === 'hard') return 'chip-hard';
        return '';
    };

    return (
        <div className="page-container animate-fade-in-up">
            <h1 className="page-title">Question <span className="gradient-text">Generator</span></h1>
            <p className="page-subtitle">Generate tailored interview questions based on your target role and experience</p>

            {/* Configuration */}
            <div className="glass-card" style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Configure your question set</h3>

                <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, display: 'block', color: 'var(--text-secondary)' }}>Target Role</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {ROLES.map(r => (
                            <button key={r} className={`chip ${role === r ? 'active' : ''}`} onClick={() => setRole(r)}>{r}</button>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, display: 'block', color: 'var(--text-secondary)' }}>Experience Level</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {LEVELS.map(l => (
                            <button key={l} className={`chip ${level === l ? 'active' : ''}`} onClick={() => setLevel(l)}>{l}</button>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, display: 'block', color: 'var(--text-secondary)' }}>Additional Skills (optional)</label>
                    <input className="input-field" type="text" placeholder="e.g. React, Node.js, MongoDB, TypeScript"
                        value={skills} onChange={e => setSkills(e.target.value)} />
                </div>

                <button className="btn-primary" onClick={handleGenerate} disabled={loading || !role || !level}>
                    {loading ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <><HiLightningBolt /> Generate Questions</>}
                </button>
            </div>

            {loading && <LoadingSpinner text="AI is generating your questions..." />}

            {/* Results */}
            {questions && !loading && (
                <div>
                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 2 }}>
                        {[
                            { key: 'technical', label: 'Technical', icon: <HiLightningBolt />, count: questions.technical?.length },
                            { key: 'behavioral', label: 'Behavioral', icon: <HiUserGroup />, count: questions.behavioral?.length },
                            { key: 'hr', label: 'HR', icon: <HiAcademicCap />, count: questions.hr?.length },
                        ].map(tab => (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                                padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
                                color: activeTab === tab.key ? 'var(--primary-light)' : 'var(--text-secondary)',
                                borderBottom: activeTab === tab.key ? '2px solid var(--primary)' : '2px solid transparent',
                                transition: 'all 0.2s'
                            }}>
                                {tab.icon} {tab.label} ({tab.count || 0})
                            </button>
                        ))}
                    </div>

                    {/* Question List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {activeTab === 'technical' && questions.technical?.map((q, i) => (
                            <div key={i} className="glass-card" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                <span style={{
                                    background: 'var(--primary)', color: 'white', width: 28, height: 28,
                                    borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.8rem', fontWeight: 700, flexShrink: 0
                                }}>{i + 1}</span>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 8 }}>{q.question}</p>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        {q.difficulty && <span className={`chip ${getDifficultyChip(q.difficulty)}`} style={{ fontSize: '0.7rem' }}>{q.difficulty}</span>}
                                        {q.topic && <span className="chip" style={{ fontSize: '0.7rem' }}>{q.topic}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {activeTab === 'behavioral' && questions.behavioral?.map((q, i) => (
                            <div key={i} className="glass-card" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                <span style={{
                                    background: 'var(--accent)', color: 'white', width: 28, height: 28,
                                    borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.8rem', fontWeight: 700, flexShrink: 0
                                }}>{i + 1}</span>
                                <div>
                                    <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 6 }}>{q.question}</p>
                                    {q.category && <span className="chip" style={{ fontSize: '0.7rem' }}>{q.category}</span>}
                                </div>
                            </div>
                        ))}
                        {activeTab === 'hr' && questions.hr?.map((q, i) => (
                            <div key={i} className="glass-card" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                <span style={{
                                    background: 'var(--success)', color: 'white', width: 28, height: 28,
                                    borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.8rem', fontWeight: 700, flexShrink: 0
                                }}>{i + 1}</span>
                                <div>
                                    <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 6 }}>{q.question}</p>
                                    {q.category && <span className="chip" style={{ fontSize: '0.7rem' }}>{q.category}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
