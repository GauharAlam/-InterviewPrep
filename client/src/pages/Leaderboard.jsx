import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getLeaderboard, getMyStats } from '../services/api';
import { HiLightningBolt, HiFire, HiStar, HiTrendingUp } from 'react-icons/hi';
import LoadingSpinner from '../components/LoadingSpinner';

const RANK_STYLES = {
    1: { bg: 'rgba(255,255,255,0.04)', border: '#444', medal: '🥇' },
    2: { bg: 'rgba(255,255,255,0.03)', border: '#383838', medal: '🥈' },
    3: { bg: 'rgba(255,255,255,0.02)', border: '#333', medal: '🥉' },
};

const LEVEL_TITLES = [
    'Beginner', 'Learner', 'Explorer', 'Practitioner', 'Skilled',
    'Proficient', 'Advanced', 'Expert', 'Master', 'Grandmaster'
];

const ALL_BADGES = [
    { id: 'first_step', name: 'First Step', icon: '🎯', desc: 'Complete your first activity' },
    { id: 'coder', name: 'Code Warrior', icon: '⚔️', desc: 'Submit 5 coding solutions' },
    { id: 'code_master', name: 'Code Master', icon: '🏆', desc: 'Submit 20 coding solutions' },
    { id: 'interviewer', name: 'Interview Ready', icon: '🎤', desc: 'Complete 3 interview sessions' },
    { id: 'interview_pro', name: 'Interview Pro', icon: '⭐', desc: 'Complete 10 interview sessions' },
    { id: 'resume_builder', name: 'Resume Builder', icon: '📄', desc: 'Analyze your first resume' },
    { id: 'streak_3', name: 'On Fire', icon: '🔥', desc: '3-day practice streak' },
    { id: 'streak_7', name: 'Unstoppable', icon: '💪', desc: '7-day practice streak' },
    { id: 'streak_30', name: 'Legend', icon: '👑', desc: '30-day practice streak' },
    { id: 'high_scorer', name: 'High Scorer', icon: '💎', desc: 'Average score above 80' },
    { id: 'perfect', name: 'Perfect Score', icon: '🌟', desc: 'Get a perfect 100 on coding' },
];

