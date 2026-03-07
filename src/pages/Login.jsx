import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Camera } from 'lucide-react';

export default function Login() {
    const [loginType, setLoginType] = useState('student'); // 'student' | 'faculty'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState(null);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (isRegister) {
                // Simple sign-up Flow
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;

                // Wait, normally we'd insert into `users` table via trigger or here.
                // For simplicity, we just notify
                alert('Account created! You can now sign in.');
                setIsRegister(false);
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                localStorage.setItem('loginType', loginType);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="glass-panel login-box">
                <div className="login-header">
                    <div className="icon-wrapper">
                        <Camera size={32} className="logoIcon" />
                    </div>
                    <h2>AIAttend</h2>
                    <p className="page-description">AI-Powered Attendance System</p>
                </div>

                <div className="flex rounded-md p-1 mb-2" style={{ backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)' }}>
                    <button
                        type="button"
                        className="flex-1 py-2 text-sm rounded transition-all"
                        style={{
                            backgroundColor: loginType === 'student' ? 'var(--primary-color)' : 'transparent',
                            color: loginType === 'student' ? 'white' : 'var(--text-secondary)'
                        }}
                        onClick={() => setLoginType('student')}
                    >
                        Student
                    </button>
                    <button
                        type="button"
                        className="flex-1 py-2 text-sm rounded transition-all"
                        style={{
                            backgroundColor: loginType === 'faculty' ? 'var(--primary-color)' : 'transparent',
                            color: loginType === 'faculty' ? 'white' : 'var(--text-secondary)'
                        }}
                        onClick={() => setLoginType('faculty')}
                    >
                        Faculty
                    </button>
                </div>

                <form onSubmit={handleAuth} className="flex flex-col gap-4">
                    {error && <div className="error-msg">{error}</div>}

                    {isRegister && (
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                        {loading ? 'Processing...' : (isRegister ? 'Sign Up' : 'Sign In')}
                    </button>
                </form>

                <div className="login-footer">
                    <button type="button" onClick={() => setIsRegister(!isRegister)} className="auth-switch">
                        {isRegister ? 'Already have an account? Sign in' : 'Need an account? Sign up (Demo mode)'}
                    </button>
                </div>
            </div>
        </div>
    );
}
