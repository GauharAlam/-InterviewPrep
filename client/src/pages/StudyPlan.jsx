import { useState, useEffect } from 'react';
import { generateStudyPlan, getStudyPlans, updatePlanProgress, deleteStudyPlan } from '../services/api';
import { HiCalendar, HiAcademicCap, HiClock, HiCheckCircle, HiChevronDown, HiChevronRight, HiTrash, HiLightBulb, HiFlag } from 'react-icons/hi';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ROLES = [
    'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
    'MERN Stack Developer', 'React Developer', 'Node.js Developer',
    'Python Developer', 'Java Developer', 'Data Scientist',
    'DevOps Engineer', 'Software Engineer', 'System Design'
];

const COMPANIES = [
    'General', 'Google', 'Amazon', 'Microsoft', 'Meta', 'Apple',
    'Netflix', 'TCS', 'Infosys', 'Wipro', 'HCL', 'Cognizant',
    'Flipkart', 'Razorpay', 'Swiggy', 'Zomato', 'Paytm', 'Other'
];

const SKILL_OPTIONS = [
    'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'Express',
    'MongoDB', 'SQL', 'HTML/CSS', 'Git', 'Docker', 'AWS', 'TypeScript',
    'Data Structures', 'Algorithms', 'System Design', 'REST API', 'GraphQL'
];