export default function Leaderboard() {
    const { user } = useSelector(state => state.auth);
    const [leaderboard, setLeaderboard] = useState([]);
    const [myStats, setMyStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('leaderboard');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [lb, ms] = await Promise.all([
                getLeaderboard().catch(() => ({ data: [] })),
                getMyStats().catch(() => ({ data: null }))
            ]);
            setLeaderboard(lb.data);
            setMyStats(ms.data);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner size="lg" text="Loading leaderboard..." />;

    const myRank = leaderboard.findIndex(e => e._id === user?._id) + 1;
    const levelTitle = LEVEL_TITLES[Math.min((myStats?.level || 1) - 1, LEVEL_TITLES.length - 1)];
    const unlockedIds = new Set((myStats?.badges || []).map(b => b.id));

    return (
        <div className="page-container animate-fade-in-up">
            <h1 className="page-title">Leader<span className="gradient-text">board</span></h1>
            <p className="page-subtitle">Compete with others, earn XP, unlock badges, and climb the ranks</p>

            {/* My Stats Banner */}
            {myStats && (
                <div className="glass-card" style={{
                    marginBottom: 24, padding: '24px 28px',
                    background: 'rgba(255,255,255,0.03)',
                    borderColor: '#2a2a2a'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: '50%',
                                background: '#333',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 22, fontWeight: 700, color: 'white'
                            }}>{user?.name?.charAt(0)}</div>
                            <div>
                                <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{user?.name}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                                    <span style={{
                                        background: '#333',
                                        color: 'white', padding: '2px 10px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600
                                    }}>Lv.{myStats.level} {levelTitle}</span>
                                    {myRank > 0 && <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Rank #{myRank}</span>}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>{myStats.xp}</p>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total XP</p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: myStats.streak > 0 ? '#ccc' : 'var(--text-secondary)' }}>
                                    {myStats.streak} 🔥
                                </p>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Day Streak</p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ddd' }}>{myStats.badges?.length || 0}</p>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Badges</p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#bbb' }}>{myStats.avgScore}</p>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Avg Score</p>
                            </div>
                        </div>
                    </div>

                    {/* XP Progress Bar */}
                    <div style={{ marginTop: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            <span>Level {myStats.level}</span>
                            <span>{myStats.xpInLevel}/{myStats.xpToNext} XP to next level</span>
                        </div>
                        <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-primary)' }}>
                            <div style={{
                                height: '100%', borderRadius: 3,
                                width: `${(myStats.xpInLevel / myStats.xpToNext) * 100}%`,
                                background: '#444',
                                transition: 'width 0.5s ease'
                            }} />
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {[
                    { key: 'leaderboard', label: '🏆 Rankings', icon: <HiTrendingUp /> },
                    { key: 'badges', label: '🎖️ Badges', icon: <HiStar /> },
                ].map(tab => (
                    <button key={tab.key} className={activeTab === tab.key ? 'btn-primary' : 'btn-secondary'}
                        onClick={() => setActiveTab(tab.key)} style={{ padding: '10px 20px' }}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Rankings Tab */}
            {activeTab === 'leaderboard' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {leaderboard.length === 0 ? (
                        <div className="glass-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                            <p style={{ fontSize: '1.1rem', marginBottom: 8 }}>No users on the leaderboard yet</p>
                            <p style={{ color: 'var(--text-secondary)' }}>Start practicing to claim your spot!</p>
                        </div>
                    ) : (
                        leaderboard.map((entry) => {
                            const isMe = entry._id === user?._id;
                            const rankStyle = RANK_STYLES[entry.rank] || {};
                            return (
                                <div key={entry._id} className="glass-card" style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '14px 20px',
                                    background: isMe ? 'rgba(255,255,255,0.03)' : rankStyle.bg || undefined,
                                    borderColor: isMe ? '#444' : rankStyle.border || undefined,
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                        {/* Rank */}
                                        <div style={{
                                            width: 36, height: 36, borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: entry.rank <= 3 ? '1.2rem' : '0.85rem',
                                            fontWeight: 700,
                                            background: entry.rank <= 3 ? 'transparent' : 'var(--bg-primary)',
                                            color: entry.rank <= 3 ? undefined : 'var(--text-secondary)'
                                        }}>
                                            {entry.rank <= 3 ? rankStyle.medal : `#${entry.rank}`}
                                        </div>

                                        {/* Avatar */}
                                        <div style={{
                                            width: 40, height: 40, borderRadius: '50%',
                                            background: isMe ? '#333' : 'var(--bg-primary)',
                                            border: `2px solid ${isMe ? 'var(--primary)' : 'var(--border)'}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 16, fontWeight: 700, color: isMe ? 'white' : 'var(--text-primary)'
                                        }}>{entry.name?.charAt(0)}</div>

                                        {/* Info */}
                                        <div>
                                            <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                                                {entry.name} {isMe && <span style={{ color: 'var(--primary-light)', fontSize: '0.75rem' }}>(You)</span>}
                                            </p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                                    Lv.{entry.level} • {entry.totalActivities} activities
                                                </span>
                                                {entry.streak > 0 && (
                                                    <span style={{ fontSize: '0.7rem', color: '#aaa' }}>🔥 {entry.streak}d</span>
                                                )}
                                                {entry.badges?.slice(0, 3).map((b, i) => (
                                                    <span key={i} style={{ fontSize: '0.8rem' }} title={b.name}>{b.icon}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Scores */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <div style={{ textAlign: 'right', display: 'none' }}>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>{entry.xp}</p>
                                            <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 500 }}>XP</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Badges Tab */}
            {activeTab === 'badges' && (
                <div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
                        {unlockedIds.size}/{ALL_BADGES.length} badges unlocked
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                        {ALL_BADGES.map((badge) => {
                            const unlocked = unlockedIds.has(badge.id);
                            return (
                                <div key={badge.id} className="glass-card" style={{
                                    textAlign: 'center', padding: '20px 16px',
                                    opacity: unlocked ? 1 : 0.4,
                                    filter: unlocked ? 'none' : 'grayscale(100%)',
                                    borderColor: unlocked ? '#444' : undefined
                                }}>
                                    <div style={{ fontSize: '2.2rem', marginBottom: 8 }}>{badge.icon}</div>
                                    <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>{badge.name}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{badge.desc}</p>
                                    {unlocked && (
                                        <div style={{
                                            marginTop: 8, fontSize: '0.65rem', fontWeight: 600,
                                            color: '#aaa', textTransform: 'uppercase', letterSpacing: 1
                                        }}>✓ Unlocked</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
