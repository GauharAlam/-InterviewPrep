import { useState, useEffect } from 'react';
import { getCodingProblems, getCodingTopics, getCodingCompanies } from '../services/api';
import { HiSearch, HiExternalLink, HiFilter, HiCode } from 'react-icons/hi';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const DIFFICULTY_COLORS = {
    Easy: '#999',
    Medium: '#999',
    Hard: '#666',
};

const PLATFORM_STYLES = {
    LeetCode: { bg: 'rgba(255,161,22,0.12)', color: '#ffa116', label: 'LeetCode' },
    GeeksforGeeks: { bg: 'rgba(46,125,50,0.12)', color: '#2e7d32', label: 'GFG' },
};

export default function CodingRound() {
    const [problems, setProblems] = useState([]);
    const [topics, setTopics] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [topic, setTopic] = useState('');
    const [company, setCompany] = useState('');
    const [platform, setPlatform] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        Promise.all([
            getCodingTopics(),
            getCodingCompanies(),
        ]).then(([topicsRes, companiesRes]) => {
            setTopics(topicsRes.data);
            setCompanies(companiesRes.data);
        });
    }, []);

    useEffect(() => {
        fetchProblems();
    }, [difficulty, topic, company, platform, search]);

    const fetchProblems = async () => {
        setLoading(true);
        try {
            const params = {};
            if (difficulty) params.difficulty = difficulty;
            if (topic) params.topic = topic;
            if (company) params.company = company;
            if (platform) params.platform = platform;
            if (search) params.search = search;

            const { data } = await getCodingProblems(params);
            setProblems(data);
        } catch (err) {
            toast.error('Failed to load problems');
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setSearch('');
        setDifficulty('');
        setTopic('');
        setCompany('');
        setPlatform('');
    };

    const activeFilterCount = [difficulty, topic, company, platform].filter(Boolean).length;

    // Stats
    const easyCount = problems.filter(p => p.difficulty === 'Easy').length;
    const mediumCount = problems.filter(p => p.difficulty === 'Medium').length;
    const hardCount = problems.filter(p => p.difficulty === 'Hard').length;

    return (
        <div className="page-container animate-fade-in-up">
            <h1 className="page-title">Coding <span className="gradient-text">Problem Hub</span></h1>
            <p className="page-subtitle">Curated LeetCode & GFG problems asked at top tech companies — click to practice on the official platform</p>

            {/* Stats Row */}
            <div className="stats-grid" style={{ marginBottom: 24 }}>
                {[
                    { label: 'Total', value: problems.length, color: 'var(--primary-light)' },
                    { label: 'Easy', value: easyCount, color: DIFFICULTY_COLORS.Easy },
                    { label: 'Medium', value: mediumCount, color: DIFFICULTY_COLORS.Medium },
                    { label: 'Hard', value: hardCount, color: DIFFICULTY_COLORS.Hard },
                ].map((stat) => (
                    <div key={stat.label} className="glass-card" style={{ textAlign: 'center', padding: '16px 12px' }}>
                        <p style={{ fontSize: '1.6rem', fontWeight: 700, color: stat.color }}>{stat.value}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Search + Filter Bar */}
            <div className="glass-card" style={{ marginBottom: 24, padding: '20px' }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', background: 'var(--bg-primary)', padding: '0 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
                        <HiSearch style={{ color: 'var(--text-secondary)', fontSize: 20 }} />
                        <input
                            type="text"
                            placeholder="Search problems (e.g. Two Sum, Linked List)..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ width: '100%', background: 'transparent', border: 'none', padding: '12px', color: 'var(--text-primary)', outline: 'none' }}
                        />
                    </div>
                    <button
                        className={showFilters ? 'btn-primary' : 'btn-secondary'}
                        onClick={() => setShowFilters(!showFilters)}
                        style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}
                    >
                        <HiFilter /> Filters
                        {activeFilterCount > 0 && (
                            <span style={{
                                position: 'absolute', top: -6, right: -6,
                                width: 20, height: 20, borderRadius: '50%',
                                background: 'var(--accent)', color: 'white',
                                fontSize: '0.65rem', fontWeight: 700,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>{activeFilterCount}</span>
                        )}
                    </button>
                    {activeFilterCount > 0 && (
                        <button className="btn-secondary" onClick={clearFilters} style={{ padding: '10px 14px', fontSize: '0.8rem' }}>
                            Clear All
                        </button>
                    )}
                </div>

                {/* Expandable Filters */}
                {showFilters && (
                    <div className="filter-grid" style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Difficulty</label>
                            <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="input-field" style={{ cursor: 'pointer' }}>
                                <option value="">All</option>
                                <option value="Easy">🟢 Easy</option>
                                <option value="Medium">🟡 Medium</option>
                                <option value="Hard">🔴 Hard</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Topic</label>
                            <select value={topic} onChange={e => setTopic(e.target.value)} className="input-field" style={{ cursor: 'pointer' }}>
                                <option value="">All Topics</option>
                                {topics.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Company</label>
                            <select value={company} onChange={e => setCompany(e.target.value)} className="input-field" style={{ cursor: 'pointer' }}>
                                <option value="">All Companies</option>
                                {companies.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Platform</label>
                            <select value={platform} onChange={e => setPlatform(e.target.value)} className="input-field" style={{ cursor: 'pointer' }}>
                                <option value="">All Platforms</option>
                                <option value="LeetCode">LeetCode</option>
                                <option value="GeeksforGeeks">GeeksforGeeks</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Problem List */}
            {loading ? (
                <LoadingSpinner size="lg" text="Loading problems..." />
            ) : problems.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                    <HiCode style={{ fontSize: 48, opacity: 0.2, marginBottom: 16, display: 'block', margin: '0 auto 16px' }} />
                    <p style={{ fontSize: '1rem', marginBottom: 8 }}>No problems found matching your filters</p>
                    <button className="btn-secondary" onClick={clearFilters} style={{ marginTop: 8 }}>Clear Filters</button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Table-like header */}
                    <div className="problem-table-header">
                        <span>Problem</span>
                        <span>Difficulty</span>
                        <span>Topic</span>
                        <span>Company Tags</span>
                        <span style={{ textAlign: 'right' }}>Solve</span>
                    </div>

                    {problems.map((problem, idx) => {
                        const platStyle = PLATFORM_STYLES[problem.platform] || PLATFORM_STYLES.LeetCode;
                        return (
                            <div key={problem._id} className="glass-card hover-glow problem-row" style={{
                                padding: '16px 20px', cursor: 'default',
                                animation: `fadeInUp 0.3s ease ${idx * 0.02}s both`
                            }}>
                                {/* Problem Name + Platform */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{
                                        fontSize: '0.6rem', fontWeight: 700, padding: '3px 8px',
                                        borderRadius: 6, background: platStyle.bg, color: platStyle.color,
                                        flexShrink: 0
                                    }}>
                                        {platStyle.label}
                                    </span>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                        {problem.problemNumber ? `${problem.problemNumber}. ` : ''}{problem.title}
                                    </span>
                                </div>

                                {/* Difficulty */}
                                <span style={{
                                    fontSize: '0.75rem', fontWeight: 600,
                                    color: DIFFICULTY_COLORS[problem.difficulty],
                                    display: 'flex', alignItems: 'center', gap: 6
                                }}>
                                    <span style={{
                                        width: 8, height: 8, borderRadius: '50%',
                                        background: DIFFICULTY_COLORS[problem.difficulty]
                                    }} />
                                    {problem.difficulty}
                                </span>

                                {/* Topic */}
                                <span className="chip" style={{
                                    fontSize: '0.7rem', background: 'var(--bg-secondary)',
                                    justifySelf: 'start', maxWidth: '100%'
                                }}>
                                    {problem.topic}
                                </span>

                                {/* Company Tags */}
                                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                    {problem.companyTags.slice(0, 4).map(tag => (
                                        <span key={tag} style={{
                                            fontSize: '0.6rem', fontWeight: 500,
                                            padding: '2px 8px', borderRadius: 6,
                                            background: 'rgba(99,102,241,0.08)',
                                            color: 'var(--primary-light)',
                                            border: '1px solid rgba(99,102,241,0.15)'
                                        }}>
                                            {tag}
                                        </span>
                                    ))}
                                    {problem.companyTags.length > 4 && (
                                        <span style={{
                                            fontSize: '0.6rem', fontWeight: 500,
                                            padding: '2px 8px', borderRadius: 6,
                                            background: 'var(--bg-secondary)',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            +{problem.companyTags.length - 4}
                                        </span>
                                    )}
                                </div>

                                {/* Solve Link */}
                                <a
                                    href={problem.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-primary problem-solve-link"
                                    style={{
                                        padding: '6px 14px', fontSize: '0.75rem',
                                        textDecoration: 'none', display: 'inline-flex',
                                        alignItems: 'center', gap: 6, justifySelf: 'end',
                                        whiteSpace: 'nowrap'
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Solve <HiExternalLink />
                                </a>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
