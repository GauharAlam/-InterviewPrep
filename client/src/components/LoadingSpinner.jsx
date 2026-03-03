export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 0',
            gap: 16
        }}>
            <div className={size === 'lg' ? 'spinner spinner-lg' : 'spinner'} />
            {text && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{text}</p>}
        </div>
    );
}
