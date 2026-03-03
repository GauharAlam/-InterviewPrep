import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCompany, getCompanyQuestions } from '../services/api';
import { HiArrowLeft, HiOfficeBuilding, HiCode, HiChatAlt2, HiOutlineDatabase } from 'react-icons/hi';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function CompanyDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('technical');

    useEffect(() => {
        fetchCompanyDetails();
    }, [id]);

    const fetchCompanyDetails = async () => {
        try {
            const [companyRes, questionsRes] = await Promise.all([
                getCompany(id),
                getCompanyQuestions(id)
            ]);
            setCompany(companyRes.data);
            setQuestions(questionsRes.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load company details');
            navigate('/companies');
        } finally {
            setLoading(false);
        }
    };

    const handleMockInterview = () => {
        // Here we could navigate to the voice interview with some company context
        // Currently redirecting to normal voice interview
        toast.success(`Starting mock interview for ${company.name}`);
        navigate('/voice', { state: { companyContext: company.name } });
    };

    if (loading) return <LoadingSpinner size="lg" text="Loading company specifics..." />;
    if (!company) return null;

    const technicalQuestions = questions.filter(q => q.type === 'technical');
    const behavioralQuestions = questions.filter(q => q.type === 'behavioral');
    const systemDesignQuestions = questions.filter(q => q.type === 'system_design');

    return (
        <div className="page-container animate-fade-in-up">
            <button onClick={() => navigate('/companies')} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24, padding: '8px 16px', fontSize: '0.85rem' }}>
                <HiArrowLeft /> Back to Companies
            </button>

            {/* Header */}
            <div className="glass-card" style={{ marginBottom: 32, padding: '32px', display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                {company.logoUrl ? (
                    <img src={company.logoUrl} alt={company.name} style={{ width: 80, height: 80, objectFit: 'contain', background: 'white', borderRadius: 16, padding: 8 }} />
                ) : (
                    <div style={{ width: 80, height: 80, borderRadius: 16, background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, color: 'white' }}>
                        {company.name.charAt(0).toUpperCase()}
                    </div>
                )}

                <div style={{ flex: 1, minWidth: 280 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>{company.name}</h1>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><HiOfficeBuilding /> {company.industry}</span>
                                <span>•</span>
                                <span>{company.difficultyLevel} Difficulty</span>
                            </div>
                        </div>
                        <button onClick={handleMockInterview} className="btn-primary" style={{ padding: '12px 24px', fontSize: '0.95rem' }}>
                            Start Mock Interview
                        </button>
                    </div>
                    <p style={{ marginTop: 16, color: 'var(--text-primary)', lineHeight: 1.6 }}>{company.description}</p>

                    <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {company.commonRoles.map(role => (
                            <span key={role} className="chip" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: 'var(--primary-light)' }}>
                                {role}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 16, overflowX: 'auto' }}>
                {[
                    { id: 'technical', label: `Technical (${technicalQuestions.length})`, icon: <HiCode /> },
                    { id: 'behavioral', label: `Behavioral (${behavioralQuestions.length})`, icon: <HiChatAlt2 /> },
                    { id: 'system_design', label: `System Design (${systemDesignQuestions.length})`, icon: <HiOutlineDatabase /> },
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

            {/* Questions List */}
            <div className="glass-card">
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 24, textTransform: 'capitalize' }}>
                    {activeTab.replace('_', ' ')} Questions
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {questions.filter(q => q.type === activeTab).length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '32px 0' }}>No questions available for this category yet.</p>
                    ) : (
                        questions.filter(q => q.type === activeTab).map((q, i) => (
                            <div key={q._id} style={{ padding: '20px', background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                <div style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 700, minWidth: '30px' }}>Q{i + 1}.</div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 500, fontSize: '1.05rem', marginBottom: 12, lineHeight: 1.5 }}>{q.question}</p>
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                                        <span className="chip" style={{ fontSize: '0.75rem', background: 'var(--bg-card)' }}>Role: {q.role}</span>
                                        <span className="chip" style={{ fontSize: '0.75rem', background: q.frequency === 'High' ? 'rgba(239,68,68,0.1)' : 'var(--bg-card)', color: q.frequency === 'High' ? '#ef4444' : 'var(--text-secondary)' }}>
                                            {q.frequency} Frequency
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
