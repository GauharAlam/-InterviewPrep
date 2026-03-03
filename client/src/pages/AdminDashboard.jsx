import { useState, useEffect } from 'react';
import { getUsers, deleteUser, getAnalytics, seedProblems } from '../services/api';
import { HiUsers, HiChartBar, HiTrash, HiDatabase, HiSearch } from 'react-icons/hi';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('analytics');
    const [searchTerm, setSearchTerm] = useState('');
    const [seeding, setSeeding] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [u, a] = await Promise.all([
                getUsers().catch(() => ({ data: [] })),
                getAnalytics().catch(() => ({ data: {} }))
            ]);
            setUsers(u.data);
            setAnalytics(a.data);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await deleteUser(id);
            setUsers(users.filter(u => u._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const handleSeedProblems = async () => {
        setSeeding(true);
        try {
            await seedProblems();
            alert('Problems seeded successfully!');
        } catch (err) {
            console.error(err);
        } finally {
            setSeeding(false);
        }
    };

    if (loading) return <LoadingSpinner size="lg" text="Loading admin data..." />;

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="page-container animate-fade-in-up">
            <h1 className="page-title">Admin <span className="gradient-text">Dashboard</span></h1>
            <p className="page-subtitle">Manage users, view analytics, and configure the platform</p>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                <button className={activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setActiveTab('analytics')} style={{ padding: '10px 20px' }}>
                    <HiChartBar /> Analytics
                </button>
                <button className={activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setActiveTab('users')} style={{ padding: '10px 20px' }}>
                    <HiUsers /> Users
                </button>
            </div>

            {activeTab === 'analytics' && analytics && (
                <>
                    {/* Stats Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                        {[
                            { label: 'Total Users', value: analytics.totalUsers, color: '#6366f1' },
                            { label: 'Submissions', value: analytics.totalSubmissions, color: '#06b6d4' },
                            { label: 'Resumes Analyzed', value: analytics.totalResumes, color: '#10b981' },
                            { label: 'Interview Sessions', value: analytics.totalSessions, color: '#f59e0b' },
                            { label: 'Avg Coding Score', value: Math.round(analytics.averageCodingScore || 0), color: '#8b5cf6' },
                        ].map((card, i) => (
                            <div key={i} className="glass-card" style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{card.label}</p>
                                <p style={{ fontSize: '2rem', fontWeight: 700, color: card.color, marginTop: 4 }}>{card.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Seed Problems */}
                    <div className="glass-card" style={{ marginBottom: 24 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12 }}>
                            <HiDatabase style={{ display: 'inline', marginRight: 8 }} />
                            Database Actions
                        </h3>
                        <button className="btn-primary" onClick={handleSeedProblems} disabled={seeding}>
                            {seeding ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <><HiDatabase /> Seed Sample Problems</>}
                        </button>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: 8 }}>
                            This will add 5 sample coding problems (Two Sum, Reverse String, etc.) to the database.
                        </p>
                    </div>

                    {/* Recent Users */}
                    {analytics.recentUsers?.length > 0 && (
                        <div className="glass-card">
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12 }}>Recent Users</h3>
                            {analytics.recentUsers.map((u, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '10px 0', borderBottom: i < analytics.recentUsers.length - 1 ? '1px solid var(--border)' : 'none'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{
                                            width: 32, height: 32, borderRadius: '50%',
                                            background: '#333',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 12, fontWeight: 700, color: 'white'
                                        }}>{u.name?.charAt(0)}</div>
                                        <div>
                                            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.name}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{u.email}</p>
                                        </div>
                                    </div>
                                    <span className="chip" style={{ fontSize: '0.7rem' }}>{u.role}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {activeTab === 'users' && (
                <>
                    {/* Search */}
                    <div style={{ position: 'relative', marginBottom: 20, maxWidth: 400 }}>
                        <HiSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input className="input-field" placeholder="Search users..." style={{ paddingLeft: 40 }}
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>

                    {/* User List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {filteredUsers.map((u) => (
                            <div key={u._id} className="glass-card" style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '14px 20px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 38, height: 38, borderRadius: '50%',
                                        background: '#333',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 14, fontWeight: 700, color: 'white'
                                    }}>{u.name?.charAt(0)}</div>
                                    <div>
                                        <p style={{ fontWeight: 600 }}>{u.name}</p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.email}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span className="chip" style={{ fontSize: '0.7rem' }}>{u.role}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        {new Date(u.createdAt).toLocaleDateString()}
                                    </span>
                                    {u.role !== 'admin' && (
                                        <button className="btn-danger" onClick={() => handleDeleteUser(u._id)}
                                            style={{ padding: '6px 10px', fontSize: '0.75rem' }}>
                                            <HiTrash />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
