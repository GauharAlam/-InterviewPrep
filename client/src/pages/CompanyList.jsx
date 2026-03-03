import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCompanies } from '../services/api';
import { HiSearch, HiOfficeBuilding } from 'react-icons/hi';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function CompanyList() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const { data } = await getCompanies();
            setCompanies(data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to fetch companies');
        } finally {
            setLoading(false);
        }
    };

    const filteredCompanies = companies.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getDifficultyColor = (diff) => {
        if (diff === 'Easy') return '#10b981';
        if (diff === 'Medium') return '#f59e0b';
        return '#ef4444';
    };

    if (loading) return <LoadingSpinner size="lg" text="Loading company database..." />;

    return (
        <div className="page-container animate-fade-in-up">
            <h1 className="page-title">Company Profile & <span className="gradient-text">Prep Hub</span></h1>
            <p className="page-subtitle">Select a company to view interview processes, question patterns, and resources</p>

            {/* Search Bar */}
            <div className="glass-card" style={{ marginBottom: 32, padding: '24px' }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', background: 'var(--bg-primary)', padding: '0 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
                        <HiSearch style={{ color: 'var(--text-secondary)', fontSize: 20 }} />
                        <input
                            type="text"
                            placeholder="Search by company name or industry..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', background: 'transparent', border: 'none', padding: '14px', color: 'var(--text-primary)', outline: 'none' }}
                        />
                    </div>
                </div>
            </div>

            {/* Companies Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {filteredCompanies.map(company => (
                    <div
                        key={company._id}
                        onClick={() => navigate(`/companies/${company._id}`)}
                        className="glass-card hover-glow"
                        style={{ padding: '24px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 16 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                {company.logoUrl ? (
                                    <img src={company.logoUrl} alt={company.name} style={{ width: 48, height: 48, objectFit: 'contain', background: 'white', borderRadius: 8, padding: 4, filter: 'grayscale(100%) opacity(0.8)' }} />
                                ) : (
                                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                                        <HiOfficeBuilding style={{ color: 'var(--primary-light)' }} />
                                    </div>
                                )}
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{company.name}</h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{company.industry}</p>
                                </div>
                            </div>
                        </div>

                        <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5, flex: 1 }}>
                            {company.description.length > 100 ? `${company.description.substring(0, 100)}...` : company.description}
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 'auto' }}>
                            <span className="chip" style={{ border: `1px solid ${getDifficultyColor(company.difficultyLevel)}`, color: getDifficultyColor(company.difficultyLevel), background: 'transparent' }}>
                                {company.difficultyLevel} Difficulty
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--primary-light)', fontWeight: 500 }}>View Prep →</span>
                        </div>
                    </div>
                ))}

                {filteredCompanies.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 0', color: 'var(--text-secondary)' }}>
                        <HiOfficeBuilding style={{ fontSize: 48, opacity: 0.2, marginBottom: 16 }} />
                        <p>No companies found matching "{searchTerm}"</p>
                    </div>
                )}
            </div>
        </div>
    );
}
