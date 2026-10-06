import { useEffect, useState } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AuthView } from '@neondatabase/neon-js/auth/react';
import { neon } from './lib/neon';

function Dashboard() {
    const { data, isPending } = neon.auth.useSession();
    const [profiles, setProfiles] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3000/profiles')
            .then(res => res.json())
            .then(data => setProfiles(data))
            .catch(err => console.error("Error fetching data:", err));
    }, []);

    if (isPending) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
    
    if (!data?.session) {
        return <Navigate to="/auth" replace />;
    }

    return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
            <h2>Welcome, {data.user?.email}! You have successfully logged in.</h2>
            <button 
                onClick={async () => {
                    await neon.auth.signOut();
                    window.location.href = '/auth';
                }}
                style={{ 
                    marginTop: '20px', 
                    padding: '10px 20px', 
                    cursor: 'pointer',
                    background: '#000',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px'
                }}
            >
                Sign Out
            </button>

            <div style={{ marginTop: '40px' }}>
                <h3>User Profiles from Neon Database</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {profiles.map((profile: any) => (
                        <li key={profile.id} style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
                            <strong>{profile.full_name || 'No Name'}</strong> - {profile.mobile || 'No Mobile'}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

function AuthPage() {
    const location = useLocation();
    const { data } = neon.auth.useSession();

    if (data?.session) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
            <AuthView pathname={location.pathname} callbackURL="/dashboard" />
        </div>
    );
}

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/auth/*" element={<AuthPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
    );
}