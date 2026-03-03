import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../redux/authSlice';
import { HiMenu, HiX, HiSun, HiMoon } from 'react-icons/hi';

export default function Navbar({ theme, toggleTheme }) {
    const { user } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/login');
    };

    const navLinks = [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/resume', label: 'Resume' },
        { path: '/companies', label: 'Companies' },
        { path: '/questions', label: 'Questions' },
        { path: '/coding', label: 'Coding' },
        { path: '/voice', label: 'Voice' },
        { path: '/ai-practice', label: 'Practice' },
        { path: '/study-plan', label: 'Study Plan' },
        { path: '/leaderboard', label: 'Ranks' },
        { path: '/history', label: 'History' },
    ];

    if (user?.role === 'admin') {
        navLinks.push({ path: '/admin', label: 'Admin' });
    }

    return (
        <nav style={{
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border)',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            padding: '0 16px'
        }}>
            <div style={{
                maxWidth: 1280,
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: 56
            }}>
                {/* Logo */}
                <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <div style={{
                        width: 32, height: 32,
                        background: '#ffffff',
                        borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 700, color: '#0a0a0a'
                    }}>AI</div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>InterviewPrep</span>
                </Link>

                {/* Desktop Links */}
                <div style={{ display: 'flex', gap: 1, alignItems: 'center', overflow: 'hidden' }} className="nav-links-desktop">
                    {user && navLinks.map(link => (
                        <Link key={link.path} to={link.path} style={{
                            textDecoration: 'none',
                            padding: '6px 10px',
                            borderRadius: 8,
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                            color: location.pathname === link.path ? '#ffffff' : 'var(--text-secondary)',
                            background: location.pathname === link.path ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                            transition: 'all 0.2s'
                        }}>
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Right side */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={toggleTheme} style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: 10,
                        width: 38, height: 38,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 18
                    }}>
                        {theme === 'dark' ? <HiSun /> : <HiMoon />}
                    </button>

                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                                width: 36, height: 36,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 14, fontWeight: 700, color: 'white'
                            }}>
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <button onClick={handleLogout} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: 8 }}>
                            <Link to="/login" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem', textDecoration: 'none' }}>Login</Link>
                            <Link to="/signup" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', textDecoration: 'none' }}>Sign Up</Link>
                        </div>
                    )}

                    {/* Mobile toggle */}
                    <button onClick={() => setMenuOpen(!menuOpen)} style={{
                        display: 'none', background: 'none', border: 'none',
                        color: 'var(--text-primary)', fontSize: 24, cursor: 'pointer'
                    }} className="mobile-toggle">
                        {menuOpen ? <HiX /> : <HiMenu />}
                    </button>
                </div>
            </div>

            {/* Mobile dropdown */}
            {menuOpen && user && (
                <div style={{
                    padding: '16px',
                    display: 'flex', flexDirection: 'column', gap: 4,
                    borderTop: '1px solid var(--border)'
                }}>
                    {navLinks.map(link => (
                        <Link key={link.path} to={link.path} onClick={() => setMenuOpen(false)} style={{
                            textDecoration: 'none',
                            padding: '10px 14px',
                            borderRadius: 8,
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            color: location.pathname === link.path ? 'var(--primary-light)' : 'var(--text-secondary)',
                            background: location.pathname === link.path ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                        }}>
                            {link.label}
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    );
}
