import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import { loginUser, clearError } from '../redux/authSlice';
import { HiMail, HiLockClosed, HiArrowRight } from 'react-icons/hi';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const { user, loading, error } = useSelector(state => state.auth);
    const dispatch = useDispatch();

    if (user) return <Navigate to="/dashboard" replace />;

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(clearError());
        dispatch(loginUser(form));
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)',
            padding: 24,
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background orbs */}
            <div style={{
                position: 'absolute', width: 400, height: 400,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(168,85,247,0.2), transparent)',
                top: -100, right: -100, filter: 'blur(60px)'
            }} />
            <div style={{
                position: 'absolute', width: 300, height: 300,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(236,72,153,0.2), transparent)',
                bottom: -50, left: -50, filter: 'blur(60px)'
            }} />

            <div className="glass-card animate-fade-in-up" style={{ maxWidth: 440, width: '100%', padding: '40px 36px' }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{
                        width: 56, height: 56, margin: '0 auto 16px',
                        background: '#333',
                        borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 24, fontWeight: 700, color: 'white'
                    }}>AI</div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Welcome back</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Sign in to your interview prep account</p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: 12, padding: '12px 16px', marginBottom: 20,
                        color: '#ef4444', fontSize: '0.9rem'
                    }}>{error}</div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--text-secondary)' }}>Email</label>
                        <div style={{ position: 'relative' }}>
                            <HiMail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input className="input-field" type="email" placeholder="you@example.com"
                                style={{ paddingLeft: 40 }}
                                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--text-secondary)' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <HiLockClosed style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input className="input-field" type="password" placeholder="••••••••"
                                style={{ paddingLeft: 40 }}
                                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                        </div>
                    </div>
                    <button className="btn-primary" type="submit" disabled={loading}
                        style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '14px' }}>
                        {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <>Sign In <HiArrowRight /></>}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Don't have an account? <Link to="/signup" style={{ color: 'var(--primary-light)', textDecoration: 'none', fontWeight: 600 }}>Sign up</Link>
                </p>
            </div>
        </div>
    );
}