const TASK_COLORS = {
    theory: { bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.3)', color: '#a855f7', icon: '📖' },
    practice: { bg: 'rgba(34,211,238,0.12)', border: 'rgba(34,211,238,0.3)', color: '#22d3ee', icon: '💻' },
    project: { bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.3)', color: '#ec4899', icon: '🛠️' },
    mock: { bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)', color: '#fbbf24', icon: '🎤' },
    revision: { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', color: '#22c55e', icon: '🔄' },
};

export default function StudyPlanPage() {
    const [view, setView] = useState('list'); // 'list' | 'create' | 'detail'
    const [plans, setPlans] = useState([]);
    const [activePlan, setActivePlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [expandedWeeks, setExpandedWeeks] = useState({});
    const [expandedDays, setExpandedDays] = useState({});
    const [progress, setProgress] = useState({});

    // Form state
    const [targetCompany, setTargetCompany] = useState('General');
    const [customCompany, setCustomCompany] = useState('');
    const [targetRole, setTargetRole] = useState('Full Stack Developer');
    const [interviewDate, setInterviewDate] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('fresher');
    const [hoursPerDay, setHoursPerDay] = useState(3);
    const [selectedSkills, setSelectedSkills] = useState([]);

    useEffect(() => { fetchPlans(); }, []);

    const fetchPlans = async () => {
        try {
            const { data } = await getStudyPlans();
            setPlans(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const toggleSkill = (skill) => {
        setSelectedSkills(prev =>
            prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
        );
    };

    const handleGenerate = async () => {
        if (!interviewDate) return toast.error('Please select an interview date');
        const interview = new Date(interviewDate);
        if (interview <= new Date()) return toast.error('Interview date must be in the future');

        setGenerating(true);
        try {
            const company = targetCompany === 'Other' ? customCompany : targetCompany;
            const { data } = await generateStudyPlan({
                targetCompany: company,
                targetRole,
                interviewDate,
                currentSkills: selectedSkills,
                experienceLevel,
                hoursPerDay
            });
            setActivePlan(data);
            setProgress(data.progress ? Object.fromEntries(Object.entries(data.progress)) : {});
            setView('detail');
            setExpandedWeeks({ 0: true });
            toast.success('Study plan generated!');
            fetchPlans();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to generate plan');
        } finally { setGenerating(false); }
    };

    const openPlan = (plan) => {
        setActivePlan(plan);
        setProgress(plan.progress ? (plan.progress instanceof Map ? Object.fromEntries(plan.progress) : plan.progress) : {});
        setExpandedWeeks({ 0: true });
        setView('detail');
    };

    const toggleDay = async (dayKey) => {
        const newVal = !progress[dayKey];
        setProgress(prev => ({ ...prev, [dayKey]: newVal }));
        try {
            await updatePlanProgress(activePlan._id, { dayKey, completed: newVal });
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        try {
            await deleteStudyPlan(id);
            setPlans(prev => prev.filter(p => p._id !== id));
            toast.success('Plan deleted');
            if (activePlan?._id === id) setView('list');
        } catch (err) { console.error(err); }
    };

    const daysUntil = (date) => {
        const d = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
        return d > 0 ? d : 0;
    };

    const getPlanProgress = (plan) => {
        const totalDays = plan.plan?.totalDays || 1;
        const p = plan.progress instanceof Map ? Object.fromEntries(plan.progress) : (plan.progress || {});
        const completed = Object.values(p).filter(Boolean).length;
        return Math.round((completed / totalDays) * 100);
    };

    if (loading) return <LoadingSpinner size="lg" text="Loading study plans..." />;

    // ════════════════════════════════════════════════════════════
    // VIEW: Plan List
    // ════════════════════════════════════════════════════════════
    if (view === 'list') {
        return (
            <div className="page-container animate-fade-in-up">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h1 className="page-title">Study <span className="gradient-text">Planner</span></h1>
                        <p className="page-subtitle">AI-generated personalized study plans for your interview preparation</p>
                    </div>
                    <button className="btn-primary" onClick={() => setView('create')} style={{ padding: '12px 24px' }}>
                        ✨ Create New Plan
                    </button>
                </div>

                {plans.length === 0 ? (
                    <div className="glass-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 16 }}>📅</div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 8 }}>No study plans yet</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Create your first AI-powered study plan to start preparing for your interview</p>
                        <button className="btn-primary" onClick={() => setView('create')}>✨ Create Your First Plan</button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                        {plans.map(plan => {
                            const pct = getPlanProgress(plan);
                            const days = daysUntil(plan.interviewDate);
                            return (
                                <div key={plan._id} className="glass-card" style={{ cursor: 'pointer', position: 'relative' }}
                                    onClick={() => openPlan(plan)}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                        <div>
                                            <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{plan.targetRole}</h3>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                {plan.targetCompany} • {plan.experienceLevel}
                                            </p>
                                        </div>
                                        <button className="btn-danger" onClick={(e) => { e.stopPropagation(); handleDelete(plan._id); }}
                                            style={{ padding: '4px 8px', fontSize: '0.7rem', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#f43f5e', borderRadius: 6 }}>
                                            <HiTrash />
                                        </button>
                                    </div>

                                    <div style={{ display: 'flex', gap: 12, marginBottom: 12, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        <span><HiCalendar style={{ display: 'inline', verticalAlign: 'middle' }} /> {days}d left</span>
                                        <span><HiClock style={{ display: 'inline', verticalAlign: 'middle' }} /> {plan.hoursPerDay}h/day</span>
                                        <span><HiAcademicCap style={{ display: 'inline', verticalAlign: 'middle' }} /> {plan.plan?.totalDays || '?'}d plan</span>
                                    </div>

                                    {/* Progress bar */}
                                    <div style={{ marginBottom: 6 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                                            <span>Progress</span><span>{pct}%</span>
                                        </div>
                                        <div style={{ height: 5, borderRadius: 3, background: 'var(--bg-primary)' }}>
                                            <div style={{
                                                height: '100%', borderRadius: 3,
                                                width: `${pct}%`,
                                                background: pct === 100 ? '#22c55e' : 'linear-gradient(90deg, var(--primary), var(--accent))',
                                                transition: 'width 0.3s'
                                            }} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    // ════════════════════════════════════════════════════════════
    // VIEW: Create Plan
    // ════════════════════════════════════════════════════════════
    if (view === 'create') {
        return (
            <div className="page-container animate-fade-in-up">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <button className="btn-secondary" onClick={() => setView('list')} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>← Back</button>
                    <h1 className="page-title" style={{ marginBottom: 0 }}>Create <span className="gradient-text">Study Plan</span></h1>
                </div>

                {generating ? (
                    <div className="glass-card" style={{ textAlign: 'center', padding: '80px 24px' }}>
                        <div className="spinner spinner-lg" style={{ margin: '0 auto 24px' }} />
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 8 }}>Generating your personalized study plan...</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>AI is analyzing your profile and creating a day-by-day plan</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                        {/* Left: Form */}
                        <div className="glass-card">
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 16 }}>📋 Your Details</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Target Company</label>
                                    <select value={targetCompany} onChange={e => setTargetCompany(e.target.value)} className="input-field">
                                        {COMPANIES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                    {targetCompany === 'Other' && (
                                        <input className="input-field" placeholder="Enter company name" value={customCompany}
                                            onChange={e => setCustomCompany(e.target.value)} style={{ marginTop: 8 }} />
                                    )}
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Target Role</label>
                                    <select value={targetRole} onChange={e => setTargetRole(e.target.value)} className="input-field">
                                        {ROLES.map(r => <option key={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Interview Date *</label>
                                    <input type="date" className="input-field" value={interviewDate} onChange={e => setInterviewDate(e.target.value)}
                                        min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} />
                                </div>
                                <div className="eval-split" style={{ gap: 10 }}>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Experience</label>
                                        <select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)} className="input-field">
                                            <option value="fresher">Fresher</option>
                                            <option value="junior">Junior (1-2 yrs)</option>
                                            <option value="mid">Mid (3-5 yrs)</option>
                                            <option value="senior">Senior (5+ yrs)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Hours/Day: {hoursPerDay}</label>
                                        <input type="range" min={1} max={10} value={hoursPerDay} onChange={e => setHoursPerDay(+e.target.value)}
                                            style={{ width: '100%', accentColor: 'var(--primary)', marginTop: 8 }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Skills */}
                        <div className="glass-card">
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 16 }}>🛠️ Current Skills</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 12 }}>Select skills you already know (plan will focus on gaps)</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                                {SKILL_OPTIONS.map(skill => (
                                    <button key={skill} onClick={() => toggleSkill(skill)} style={{
                                        padding: '6px 14px', borderRadius: 999, fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer',
                                        border: `1px solid ${selectedSkills.includes(skill) ? 'var(--primary)' : 'var(--border)'}`,
                                        background: selectedSkills.includes(skill) ? 'rgba(168,85,247,0.15)' : 'var(--bg-primary)',
                                        color: selectedSkills.includes(skill) ? 'var(--primary-light)' : 'var(--text-secondary)',
                                        transition: 'all 0.2s'
                                    }}>
                                        {selectedSkills.includes(skill) ? '✓ ' : ''}{skill}
                                    </button>
                                ))}
                            </div>

                            {interviewDate && (
                                <div style={{ padding: '12px 16px', background: 'rgba(168,85,247,0.08)', borderRadius: 10, marginBottom: 16, fontSize: '0.85rem' }}>
                                    📅 <strong>{daysUntil(interviewDate)} days</strong> until your interview • <strong>{hoursPerDay}h/day</strong> = <strong>{daysUntil(interviewDate) * hoursPerDay}h</strong> total study time
                                </div>
                            )}

                            <button className="btn-primary" onClick={handleGenerate} style={{ width: '100%', justifyContent: 'center', padding: 14 }}>
                                🧠 Generate AI Study Plan
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ════════════════════════════════════════════════════════════
    // VIEW: Plan Detail
    // ════════════════════════════════════════════════════════════
    if (view === 'detail' && activePlan) {
        const plan = activePlan.plan;
        const totalDays = plan?.totalDays || 1;
        const completedDays = Object.values(progress).filter(Boolean).length;
        const progressPct = Math.round((completedDays / totalDays) * 100);

        return (
            <div className="page-container animate-fade-in-up">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <button className="btn-secondary" onClick={() => setView('list')} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>← Plans</button>
                    <div style={{ flex: 1 }}>
                        <h1 className="page-title" style={{ marginBottom: 0, fontSize: '1.4rem' }}>
                            {activePlan.targetRole} <span className="gradient-text">Study Plan</span>
                        </h1>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {activePlan.targetCompany} • {daysUntil(activePlan.interviewDate)} days left • {activePlan.hoursPerDay}h/day
                        </p>
                    </div>
                </div>

                {/* Summary + Progress */}
                <div className="glass-card" style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 16 }}>{plan?.summary}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8rem' }}>
                        <span style={{ fontWeight: 600 }}>Overall Progress</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{completedDays}/{totalDays} days • {progressPct}%</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 4, background: 'var(--bg-primary)' }}>
                        <div style={{
                            height: '100%', borderRadius: 4,
                            width: `${progressPct}%`,
                            background: progressPct === 100 ? '#22c55e' : 'linear-gradient(90deg, var(--primary), var(--accent))',
                            transition: 'width 0.5s'
                        }} />
                    </div>
                </div>

                {/* Company Tips */}
                {plan?.companyTips?.length > 0 && (
                    <div className="glass-card" style={{ marginBottom: 20, background: 'rgba(251,191,36,0.06)', borderColor: 'rgba(251,191,36,0.2)' }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 10, color: '#fbbf24' }}>
                            <HiLightBulb style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                            Company Tips — {activePlan.targetCompany}
                        </h3>
                        {plan.companyTips.map((tip, i) => (
                            <p key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 4 }}>💡 {tip}</p>
                        ))}
                    </div>
                )}

                {/* Milestones */}
                {plan?.milestones?.length > 0 && (
                    <div className="glass-card" style={{ marginBottom: 20 }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 12 }}>
                            <HiFlag style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6, color: 'var(--accent)' }} />
                            Milestones
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                            {plan.milestones.map((m, i) => {
                                const reached = completedDays >= m.day;
                                return (
                                    <div key={i} style={{
                                        padding: '10px 16px', borderRadius: 10, fontSize: '0.8rem',
                                        background: reached ? 'rgba(34,197,94,0.1)' : 'var(--bg-primary)',
                                        border: `1px solid ${reached ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
                                        opacity: reached ? 1 : 0.7
                                    }}>
                                        <span style={{ fontWeight: 600, color: reached ? '#22c55e' : 'var(--text-primary)' }}>
                                            {reached ? '✅' : '⬜'} Day {m.day}:
                                        </span>{' '}
                                        <span style={{ color: 'var(--text-secondary)' }}>{m.title}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Weekly Plan */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {plan?.weeks?.map((week, wi) => (
                        <div key={wi} className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                            {/* Week Header */}
                            <div onClick={() => setExpandedWeeks(prev => ({ ...prev, [wi]: !prev[wi] }))}
                                style={{
                                    padding: '16px 20px', cursor: 'pointer',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    background: expandedWeeks[wi] ? 'rgba(168,85,247,0.06)' : 'transparent'
                                }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    {expandedWeeks[wi] ? <HiChevronDown style={{ color: 'var(--primary-light)' }} /> : <HiChevronRight />}
                                    <div>
                                        <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Week {week.weekNumber}</h4>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--primary-light)' }}>{week.theme}</p>
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    {week.days?.length} days
                                </div>
                            </div>

                            {/* Days */}
                            {expandedWeeks[wi] && (
                                <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {week.days?.map((day, di) => {
                                        const dayKey = `w${wi}d${di}`;
                                        const done = progress[dayKey];
                                        const today = new Date().toISOString().split('T')[0];
                                        const isToday = day.date === today;

                                        return (
                                            <div key={di} style={{
                                                borderRadius: 10, overflow: 'hidden',
                                                border: `1px solid ${isToday ? 'rgba(168,85,247,0.4)' : done ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
                                                background: isToday ? 'rgba(168,85,247,0.05)' : done ? 'rgba(34,197,94,0.03)' : 'transparent'
                                            }}>
                                                {/* Day header */}
                                                <div onClick={() => setExpandedDays(prev => ({ ...prev, [dayKey]: !prev[dayKey] }))}
                                                    style={{
                                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                        padding: '12px 16px', cursor: 'pointer'
                                                    }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <button onClick={(e) => { e.stopPropagation(); toggleDay(dayKey); }}
                                                            style={{
                                                                width: 22, height: 22, borderRadius: 6, border: `2px solid ${done ? '#22c55e' : 'var(--border)'}`,
                                                                background: done ? '#22c55e' : 'transparent', cursor: 'pointer',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                color: 'white', fontSize: 12, flexShrink: 0
                                                            }}>
                                                            {done && '✓'}
                                                        </button>
                                                        <div>
                                                            <p style={{ fontWeight: 600, fontSize: '0.85rem', textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.6 : 1 }}>
                                                                Day {day.dayNumber}: {day.focus}
                                                                {isToday && <span style={{ marginLeft: 8, fontSize: '0.65rem', background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: 999 }}>TODAY</span>}
                                                            </p>
                                                            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{day.date}</p>
                                                        </div>
                                                    </div>
                                                    {expandedDays[dayKey] ? <HiChevronDown style={{ color: 'var(--text-secondary)' }} /> : <HiChevronRight style={{ color: 'var(--text-secondary)' }} />}
                                                </div>

                                                {/* Tasks */}
                                                {expandedDays[dayKey] && (
                                                    <div style={{ padding: '0 16px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                        {day.tasks?.map((task, ti) => {
                                                            const tc = TASK_COLORS[task.type] || TASK_COLORS.theory;
                                                            return (
                                                                <div key={ti} style={{
                                                                    padding: '12px 14px', borderRadius: 8,
                                                                    background: tc.bg, border: `1px solid ${tc.border}`
                                                                }}>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                                                        <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{tc.icon} {task.title}</p>
                                                                        <span style={{ fontSize: '0.7rem', color: tc.color, fontWeight: 600 }}>{task.duration}</span>
                                                                    </div>
                                                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 6 }}>{task.description}</p>
                                                                    {task.resources?.length > 0 && (
                                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                                                            {task.resources.map((r, ri) => (
                                                                                <span key={ri} style={{ fontSize: '0.7rem', color: 'var(--primary-light)' }}>📎 {r}</span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                        {day.tip && (
                                                            <div style={{ fontSize: '0.8rem', color: '#fbbf24', padding: '8px 12px', background: 'rgba(251,191,36,0.06)', borderRadius: 8 }}>
                                                                💡 <strong>Tip:</strong> {day.tip}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return null;
}
